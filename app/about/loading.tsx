export default function AboutLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 lg:h-20 bg-transparent" />
      
      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-16 animate-pulse">
          <div className="inline-block h-8 w-32 rounded-full bg-white/5 mb-6" />
          <div className="h-14 w-80 mx-auto rounded-lg bg-white/5 mb-6" />
        </div>
        
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-full rounded bg-white/5" />
          <div className="h-6 w-11/12 mx-auto rounded bg-white/5" />
          <div className="h-6 w-10/12 mx-auto rounded bg-white/5" />
          
          <div className="h-px w-24 mx-auto bg-white/5 my-8" />
          
          <div className="h-6 w-full rounded bg-white/5" />
          <div className="h-6 w-11/12 mx-auto rounded bg-white/5" />
          <div className="h-6 w-10/12 mx-auto rounded bg-white/5" />
        </div>
        
        {/* Feature Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 mb-4" />
              <div className="h-5 w-32 rounded bg-white/5 mb-2" />
              <div className="h-4 w-full rounded bg-white/5" />
              <div className="h-4 w-3/4 rounded bg-white/5 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

