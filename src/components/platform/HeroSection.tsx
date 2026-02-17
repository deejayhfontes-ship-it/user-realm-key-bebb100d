import { NeonButton } from "./NeonButton";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-lime-400/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-lime-400/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(163,230,53,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center py-16 md:py-20">
        {/* Badge */}
        <div className="inline-block mb-4 md:mb-6 animate-fade-in">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">
            AGÊNCIA + SISTEMA
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight tracking-tight animate-fade-in">
          Criação profissional no início.
          <br />
          <span className="text-lime-400">Liberdade total depois.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-4xl mx-auto mb-8 md:mb-12 font-light leading-relaxed animate-fade-in">
          A agência cria a base criativa. Você controla os desdobramentos.
          <br className="hidden md:block" />
          Padrão visual + escala operacional.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 animate-fade-in">
          <Link to="/client/login">
            <NeonButton size="lg">
              Criar minha base criativa
            </NeonButton>
          </Link>
          <NeonButton variant="secondary" size="lg">
            <Play className="h-4 w-4" />
            Ver demonstração
          </NeonButton>
        </div>

        {/* Trust */}
        <div className="animate-fade-in">
          <p className="text-zinc-500 text-xs md:text-sm mb-3 md:mb-4">Usado por empresas que evoluíram a relação com agência</p>
          
          {/* Posicionamento */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10">
            <span className="text-white font-semibold text-sm md:text-base">Você não compete com agência.</span>
            <span className="text-zinc-400 text-sm md:text-base">Você evolui a agência.</span>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-12 md:mt-16 relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl md:rounded-2xl border border-white/20 p-1.5 md:p-2 max-w-4xl mx-auto shadow-2xl">
            <div className="bg-zinc-900 rounded-lg md:rounded-xl overflow-hidden">
              {/* Fake browser header */}
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-md px-3 md:px-4 py-1 text-[10px] md:text-xs text-zinc-500">
                    fontesgraphics.app/client/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard mockup content */}
              <div className="p-4 md:p-6 min-h-[200px] md:min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
                  {/* Mock stats cards */}
                  <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                    <div className="text-xl md:text-3xl font-bold text-lime-400">45</div>
                    <div className="text-[10px] md:text-xs text-zinc-500">Créditos</div>
                  </div>
                  <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                    <div className="text-xl md:text-3xl font-bold text-white">3</div>
                    <div className="text-[10px] md:text-xs text-zinc-500">Geradores</div>
                  </div>
                  <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                    <div className="text-xl md:text-3xl font-bold text-white">127</div>
                    <div className="text-[10px] md:text-xs text-zinc-500">Artes Criadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
