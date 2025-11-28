import { Skeleton } from "@/app/components/ui/skeleton";

export default function AudioLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar placeholder */}
      <div className="w-19 bg-[#0a0a0a]" />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <div className="flex h-screen">
          {/* Main Area */}
          <div className="flex-1 flex flex-col p-6">
            {/* Header */}
            <Skeleton className="h-8 w-24 mb-6 bg-white/5" />

            {/* Voice Controls */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-10 w-32 rounded-full bg-white/5" />
              <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
              <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
            </div>

            {/* Text Area */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#0f0f0f] p-4">
              <Skeleton className="h-4 w-3/4 mb-2 bg-white/5" />
              <Skeleton className="h-4 w-1/2 mb-2 bg-white/5" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <Skeleton className="h-4 w-16 bg-white/5" />
                <Skeleton className="h-10 w-28 rounded-xl bg-white/5" />
              </div>
            </div>
          </div>

          {/* History Panel */}
          <aside className="w-80 xl:w-96 border-l border-white/10 bg-[#0f0f0f]">
            <div className="px-6 py-4 border-b border-white/10">
              <Skeleton className="h-5 w-20 bg-white/5" />
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2 bg-white/5" />
                    <Skeleton className="h-3 w-full mb-1 bg-white/5" />
                    <Skeleton className="h-3 w-2/3 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


