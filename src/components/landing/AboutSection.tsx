export function AboutSection() {
  return (
    <section id="about" className="relative section-padding overflow-hidden">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Glassmorphism Card */}
          <div className="magnetto-glass p-8 md:p-12">
            <p className="font-pixel text-xs text-zinc-400 tracking-[0.2em] mb-4">
              ABOUT US.25
            </p>
            <h2 className="magnetto-title text-5xl md:text-7xl text-white mb-6">
              ABOUT
            </h2>
            <div className="w-20 h-1 bg-primary mb-6" />
          </div>

          {/* Right - Description */}
          <div>
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-8">
              Na Fontes Graphics, criamos designs que não apenas impressionam visualmente 
              — eles geram impacto. Combinamos criatividade com estratégia, transformando 
              ideias ousadas em experiências digitais imersivas que cativam, engajam e convertem.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-sm">BRANDING</span>
              </div>
              <div className="px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-sm">WEB DESIGN</span>
              </div>
              <div className="px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700">
                <span className="text-white font-pixel text-sm">SOCIAL MEDIA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
