import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  { label: "HOME", href: "#hero" },
  { label: "ABOUT", href: "#about" },
  { label: "PROJECTS", href: "#projects" },
  { label: "SERVICES", href: "#services" },
  { label: "CONTACT", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, profile } = useAuth();
  const { client } = useClientData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/");
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
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center overflow-hidden mr-2">
          <span className="font-display text-sm text-white">FG</span>
        </div>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="px-4 py-2 text-sm font-pixel text-zinc-400 hover:text-white transition-colors"
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
            className="ml-2 px-6 py-2.5 rounded-full bg-white text-black font-pixel text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            LOGIN <span className="text-lg">+</span>
          </Link>
        )}
      </nav>

      {/* Mobile Navbar */}
      <nav
        className={cn(
          "fixed top-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-4 py-3 transition-all duration-300",
          "rounded-full bg-black/40 backdrop-blur-xl border border-white/10"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <span className="font-display text-xs text-white">FG</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Avatar className="w-8 h-8 border-2 border-primary/50">
              <AvatarImage src={clientPhoto || undefined} alt={clientName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {getInitials(clientName)}
              </AvatarFallback>
            </Avatar>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 md:hidden flex flex-col items-center justify-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="text-2xl font-display text-white hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
          
          {isAuthenticated ? (
            <>
              <Link
                to="/client/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 px-8 py-3 rounded-full bg-primary text-black font-pixel text-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Minha Área
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-8 py-3 rounded-full bg-white/10 text-white font-pixel text-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/client/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 px-8 py-3 rounded-full bg-primary text-black font-pixel text-lg"
            >
              LOGIN
            </Link>
          )}
        </div>
      )}
    </>
  );
}
