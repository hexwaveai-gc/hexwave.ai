'use client';

import { Button } from '@/app/components/ui/button';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Generate button component
 * Primary action button for video generation
 * 
 * Reasoning: Isolated button component for easy styling and state management
 */
export function GenerateButton({ onClick, disabled }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="neon"
      size="xl"
      className="w-full transition-colors"
    >
      Generate
    </Button>
  );
}

