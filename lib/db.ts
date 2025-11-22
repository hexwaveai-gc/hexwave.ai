import mongoose, { Connection } from "mongoose";

// Mongoose does *not* like being bundled multiple times during hot-reloads in
// Next.js / Turborepo.  We attach a single cache map to the Node global object
// so that every invocation (including background jobs, API routes, edge
// functions, etc.) re-uses existing connections and avoids creating an
// unbounded number of pools.

// Enhanced types for production monitoring
interface ConnectionMetadata {
  lastHealthCheck: Date;
  consecutiveFailures: number;
  isHealthy: boolean;
  createdAt: Date;
  reconnectAttempts: number;
  lastError?: any;
}

interface CircuitBreaker {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureCount: number;
  lastFailureTime: Date;
  nextAttemptTime: Date;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoConnCache__: Map<string, Connection> | undefined;
  // eslint-disable-next-line no-var
  var __mongoConnMetadata__: Map<string, ConnectionMetadata> | undefined;
  // eslint-disable-next-line no-var
  var __mongoCircuitBreakers__: Map<string, CircuitBreaker> | undefined;
  // eslint-disable-next-line no-var
  var __mongoConnectSemaphore__:
    | Map<string, Promise<Connection> | null>
    | undefined;
}

// Ensure all caches exist exactly once per process
const connectionCache: Map<string, Connection> =
  global.__mongoConnCache__ ?? new Map();
const connectionMetadata: Map<string, ConnectionMetadata> =
  global.__mongoConnMetadata__ ?? new Map();
const circuitBreakers: Map<string, CircuitBreaker> =
  global.__mongoCircuitBreakers__ ?? new Map();
const connectSemaphore: Map<string, Promise<Connection> | null> =
  global.__mongoConnectSemaphore__ ?? new Map();

if (!global.__mongoConnCache__) {
  global.__mongoConnCache__ = connectionCache;
}
if (!global.__mongoConnMetadata__) {
  global.__mongoConnMetadata__ = connectionMetadata;
}
if (!global.__mongoCircuitBreakers__) {
  global.__mongoCircuitBreakers__ = circuitBreakers;
}
if (!global.__mongoConnectSemaphore__) {
  global.__mongoConnectSemaphore__ = connectSemaphore;
}

// ---------------------------------------------------------------------------
// Constants & Utility helpers
// ---------------------------------------------------------------------------

const MAIN_DB_KEY = "main" as const;
const MAIN_DB_URI = process.env.MONGODB_URI ?? "";

if (!MAIN_DB_URI) {
  throw new Error("Missing env var: MONGODB_URI");
}

// Configuration constants for production reliability
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  timeout: 60000, // 1 minute
  resetTimeout: 300000, // 5 minutes
} as const;

const HEALTH_CHECK_CONFIG = {
  interval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  maxFailures: 3,
} as const;

function getDbUri(dbName: string): string {
  if (dbName === MAIN_DB_KEY) return MAIN_DB_URI;
  const envKey = `MONGODB_${dbName.toUpperCase()}_URI`;
  const uri = process.env[envKey];
  if (!uri) throw new Error(`Missing env: ${envKey}`);
  return uri;
}


// Production-optimized connection options with enhanced reliability
const getConnectionOptions = (dbName: string): mongoose.ConnectOptions => {
  const baseOptions: mongoose.ConnectOptions = {
    // Connection Pool Configuration (optimized for serverless)
    maxPoolSize:  100,
    minPoolSize:  10,
    maxIdleTimeMS: 300_000, // 10s for serverless, 5min otherwise
    waitQueueTimeoutMS: 30_000, // 15 seconds max wait for connection

    // Timeout Configuration (adjusted for serverless)
    serverSelectionTimeoutMS: 20_000, // Faster for serverless
    socketTimeoutMS: 60_000, // 1 minute for longer operations
    connectTimeoutMS: 20_000, // Faster for serverless
    heartbeatFrequencyMS: 30_000, // Less frequent for serverless

    // Reliability Configuration
    bufferCommands: false, // Fail fast instead of buffering indefinitely 

    // Network Configuration
    family: 4, // IPv4 only for stability

    // TLS/SSL Configuration for Atlas (automatically handled for mongodb+srv)
    retryWrites: true, // Enable retry writes for production
    retryReads: true, // Enable retry reads for production
  
  };
 
    // Disable monitoring in serverless to reduce overhead
    (baseOptions as any).monitorCommands = false;
    // Disable server discovery monitoring
    (baseOptions as any).srvMaxHosts = 0;
  

  return baseOptions;
};

