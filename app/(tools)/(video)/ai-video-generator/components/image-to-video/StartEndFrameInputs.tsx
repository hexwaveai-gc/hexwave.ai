import { Plus, ArrowRightLeft } from 'lucide-react';

export function StartEndFrameInputs() {
  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <button className="flex-1 h-10 rounded-md border border-border bg-card/30 hover:bg-card/50 flex items-center justify-center gap-2 text-xs text-muted-foreground transition-colors group">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center group-hover:border-primary group-hover:text-primary">
          <Plus className="w-3 h-3" />
        </div>
        Start
      </button>

      <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />

      <button className="flex-1 h-10 rounded-md border border-border bg-card/30 hover:bg-card/50 flex items-center justify-center gap-2 text-xs text-muted-foreground transition-colors group">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center group-hover:border-primary group-hover:text-primary">
          <Plus className="w-3 h-3" />
        </div>
        End
      </button>
    </div>
  );
}

