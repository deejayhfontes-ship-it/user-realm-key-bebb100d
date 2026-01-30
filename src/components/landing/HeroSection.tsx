import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const handleScrollToBriefing = () => {
    const element = document.querySelector("#contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-[#0a0a0a]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="magnetto-title text-[12vw] md:text-[10vw] lg:text-[8vw] text-white leading-[0.85]">
              FONTES
              <br />
              <span className="text-primary">GRAPHICS</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-12">
            <p className="font-pixel text-zinc-400 text-sm md:text-base tracking-[0.3em]">
              DESIGN STUDIO • POÇOS DE CALDAS
            </p>
          </div>

          {/* Description */}
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-zinc-400 text-lg leading-relaxed">
              Transformamos ideias em experiências visuais impactantes. 
              Criatividade e estratégia para marcas que querem se destacar.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleScrollToBriefing}
              className="group px-8 py-4 rounded-full bg-primary text-black font-pixel text-sm flex items-center gap-3 hover:bg-lime-300 transition-all glow-lime"
            >
              <Sparkles className="w-5 h-5" />
              INICIAR PROJETO
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <Link
              to="/client/login"
              className="px-8 py-4 rounded-full border border-zinc-700 text-white font-pixel text-sm hover:border-zinc-500 hover:bg-zinc-900 transition-all"
            >
              ÁREA DO CLIENTE
            </Link>
          </div>
        </div>
      </div>

      {/* Floating glass card - decorative */}
      <div className="absolute bottom-20 right-8 md:right-20 hidden lg:block">
        <div className="magnetto-glass p-6 w-64">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-lime-600" />
            <div>
              <p className="font-pixel text-xs text-zinc-400">FEATURED</p>
              <p className="text-white text-sm font-medium">Brand Identity</p>
            </div>
          </div>
          <p className="text-zinc-500 text-xs">Projetos que transformam negócios</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-zinc-500" />
        </div>
      </div>
    </section>
  );
}
