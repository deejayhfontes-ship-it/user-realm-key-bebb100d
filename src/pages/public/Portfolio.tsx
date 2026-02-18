import { useState, useMemo, useEffect } from "react";
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

const FILTER_CATEGORIES = [
  "Todos",
  "Social Media",
  "Identidade Visual",
  "Artes/Flyers",
  "Vídeo",
  "Web Design",
  "Outros",
];

export default function Portfolio() {
  const { cases, isLoading } = usePublicPortfolio();
  const { user, profile } = useAuth();
  const { client } = useClientData();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  // Filter cases by category
  const filteredCases = useMemo(() => {
    if (selectedCategory === "Todos") return cases;
    return cases.filter((c) => c.category === selectedCategory);
  }, [cases, selectedCategory]);

  // Check if client owns the project
  const isClientProject = (projectClientName: string) => {
    if (!user || profile?.role !== "client" || !client) return false;
    return client.name?.toLowerCase() === projectClientName?.toLowerCase();
  };

  // Get selected project
  const selectedProject = selectedProjectIndex !== null ? filteredCases[selectedProjectIndex] : null;

  // Navigate between projects
  const goToPrevProject = () => {
    if (selectedProjectIndex === null) return;
    setSelectedProjectIndex(selectedProjectIndex === 0 ? filteredCases.length - 1 : selectedProjectIndex - 1);
  };

  const goToNextProject = () => {
    if (selectedProjectIndex === null) return;
    setSelectedProjectIndex(selectedProjectIndex === filteredCases.length - 1 ? 0 : selectedProjectIndex + 1);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />

      {/* Hero Section - 300px height */}
      <section
        className="min-h-[250px] md:h-[300px] flex flex-col items-center justify-center pt-20 px-4"
        style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%)" }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-[48px] font-bold text-white text-center mb-4">
          Portfólio
        </h1>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#c4ff0d]">
          <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Portfólio</span>
        </nav>
      </section>

      {/* Filter Pills */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 md:px-5 py-2 rounded-[24px] text-xs md:text-sm transition-all duration-300",
                  selectedCategory === category
                    ? "bg-[#c4ff0d] text-[#1a1a1a] border border-transparent"
                    : "bg-transparent text-white border border-white/20 hover:border-[#c4ff0d]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="mx-auto max-w-[1400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "rounded-[16px] bg-white/5",
                    i % 3 === 0 ? "h-[400px]" : i % 3 === 1 ? "h-[320px]" : "h-[360px]"
                  )}
                />
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">
                {selectedCategory === "Todos"
                  ? "Nenhum projeto publicado ainda."
                  : `Nenhum projeto na categoria "${selectedCategory}".`}
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filteredCases.map((project, index) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  index={index}
                  isClientProject={isClientProject(project.client_name)}
                  onClick={() => setSelectedProjectIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Project Detail Modal */}
      <PortfolioModal
        project={selectedProject}
        isClientProject={selectedProject ? isClientProject(selectedProject.client_name) : false}
        onClose={() => setSelectedProjectIndex(null)}
        onPrev={goToPrevProject}
        onNext={goToNextProject}
        hasMultipleProjects={filteredCases.length > 1}
      />
    </div>
  );
}
