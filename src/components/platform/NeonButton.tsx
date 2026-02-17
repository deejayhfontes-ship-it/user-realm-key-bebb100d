import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center gap-2",
          // Size variants
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          // Color variants
          variant === "primary" && [
            "bg-lime-400 text-black",
            "hover:bg-lime-300 hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]",
            "active:scale-95"
          ],
          variant === "secondary" && [
            "bg-white/10 text-white border border-white/20",
            "hover:bg-white/20 hover:border-white/30",
            "active:scale-95"
          ],
          variant === "outline" && [
            "bg-transparent text-lime-400 border-2 border-lime-400",
            "hover:bg-lime-400/10 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]",
            "active:scale-95"
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeonButton.displayName = "NeonButton";
