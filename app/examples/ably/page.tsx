"use client";

import { useState, useCallback } from "react";
import {
  useProcessStatusQuery,
  useStartProcess,
  useSimulateWebhook,
  useClearProcessCache,
} from "@/hooks/queries/use-process";
import { useUser } from "@/hooks/use-user";
import { useUserStore, selectCredits } from "@/store/useUserStore";
import Sidebar from "@/app/components/common/Sidebar";
import { FlowDiagram } from "./components/FlowDiagram";
import { ProcessMonitor } from "./components/ProcessMonitor";
import { WebhookSimulator } from "./components/WebhookSimulator";

export default function AblyDemoPage() {
  const [processId, setProcessId] = useState<string | null>(null);
  const [activeFlowStep, setActiveFlowStep] = useState<string | undefined>();
  const clearCache = useClearProcessCache();

  // User data with credits - uses TanStack Query + Zustand sync
  const { credits, invalidate: invalidateUser, isLoading: isUserLoading } = useUser();

  // Process status with TanStack Query + Ably
  const { status, data, error, isLoading } = useProcessStatusQuery(processId, {
    onComplete: (completedData) => {
      setActiveFlowStep("ably");
      // Refresh user data to get updated credits
      invalidateUser();
      // Clear active step after animation
      setTimeout(() => setActiveFlowStep(undefined), 2000);
    },
    onError: (errorMessage) => {
      setActiveFlowStep(undefined);
      // Refresh user data - credits may have been refunded
      invalidateUser();
    },
  });

  // Mutations
  const startProcess = useStartProcess();
  const simulateWebhook = useSimulateWebhook();

  // Handle starting a new process
  const handleStartProcess = useCallback(async () => {
    setActiveFlowStep("frontend");

    try {
      const result = await startProcess.mutateAsync({
        toolName: "ably-demo",
        category: "demo",
        data: { startedFrom: "examples-page" },
      });

      setProcessId(result.processId);
      setActiveFlowStep("backend");

      // Refresh credits after process starts (credits deducted)
      invalidateUser();

      // Simulate backend -> external API flow
      setTimeout(() => setActiveFlowStep("external"), 500);
    } catch (err) {
      console.error("Failed to start process:", err);
      setActiveFlowStep(undefined);
    }
  }, [startProcess, invalidateUser]);

  // Handle simulating webhook
  const handleSimulateWebhook = useCallback(
    async ({ success, delay }: { success: boolean; delay: number }) => {
      if (!processId) return;

      setActiveFlowStep("webhook");

      try {
        await simulateWebhook.mutateAsync({
          processId,
          success,
          delay,
        });
        // After webhook completes, Ably will push the update
        // The flow will show "ably" step via onComplete callback
      } catch (err) {
        console.error("Failed to simulate webhook:", err);
        setActiveFlowStep(undefined);
      }
    },
    [processId, simulateWebhook]
  );

  // Reset everything
  const handleReset = useCallback(() => {
    if (processId) {
      clearCache(processId);
    }
    setProcessId(null);
    setActiveFlowStep(undefined);
  }, [processId, clearCache]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - offset for sidebar on desktop */}
      <div className="md:ml-20">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📡</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Ably Real-Time Demo
                </h1>
              </div>
              {/* Credit Display */}
              <CreditDisplay credits={credits} isLoading={isUserLoading} />
            </div>
            <p className="text-zinc-400 max-w-2xl">
              Experience the complete webhook flow with real-time updates. This
              demo shows how TanStack Query integrates with Ably for instant
              status notifications without polling.
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8 space-y-8">
        {/* Flow Diagram */}
        <FlowDiagram activeStep={activeFlowStep} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Start Process Section */}
            <section className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🚀</span>
                <h3 className="font-semibold">Start Process</h3>
              </div>

              <p className="text-sm text-zinc-500 mb-4">
                Click to generate a process ID and subscribe to real-time
                updates. This simulates triggering a long-running operation like
                image generation.
              </p>

              <button
                onClick={handleStartProcess}
                disabled={startProcess.isPending || status === "processing"}
                className={`
                  w-full py-3 rounded-xl font-medium transition-all
                  ${
                    startProcess.isPending || status === "processing"
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20"
                  }
                `}
              >
                {startProcess.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Process...
                  </span>
                ) : status === "processing" ? (
                  "Process Running..."
                ) : (
                  "Start Demo Process"
                )}
              </button>

              {startProcess.error && (
                <p className="mt-2 text-sm text-red-400">
                  {startProcess.error.message}
                </p>
              )}
            </section>

            {/* Webhook Simulator */}
            <WebhookSimulator
              processId={processId}
              isProcessing={status === "processing"}
              onSimulate={handleSimulateWebhook}
              isPending={simulateWebhook.isPending}
            />

            {/* Code Example */}
            <CodeExample />
          </div>

          {/* Right Column - Monitor */}
          <ProcessMonitor
            processId={processId}
            status={status}
            data={data}
            error={error}
            isLoading={isLoading}
            onReset={handleReset}
          />
        </div>

        {/* Feature Cards */}
        <FeatureCards />
      </main>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

