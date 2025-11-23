import { Info } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';

export function MotionControl() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Motion Control</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded font-medium">Beta</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help" title="View Demo">
          <Info className="w-3 h-3" />
          <span>Demo</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/30">
        <span className="text-xs text-muted-foreground">Only available with the 1.6 model</span>
        <div className="flex items-center gap-2">
          <Label htmlFor="motion-switch" className="text-xs font-medium cursor-pointer">Switch</Label>
          <Switch id="motion-switch" />
        </div>
      </div>
    </div>
  );
}
