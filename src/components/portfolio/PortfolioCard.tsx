import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { PortfolioCase } from "@/hooks/usePortfolio";

interface PortfolioCardProps {
  project: PortfolioCase;
  index: number;
  isClientProject: boolean;
  onClick: () => void;
}

export function PortfolioCard({ project, index, isClientProject, onClick }: PortfolioCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Vary aspect ratios for masonry effect
  const aspectRatio = index % 4 === 0 
    ? "aspect-[3/4]" 
    : index % 4 === 1 
    ? "aspect-square" 
    : index % 4 === 2 
    ? "aspect-[4/3]" 
    : "aspect-[3/4]";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[16px] cursor-pointer break-inside-avoid mb-6",
        "transition-transform duration-300 ease-out hover:scale-[1.02]",
        aspectRatio
      )}
    >
      {/* Image with lazy loading */}
      {isVisible && !imageError && project.thumbnail_url ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <img
            src={project.thumbnail_url}
            alt={project.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#c4ff0d]/20 to-[#c4ff0d]/5 flex items-center justify-center">
          <span className="text-4xl font-bold text-white/20">{project.title[0]}</span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-6">
          {/* Category */}
          <span className="text-[#c4ff0d] text-xs uppercase tracking-wider mb-2 block">
            {project.category}
          </span>
          
          {/* Title */}
          <h3 className="text-white text-2xl font-semibold mb-4">
            {project.title}
          </h3>
          
          {/* View Button */}
          <button className="px-6 py-2 border border-white text-white text-sm rounded-full hover:bg-[#c4ff0d] hover:border-[#c4ff0d] hover:text-[#1a1a1a] transition-all duration-300">
            Ver Projeto
          </button>

          {/* Client Project Badge */}
          {isClientProject && (
            <div className="mt-4">
              <span className="inline-block px-3 py-1 bg-emerald-500/90 text-white text-xs rounded-full">
                SEU PROJETO
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
