"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

export interface SettingOption {
  value: string;
  label: string;
}

export interface Setting {
  /** Unique identifier for this setting */
  id: string;
  
  /** Current value */
  value: string;
  
  /** Available options */
  options: SettingOption[];
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** ARIA label for accessibility */
  ariaLabel: string;
  
  /** Optional custom width class */
  widthClass?: string;
}

interface SettingsRowProps {
  /** Array of settings to display */
  settings: Setting[];
  
  /** Number of columns (2, 3, or 4) */
  columns?: 2 | 3 | 4;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Shared settings row component with dropdown controls
 * Used across image and video generators for consistent UX
 * 
 * Reasoning: Extracted common settings pattern (aspect ratio, duration, etc.)
 * Flexible grid layout supports 2-4 columns of dropdowns
 */
export default function SettingsRow({
  settings,
  columns = 3,
  className,
}: SettingsRowProps) {
  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-2", gridColsClass, className)}>
      {settings.map((setting) => (
        <Select
          key={setting.id}
          value={setting.value}
          onValueChange={setting.onChange}
        >
          <SelectTrigger
            id={setting.id}
            aria-label={setting.ariaLabel}
            className={cn(
              "w-full rounded-lg border-gray-200 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]",
              setting.widthClass
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {setting.options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded-lg"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