// ---------------------------------------------------------------------------
// Circuit Breaker and Health Monitoring
// ---------------------------------------------------------------------------

// Circuit breaker implementation
function getCircuitBreaker(dbName: string): CircuitBreaker {
  if (!circuitBreakers.has(dbName)) {
    circuitBreakers.set(dbName, {
      state: "CLOSED",
      failureCount: 0,
      lastFailureTime: new Date(0),
      nextAttemptTime: new Date(0),
    });
  }
  return circuitBreakers.get(dbName)!;
}

function checkCircuitBreaker(dbName: string): boolean {
  const breaker = getCircuitBreaker(dbName);
  const now = new Date();

  switch (breaker.state) {
    case "CLOSED":
      return true;
    case "OPEN":
      if (now >= breaker.nextAttemptTime) {
        breaker.state = "HALF_OPEN";
        console.log(`Circuit breaker for ${dbName} entering HALF_OPEN state`);
        return true;
      }
      return false;
    case "HALF_OPEN":
      return true;
    default:
      return true;
  }
}

function recordCircuitBreakerSuccess(dbName: string): void {
  const breaker = getCircuitBreaker(dbName);
  breaker.failureCount = 0;
  breaker.state = "CLOSED";
  if (breaker.state !== "CLOSED") {
    console.log(`Circuit breaker for ${dbName} reset to CLOSED state`);
  }
}

function recordCircuitBreakerFailure(dbName: string): void {
  const breaker = getCircuitBreaker(dbName);
  const now = new Date();

  breaker.failureCount++;
  breaker.lastFailureTime = now;

  if (breaker.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    breaker.state = "OPEN";
    breaker.nextAttemptTime = new Date(
      now.getTime() + CIRCUIT_BREAKER_CONFIG.resetTimeout
    );
    console.error(`Circuit breaker for ${dbName} OPEN - too many failures`, {
      failureCount: breaker.failureCount,
      nextAttemptTime: breaker.nextAttemptTime,
    });
  }
}

// Connection health check
async function isConnectionHealthy(
  connection: Connection,
  dbName: string,
  skipPing: boolean = false
): Promise<boolean> {
  try {
    // Check basic connection state
    if (!connection || connection.readyState !== 1) {
      return false;
    }

    // For initial connection checks, skip ping to avoid false negatives
    if (skipPing) {
      return true;
    }

    // Check if db property exists before attempting ping
    if (!connection.db) {
      console.warn(
        `Connection for ${dbName} missing db property, considering unhealthy`
      );
      return false;
    }

    // Perform ping test with timeout
    const pingPromise = connection.db.admin().ping();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Health check timeout")),
        HEALTH_CHECK_CONFIG.timeout
      )
    );

    await Promise.race([pingPromise, timeoutPromise]);
    return true;
  } catch (error) {
    // Don't log warnings for expected transient errors during connection establishment
    const isTransientError =
      error instanceof Error &&
      (error.message.includes("topology") ||
        error.message.includes("not connected") ||
        error.message.includes("ECONN"));

    if (!isTransientError) {
      console.warn(`Health check failed for ${dbName}:`, error);
    }

    return false;
  }
}

// Update connection metadata
function updateConnectionMetadata(
  dbName: string,
  isHealthy: boolean,
  error?: any
): void {
  if (!connectionMetadata.has(dbName)) {
    connectionMetadata.set(dbName, {
      lastHealthCheck: new Date(),
      consecutiveFailures: 0,
      isHealthy: true,
      createdAt: new Date(),
      reconnectAttempts: 0,
    });
  }

  const metadata = connectionMetadata.get(dbName)!;
  metadata.lastHealthCheck = new Date();
  metadata.isHealthy = isHealthy;

  if (isHealthy) {
    metadata.consecutiveFailures = 0;
    recordCircuitBreakerSuccess(dbName);
  } else {
    metadata.consecutiveFailures++;
    metadata.lastError = error;
    recordCircuitBreakerFailure(dbName);
  }
}

