"use client";

import { useEffect, useState } from "react";
import type { ProcessStatus } from "@/hooks/queries/use-process";

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "update";
  message: string;
}

interface ProcessMonitorProps {
  processId: string | null;
  status: ProcessStatus;
  data: Record<string, unknown> | null;
  error: string | null;
  isLoading: boolean;
  onReset?: () => void;
}

export function ProcessMonitor({
  processId,
  status,
  data,
  error,
  isLoading,
  onReset,
}: ProcessMonitorProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showRawData, setShowRawData] = useState(false);

  // Add timeline events based on status changes
  useEffect(() => {
    if (!processId) return;

    if (status === "processing") {
      addTimelineEvent("info", `Process started: ${processId.slice(0, 8)}...`);
      addTimelineEvent("info", "Subscribed to Ably channel for real-time updates");
    }
  }, [processId, status === "processing"]);

  useEffect(() => {
    if (status === "completed" && data) {
      addTimelineEvent("success", "Received completion update via Ably");
      addTimelineEvent(
        "success",
        `Process completed with ${
          (data as { generations?: unknown[] })?.generations?.length ?? 0
        } results`
      );
    }
  }, [status === "completed", data]);

  useEffect(() => {
    if (status === "failed" && error) {
      addTimelineEvent("error", `Process failed: ${error}`);
    }
  }, [status === "failed", error]);

  function addTimelineEvent(
    type: TimelineEvent["type"],
    message: string
  ) {
    setTimeline((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        type,
        message,
      },
    ]);
  }

  function handleReset() {
    setTimeline([]);
    onReset?.();
  }

  const statusConfig = {
    idle: {
      label: "Idle",
      color: "bg-zinc-500",
      textColor: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
    },
    processing: {
      label: "Processing",
      color: "bg-amber-500",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    completed: {
      label: "Completed",
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    failed: {
      label: "Failed",
      color: "bg-red-500",
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📊</span>
          <h3 className="font-semibold">Process Monitor</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${currentStatus.bgColor}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${currentStatus.color} ${
                status === "processing" ? "animate-pulse" : ""
              }`}
            />
            <span className={currentStatus.textColor}>{currentStatus.label}</span>
          </div>

          {/* Reset Button */}
          {(status === "completed" || status === "failed") && (
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Process ID */}
        {processId && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Process ID:</span>
            <code className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
              {processId}
            </code>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && status === "processing" && (
          <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <div className="relative">
              <div className="w-5 h-5 border-2 border-amber-500/30 rounded-full" />
              <div className="absolute top-0 left-0 w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-sm text-amber-400">
              Waiting for real-time update via Ably...
            </span>
          </div>
        )}

        {/* Results */}
        {status === "completed" && data && (
          <div className="space-y-3">
            {/* Generated Images */}
            {(data as { generations?: string[] })?.generations && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">
                  Generated Results
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(data as { generations: string[] }).generations.map(
                    (url, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-zinc-800"
                      >
                        <img
                          src={url}
                          alt={`Result ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            {(data as { metadata?: Record<string, unknown> })?.metadata && (
              <div className="text-xs text-zinc-500 flex flex-wrap gap-3">
                {Object.entries(
                  (data as { metadata: Record<string, unknown> }).metadata
                ).map(([key, value]) => (
                  <span key={key}>
                    <span className="text-zinc-400">{key}:</span>{" "}
                    {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === "failed" && error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-zinc-400">Event Timeline</h4>
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                {showRawData ? "Hide Raw Data" : "Show Raw Data"}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="text-zinc-600 font-mono whitespace-nowrap">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      event.type === "success"
                        ? "bg-emerald-500"
                        : event.type === "error"
                        ? "bg-red-500"
                        : event.type === "update"
                        ? "bg-blue-500"
                        : "bg-zinc-500"
                    }`}
                  />
                  <span className="text-zinc-400">{event.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data */}
        {showRawData && data && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Raw Data</h4>
            <pre className="p-3 bg-zinc-950 rounded-lg text-xs text-zinc-400 overflow-auto max-h-48">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* Empty State */}
        {status === "idle" && (
          <div className="text-center py-8 text-zinc-500">
            <span className="text-3xl mb-2 block">🎯</span>
            <p className="text-sm">
              Start a process to see real-time updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessMonitor;

