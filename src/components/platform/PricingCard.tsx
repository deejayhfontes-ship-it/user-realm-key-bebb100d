import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { NeonButton } from "./NeonButton";
import { Link } from "react-router-dom";

interface PricingCardProps {
  name: string;
  price: string; // EDITAR: "R$ 99" ou "Sob consulta"
  period?: string; // "/mês" ou ""
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string; // "Mais Popular", etc.
  ctaText?: string;
  ctaLink?: string;
}

export function PricingCard({
  name,
  price,
  period = "/mês",
  description,
  features,
  highlighted = false,
  badge,
  ctaText = "Começar",
  ctaLink = "/client/login",
}: PricingCardProps) {
  return (
    <div className="relative">
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}
      <GlassCard
        hover={false}
        className={cn(
          "flex flex-col h-full",
          highlighted && "border-lime-400/50 bg-lime-400/5 scale-105"
        )}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">{price}</span>
            {period && <span className="text-zinc-400">{period}</span>}
          </div>
          {description && (
            <p className="text-zinc-400 text-sm mt-2">{description}</p>
          )}
        </div>

        <ul className="space-y-3 flex-grow mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Link to={ctaLink} className="mt-auto">
          <NeonButton
            variant={highlighted ? "primary" : "secondary"}
            className="w-full"
          >
            {ctaText}
          </NeonButton>
        </Link>
      </GlassCard>
    </div>
  );
}
