import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { icons } from "lucide-react";
import type { Service } from "@/types/service";
import type { LucideIcon } from "lucide-react";

interface BriefingStep1Props {
  services: Service[];
  loading: boolean;
  selectedServiceId: string;
  onSelect: (id: string, name: string) => void;
  onNext: () => void;
  canNext: boolean;
}

export function BriefingStep1({
  services,
  loading,
  selectedServiceId,
  onSelect,
  onNext,
  canNext,
}: BriefingStep1Props) {
  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return icons.Palette as LucideIcon;
    const IconComponent = icons[iconName as keyof typeof icons];
    if (IconComponent && typeof IconComponent !== "function") {
      return IconComponent as LucideIcon;
    }
    return icons.Palette as LucideIcon;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-8">
        Qual serviço você precisa?
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-[16px] bg-white/5" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-white/50">
          <p>Nenhum serviço disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            const Icon = getIcon(service.icon);

            return (
              <label
                key={service.id}
                className={cn(
                  "relative block p-6 rounded-[16px] cursor-pointer transition-all duration-300",
                  "border-2",
                  isSelected
                    ? "border-[#c4ff0d] bg-[#c4ff0d]/10"
                    : "border-transparent bg-white/5 hover:bg-white/10"
                )}
                onClick={() => onSelect(service.id, service.title)}
              >
                <input
                  type="radio"
                  name="servico"
                  value={service.id}
                  checked={isSelected}
                  onChange={() => {}}
                  className="sr-only"
                />

                {/* Check Icon */}
                {isSelected && (
                  <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-[#c4ff0d]" />
                )}

                {/* Icon */}
                <div className="mb-4">
                  <Icon className="w-12 h-12 text-[#c4ff0d]" />
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
                  {service.short_description}
                </p>
              </label>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!canNext}
          className={cn(
            "px-8 py-3 rounded-[24px] font-semibold transition-all duration-300",
            canNext
              ? "bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90"
              : "bg-[#c4ff0d]/50 text-[#1a1a1a]/50 cursor-not-allowed"
          )}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
