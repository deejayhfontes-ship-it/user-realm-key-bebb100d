import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useClientData } from "@/hooks/useClientData";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const navItems = [
  { label: "HOME", href: "/", isRoute: true, anchor: "#hero" },
  { label: "SOBRE", href: "/#about", isRoute: false, anchor: "#about" },
  { label: "PORTFÓLIO", href: "/portfolio", isRoute: true, anchor: null },
  { label: "SERVIÇOS", href: "/#services", isRoute: false, anchor: "#services" },
  { label: "ORÇAMENTO", href: "/briefing", isRoute: true, anchor: null },
  { label: "CONTATO", href: "/#contact", isRoute: false, anchor: "#contact" },
  { label: "ACOMPANHAR", href: "/consultar", isRoute: true, anchor: null },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { user, signOut, profile } = useAuth();
  const { client } = useClientData();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position (only on home page)
      if (location.pathname === "/") {
        const sections = ["hero", "about", "services", "contact"];
        const scrollPosition = window.scrollY + 100;

        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element && element.offsetTop <= scrollPosition) {
            setActiveSection(`#${section}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback((item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);

    // If it's a route (like /portfolio or /briefing)
    if (item.isRoute && !item.anchor) {
      navigate(item.href);
      return;
    }

    // If it's the home route
    if (item.href === "/" && location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If we're on home page and it's an anchor
    if (location.pathname === "/" && item.anchor) {
      const element = document.querySelector(item.anchor);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
      return;
    }

    // If we're on another page and need to go to home + anchor
    if (location.pathname !== "/" && item.anchor) {
      navigate("/");
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.querySelector(item.anchor!);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
      return;
    }

    // Fallback: just navigate
    if (item.href !== location.pathname) {
      navigate(item.href);
    }
  }, [location.pathname, navigate]);

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (item: typeof navItems[0]) => {
    // For route-based items
    if (item.isRoute && !item.anchor) {
      return location.pathname === item.href;
    }
    // For home
    if (item.href === "/" && location.pathname === "/") {
      return activeSection === "#hero" || (!activeSection && window.scrollY < 100);
    }
    // For anchor-based items on home page
    if (location.pathname === "/" && item.anchor) {
      return activeSection === item.anchor;
    }
    return false;
  };

  const isAuthenticated = !!user && profile?.role === "client";
  const clientName = client?.name || profile?.email || "Usuário";
  const clientPhoto = client?.logo_url;

  return (
    <>
      {/* Desktop Navbar - Floating Pill */}
      <nav
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2 px-3 py-3 transition-all duration-300",
          "rounded-full bg-black/40 backdrop-blur-xl border border-white/10"
        )}
      >
        {/* Logo/Avatar */}
        <button
          onClick={handleLogoClick}
          className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden mr-2 hover:scale-105 transition-transform cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #c4ff0d, #a8e000)' }}
        >
          <span className="font-display text-sm text-black font-semibold">FG</span>
        </button>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors duration-200",
                isActive(item)
                  ? "text-primary font-semibold"
                  : "text-white/80 hover:text-primary"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth Section */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                <Avatar className="w-9 h-9 border-2 border-primary/50">
                  <AvatarImage src={clientPhoto || undefined} alt={clientName} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {getInitials(clientName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-medium text-white truncate">{clientName}</p>
                <p className="text-xs text-white/50 truncate">{client?.email || profile?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => navigate("/client/dashboard")}
                className="px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Minha Área
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/client/login"
            className="ml-2 px-6 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            LOGIN <span className="text-lg">+</span>
          </Link>
        )}
      </nav>

      {/* Mobile Bottom Bar */}
      <nav
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-4 py-3 transition-all duration-300",
          "rounded-full bg-black/40 backdrop-blur-xl border border-white/10"
        )}
      >
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg, #c4ff0d, #a8e000)' }}
        >
          <span className="font-display text-xs text-black font-semibold">FG</span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Avatar className="w-8 h-8 border-2 border-primary/50">
              <AvatarImage src={clientPhoto || undefined} alt={clientName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {getInitials(clientName)}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              "bg-white/10 backdrop-blur-sm hover:bg-primary/20",
              isMobileMenuOpen && "bg-primary/20"
            )}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" />

        {/* Menu Content */}
        <div
          className={cn(
            "relative h-full flex flex-col items-center justify-center px-8 py-32 transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Nav Items */}
          <div className="flex flex-col items-center w-full max-w-sm">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "w-full py-5 text-center text-2xl font-semibold transition-colors duration-200 border-b border-white/10",
                  isActive(item)
                    ? "text-primary"
                    : "text-white hover:text-primary"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="mt-10 flex flex-col items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/client/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-10 py-4 rounded-full bg-primary text-black font-semibold text-lg flex items-center gap-3 hover:bg-primary/90 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Minha Área
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-10 py-4 rounded-full bg-white/10 text-white font-semibold text-lg flex items-center gap-3 hover:bg-white/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/client/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-10 py-4 rounded-full bg-primary text-black font-semibold text-lg hover:bg-primary/90 transition-colors"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
