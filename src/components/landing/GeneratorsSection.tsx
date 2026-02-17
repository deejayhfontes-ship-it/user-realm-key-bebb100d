import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  SlidersHorizontal, 
  Award,
  Lock,
  ArrowRight,
  CheckCircle,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const benefits = [
  {
    icon: Zap,
    title: "Criação em Segundos",
    description: "Gere flyers, posts e artes criativas em minutos. Sem espera, sem complexidade. Do briefing ao arquivo final, tudo automatizado."
  },
  {
    icon: SlidersHorizontal,
    title: "Controle Total",
    description: "Você decide cores, estilos e elementos. A IA executa sua visão, não cria algo aleatório. Direção manual com velocidade de máquina."
  },
  {
    icon: Award,
    title: "Resultado Profissional",
    description: "Arquivos prontos para uso comercial. Resolução adequada, formatos corretos, qualidade garantida. Pronto para publicar ou imprimir."
  }
];

const steps = [
  "Escolha o tipo de arte",
  "Defina seu estilo",
  "Gere em segundos",
  "Baixe e use"
];

export function GeneratorsSection() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(false);

  const isAuthenticated = !!user && profile?.role === "client";

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate("/client/geradores");
    } else {
      setShowAccessModal(true);
    }
  };

  const handleViewExamples = () => {
    const portfolioSection = document.querySelector("#projects");
    if (portfolioSection) {
      const offsetPosition = portfolioSection.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    } else {
      navigate("/portfolio");
    }
  };

  return (
    <section id="generators" className="py-16 md:py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary mb-6">
            <span className="text-xs md:text-sm font-semibold text-primary tracking-wide">
              🤖 RECURSOS PREMIUM
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 md:mb-6">
            Transforme ideias em<br />arte profissional
          </h2>

          {/* Subtitles */}
          <p className="text-base md:text-lg lg:text-xl text-white/70 mb-2">
            IA com direção manual e controle criativo.
          </p>
          <p className="text-sm md:text-base lg:text-lg text-primary font-semibold">
            Resultados profissionais, não aleatórios.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 md:mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                "p-6 md:p-8 rounded-2xl text-center",
                "bg-white/[0.03] border border-white/10",
                "hover:border-primary hover:-translate-y-1",
                "transition-all duration-300",
                "min-h-[280px] flex flex-col items-center justify-start"
              )}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 mb-5 md:mb-6">
                <benefit.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Demo Section */}
        <div className="max-w-5xl mx-auto bg-white/[0.03] rounded-2xl p-6 md:p-8 lg:p-12 mb-10 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left Column - Steps */}
            <div className="md:col-span-2">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">
                Como funciona
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm md:text-base text-white/80">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual Mockup */}
            <div className="md:col-span-3">
              <div className="aspect-video bg-black/30 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                {/* Animated mockup placeholder */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Background gradient animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
                  
                  {/* Central content */}
                  <div className="relative z-10 text-center p-4 md:p-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Zap className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    <p className="text-white/40 text-xs md:text-sm">
                      Preview interativo em breve
                    </p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 border border-primary/20" />
                  <div className="absolute bottom-4 right-4 w-10 md:w-12 h-2 md:h-3 rounded bg-white/10" />
                  <div className="absolute top-4 right-4 w-12 md:w-16 h-2 rounded bg-white/5" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-base md:text-lg text-white/70 mb-5 md:mb-6">
            Pronto para criar?
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            {/* Primary CTA */}
            <button
              onClick={handleStartClick}
              className={cn(
                "w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 rounded-full",
                "bg-primary text-primary-foreground",
                "text-sm md:text-base font-semibold",
                "hover:bg-primary/90 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "transition-all duration-200",
                "flex items-center justify-center gap-2"
              )}
            >
              Começar agora
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleViewExamples}
              className={cn(
                "w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 rounded-full",
                "bg-transparent border border-primary text-primary",
                "text-sm md:text-base font-semibold",
                "hover:bg-primary/10 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "transition-all duration-200"
              )}
            >
              Ver exemplos
            </button>
          </div>
        </div>
      </div>

      {/* Access Modal - For Non-Authenticated Users */}
      <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
        <DialogContent className="max-w-md bg-[#0a0a0a]/98 backdrop-blur-xl border border-white/10 p-0 overflow-hidden rounded-[24px]">
          <VisuallyHidden>
            <DialogTitle>Acesso Exclusivo</DialogTitle>
          </VisuallyHidden>

          <div className="relative p-8 md:p-10 text-center">
            {/* Close button */}
            <button
              onClick={() => setShowAccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Lock Icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-3">
              Área Exclusiva
            </h3>

            {/* Description */}
            <p className="text-white/60 text-[15px] mb-8 leading-relaxed">
              Faça login ou crie uma conta para acessar os geradores IA
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  navigate("/client/login");
                }}
                className={cn(
                  "w-full py-4 rounded-full",
                  "bg-primary text-[#1a1a1a]",
                  "font-semibold text-[15px]",
                  "hover:bg-primary/90",
                  "transition-all duration-200"
                )}
              >
                Fazer Login
              </button>
              
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  navigate("/client/registro");
                }}
                className={cn(
                  "w-full py-4 rounded-full",
                  "bg-white/5 border border-white/10 text-white",
                  "font-semibold text-[15px]",
                  "hover:bg-white/10",
                  "transition-all duration-200"
                )}
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
