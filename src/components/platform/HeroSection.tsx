import { Badge } from "@/components/ui/badge";
import { NeonButton } from "./NeonButton";
import { Link } from "react-router-dom";
import { Sparkles, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-400/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(163,230,53,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 animate-fade-in">
          <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            NOVO • SaaS
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in">
          Gere Artes Profissionais
          <br />
          <span className="text-lime-400">com IA</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 font-light animate-fade-in">
          Deixe sua equipe criar conteúdo visual em segundos. 
          Templates prontos, IA avançada, resultados profissionais.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
          <Link to="/client/login">
            <NeonButton size="lg">
              Testar Gratuitamente
            </NeonButton>
          </Link>
          <NeonButton variant="secondary" size="lg">
            <Play className="h-4 w-4" />
            Ver Demonstração
          </NeonButton>
        </div>

        {/* Trust Badges */}
        <div className="animate-fade-in">
          <p className="text-zinc-500 text-sm mb-3">Usado por empresas que confiam na inovação</p>
          <div className="flex flex-wrap justify-center gap-6 text-zinc-600 text-sm">
            <span className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Prefeitura de Osasco
            </span>
            <span className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Anhanguera
            </span>
            <span className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              +50 empresas
            </span>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/20 p-2 max-w-4xl mx-auto shadow-2xl">
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              {/* Fake browser header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-md px-4 py-1 text-xs text-zinc-500">
                    fontesgraphics.app/client/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard mockup content */}
              <div className="p-6 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                  {/* Mock stats cards */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-lime-400">45</div>
                    <div className="text-xs text-zinc-500">Créditos</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white">3</div>
                    <div className="text-xs text-zinc-500">Geradores</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white">127</div>
                    <div className="text-xs text-zinc-500">Artes Criadas</div>
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
