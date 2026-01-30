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
    <section id="generators" className="py-24 md:py-32 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary mb-6">
            <span className="text-[13px] font-semibold text-primary tracking-wide">
              🤖 RECURSOS PREMIUM
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-[32px] md:text-[48px] font-bold text-white leading-[1.2] mb-4 md:mb-6">
            Transforme ideias em<br />arte profissional
          </h2>

          {/* Subtitles */}
          <p className="text-[16px] md:text-[20px] text-white/70 mb-2">
            IA com direção manual e controle criativo.
          </p>
          <p className="text-[15px] md:text-[18px] text-primary font-semibold mb-16">
            Resultados profissionais, não aleatórios.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                "p-8 md:p-10 rounded-[24px] text-center",
                "bg-white/[0.03] border border-white/10",
                "hover:border-primary hover:-translate-y-1",
                "transition-all duration-300"
              )}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-semibold text-white mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-white/60 leading-[1.6]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Demo Section */}
        <div className="max-w-[1000px] mx-auto bg-white/[0.03] rounded-[24px] p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
            {/* Left Column - Steps */}
            <div className="md:col-span-2">
              <h3 className="text-[24px] font-semibold text-white mb-6">
                Como funciona
              </h3>
              
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-[16px] text-white/80">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual Mockup */}
            <div className="md:col-span-3">
              <div className="aspect-video bg-black/30 rounded-[16px] border border-white/10 flex items-center justify-center overflow-hidden">
                {/* Animated mockup placeholder */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Background gradient animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
                  
                  {/* Central content */}
                  <div className="relative z-10 text-center p-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-white/40 text-sm">
                      Preview interativo em breve
                    </p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20" />
                  <div className="absolute bottom-4 right-4 w-12 h-3 rounded bg-white/10" />
                  <div className="absolute top-4 right-4 w-16 h-2 rounded bg-white/5" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-[18px] text-white/70 mb-6">
            Pronto para criar?
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <button
              onClick={handleStartClick}
              className={cn(
                "px-10 py-4 rounded-full",
                "bg-primary text-[#1a1a1a]",
                "text-[16px] font-semibold",
                "hover:bg-primary/90 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "transition-all duration-200",
                "flex items-center gap-2"
              )}
            >
              Começar agora
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleViewExamples}
              className={cn(
                "px-10 py-4 rounded-full",
                "bg-transparent border border-primary text-primary",
                "text-[16px] font-semibold",
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
