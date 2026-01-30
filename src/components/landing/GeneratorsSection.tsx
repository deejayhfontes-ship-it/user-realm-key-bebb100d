import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wand2, 
  Image, 
  Sparkles, 
  Lock,
  ArrowRight,
  LayoutTemplate,
  Megaphone,
  Palette,
  Layers,
  FileText,
  Instagram,
  Target,
  Eye,
  Bot
} from "lucide-react";
import { useGeneratorsList } from "@/hooks/useGenerators";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Map generator types/slugs to icons
const getGeneratorIcon = (type: string, slug: string) => {
  if (slug.includes("flyer")) return FileText;
  if (slug.includes("post")) return Instagram;
  if (slug.includes("campanha") || slug.includes("campaign")) return Target;
  if (slug.includes("stories") || slug.includes("story")) return Image;
  if (slug.includes("carrossel") || type === "carousel") return Layers;
  if (slug.includes("derivac") || type === "derivations") return Sparkles;
  if (slug.includes("identidade") || slug.includes("visual")) return Palette;
  if (type === "stories") return Image;
  return Wand2;
};

export function GeneratorsSection() {
  const { data: generators, isLoading } = useGeneratorsList();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [previewModal, setPreviewModal] = useState<{ open: boolean; generator: any | null }>({
    open: false,
    generator: null
  });

  const isAuthenticated = !!user && profile?.role === "client";

  // Filter only ready generators for the public showcase
  const showcaseGenerators = generators?.filter(g => g.status === "ready") || [];

  const handleGeneratorClick = (generator: any) => {
    if (!isAuthenticated) {
      // Show preview modal for non-authenticated users
      setPreviewModal({ open: true, generator });
    } else {
      // Navigate to the generator
      navigate(`/client/geradores`);
    }
  };

  const handleAccessClick = () => {
    setPreviewModal({ open: false, generator: null });
    navigate("/client/login");
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4 bg-white/10 rounded-full" />
            <Skeleton className="h-12 w-[500px] mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-6 w-[600px] mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-[16px] bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (showcaseGenerators.length === 0) {
    return null;
  }

  return (
    <section id="generators" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-4 h-4 text-primary" />
            <span className="font-pixel text-xs text-primary tracking-wider">
              RECURSOS PREMIUM
            </span>
          </div>

          {/* Title */}
          <h2 className="magnetto-title text-3xl md:text-4xl lg:text-5xl text-white tracking-[0.05em] mb-6">
            TRANSFORME IDEIAS EM<br />ARTE PROFISSIONAL
          </h2>

          {/* Subtitle */}
          <p className="text-white/60 text-lg leading-relaxed">
            <span className="text-white font-medium">IA com direção manual</span> e controle criativo.
            <br />
            <span className="text-white/40">Resultados profissionais, não aleatórios.</span>
          </p>
        </div>

        {/* Generators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseGenerators.map((generator) => {
            const IconComponent = getGeneratorIcon(generator.type, generator.slug);

            return (
              <div
                key={generator.id}
                onClick={() => handleGeneratorClick(generator)}
                className={cn(
                  "group relative aspect-[4/3] rounded-[16px] p-8 cursor-pointer transition-all duration-300",
                  "bg-white/[0.05] backdrop-blur-[10px] border border-white/[0.1]",
                  "hover:scale-[1.02] hover:border-primary hover:bg-white/[0.08]",
                  "active:scale-[0.98]"
                )}
              >
                {/* AI Badge */}
                <div className="absolute top-5 right-5 z-10">
                  <span className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-pixel tracking-wider">
                    IA
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-5",
                    "bg-white/[0.05] border border-white/[0.1]",
                    "group-hover:bg-primary/10 group-hover:border-primary/30",
                    "transition-all duration-300"
                  )}>
                    <IconComponent className="w-6 h-6 text-white/60 group-hover:text-primary transition-colors duration-300" />
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-xl text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {generator.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-2 flex-1">
                    {generator.description || "Gerador visual automatizado para criar artes profissionais rapidamente."}
                  </p>

                  {/* Category Tag */}
                  <div className="mt-4 pt-4 border-t border-white/[0.05]">
                    <span className="text-xs text-white/30 font-pixel tracking-wider uppercase">
                      {generator.type === "stories" && "STORIES"}
                      {generator.type === "carousel" && "CARROSSEL"}
                      {generator.type === "derivations" && "VARIAÇÕES"}
                      {!["stories", "carousel", "derivations"].includes(generator.type) && "GERADOR"}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay - Blur + Access Button (for non-authenticated) */}
                {!isAuthenticated && (
                  <div className="absolute inset-0 rounded-[16px] bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 z-20">
                    <Lock className="w-8 h-8 text-white/60" />
                    <p className="text-white/80 text-sm font-medium text-center px-4">
                      Área exclusiva para clientes
                    </p>
                    <button className="px-6 py-2.5 rounded-full bg-primary text-black font-pixel text-xs tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2">
                      ACESSAR
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Hover Overlay - Access Button (for authenticated) */}
                {isAuthenticated && (
                  <div className="absolute inset-0 rounded-[16px] bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                    <button className="px-6 py-2.5 rounded-full bg-primary text-black font-pixel text-xs tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2">
                      ACESSAR
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center mt-16 gap-4">
          <button 
            onClick={() => navigate(isAuthenticated ? "/client/geradores" : "/client/login")}
            className="px-10 py-4 rounded-full bg-primary text-black font-pixel text-sm tracking-wider hover:bg-primary/90 transition-all flex items-center gap-3 group shadow-lg shadow-primary/20"
          >
            {isAuthenticated ? "VER TODOS OS GERADORES" : "COMEÇAR AGORA"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-white/30 text-xs">
            {isAuthenticated ? "Acesse sua área de geradores" : "Crie sua conta gratuitamente e comece a gerar"}
          </p>
        </div>
      </div>

      {/* Preview Blocked Modal - For Non-Authenticated Users */}
      <Dialog open={previewModal.open} onOpenChange={(open) => setPreviewModal({ open, generator: previewModal.generator })}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 p-0 overflow-hidden rounded-[24px]">
          <VisuallyHidden>
            <DialogTitle>Preview do Gerador</DialogTitle>
          </VisuallyHidden>

          {previewModal.generator && (
            <div className="relative">
              {/* Blurred Preview Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" />
              
              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Lock Icon */}
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-white/40" />
                </div>

                {/* Generator Name */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {previewModal.generator.name}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                  {previewModal.generator.description || "Gerador visual automatizado"}
                </p>

                {/* Divider */}
                <div className="w-16 h-px bg-white/10 mx-auto mb-6" />

                {/* Message */}
                <p className="text-white/60 text-sm mb-8">
                  🔒 Área exclusiva para clientes.
                  <br />
                  Faça login para acessar este gerador.
                </p>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAccessClick}
                    className="w-full py-4 rounded-full bg-primary text-black font-pixel text-sm tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    ACESSAR AGORA
                  </button>
                  <button
                    onClick={() => setPreviewModal({ open: false, generator: null })}
                    className="w-full py-3 rounded-full bg-white/5 text-white/60 font-pixel text-xs tracking-wider hover:bg-white/10 transition-all"
                  >
                    CONTINUAR EXPLORANDO
                  </button>
                </div>

                {/* Footer Note */}
                <p className="text-white/30 text-xs mt-6">
                  Conta gratuita • Sem cartão de crédito
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
