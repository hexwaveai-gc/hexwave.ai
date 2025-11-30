import Sidebar from "@/app/components/common/sidebar";

function ToolCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#151515] border border-white/10 animate-pulse">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-8 w-36 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-80 max-w-full bg-white/5 rounded animate-pulse" />
          </div>

          {/* Filter Tabs Skeleton */}
          <div className="mb-6">
            <div className="inline-flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-20 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
