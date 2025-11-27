export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar Placeholder */}
      <aside className="w-19 bg-[#0a0a0a] flex-shrink-0" />

      {/* Main Content */}
      <main className="flex-1 ml-20 flex">
        {/* Left Sidebar Skeleton */}
        <aside className="w-80 xl:w-96 border-r border-white/10 bg-[#0f0f0f] flex-shrink-0">
          <div className="p-5 border-b border-white/10">
            <div className="h-6 w-28 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="p-5 space-y-4">
            {/* Avatar Preview Skeleton */}
            <div className="aspect-video w-full bg-white/5 rounded-xl animate-pulse" />
            
            {/* Avatar Info Skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-6 w-18 bg-white/5 rounded animate-pulse" />
              </div>
            </div>

            {/* Script Input Skeleton */}
            <div className="space-y-2 pt-4">
              <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
              <div className="h-24 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>

            {/* Reference Image Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          {/* Header Skeleton */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-14 bg-white/10 rounded-md animate-pulse" />
                ))}
              </div>
              <div className="h-9 w-32 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
