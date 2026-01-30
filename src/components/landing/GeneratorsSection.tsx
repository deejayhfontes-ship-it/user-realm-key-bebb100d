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
  Zap,
  Eye
} from "lucide-react";
import { useGeneratorsList } from "@/hooks/useGenerators";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Map generator types/slugs to icons
const getGeneratorIcon = (type: string, slug: string) => {
  if (slug.includes("stories") || slug.includes("story")) return Image;
  if (slug.includes("carrossel") || type === "carousel") return Layers;
  if (slug.includes("derivac") || type === "derivations") return Sparkles;
  if (slug.includes("flyer") || slug.includes("campanha")) return Megaphone;
  if (slug.includes("post")) return LayoutTemplate;
  if (slug.includes("identidade") || slug.includes("visual")) return Palette;
  if (type === "stories") return Image;
  return Wand2;
};

// Determine badge based on generator properties
const getGeneratorBadge = (generator: any) => {
  const isAI = generator.type === "derivations" || generator.slug.includes("ia") || generator.slug.includes("ai");
  const isNew = new Date(generator.created_at || "").getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000;
  
  // Check if it's a "popular" generator (based on type or could be from usage data)
  const popularTypes = ["stories", "carousel"];
  const isPopular = popularTypes.includes(generator.type);

  if (isAI) return { label: "IA", color: "bg-primary/20 border-primary/40 text-primary" };
  if (isNew) return { label: "NOVO", color: "bg-blue-500/20 border-blue-500/40 text-blue-400" };
  if (isPopular) return { label: "POPULAR", color: "bg-amber-500/20 border-amber-500/40 text-amber-400" };
  return null;
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
    // All generators require login for now (can be expanded with requer_login field)
    const requiresLogin = true;

    if (requiresLogin && !isAuthenticated) {
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
            <Skeleton className="h-4 w-40 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-12 w-80 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-[24px] bg-white/5" />
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
        {/* Section Header - Marketing Copy */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="font-pixel text-xs text-primary tracking-[0.3em] uppercase mb-4">
            TECNOLOGIA + DIREÇÃO MANUAL
          </p>
          <h2 className="magnetto-title text-3xl md:text-4xl lg:text-5xl text-white tracking-[0.05em] mb-6">
            CONHEÇA NOSSOS GERADORES
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-4">
            <span className="text-white font-medium">IA com direção manual:</span> você controla o resultado. 
            Gere flyers, artes, posts e variações profissionais em minutos.
          </p>
          <p className="text-white/40 text-sm">
            Geradores focados em campanhas reais — com resultado guiado por direção manual, não "aleatório".
          </p>
        </div>

        {/* Generators Grid - Product Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseGenerators.map((generator) => {
            const IconComponent = getGeneratorIcon(generator.type, generator.slug);
            const badge = getGeneratorBadge(generator);

            return (
              <div
                key={generator.id}
                onClick={() => handleGeneratorClick(generator)}
                className={cn(
                  "group relative rounded-[24px] p-6 cursor-pointer transition-all duration-500",
                  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
                  "hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/5",
                  "hover:-translate-y-1",
                  "active:scale-[0.98]"
                )}
              >
                {/* Ambient Glow on Hover */}
                <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div 
                    className="absolute inset-0 blur-3xl"
                    style={{
                      background: 'radial-gradient(ellipse 80% 60% at 50% 100%, hsl(78 70% 50% / 0.15) 0%, transparent 70%)'
                    }}
                  />
                </div>

                {/* Badge */}
                {badge && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full border text-[10px] font-pixel tracking-wider",
                      badge.color
                    )}>
                      {badge.label}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
                    "bg-gradient-to-br from-white/10 to-white/5",
                    "border border-white/10 group-hover:border-primary/40",
                    "group-hover:from-primary/20 group-hover:to-primary/5",
                    "transition-all duration-500"
                  )}>
                    <IconComponent className="w-7 h-7 text-white/60 group-hover:text-primary transition-colors duration-500" />
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-xl text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {generator.name}
                  </h3>

                  {/* Description - Clamp to 2 lines, expand on hover */}
                  <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {generator.description || "Gerador visual automatizado para criar artes profissionais rapidamente."}
                  </p>

                  {/* Footer with Category + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-white/30 font-pixel tracking-wider uppercase">
                      {generator.type === "stories" && "STORIES"}
                      {generator.type === "carousel" && "CARROSSEL"}
                      {generator.type === "derivations" && "VARIAÇÕES"}
                      {!["stories", "carousel", "derivations"].includes(generator.type) && "GERADOR"}
                    </span>

                    {/* CTA - appears on hover */}
                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <span className="font-pixel text-xs tracking-wider">
                        {isAuthenticated ? "ACESSAR" : "VER MAIS"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Lock indicator for non-authenticated - subtle corner */}
                {!isAuthenticated && (
                  <div className="absolute bottom-5 left-6 opacity-40 group-hover:opacity-0 transition-opacity">
                    <Lock className="w-4 h-4 text-white/40" />
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
            {isAuthenticated ? "ACESSAR MEUS GERADORES" : "COMEÇAR AGORA"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-white/30 text-xs">
            {isAuthenticated ? "Veja todos os geradores disponíveis na sua conta" : "Crie sua conta gratuitamente e comece a gerar"}
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
                  Faça login para acessar este gerador e começar a criar artes profissionais.
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