import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}
