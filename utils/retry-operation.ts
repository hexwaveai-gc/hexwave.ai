export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 2000,
  exponentialBackoff: true,
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 5,
    baseDelay = 1000,
    maxDelay = 30000,
    exponentialBackoff = true,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[retryOperation] Attempt ${attempt}/${maxAttempts}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`[retryOperation] Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      console.warn(`[retryOperation] Attempt ${attempt}/${maxAttempts} failed`, {
        attempt,
        maxAttempts,
        errorMessage: lastError.message
      });

      if (attempt === maxAttempts) {
        console.error(`[retryOperation] All ${maxAttempts} attempts failed`, lastError);
        throw lastError;
      }

      // Calculate delay with exponential backoff
      let delay = exponentialBackoff 
        ? Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
        : baseDelay;

      // Add jitter to prevent thundering herd
      delay = delay + Math.random() * 1000;

      console.log(`[retryOperation] Retrying in ${delay}ms...`, {
        attempt,
        nextAttempt: attempt + 1,
        delay
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export default retryOperation;
