import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicPortfolio } from "@/hooks/usePortfolio";
import { ArrowRight, X, CheckCircle2, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { landingContent } from "@/data/landingContent";
import { useAuth } from "@/hooks/useAuth";
import { useClientData } from "@/hooks/useClientData";
import { PackagesModal } from "./PackagesModal";
import cardClientLoginBg from "@/assets/card-client-login-bg.jpg";
import cardServicesBg from "@/assets/card-services-bg.jpg";

export function ProjectsSection() {
  const { cases, isLoading } = usePublicPortfolio();
  const [selectedProject, setSelectedProject] = useState<typeof cases[0] | null>(null);
  const [packagesModalOpen, setPackagesModalOpen] = useState(false);
  const { user, profile } = useAuth();
  const { client } = useClientData();
  const navigate = useNavigate();

  const content = landingContent.projects;

  // Placeholder data if no projects exist
  const placeholderProjects = [
    {
      id: "1",
      title: "EVERY SECOND",
      category: "AD CAMPAIGN",
      client_name: "Studio X",
      thumbnail_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      description: "Uma campanha visual que captura a essência do tempo.",
      results: null,
      gallery_urls: [],
    },
    {
      id: "2",
      title: "TIMELESS MASTERY",
      category: "ART DIRECTION",
      client_name: "Brand Co",
      thumbnail_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      description: "Direção de arte para uma marca de luxo atemporal.",
      results: null,
      gallery_urls: [],
    },
    {
      id: "3",
      title: "BEYOND TIME",
      category: "ART DIRECTION",
      client_name: "Cinema Plus",
      thumbnail_url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
      description: "Identidade visual para festival de cinema.",
      results: null,
      gallery_urls: [],
    },
    {
      id: "4",
      title: "BRAND REDEFINE",
      category: "BRAND IDENTITY",
      client_name: "Fresh Co",
      thumbnail_url: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&q=80",
      description: "Rebranding completo para marca de alimentos.",
      results: null,
      gallery_urls: [],
    },
  ];

  const displayProjects = cases.length > 0 ? cases : placeholderProjects;

  const ctaCards = content.ctaCards;

  const handleScrollToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector("#services");
    element?.scrollIntoView({ behavior: "smooth" });
  };

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
        {/* Cards only - no header */}

        {/* Projects Grid - CTA Cards First, then Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CTA Card 1 - Client Login/Dashboard */}
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

          {/* CTA Card 2 - Packages (was Services) */}
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

          {/* Portfolio Project Cards */}
          {displayProjects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project as typeof cases[0])}
              className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer magnetto-card"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${project.thumbnail_url})` }}
              />
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Central Glass Card - Fixed size */}
              <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                <div className="bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center w-[75%] aspect-square max-w-[280px]">
                  {/* Category Tag */}
                  <p className="font-pixel text-xs text-white/80 tracking-[0.3em] uppercase mb-4">
                    {project.category}
                  </p>

                  {/* Title */}
                  <h3 className="magnetto-title text-2xl md:text-3xl lg:text-4xl text-white text-center mb-6 tracking-[0.1em] leading-tight">
                    {project.title}
                  </h3>

                  {/* Explore More Button */}
                  <button className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-pixel tracking-wider flex items-center gap-2 hover:bg-black/60 transition-all">
                    {content.exploreButton}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {cases.length > 4 && (
          <div className="flex justify-center mt-12">
            <button className="px-8 py-4 rounded-full border border-zinc-700 text-white font-pixel text-sm hover:border-zinc-500 hover:bg-zinc-900 transition-all flex items-center gap-3">
              VER TODOS OS PROJETOS
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Detalhes do Projeto</DialogTitle>
          </VisuallyHidden>
          {selectedProject && (
            <div>
              {/* Header Image */}
              <div className="relative aspect-video">
                <img
                  src={selectedProject.thumbnail_url}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="font-pixel text-xs text-primary tracking-[0.2em] mb-2">
                  {selectedProject.category}
                </p>
                <h3 className="magnetto-title text-4xl text-white mb-4">
                  {selectedProject.title}
                </h3>
                <p className="text-zinc-400 text-lg mb-4">
                  Cliente: {selectedProject.client_name}
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  {selectedProject.description}
                </p>
                {selectedProject.results && (
                  <div className="mt-6 p-4 rounded-2xl bg-zinc-800">
                    <p className="font-pixel text-xs text-zinc-400 mb-2">RESULTADOS</p>
                    <p className="text-white">{selectedProject.results}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Packages Modal */}
      <PackagesModal open={packagesModalOpen} onOpenChange={setPackagesModalOpen} />
    </section>
  );
}
