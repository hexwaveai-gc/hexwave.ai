"use client";

export function AboutContent() {
  return (
    <section className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#74FF52]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#74FF52]/5 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Meet{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              Hexwave.ai
            </span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8 text-center">
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
            Our brand-new GenAI creative platform designed specifically for creative professionals like music 
            video directors, commercial filmmakers, AI creators, and social media storytellers who want to 
            produce high-quality, stylized content with true cinematic control.
          </p>

          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#74FF52]/50 to-transparent" />

          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            This platform represents a significant step forward in AI-powered creativity. What truly sets us apart 
            is the way we give users real control over camera motion — something that&apos;s been missing in every other 
            GenAI video platform we&apos;ve seen. With our tools, creators can generate shots using advanced techniques 
            like crash zooms, dolly moves, overheads, or even boltcam-style angles — all in just minutes, 
            with full creative intent behind every motion.
          </p>

          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            Our models significantly outperform existing options when it comes to both video quality and motion 
            precision. They&apos;re fast, efficient, and built to support the kind of creative workflows 
            professionals expect.
          </p>
        </div>
      </div>
    </section>
  );
}

