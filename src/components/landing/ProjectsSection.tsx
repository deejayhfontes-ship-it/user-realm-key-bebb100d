import { useState } from "react";
import { usePublicPortfolio } from "@/hooks/usePortfolio";
import { ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { landingContent } from "@/data/landingContent";

export function ProjectsSection() {
  const { cases, isLoading } = usePublicPortfolio();
  const [selectedProject, setSelectedProject] = useState<typeof cases[0] | null>(null);

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

  return (
    <section id="projects" className="section-padding bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <h2 className="magnetto-title text-5xl md:text-7xl lg:text-8xl text-white">
            {content.sectionTitle}
          </h2>
          <p className="text-zinc-400 max-w-md text-lg">
            Explore nossos projetos mais recentes. Cada trabalho conta uma história única de criatividade e estratégia.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayProjects.slice(0, 4).map((project, index) => (
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
    </section>
  );
}
