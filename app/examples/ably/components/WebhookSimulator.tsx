"use client";

import { useState } from "react";

interface WebhookSimulatorProps {
  processId: string | null;
  isProcessing: boolean;
  onSimulate: (options: { success: boolean; delay: number }) => void;
  isPending?: boolean;
}

export function WebhookSimulator({
  processId,
  isProcessing,
  onSimulate,
  isPending = false,
}: WebhookSimulatorProps) {
  const [delay, setDelay] = useState(1000);
  const [simulateSuccess, setSimulateSuccess] = useState(true);

  const isDisabled = !processId || !isProcessing || isPending;

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎮</span>
        <h3 className="font-semibold">Webhook Simulator</h3>
      </div>

      <p className="text-sm text-zinc-500 mb-4">
        Simulate what happens when an external API completes processing and calls
        your webhook endpoint.
      </p>

      <div className="space-y-4">
        {/* Delay Control */}
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">
            Simulate Delay: {delay}ms
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="500"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            disabled={isDisabled}
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>Instant</span>
            <span>5 seconds</span>
          </div>
        </div>

        {/* Success/Failure Toggle */}
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">
            Simulation Result
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSimulateSuccess(true)}
              disabled={isDisabled}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                simulateSuccess
                  ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800 border-2 border-transparent text-zinc-400 hover:border-zinc-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ✓ Success
            </button>
            <button
              onClick={() => setSimulateSuccess(false)}
              disabled={isDisabled}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !simulateSuccess
                  ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                  : "bg-zinc-800 border-2 border-transparent text-zinc-400 hover:border-zinc-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ✗ Failure
            </button>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={() =>
            onSimulate({
              success: simulateSuccess,
              delay,
            })
          }
          disabled={isDisabled}
          className={`
            w-full py-3 rounded-xl font-medium transition-all
            ${
              isDisabled
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : simulateSuccess
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20"
            }
          `}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Simulating Webhook...
            </span>
          ) : isDisabled ? (
            "Start a process first"
          ) : (
            `Simulate ${simulateSuccess ? "Success" : "Failure"} Webhook`
          )}
        </button>

        {/* Info Box */}
        {processId && isProcessing && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              <strong>Webhook URL:</strong>
              <br />
              <code className="text-blue-300">
                /api/examples/ably/webhook?processId={processId.slice(0, 8)}...
              </code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebhookSimulator;

