'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface VideoSettingsProps {
  duration: string;
  aspectRatio: string;
  outputCount: string;
  onDurationChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
  onOutputCountChange: (value: string) => void;
}

/**
 * Video settings component with dropdowns for duration, aspect ratio, and output count
 * 
 * Reasoning: Updated to match screenshot - compact row without visible labels
 */
export function VideoSettings({
  duration,
  aspectRatio,
  outputCount,
  onDurationChange,
  onAspectRatioChange,
  onOutputCountChange,
}: VideoSettingsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <Select value={duration} onValueChange={onDurationChange}>
        <SelectTrigger id="duration" aria-label="Duration" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5s">5s</SelectItem>
          <SelectItem value="10s">10s</SelectItem>
          <SelectItem value="15s">15s</SelectItem>
          <SelectItem value="30s">30s</SelectItem>
        </SelectContent>
      </Select>

      <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
        <SelectTrigger id="aspect-ratio" aria-label="Aspect Ratio" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="16:9">16:9</SelectItem>
          <SelectItem value="9:16">9:16</SelectItem>
          <SelectItem value="1:1">1:1</SelectItem>
          <SelectItem value="4:3">4:3</SelectItem>
        </SelectContent>
      </Select>

      <Select value={outputCount} onValueChange={onOutputCountChange}>
        <SelectTrigger id="output-count" aria-label="Output Count" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 Output</SelectItem>
          <SelectItem value="2">2 Outputs</SelectItem>
          <SelectItem value="3">3 Outputs</SelectItem>
          <SelectItem value="4">4 Outputs</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
