"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import DynamicFieldRenderer from "./DynamicFieldRenderer";
import { useImageGenerationStore } from "../store/useImageGenerationStore";

interface AdvancedSettingsDialogProps {
  excludeFields?: string[];
}

/**
 * Advanced Settings Dialog
 * Refactored to use Zustand store - eliminates prop drilling
 */
export default function AdvancedSettingsDialog({
  excludeFields = [],
}: AdvancedSettingsDialogProps) {
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  
  if (!selectedModel || !selectedModel.settings) {
    return null;
  }
  
  const settings = selectedModel.settings;
  
  // Check if there are any fields to show
  const hasAdvancedFields = Object.keys(settings).some(
    (key) => !excludeFields.includes(key)
  );

  if (!hasAdvancedFields) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-lg border-gray-200 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      {/* Dialog - responsive width */}
      <DialogContent className="max-h-[85vh] md:max-h-[80vh] overflow-y-auto rounded-lg w-[95vw] sm:max-w-[425px] dark:bg-[var(--color-bg-dialog)] dark:border-[var(--color-border-container)] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg dark:text-[var(--color-text-1)]">Advanced Settings</DialogTitle>
          <DialogDescription className="text-xs md:text-sm dark:text-[var(--color-text-3)]">
            Configure additional options for your generation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 md:py-4">
          <DynamicFieldRenderer excludeFields={excludeFields} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

