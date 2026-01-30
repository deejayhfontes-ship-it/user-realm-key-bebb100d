import { useNavigate } from "react-router-dom";
import { 
  Wand2, 
  Image, 
  Layers, 
  Sparkles, 
  Lock,
  ArrowRight,
  FileImage,
  LayoutGrid
} from "lucide-react";
import { useGeneratorsList } from "@/hooks/useGenerators";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Map generator types to icons
const getGeneratorIcon = (type: string, slug: string) => {
  if (slug.includes("stories")) return Image;
  if (slug.includes("carrossel") || type === "carousel") return LayoutGrid;
  if (slug.includes("derivac") || type === "derivations") return Sparkles;
  if (type === "stories") return FileImage;
  return Wand2;
};

// Map generator types to accent colors
const getGeneratorAccent = (type: string) => {
  switch (type) {
    case "stories":
      return "from-purple-500/20 to-pink-500/20";
    case "carousel":
      return "from-blue-500/20 to-cyan-500/20";
    case "derivations":
      return "from-primary/20 to-yellow-500/20";
    default:
      return "from-primary/20 to-emerald-500/20";
  }
};

export function GeneratorsSection() {
  const { data: generators, isLoading } = useGeneratorsList();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user && profile?.role === "client";

  // Filter only ready generators
  const readyGenerators = generators?.filter(g => g.status === "ready") || [];

  const handleGeneratorClick = (generator: any) => {
    if (isAuthenticated) {
      navigate(`/client/geradores`);
    } else {
      navigate("/client/login");
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-10 w-64 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-[24px] bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (readyGenerators.length === 0) {
    return null;
  }

  return (
    <section id="generators" className="py-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-pixel text-xs text-primary tracking-[0.3em] uppercase mb-4">
            FERRAMENTAS VISUAIS
          </p>
          <h2 className="magnetto-title text-3xl md:text-4xl lg:text-5xl text-white tracking-[0.05em] mb-4">
            NOSSOS GERADORES
          </h2>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            Crie artes profissionais em segundos com nossos geradores automatizados
          </p>
        </div>

        {/* Generators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readyGenerators.map((generator) => {
            const IconComponent = getGeneratorIcon(generator.type, generator.slug);
            const accentGradient = getGeneratorAccent(generator.type);
            const isNew = new Date(generator.created_at || "").getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
            const isAI = generator.type === "derivations" || generator.slug.includes("ia");

            return (
              <div
                key={generator.id}
                onClick={() => handleGeneratorClick(generator)}
                className={cn(
                  "group relative rounded-[24px] p-6 cursor-pointer transition-all duration-300",
                  "bg-white/5 backdrop-blur-xl border border-white/10",
                  "hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]",
                  "active:scale-[0.98]"
                )}
              >
                {/* Gradient Background on Hover */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    accentGradient
                  )}
                />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {isAI && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-pixel tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                  )}
                  {isNew && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-pixel tracking-wider">
                      NOVO
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                    "bg-white/10 border border-white/10 group-hover:border-primary/30 transition-colors"
                  )}>
                    <IconComponent className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-primary transition-colors">
                    {generator.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
                    {generator.description || "Gerador visual automatizado"}
                  </p>

                  {/* Category Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 font-pixel tracking-wider uppercase">
                      {generator.type}
                    </span>

                    {/* CTA */}
                    <div className={cn(
                      "flex items-center gap-2 text-sm transition-all",
                      isAuthenticated 
                        ? "text-primary opacity-0 group-hover:opacity-100" 
                        : "text-white/60"
                    )}>
                      {!isAuthenticated && <Lock className="w-3.5 h-3.5" />}
                      <span className="font-pixel text-xs tracking-wider">
                        {isAuthenticated ? "ACESSAR" : "LOGIN"}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Locked Overlay for Non-Authenticated */}
                {!isAuthenticated && (
                  <div className="absolute inset-0 rounded-[24px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-white/60 mx-auto mb-2" />
                      <p className="text-white font-pixel text-sm tracking-wider">
                        FAÇA LOGIN PARA ACESSAR
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => navigate(isAuthenticated ? "/client/geradores" : "/client/login")}
            className="px-8 py-4 rounded-full bg-primary/10 border border-primary/30 text-primary font-pixel text-sm tracking-wider hover:bg-primary/20 transition-all flex items-center gap-3 group"
          >
            {isAuthenticated ? "VER TODOS OS GERADORES" : "ACESSAR GERADORES"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}