"use client";

import { Settings2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { ModelSettings } from "../lib/models/runwaygen4/settings";
import DynamicFieldRenderer from "./DynamicFieldRenderer";

interface AdvancedSettingsDialogProps {
  settings: ModelSettings;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  excludeFields?: string[];
}

export default function AdvancedSettingsDialog({
  settings,
  values,
  onChange,
  excludeFields = [],
}: AdvancedSettingsDialogProps) {
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
          className="h-10 w-10 shrink-0 rounded-lg border-gray-200 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto rounded-lg sm:max-w-[425px] dark:bg-[var(--color-bg-dialog)] dark:border-[var(--color-border-container)]">
        <DialogHeader>
          <DialogTitle className="dark:text-[var(--color-text-1)]">Advanced Settings</DialogTitle>
          <DialogDescription className="dark:text-[var(--color-text-3)]">
            Configure additional options for your generation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <DynamicFieldRenderer
            settings={settings}
            values={values}
            onChange={onChange}
            excludeFields={excludeFields}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

