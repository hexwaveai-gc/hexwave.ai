'use client';

import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Info } from 'lucide-react';

interface SoundEffectsToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Sound effects toggle component
 * Allows users to enable/disable sound effects generation
 * 
 * Reasoning: Small, focused component for sound effects control
 */
export function SoundEffectsToggle({
  enabled,
  onToggle,
}: SoundEffectsToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[18px] border border-gray-200 bg-gray-50 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]">
      <div className="flex items-center gap-2">
        <Label htmlFor="sound-effects" className="text-sm font-medium cursor-pointer text-gray-900 dark:text-[var(--color-text-1)]">
          Sound Effects
        </Label>
        <Info className="h-4 w-4 text-gray-500 dark:text-[var(--color-text-3)]" />
        <span className="text-xs text-gray-500 dark:text-[var(--color-text-3)]">Free for now</span>
      </div>
      <Switch id="sound-effects" checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

