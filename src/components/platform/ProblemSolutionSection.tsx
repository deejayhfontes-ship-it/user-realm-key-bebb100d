import { Clock, DollarSign, AlertTriangle, Zap, Sparkles, Target } from "lucide-react";
import { GlassCard } from "./GlassCard";

const problems = [
  {
    icon: Clock,
    title: "Demora para aprovação",
    description: "Cada arte leva dias entre briefing, criação e revisões intermináveis."
  },
  {
    icon: DollarSign,
    title: "Custo com freelancers",
    description: "Contratar designers para cada demanda corrói seu orçamento de marketing."
  },
  {
    icon: AlertTriangle,
    title: "Inconsistência visual",
    description: "Sem padrão definido, cada peça sai diferente da anterior."
  }
];

const solutions = [
  {
    icon: Zap,
    title: "Geração instantânea",
    description: "De 3 dias para 30 segundos. Artes prontas em cliques."
  },
  {
    icon: Target,
    title: "Templates padronizados",
    description: "Identidade visual consistente em todas as peças."
  },
  {
    icon: Sparkles,
    title: "IA que entende você",
    description: "Descreva o que precisa, a IA faz o resto."
  }
];

export function ProblemSolutionSection() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Problem Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Sua equipe perde tempo criando artes <span className="text-red-400">manualmente?</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Você não está sozinho. Milhares de empresas enfrentam os mesmos desafios.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-20">
          {problems.map((problem, index) => (
            <GlassCard key={index} className="text-center border-red-500/20 bg-red-500/5 min-h-[180px] md:min-h-[200px] flex flex-col items-center justify-center p-5 md:p-6">
              <div className="inline-flex p-2.5 md:p-3 rounded-xl bg-red-500/10 mb-3 md:mb-4">
                <problem.icon className="h-6 w-6 md:h-8 md:w-8 text-red-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">{problem.title}</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{problem.description}</p>
            </GlassCard>
          ))}
        </div>

        {/* Arrow or divider */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="w-px h-12 md:h-16 bg-gradient-to-b from-red-400/50 to-lime-400/50" />
        </div>

        {/* Solution Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            A solução: <span className="text-lime-400">Geradores automatizados com IA</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Transforme horas de trabalho em segundos de resultado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {solutions.map((solution, index) => (
            <GlassCard key={index} className="text-center border-lime-400/20 bg-lime-400/5 min-h-[180px] md:min-h-[200px] flex flex-col items-center justify-center p-5 md:p-6">
              <div className="inline-flex p-2.5 md:p-3 rounded-xl bg-lime-400/10 mb-3 md:mb-4">
                <solution.icon className="h-6 w-6 md:h-8 md:w-8 text-lime-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">{solution.title}</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{solution.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