// Setup connection event handlers with health monitoring
function setupConnectionEventHandlers(
  connection: Connection,
  dbName: string
): void {
  // Prevent duplicate event handlers
  if (connection.listenerCount("connected") > 0) {
    return;
  }

  connection.on("connected", () => {
    console.log(`MongoDB connected successfully: ${dbName}`);
    updateConnectionMetadata(dbName, true);
  });

  connection.on("error", (error) => {
    console.error(`MongoDB connection error for ${dbName}:`, error);
    updateConnectionMetadata(dbName, false, error);
  });

  connection.on("disconnected", () => {
    console.warn(`MongoDB disconnected: ${dbName}`);
    updateConnectionMetadata(dbName, false);
  });

  connection.on("reconnected", () => {
    console.log(`MongoDB reconnected: ${dbName}`);
    updateConnectionMetadata(dbName, true);
  });

  connection.on("close", () => {
    console.warn(`MongoDB connection closed: ${dbName}`);
    updateConnectionMetadata(dbName, false);
  });

  connection.on("fullsetup", () => {
    console.log(`MongoDB replica set connected: ${dbName}`);
  });

  connection.on("all", () => {
    console.log(`MongoDB all servers connected: ${dbName}`);
  }); 

  // Clean up interval on connection close
  connection.on("close", () => {
    const interval = (connection as any).__healthCheckInterval;
    if (interval) {
      clearInterval(interval);
      delete (connection as any).__healthCheckInterval;
    }
  });
}

// ---------------------------------------------------------------------------
// Robust connect with retry (exponential back-off)
// ---------------------------------------------------------------------------

