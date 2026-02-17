import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioCase } from "@/hooks/usePortfolio";

interface PortfolioModalProps {
  project: PortfolioCase | null;
  isClientProject: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasMultipleProjects: boolean;
}

export function PortfolioModal({ 
  project, 
  isClientProject, 
  onClose, 
  onPrev, 
  onNext,
  hasMultipleProjects 
}: PortfolioModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose, onPrev, onNext]);

  if (!project) return null;

  // Combine thumbnail with gallery
  const allImages = [
    project.thumbnail_url,
    ...(Array.isArray(project.gallery_urls) ? project.gallery_urls : [])
  ].filter(Boolean) as string[];

  const currentImage = allImages[currentImageIndex];

  // Parse tags from description or use category as fallback
  const tags = project.category ? [project.category] : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)"
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows - Project Navigation */}
      {hasMultipleProjects && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Modal Content */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col md:flex-row overflow-hidden rounded-2xl bg-[#1a1a1a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section - 60% */}
        <div className="relative md:w-[60%] min-h-[300px] md:min-h-[500px] bg-black flex items-center justify-center">
          <img
            src={currentImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          
          {/* Gallery Navigation */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentImageIndex 
                      ? "bg-[#c4ff0d] w-6" 
                      : "bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section - 40% */}
        <div className="md:w-[40%] p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
          {/* Category Pill */}
          <span className="inline-block px-4 py-1.5 bg-[#c4ff0d] text-[#1a1a1a] text-xs font-medium rounded-full mb-4">
            {project.category}
          </span>

          {/* Title */}
          <h2 className="text-3xl md:text-[32px] font-bold text-white mb-4">
            {project.title}
          </h2>

          {/* Description */}
          <p className="text-white/80 text-base leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 border border-white/20 text-white/70 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Client Name */}
          {project.client_name && (
            <div className="mb-4">
              <span className="text-white/50 text-sm">Cliente: </span>
              <span className="text-white text-sm">{project.client_name}</span>
            </div>
          )}

          {/* Client Project Badge */}
          {isClientProject && (
            <div className="inline-block px-4 py-2 bg-emerald-500/90 text-white text-sm font-medium rounded-full">
              SEU PROJETO
            </div>
          )}

          {/* Results */}
          {project.results && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-[#c4ff0d] text-sm font-medium mb-2">RESULTADOS</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {project.results}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
