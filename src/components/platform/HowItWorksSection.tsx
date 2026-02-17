import { MousePointer, MessageSquare, Sparkles, Download } from "lucide-react";

const steps = [
  {
    icon: MousePointer,
    step: "01",
    title: "Escolha o gerador",
    description: "Stories, Posts ou Carrossel - selecione o formato ideal."
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "Descreva o conteúdo",
    description: "Digite o que precisa: tema, cores, estilo desejado."
  },
  {
    icon: Sparkles,
    step: "03",
    title: "IA gera em segundos",
    description: "Nossa IA processa e cria artes profissionais instantaneamente."
  },
  {
    icon: Download,
    step: "04",
    title: "Baixe e publique",
    description: "Faça download em alta qualidade, pronto para publicar."
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-black relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-lime-400/5 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-lime-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-4 block">
            Simples e Rápido
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Como Funciona
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Em 4 passos simples você tem artes profissionais prontas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <div key={index} className="relative text-center group">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 md:top-12 left-[60%] w-full h-px bg-gradient-to-r from-lime-400/50 to-transparent" />
              )}
              
              {/* Step number */}
              <div className="relative inline-flex mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-lime-400/50 transition-colors">
                  <item.icon className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 text-lime-400" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-lime-400 text-black text-[10px] md:text-xs font-bold w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                  {item.step}
                </span>
              </div>

              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-white mb-1.5 md:mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
