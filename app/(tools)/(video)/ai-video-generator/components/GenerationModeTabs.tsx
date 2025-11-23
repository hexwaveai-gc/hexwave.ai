'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import { cn } from '@/lib/utils';

interface GenerationModeTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

/**
 * Tabs component for switching between generation modes
 * (Text to Video, Image to Video, Multi-Elements)
 */
export function GenerationModeTabs({
  activeTab,
  onTabChange,
  children,
}: GenerationModeTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start bg-transparent border-b border-border p-0 h-auto rounded-none gap-6 mb-6">
        <Trigger value="text-to-video">Text to Video</Trigger>
        <Trigger value="image-to-video">Image to Video</Trigger>
        <Trigger value="multi-elements">Multi-Elements</Trigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

function Trigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground/80"
      )}
    >
      {children}
    </TabsTrigger>
  );
}