/**
 * Credit Display Component
 * Shows current credit balance with optimized re-renders via Zustand selector
 */
function CreditDisplay({
  credits,
  isLoading,
}: {
  credits: number;
  isLoading: boolean;
}) {
  // Also subscribe directly to store for instant updates
  const storeCredits = useUserStore(selectCredits);
  const displayCredits = credits || storeCredits;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700">
      <span className="text-lg">💎</span>
      {isLoading ? (
        <div className="w-12 h-5 bg-zinc-700 rounded animate-pulse" />
      ) : (
        <span className="font-semibold text-emerald-400">
          {displayCredits.toLocaleString()}
        </span>
      )}
      <span className="text-xs text-zinc-500">credits</span>
    </div>
  );
}

function CodeExample() {
  const [showCode, setShowCode] = useState(false);

  const exampleCode = `// Using the combined TanStack Query + Ably hook
import { useProcessStatusQuery } from "@/hooks/queries/use-process";
import { useUser } from "@/hooks/use-user";

function MyComponent() {
  const [processId, setProcessId] = useState<string | null>(null);
  const { credits, invalidate } = useUser();

  const { status, data, error, isLoading } = useProcessStatusQuery(
    processId,
    {
      onComplete: (data) => {
        toast.success("Done!");
        invalidate(); // Refresh credits
      },
      onError: (error) => {
        toast.error(error);
        invalidate(); // Credits may be refunded
      },
    }
  );

  // Start a process
  const startProcess = useStartProcess();
  const handleStart = async () => {
    const { processId } = await startProcess.mutateAsync({
      toolName: "my-tool",
    });
    setProcessId(processId);
    invalidate(); // Credits deducted
  };

  return (
    <div>
      <p>Credits: {credits}</p>
      <button onClick={handleStart}>Start</button>
      {isLoading && <Spinner />}
      {status === "completed" && <Results data={data} />}
    </div>
  );
}`;

  return (
    <section className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💻</span>
          <h3 className="font-semibold">Usage Example</h3>
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          {showCode ? "Hide Code" : "Show Code"}
        </button>
      </div>

      {showCode && (
        <pre className="p-4 bg-zinc-950 rounded-xl text-xs text-zinc-300 overflow-x-auto">
          <code>{exampleCode}</code>
        </pre>
      )}

      {!showCode && (
        <p className="text-sm text-zinc-500">
          Click &quot;Show Code&quot; to see how to use the useProcessStatusQuery
          hook with TanStack Query and Ably in your own components.
        </p>
      )}
    </section>
  );
}

function FeatureCards() {
  const features = [
    {
      icon: "⚡",
      title: "Real-Time Updates",
      description:
        "Ably pushes updates instantly when external APIs complete processing - no polling needed.",
    },
    {
      icon: "💾",
      title: "Smart Caching",
      description:
        "TanStack Query caches process results. Refresh the page and completed processes are instantly available.",
    },
    {
      icon: "🔄",
      title: "Automatic Sync",
      description:
        "Real-time Ably updates automatically sync with TanStack Query cache for consistency.",
    },
    {
      icon: "💎",
      title: "Credit Tracking",
      description:
        "Credits are deducted on process start and automatically refunded if the process fails.",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <span className="text-2xl mb-2 block">{feature.icon}</span>
          <h4 className="font-medium mb-1">{feature.title}</h4>
          <p className="text-xs text-zinc-500">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
