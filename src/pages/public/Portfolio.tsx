import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicPortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/hooks/useAuth";
import { useClientData } from "@/hooks/useClientData";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioModal } from "@/components/portfolio/PortfolioModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Home, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioCase } from "@/hooks/usePortfolio";

export default function Portfolio() {
  const { cases, isLoading } = usePublicPortfolio();
  const { user, profile } = useAuth();
  const { client } = useClientData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<PortfolioCase | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(cases.map((c) => c.category));
    return ["all", ...Array.from(cats)];
  }, [cases]);

  // Filter cases by category
  const filteredCases = useMemo(() => {
    if (selectedCategory === "all") return cases;
    return cases.filter((c) => c.category === selectedCategory);
  }, [cases, selectedCategory]);

  // Check if client owns the project (by name match for now)
  const isClientProject = (projectClientName: string) => {
    if (!user || profile?.role !== "client" || !client) return false;
    return client.name?.toLowerCase() === projectClientName?.toLowerCase();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 mb-8">
          <nav className="flex items-center gap-2 text-sm text-white/50">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white flex items-center gap-1">
              <FolderOpen className="w-4 h-4" />
              Portfólio
            </span>
          </nav>
        </div>

        {/* Header */}
        <section className="container mx-auto px-4 mb-16 text-center">
          <h1 className="magnetto-title text-4xl md:text-6xl lg:text-7xl mb-6">
            NOSSOS PROJETOS
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
            Conheça alguns dos trabalhos que desenvolvemos para nossos clientes.
            Cada projeto é único, feito sob medida para alcançar resultados reais.
          </p>
        </section>

        {/* Category Filters */}
        <section className="container mx-auto px-4 mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-5 py-2.5 rounded-full font-pixel text-sm uppercase transition-all duration-300",
                  selectedCategory === category
                    ? "bg-primary text-black scale-105"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                )}
              >
                {category === "all" ? "Todos" : category}
              </button>
            ))}
          </div>
        </section>

        {/* Projects Grid - Masonry Style */}
        <section className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className={cn(
                    "rounded-[24px] bg-white/5",
                    i % 3 === 0 ? "h-[400px]" : i % 3 === 1 ? "h-[320px]" : "h-[360px]"
                  )} 
                />
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">
                {selectedCategory === "all" 
                  ? "Nenhum projeto publicado ainda."
                  : `Nenhum projeto na categoria "${selectedCategory}".`}
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredCases.map((project, index) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  index={index}
                  isClientProject={isClientProject(project.client_name)}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Project Detail Modal */}
      <PortfolioModal
        project={selectedProject}
        isClientProject={selectedProject ? isClientProject(selectedProject.client_name) : false}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
