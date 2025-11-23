"use client";

import { ReactNode } from "react";

interface MediaGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

export default function MediaGrid({
  children,
  columns = 5,
}: MediaGridProps) {
  const columnClasses = {
    2: "columns-1 md:columns-2 gap-4",
    3: "columns-1 sm:columns-2 lg:columns-3 gap-4",
    4: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4",
    5: "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4",
  };

  return (
    <div className={`${columnClasses[columns]} space-y-4`}>
      {children}
    </div>
  );
}

