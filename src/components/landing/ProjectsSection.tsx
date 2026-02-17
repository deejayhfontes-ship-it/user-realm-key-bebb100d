import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogIn, FolderOpen, Briefcase } from "lucide-react";
import { landingContent } from "@/data/landingContent";
import { useAuth } from "@/hooks/useAuth";
import { useClientData } from "@/hooks/useClientData";
import { PackagesModal } from "./PackagesModal";
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
    <section id="projects" className="py-16 md:py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Cards Grid - Exactly 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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

          {/* Card 3 - Portfólio - CORES CORRIGIDAS */}
          <div
            onClick={() => navigate("/portfolio")}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card bg-[#0f0f0f] active:scale-[0.98] transition-transform duration-200"
          >
            {/* Background escuro com glow branco sutil */}
            <div className="absolute inset-0 bg-[#0f0f0f]" />
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)'
              }}
            />

            {/* Central Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px] group-hover:border-white/20 transition-all">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-white/60 tracking-[0.3em] uppercase mb-4">
                  NOSSOS PROJETOS
                </p>

                {/* Icon */}
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-white text-center mb-6 tracking-[0.1em] leading-tight">
                  PORTFÓLIO
                </h3>

                {/* Button - Simples sem hover complexo */}
                <span className="px-6 py-3 rounded-full border border-white/20 text-white text-xs font-pixel tracking-wider group-hover:border-white/40 group-hover:bg-white/5 transition-all min-w-[140px] text-center flex items-center justify-center gap-2">
                  EXPLORAR
                  <FolderOpen className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 4 - Orçamento - CORES CORRIGIDAS */}
          <div
            onClick={() => navigate("/briefing")}
            className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card bg-[#0f0f0f] active:scale-[0.98] transition-transform duration-200"
          >
            {/* Background escuro com glow verde sutil */}
            <div className="absolute inset-0 bg-[#0f0f0f]" />
            <div 
              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 100%, hsl(var(--primary) / 0.3) 0%, transparent 60%)'
              }}
            />

            {/* Central Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-[32px] border border-primary/20 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px] group-hover:border-primary/40 transition-all">
                {/* Category Tag */}
                <p className="font-pixel text-xs text-primary/80 tracking-[0.3em] uppercase mb-4">
                  FAÇA SEU PEDIDO
                </p>

                {/* Icon */}
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-primary text-center mb-6 tracking-[0.1em] leading-tight">
                  ORÇAMENTO
                </h3>

                {/* Button - Simples sem hover complexo */}
                <span className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-pixel tracking-wider group-hover:opacity-90 transition-all min-w-[140px] text-center flex items-center justify-center gap-2">
                  SOLICITAR
                  <Briefcase className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
