"use client";

/**
 * Field Error Boundary
 * Catches rendering errors in field components
 * Provides graceful fallback UI
 */

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fieldName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for field components
 * Prevents one field's error from crashing entire form
 */
export class FieldErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (production would use error tracking service)
    console.error("Field rendering error:", {
      fieldName: this.props.fieldName,
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
    
    // In production, log to BetterStack or Sentry
    // logEnhancedError(error, {
    //   errorType: "rendering",
    //   componentName: this.props.fieldName || "unknown",
    //   severity: "high",
    // });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Field Rendering Error
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {this.props.fieldName
                  ? `Failed to render ${this.props.fieldName} field`
                  : "A field failed to render"}
              </p>
              {this.state.error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

