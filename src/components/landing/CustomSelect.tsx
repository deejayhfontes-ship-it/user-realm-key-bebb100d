import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  Check, 
  Palette, 
  Monitor, 
  Instagram, 
  Play, 
  Layers, 
  MoreHorizontal,
  Package,
  Megaphone,
  FileText,
  PenTool,
  Camera,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon | string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  error?: boolean;
  errorMessage?: string;
  loading?: boolean;
}

// Icon mapping for dynamic icons from database
const ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Monitor,
  Instagram,
  Play,
  Layers,
  MoreHorizontal,
  Package,
  Megaphone,
  FileText,
  PenTool,
  Camera,
};

export const getIconByName = (iconName: string | undefined | null): LucideIcon => {
  if (!iconName) return MoreHorizontal;
  return ICON_MAP[iconName] || MoreHorizontal;
};

// Legacy static options (fallback)
export const projectTypeOptions: SelectOption[] = [
  { value: "Identidade Visual", label: "Identidade Visual", icon: Palette },
  { value: "Web Design", label: "Web Design", icon: Monitor },
  { value: "Social Media", label: "Social Media", icon: Instagram },
  { value: "Motion Graphics", label: "Motion Graphics", icon: Play },
  { value: "Branding Completo", label: "Branding Completo", icon: Layers },
  { value: "Outro", label: "Outro", icon: MoreHorizontal },
];

export function CustomSelect({
  value,
  onChange,
  placeholder = "Selecione...",
  options,
  error = false,
  errorMessage,
  loading = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelect(options[highlightedIndex].value);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, options]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      // Find current selection index when opening
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Tipo de Projeto"
        className={cn(
          "w-full px-4 py-3.5 rounded-xl text-left",
          "bg-white/5 border border-white/20",
          "text-base cursor-pointer",
          "transition-all duration-300",
          "flex items-center justify-between gap-3",
          "focus:outline-none focus:border-primary",
          "hover:bg-white/[0.08] hover:border-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500",
          selectedOption ? "text-white" : "text-white/40"
        )}
      >
        <span className="flex items-center gap-3 truncate">
          {loading ? (
            "Carregando..."
          ) : selectedOption ? (
            <>
              {(() => {
                const IconComponent = typeof selectedOption.icon === 'string' 
                  ? getIconByName(selectedOption.icon) 
                  : selectedOption.icon || MoreHorizontal;
                return <IconComponent className="w-[18px] h-[18px] text-primary flex-shrink-0" />;
              })()}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-white/60 flex-shrink-0",
            "transition-transform duration-300",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Error Message */}
      {error && errorMessage && (
        <p className="text-red-500 text-xs mt-1.5">{errorMessage}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 w-full mt-2",
            "bg-[#2a2a2a] border border-primary/30",
            "rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
            "backdrop-blur-xl",
            "max-h-[300px] overflow-y-auto",
            "p-2",
            // Animation
            "animate-in fade-in-0 slide-in-from-top-2 duration-200",
            // Custom scrollbar
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded",
            "[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded",
            "[&::-webkit-scrollbar-thumb:hover]:bg-primary/50"
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            const Icon = typeof option.icon === 'string' 
              ? getIconByName(option.icon) 
              : option.icon || MoreHorizontal;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "px-4 py-3 rounded-lg",
                  "text-[15px] cursor-pointer",
                  "flex items-center gap-3",
                  "transition-all duration-200",
                  isSelected 
                    ? "bg-primary/15 text-primary font-semibold" 
                    : "text-white/80",
                  isHighlighted && !isSelected && "bg-primary/10 text-white translate-x-1",
                  !isSelected && !isHighlighted && "hover:bg-primary/10 hover:text-white hover:translate-x-1"
                )}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <Icon className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    isHighlighted ? "text-primary" : "text-white/40"
                  )} />
                )}
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
