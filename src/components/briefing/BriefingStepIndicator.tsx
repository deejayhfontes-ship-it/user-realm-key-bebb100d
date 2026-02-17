import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BriefingStepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Serviço" },
  { number: 2, label: "Detalhes" },
  { number: 3, label: "Referências" },
  { number: 4, label: "Revisão" },
];

export function BriefingStepIndicator({ currentStep }: BriefingStepIndicatorProps) {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-start relative">
        {/* Connecting lines */}
        {steps.slice(0, -1).map((step, index) => (
          <div
            key={`line-${index}`}
            className="absolute top-5 h-0.5"
            style={{
              left: `calc(${(index * 100) / (steps.length - 1)}% + 20px)`,
              width: `calc(${100 / (steps.length - 1)}% - 40px)`,
              backgroundColor: currentStep > step.number ? "#c4ff0d" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                  isCompleted && "bg-[#c4ff0d] text-[#1a1a1a]",
                  isActive && "bg-transparent border-2 border-[#c4ff0d] text-[#c4ff0d]",
                  !isCompleted && !isActive && "bg-transparent border-2 border-white/30 text-white/50"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  isActive ? "text-[#c4ff0d]" : "text-white/50"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