async function connectWithRetry(
  uri: string,
  dbKey: string
): Promise<Connection> {
  const MAX_RETRIES = 5;
  const BASE_DELAY = 1_000; // 1s

  // Check circuit breaker before attempting connection
  if (!checkCircuitBreaker(dbKey)) {
    throw new Error(
      `Circuit breaker is OPEN for ${dbKey}. Too many recent failures.`
    );
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const connectionOptions = getConnectionOptions(dbKey);
      const conn = await mongoose
        .createConnection(uri, connectionOptions)
        .asPromise();

      // Setup enhanced event handlers
      setupConnectionEventHandlers(conn, dbKey);

      // Verify connection health before returning (skip ping for initial connection)
      const isHealthy = await isConnectionHealthy(conn, dbKey, true);
      if (!isHealthy) {
        await conn.close();
        throw new Error(`Initial health check failed for ${dbKey}`);
      }

      console.log(`[mongo:${dbKey}] connected successfully`);
      updateConnectionMetadata(dbKey, true);
      return conn;
    } catch (err) {
      const isLast = attempt === MAX_RETRIES;
      const error = err;

      // Check if it's a retryable error
      const isRetryableError =
        error.name === "MongoNetworkTimeoutError" ||
        error.name === "MongoTimeoutError" ||
        error.name === "MongoServerSelectionError" ||
        error.name === "MongoNetworkError" ||
        error.message?.includes("timed out") ||
        error.message?.includes("connection") ||
        error.message?.includes("ECONNRESET") ||
        error.message?.includes("ENOTFOUND") ||
        error.message?.includes("TLS") ||
        error.message?.includes("secure TLS connection") ||
        (error as any).code === "ETIMEDOUT" ||
        (error as any).code === "ECONNREFUSED";

      console.error(
        `[mongo:${dbKey}] connection attempt #${attempt + 1} failed`,
        error,
        {
          isRetryable: isRetryableError,
          errorName: error?.name,
          errorCode: (error as any).code,
        }
      );

      updateConnectionMetadata(dbKey, false, error);

      if (isLast || !isRetryableError) {
        throw error;
      }

      // Exponential back-off with jitter
      const delay = BASE_DELAY * 2 ** attempt + Math.random() * 1_000;
      console.warn(`[mongo:${dbKey}] retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  // Unreachable – TypeScript needs a return
  throw new Error("Exhausted MongoDB connection retries");
}
 

export async function dbConnect(dbName?: string) {

  // 1. Handle main database connection with semaphore to prevent race conditions
  if (!connectionCache.has(MAIN_DB_KEY)) {
    // Check if there's already a connection attempt in progress
    const existingSemaphore = connectSemaphore.get(MAIN_DB_KEY);
    if (existingSemaphore) {
      // Wait for existing connection attempt
      await existingSemaphore;
    } else {
      // Create new connection attempt
      const connectionPromise = (async () => {
        try {
          console.log("(boot) establishing main MongoDB connection");

          // Disconnect existing mongoose connection if it exists
          if (mongoose.connection.readyState !== 0) {
            console.warn("Closing existing global mongoose connection");
            await mongoose.disconnect();
          } 
          mongoose.set("bufferCommands", false); // Disable buffering globally

          // Use mongoose.connect for main database to ensure proper global setup
          const connectionOptions = getConnectionOptions(MAIN_DB_KEY);
          await mongoose.connect(MAIN_DB_URI, connectionOptions);

          const mainConn = mongoose.connection;

          // Setup enhanced event handlers for main connection
          setupConnectionEventHandlers(mainConn, MAIN_DB_KEY);

          // Verify connection health with a small delay to allow connection to stabilize
          await new Promise((resolve) => setTimeout(resolve, 100));
          const isHealthy = await isConnectionHealthy(
            mainConn,
            MAIN_DB_KEY,
            true
          );
          if (!isHealthy) {
            await mongoose.disconnect();
            throw new Error(`Initial health check failed for ${MAIN_DB_KEY}`);
          }

          connectionCache.set(MAIN_DB_KEY, mainConn);
          updateConnectionMetadata(MAIN_DB_KEY, true);

          return mainConn;
        } catch (error) {
          // Clear semaphore on error
          connectSemaphore.delete(MAIN_DB_KEY);
          throw error;
        }
      })();

      connectSemaphore.set(MAIN_DB_KEY, connectionPromise);

      try {
        await connectionPromise;
      } finally {
        // Clear semaphore after successful connection
        connectSemaphore.delete(MAIN_DB_KEY);
      }
    }
  }

  // 2. Ensure main connection exists and is healthy
  const mainConnection = connectionCache.get(MAIN_DB_KEY);
  if (!mainConnection || mainConnection.readyState !== 1) {
    console.warn(`Main connection not ready, clearing cache and retrying`);
    connectionCache.delete(MAIN_DB_KEY);
    connectSemaphore.delete(MAIN_DB_KEY);
    return await dbConnect(dbName);
  }

  // 3. If caller only needs the main connection → early return
  if (!dbName || dbName === MAIN_DB_KEY) {
    return { main: mongoose } as const;
  }

  // 4. Handle additional database connections with enhanced validation
  if (!connectionCache.has(dbName)) {
    // Check if there's already a connection attempt in progress
    const existingSemaphore = connectSemaphore.get(dbName);
    if (existingSemaphore) {
      await existingSemaphore;
    } else {
      const connectionPromise = (async () => {
        try {
          const uri = getDbUri(dbName);
          console.log(`(boot) establishing ${dbName} MongoDB connection`);

          const conn = await connectWithRetry(uri, dbName);
          connectionCache.set(dbName, conn);

          return conn;
        } catch (error) {
          // Clear semaphore on error
          connectSemaphore.delete(dbName);
          throw error;
        }
      })();

      connectSemaphore.set(dbName, connectionPromise);

      try {
        await connectionPromise;
      } finally {
        // Clear semaphore after successful connection
        connectSemaphore.delete(dbName);
      }
    }
  }

  // 5. Validate and retrieve the additional connection
  const additionalConn = connectionCache.get(dbName);
  if (!additionalConn) {
    console.error(`Connection for ${dbName} not found in cache after establishment`);
    throw new Error(`Failed to establish connection for ${dbName}`);
  }

  // Check connection health
  const metadata = connectionMetadata.get(dbName);
  if (metadata && !metadata.isHealthy && additionalConn.readyState !== 1) {
    console.warn(
      `Existing connection for ${dbName} is unhealthy, attempting to reconnect`
    );

    // Remove unhealthy connection
    try {
      await additionalConn.close();
    } catch (error) {
      console.warn(`Error closing unhealthy connection for ${dbName}:`, error);
    }

    connectionCache.delete(dbName);
    connectSemaphore.delete(dbName);

    // Recursively call dbConnect to establish new connection
    return await dbConnect(dbName);
  }

  return {
    main: mongoose,
    [dbName]: additionalConn,
  } as const;
}

// ---------------------------------------------------------------------------
// Production Utilities and Monitoring
// ---------------------------------------------------------------------------

/**
 * Get comprehensive connection health status for monitoring
 */
export function getConnectionHealth(): Record<string, any> {
  const health: Record<string, any> = {};

  for (const [dbName, connection] of connectionCache.entries()) {
    const metadata = connectionMetadata.get(dbName);
    const breaker = circuitBreakers.get(dbName);

    health[dbName] = {
      connectionState: connection.readyState,
      connectionStateText: getReadyStateText(connection.readyState),
      isHealthy: metadata?.isHealthy ?? false,
      lastHealthCheck: metadata?.lastHealthCheck,
      consecutiveFailures: metadata?.consecutiveFailures ?? 0,
      reconnectAttempts: metadata?.reconnectAttempts ?? 0,
      createdAt: metadata?.createdAt,
      lastError: metadata?.lastError?.message,
      circuitBreaker: {
        state: breaker?.state ?? "CLOSED",
        failureCount: breaker?.failureCount ?? 0,
        lastFailureTime: breaker?.lastFailureTime,
        nextAttemptTime: breaker?.nextAttemptTime,
      },
      poolStats: {
        totalConnections:
          (connection as any)?.db?.s?.topology?.s?.pools?.size ?? 0,
        availableConnections:
          (connection as any)?.db?.s?.topology?.s?.state ?? "unknown",
      },
    };
  }

  return health;
}

function getReadyStateText(state: number): string {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    case 99:
      return "uninitialized";
    default:
      return "unknown";
  }
}

/**
 * Gracefully close all database connections
 */
export async function closeAllConnections(): Promise<void> {
  console.log("Closing all database connections...");

  const closePromises = Array.from(connectionCache.entries()).map(
    async ([dbName, connection]) => {
      try {
        await connection.close();
        console.log(`Closed connection for ${dbName}`);
      } catch (error) {
        console.error(`Error closing connection for ${dbName}:`, error);
      }
    }
  );

  await Promise.allSettled(closePromises);

  // Clear all caches
  connectionCache.clear();
  connectionMetadata.clear();
  circuitBreakers.clear();
  connectSemaphore.clear();

  console.log("All database connections closed");
}

/**
 * Force reconnect a specific database connection
 */
export async function forceReconnect(dbName: string): Promise<void> {
  console.log(`Force reconnecting ${dbName}...`);

  // Close existing connection
  if (connectionCache.has(dbName)) {
    const connection = connectionCache.get(dbName)!;
    try {
      await connection.close();
    } catch (error) {
      console.warn(`Error closing existing connection for ${dbName}:`, error);
    }
    connectionCache.delete(dbName);
  }

  // Clear metadata and circuit breaker
  connectionMetadata.delete(dbName);
  circuitBreakers.delete(dbName);
  connectSemaphore.delete(dbName);

  // Reconnect
  await dbConnect(dbName);

  console.log(`Successfully reconnected ${dbName}`);
}

/**
 * Check if database connection is ready
 */
export function isConnectionReady(dbName?: string): boolean {
  const targetDbName = dbName || MAIN_DB_KEY;

  if (targetDbName === MAIN_DB_KEY) {
    // For main database, check the global mongoose connection
    const metadata = connectionMetadata.get(targetDbName);
    return !!(
      mongoose.connection &&
      mongoose.connection.readyState === 1 &&
      metadata?.isHealthy !== false
    );
  }

  // For other databases, check the cached connection
  const connection = connectionCache.get(targetDbName);
  const metadata = connectionMetadata.get(targetDbName);

  return !!(
    connection &&
    connection.readyState === 1 &&
    metadata?.isHealthy !== false
  );
}

/**
 * Get connection pool statistics
 */
export function getConnectionPoolStats(): Record<string, any> {
  const stats: Record<string, any> = {};

  for (const [dbName, connection] of connectionCache.entries()) {
    try {
      // Access internal MongoDB driver statistics
      const poolSize = (connection as any)?.db?.s?.topology?.s?.poolSize ?? 0;
      const availableConnections =
        (connection as any)?.db?.s?.topology?.s?.availableConnections ?? 0;
      const checkedOutConnections =
        (connection as any)?.db?.s?.topology?.s?.checkedOutConnections ?? 0;

      stats[dbName] = {
        readyState: connection.readyState,
        poolSize,
        availableConnections,
        checkedOutConnections,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        modelsRegistered: Object.keys(connection.models).length,
      };
    } catch (error) {
      stats[dbName] = { error: "Unable to retrieve pool stats" };
    }
  }

  return stats;
}

// Setup graceful shutdown handlers
if (typeof process !== "undefined") {
  const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received. Performing graceful shutdown...`);
    await closeAllConnections();
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // nodemon restart
}