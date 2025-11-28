import Sidebar from "@/app/components/common/Sidebar";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function AssetsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-20 p-6 pb-24">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="h-9 w-40 bg-white/5" />
              <div className="flex items-center gap-4 mt-2">
                <Skeleton className="h-5 w-24 bg-white/5" />
                <Skeleton className="h-5 w-24 bg-white/5" />
                <Skeleton className="h-5 w-24 bg-white/5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-72 bg-white/5" />
              <Skeleton className="h-10 w-32 bg-white/5" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <Skeleton className="h-12 w-full max-w-xl bg-white/5" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-2xl overflow-hidden bg-[#141414] border border-white/5"
              >
                <Skeleton className="aspect-square bg-white/5" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-1/3 bg-white/5" />
                    <Skeleton className="h-3 w-1/4 bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


