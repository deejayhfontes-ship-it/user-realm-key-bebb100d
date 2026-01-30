import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
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

  // Vary card heights for masonry effect
  const heightClass = index % 4 === 0 
    ? "aspect-[3/4]" 
    : index % 4 === 1 
    ? "aspect-square" 
    : index % 4 === 2 
    ? "aspect-[4/3]" 
    : "aspect-[3/4]";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[24px] cursor-pointer break-inside-avoid mb-6",
        "bg-white/[0.03] border border-white/10 backdrop-blur-sm",
        "transition-all duration-500 hover:border-white/20 hover:scale-[1.02]",
        heightClass
      )}
    >
      {/* Image with lazy loading */}
      {!imageError && project.thumbnail_url ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <img
            src={project.thumbnail_url}
            alt={project.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700",
              "group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-4xl font-display text-white/20">{project.title[0]}</span>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Badges */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
        {project.featured && (
          <Badge className="bg-primary/90 text-black font-pixel text-xs px-3 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            DESTAQUE
          </Badge>
        )}
        {isClientProject && (
          <Badge className="bg-emerald-500/90 text-white font-pixel text-xs px-3 py-1">
            SEU PROJETO
          </Badge>
        )}
      </div>

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="bg-black/40 border-white/20 text-white/80 font-pixel text-xs">
          {project.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display text-xl md:text-2xl text-white mb-2 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-sm text-white/60 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          {project.description}
        </p>
        
        {/* View CTA */}
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
          <span className="text-sm font-pixel text-primary">VER PROJETO</span>
          <ExternalLink className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </div>
  );
}
