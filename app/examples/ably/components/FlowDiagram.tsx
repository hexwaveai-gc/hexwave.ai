"use client";

import { useState } from "react";

interface FlowStep {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const flowSteps: FlowStep[] = [
  {
    id: "frontend",
    label: "Frontend",
    description: "User triggers action, receives processId, subscribes to Ably channel",
    icon: "🖥️",
  },
  {
    id: "backend",
    label: "Backend API",
    description: "Generates processId, stores in MongoDB, calls external API with webhook URL",
    icon: "⚙️",
  },
  {
    id: "external",
    label: "External API",
    description: "Processes request asynchronously, calls webhook when complete",
    icon: "🌐",
  },
  {
    id: "webhook",
    label: "Webhook Handler",
    description: "Receives result, updates MongoDB, publishes to Ably channel",
    icon: "📨",
  },
  {
    id: "ably",
    label: "Ably Channel",
    description: "Real-time pub/sub delivers instant updates to frontend",
    icon: "📡",
  },
];

interface FlowDiagramProps {
  activeStep?: string;
  className?: string;
}

export function FlowDiagram({ activeStep, className = "" }: FlowDiagramProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  return (
    <div className={`bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 ${className}`}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="text-xl">🔄</span>
        Real-Time Webhook Flow
      </h3>

      {/* Flow Steps */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Box */}
            <div
              className={`
                relative group cursor-pointer transition-all duration-300
                ${activeStep === step.id
                  ? "scale-110"
                  : "hover:scale-105"
                }
              `}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                className={`
                  px-4 py-3 rounded-xl border-2 transition-all duration-300
                  ${activeStep === step.id
                    ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-medium text-zinc-300">
                    {step.label}
                  </span>
                </div>

                {/* Active indicator */}
                {activeStep === step.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Tooltip */}
              {hoveredStep === step.id && (
                <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl">
                  <p className="text-xs text-zinc-400">{step.description}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
                </div>
              )}
            </div>

            {/* Arrow */}
            {index < flowSteps.length - 1 && (
              <div className="flex items-center px-1 md:px-2">
                <svg
                  className={`w-6 h-6 transition-colors duration-300 ${
                    activeStep === step.id || activeStep === flowSteps[index + 1]?.id
                      ? "text-emerald-500"
                      : "text-zinc-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border-2 border-emerald-500" />
          <span>Active Step</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-800/50 border-2 border-zinc-700" />
          <span>Waiting</span>
        </div>
      </div>
    </div>
  );
}

export default FlowDiagram;

