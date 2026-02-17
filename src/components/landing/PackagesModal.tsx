import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, Check, Sparkles, Loader2 } from "lucide-react";
import { usePackages } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackagesModal({ open, onOpenChange }: PackagesModalProps) {
  const { data: packages, isLoading } = usePackages();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  const isAuthenticated = !!user && profile?.role === "client";

  const handleContractPackage = async (packageId: string) => {
    setLoadingPackageId(packageId);
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (isAuthenticated) {
      navigate(`/client/plans`);
    } else {
      navigate("/client/login");
    }
    
    setLoadingPackageId(null);
    onOpenChange(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getPackageFeatures = (pkg: any) => {
    const features = [
      `${pkg.credits} gerações incluídas`,
      `Validade: ${pkg.duration_days} dias`,
    ];
    
    if (pkg.description) {
      features.push(pkg.description);
    }
    
    return features;
  };

  // Find the best value package (most credits per day)
  const getBestValuePackage = () => {
    if (!packages || packages.length === 0) return null;
    
    return packages.reduce((best, current) => {
      const currentValue = current.credits / current.duration_days;
      const bestValue = best.credits / best.duration_days;
      return currentValue > bestValue ? current : best;
    }, packages[0]);
  };

  const bestValuePackage = getBestValuePackage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border border-white/10 p-0 overflow-hidden rounded-[32px]">
        <VisuallyHidden>
          <DialogTitle>Planos e Pacotes</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="relative p-8 pb-4">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Section */}
          <div className="text-center mb-2">
            <p className="font-pixel text-xs text-primary tracking-[0.3em] uppercase mb-3">
              ESCOLHA SEU PLANO
            </p>
            <h2 className="magnetto-title text-3xl md:text-4xl text-white tracking-[0.05em]">
              PLANOS E PACOTES
            </h2>
            <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
              Selecione o pacote ideal para suas necessidades de criação visual
            </p>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="px-8 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : packages && packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isFeatured = pkg.featured || pkg.id === bestValuePackage?.id;
                const isLoadingThis = loadingPackageId === pkg.id;
                
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.02]",
                      isFeatured
                        ? "bg-primary/10 border-2 border-primary/50"
                        : "bg-white/5 border border-white/10"
                    )}
                  >
                    {/* Featured Badge */}
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-black text-xs font-pixel tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        MELHOR VALOR
                      </div>
                    )}

                    {/* Package Name */}
                    <h3 className={cn(
                      "font-pixel text-sm tracking-wider mb-3 mt-2",
                      isFeatured ? "text-primary" : "text-white/80"
                    )}>
                      {pkg.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-4">
                      <span className={cn(
                        "text-3xl font-bold",
                        isFeatured ? "text-primary" : "text-white"
                      )}>
                        {formatPrice(pkg.price)}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {getPackageFeatures(pkg).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                          <Check className={cn(
                            "w-4 h-4 mt-0.5 flex-shrink-0",
                            isFeatured ? "text-primary" : "text-white/50"
                          )} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleContractPackage(pkg.id)}
                      disabled={isLoadingThis}
                      className={cn(
                        "w-full py-3 rounded-full font-pixel text-sm tracking-wider transition-all flex items-center justify-center gap-2",
                        isFeatured
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      )}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {isAuthenticated ? "CONTRATAR" : "COMEÇAR AGORA"}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50">Nenhum pacote disponível no momento.</p>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-center text-white/40 text-xs mt-6">
            {isAuthenticated 
              ? "Você será redirecionado para finalizar sua contratação"
              : "Faça login ou crie sua conta para contratar um pacote"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}