"use client";

import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { getAllModels, getModelById } from "../lib/modelRegistry";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorDialogProps {
  value: string;
  onChange: (modelId: string) => void;
}

/**
 * Dialog-based model selector for choosing image generation model
 */
export default function ModelSelectorDialog({
  value,
  onChange,
}: ModelSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const models = getAllModels();
  const selectedModel = getModelById(value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-full justify-between rounded-lg border-gray-200 px-4 py-3 text-left dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)] hover:dark:bg-[var(--color-bg-secondary)]"
        >
          <div className="flex flex-col items-start">
            <span className="text-base font-medium">
              {selectedModel?.name || "Select Model"}
            </span>
            {selectedModel?.description && (
              <span className="text-xs text-gray-500 dark:text-[var(--color-text-3)]">
                {selectedModel.description}
              </span>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg dark:bg-[var(--color-bg-dialog)] dark:border-[var(--color-border-container)]">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-[var(--color-text-1)]">
            Select Model
          </DialogTitle>
          <DialogDescription className="dark:text-[var(--color-text-3)]">
            Choose an AI model for image generation
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onChange(model.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start justify-between rounded-lg border-2 p-4 text-left transition-all",
                value === model.id
                  ? "border-[var(--color-theme-2)] bg-[var(--color-theme-3)] dark:border-[var(--color-theme-2)] dark:bg-[var(--color-theme-3)]"
                  : "border-transparent bg-gray-50 hover:bg-gray-100 dark:border-transparent dark:bg-[var(--color-bg-primary)] dark:hover:bg-[var(--color-bg-secondary)]"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
                    {model.name}
                  </span>
                  {value === model.id && (
                    <Check className="h-4 w-4 text-[var(--color-theme-2)]" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-[var(--color-text-3)]">
                  {model.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

