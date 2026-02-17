import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-lime-400",
  className,
}: FeatureCardProps) {
  return (
    <GlassCard className={cn("text-center", className)}>
      <div className={cn("inline-flex p-3 rounded-xl bg-white/5 mb-4", iconColor)}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </GlassCard>
  );
}
