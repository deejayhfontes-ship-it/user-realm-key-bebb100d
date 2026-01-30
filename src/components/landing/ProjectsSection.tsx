import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogIn, ArrowRight, Briefcase, FolderOpen } from "lucide-react";
import { landingContent } from "@/data/landingContent";
import { useAuth } from "@/hooks/useAuth";
import { useClientData } from "@/hooks/useClientData";
import { PackagesModal } from "./PackagesModal";
import cardPortfolioBg from "@/assets/card-portfolio-bg.jpg";
import cardBriefingBg from "@/assets/card-briefing-bg.jpg";

export function ProjectsSection() {
  const [packagesModalOpen, setPackagesModalOpen] = useState(false);
  const { user, profile } = useAuth();
  const { client } = useClientData();
  const navigate = useNavigate();

  const content = landingContent.projects;
  const ctaCards = content.ctaCards;

  // Auth state for client card
  const isAuthenticated = !!user && profile?.role === "client";
  const clientName = client?.name || profile?.email?.split("@")[0] || "Usuário";

  const handleClientCardClick = () => {
    if (isAuthenticated) {
      navigate("/client/dashboard");
    } else {
      navigate("/client/login");
    }
  };

  return (
    <section id="projects" className="section-padding bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Cards Grid - Exactly 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 - Área do Cliente (NÃO ALTERADO) */}
          <div
            onClick={handleClientCardClick}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card bg-primary active:scale-[0.98] transition-transform duration-200"
          >
            {/* Solid lime background - no image */}
            <div className="absolute inset-0 bg-primary transition-transform duration-700 group-hover:scale-105" />

            {/* Connected Badge - Only shows when authenticated */}
            {isAuthenticated && (
              <div className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-pixel text-white tracking-wider">CONECTADO</span>
              </div>
            )}

            {/* Central Glass Card - glassmorphism preserved */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px]">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-white/80 tracking-[0.3em] uppercase mb-4">
                  {isAuthenticated ? `Olá, ${clientName.split(" ")[0]}` : ctaCards.clientLogin.tag}
                </p>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-white text-center mb-6 tracking-[0.1em] leading-tight">
                  {ctaCards.clientLogin.title}
                </h3>

                {/* Button - Different states */}
                <span className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-pixel tracking-wider flex items-center gap-2 group-hover:bg-black/60 transition-all">
                  {isAuthenticated ? (
                    <>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">Acessar Área</span>
                      <span className="group-hover:opacity-0 transition-opacity duration-300">Minha Área</span>
                    </>
                  ) : (
                    <>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">Fazer Login</span>
                      <span className="group-hover:opacity-0 transition-opacity duration-300">{ctaCards.clientLogin.button}</span>
                      <LogIn className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 - Pacotes e Planos (NÃO ALTERADO) */}
          <div
            onClick={() => setPackagesModalOpen(true)}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card bg-[#1a1a1a] active:scale-[0.98] transition-transform duration-200"
          >
            {/* Dark background with subtle green ambient glow */}
            <div className="absolute inset-0 bg-[#1a1a1a]" />
            <div 
              className="absolute inset-0 blur-3xl"
              style={{
                background: 'radial-gradient(ellipse 120% 100% at 100% 0%, hsl(78 100% 60% / 0.5) 0%, transparent 60%)'
              }}
            />
            <div 
              className="absolute inset-0 blur-3xl"
              style={{
                background: 'radial-gradient(ellipse 100% 80% at 85% 100%, hsl(78 90% 55% / 0.4) 0%, transparent 55%)'
              }}
            />
            <div 
              className="absolute inset-0 blur-2xl"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 10% 50%, hsl(78 80% 50% / 0.3) 0%, transparent 50%)'
              }}
            />
            <div 
              className="absolute inset-0 blur-2xl"
              style={{
                background: 'radial-gradient(ellipse 90% 70% at 50% 50%, hsl(78 70% 45% / 0.2) 0%, transparent 60%)'
              }}
            />

            {/* Central Glass Card - Fixed size */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px]">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-primary tracking-[0.3em] uppercase mb-4">
                  {ctaCards.services.tag}
                </p>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-primary text-center mb-6 tracking-[0.1em] leading-tight">
                  {ctaCards.services.title}
                </h3>

                {/* Button */}
                <span className="px-6 py-3 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-sm font-pixel tracking-wider flex items-center gap-2 group-hover:bg-primary/30 transition-all">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">Ver Planos</span>
                  <span className="group-hover:opacity-0 transition-opacity duration-300">{ctaCards.services.button}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 - Portfólio */}
          <div
            onClick={() => navigate("/portfolio")}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card active:scale-[0.98] transition-transform duration-200"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${cardPortfolioBg})` }}
            />
            
            {/* Gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Central Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px]">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-white/80 tracking-[0.3em] uppercase mb-4">
                  NOSSOS PROJETOS
                </p>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-white text-center mb-6 tracking-[0.1em] leading-tight">
                  PORTFÓLIO
                </h3>

                {/* Button */}
                <span className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-pixel tracking-wider flex items-center gap-2 group-hover:bg-black/60 transition-all">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">Ver Projetos</span>
                  <span className="group-hover:opacity-0 transition-opacity duration-300">EXPLORAR +</span>
                  <FolderOpen className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 4 - Orçamento */}
          <div
            onClick={() => navigate("/briefing")}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card active:scale-[0.98] transition-transform duration-200"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${cardBriefingBg})` }}
            />
            
            {/* Gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Central Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px]">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-white/80 tracking-[0.3em] uppercase mb-4">
                  FAÇA SEU PEDIDO
                </p>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-white text-center mb-6 tracking-[0.1em] leading-tight">
                  ORÇAMENTO
                </h3>

                {/* Button */}
                <span className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-pixel tracking-wider flex items-center gap-2 group-hover:bg-black/60 transition-all">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">Iniciar Briefing</span>
                  <span className="group-hover:opacity-0 transition-opacity duration-300">SOLICITAR +</span>
                  <Briefcase className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Modal */}
      <PackagesModal open={packagesModalOpen} onOpenChange={setPackagesModalOpen} />
    </section>
  );
}
