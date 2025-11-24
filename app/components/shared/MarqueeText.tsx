"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  /**
   * The text content to display in the marquee
   */
  children: ReactNode;
  
  /**
   * Animation duration in seconds (default: 8s)
   */
  duration?: number;
  
  /**
   * Direction of the marquee animation
   * @default "left"
   */
  direction?: "left" | "right";
  
  /**
   * Whether to pause animation on hover
   * @default true
   */
  pauseOnHover?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional CSS classes for the inner content wrapper
   */
  contentClassName?: string;
}

/**
 * Reusable MarqueeText component for scrolling text effects
 * 
 * Features:
 * - Horizontal scrolling animation
 * - Pause on hover (configurable)
 * - Configurable speed and direction
 * - Only animates when content overflows
 * - Smooth, performant CSS animations
 * 
 * Reasoning: DRY, reusable component that can be used across the app
 * for any text that needs marquee scrolling behavior
 */
export default function MarqueeText({
  children,
  duration = 15,
  direction = "left",
  pauseOnHover = true,
  className,
  contentClassName,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if content overflows and needs animation
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = measureRef.current.scrollWidth;
        setShouldAnimate(contentWidth > containerWidth);
      }
    };

    // Use requestAnimationFrame to ensure DOM is rendered
    const rafId = requestAnimationFrame(() => {
      checkOverflow();
    });
    window.addEventListener("resize", checkOverflow);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [children]);

  // Generate animation style dynamically
  const animationName = direction === "left" ? "marquee-left" : "marquee-right";
  const animationStyle = shouldAnimate
    ? {
        animation: `${animationName} ${duration}s linear infinite`,
        animationPlayState: pauseOnHover && isHovered ? "paused" : "running",
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={cn("w-full overflow-hidden whitespace-nowrap relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden element for measuring content width */}
      <span
        ref={measureRef}
        className={cn("invisible absolute whitespace-nowrap max-w-none", contentClassName)}
        aria-hidden="true"
      >
        {children}
      </span>
      <div
        ref={contentRef}
        className={cn("inline-block", contentClassName)}
        style={shouldAnimate ? animationStyle : undefined}
      >
        {/* Duplicate content for seamless loop */}
        {shouldAnimate ? (
          <>
            <span className="inline-block pr-4">{children}</span>
            <span className="inline-block pr-4" aria-hidden="true">{children}</span>
          </>
        ) : (
          <span className="inline-block">{children}</span>
        )}
      </div>
    </div>
  );
}

