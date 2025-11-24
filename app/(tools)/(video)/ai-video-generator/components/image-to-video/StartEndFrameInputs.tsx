import { Plus, ArrowRightLeft } from 'lucide-react';

export function StartEndFrameInputs() {
  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <button className="flex-1 h-10 rounded-[18px] border border-gray-200 bg-gray-50/30 hover:bg-gray-50/50 flex items-center justify-center gap-2 text-xs text-gray-600 transition-colors group dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]/30 dark:hover:bg-[var(--color-bg-primary)]/50 dark:text-[var(--color-text-2)]">
        <div className="w-4 h-4 rounded-full border border-gray-400/50 flex items-center justify-center group-hover:border-[var(--color-theme-2)] group-hover:text-[var(--color-theme-2)] dark:border-[var(--color-text-3)]/50">
          <Plus className="w-3 h-3" />
        </div>
        Start
      </button>

      <ArrowRightLeft className="w-4 h-4 text-gray-500 dark:text-[var(--color-text-3)] shrink-0" />

      <button className="flex-1 h-10 rounded-[18px] border border-gray-200 bg-gray-50/30 hover:bg-gray-50/50 flex items-center justify-center gap-2 text-xs text-gray-600 transition-colors group dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]/30 dark:hover:bg-[var(--color-bg-primary)]/50 dark:text-[var(--color-text-2)]">
        <div className="w-4 h-4 rounded-full border border-gray-400/50 flex items-center justify-center group-hover:border-[var(--color-theme-2)] group-hover:text-[var(--color-theme-2)] dark:border-[var(--color-text-3)]/50">
          <Plus className="w-3 h-3" />
        </div>
        End
      </button>
    </div>
  );
}

