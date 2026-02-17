import { landingContent } from "@/data/landingContent";

export function AboutSection() {
  const content = landingContent.about;

  return (
    <section id="about" className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Glassmorphism Card */}
          <div className="magnetto-glass p-6 md:p-8 lg:p-10 min-h-[200px] flex flex-col justify-center">
            <p className="font-pixel text-xs text-zinc-400 tracking-[0.2em] mb-4">
              {content.sectionLabel}
            </p>
            <h2 className="magnetto-title text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              SOBRE
            </h2>
            <div className="w-20 h-1 bg-primary" />
          </div>

          {/* Right - Description */}
          <div>
            <p className="text-zinc-300 text-base md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-xs md:text-sm">BRANDING</span>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-xs md:text-sm">WEB DESIGN</span>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-xs md:text-sm">SOCIAL MEDIA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
