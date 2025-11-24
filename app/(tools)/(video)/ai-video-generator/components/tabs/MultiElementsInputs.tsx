"use client";

/**
 * Multi-Elements tab content
 * Placeholder for future implementation
 * 
 * Reasoning: Provides consistent structure for future feature
 */
export function MultiElementsInputs() {
  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center dark:border-[var(--color-border-container)]/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[var(--color-bg-primary)]">
              <svg
                className="h-8 w-8 text-gray-400 dark:text-[var(--color-text-3)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-[var(--color-text-1)]">
              Multi-Elements Coming Soon
            </h3>
            <p className="text-sm text-gray-600 dark:text-[var(--color-text-2)]">
              Combine multiple elements to create complex video compositions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

