import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  User, 
  Calendar,
  Maximize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PortfolioCase } from "@/hooks/usePortfolio";

interface PortfolioModalProps {
  project: PortfolioCase | null;
  isClientProject: boolean;
  onClose: () => void;
}

export function PortfolioModal({ project, isClientProject, onClose }: PortfolioModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsFullscreen(false);
    setIsZoomed(false);
  }, [project?.id]);

  if (!project) return null;

  // Combine thumbnail with gallery
  const allImages = [
    project.thumbnail_url,
    ...(Array.isArray(project.gallery_urls) ? project.gallery_urls : [])
  ].filter(Boolean) as string[];

  const currentImage = allImages[currentImageIndex];
  const hasMultipleImages = allImages.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, isFullscreen]);

  return (
    <>
      {/* Main Modal */}
      <Dialog open={!!project} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-5xl p-0 bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Image Section / Lightbox */}
            <div className="relative bg-black/50 flex items-center justify-center min-h-[300px] lg:min-h-full">
              {/* Current Image */}
              <img
                src={currentImage}
                alt={project.title}
                className={cn(
                  "w-full h-full object-contain max-h-[500px] lg:max-h-full transition-transform duration-300",
                  isZoomed && "scale-150 cursor-zoom-out"
                )}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter & Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                {hasMultipleImages && (
                  <div className="flex items-center gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === currentImageIndex 
                            ? "bg-primary w-6" 
                            : "bg-white/30 hover:bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
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
            </div>

            {/* Content Section */}
            <ScrollArea className="max-h-[600px]">
              <div className="p-8">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Category */}
                <Badge variant="outline" className="mb-4 bg-white/5 border-white/20 text-white/80 font-pixel text-xs">
                  {project.category}
                </Badge>

                {/* Title */}
                <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                  {project.title}
                </h2>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-6">
                  {project.client_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{project.client_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(project.created_at), "MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-invert prose-sm max-w-none mb-8">
                  <p className="text-white/70 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Results (if available) */}
                {project.results && (
                  <div className="mb-8">
                    <h3 className="font-pixel text-sm text-primary mb-3">RESULTADOS</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {project.results}
                    </p>
                  </div>
                )}

                {/* Gallery Thumbnails */}
                {hasMultipleImages && (
                  <div>
                    <h3 className="font-pixel text-sm text-white/50 mb-3">GALERIA</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            idx === currentImageIndex 
                              ? "border-primary" 
                              : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img
                            src={img}
                            alt={`${project.title} - ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <img
            src={currentImage}
            alt={project.title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {hasMultipleImages && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    idx === currentImageIndex 
                      ? "bg-primary w-8" 
                      : "bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
