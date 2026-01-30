import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <>
      {/* Desktop Navbar - Floating Pill */}
      <nav
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2 px-3 py-3 transition-all duration-300",
          "navbar-pill"
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

        {/* CTA Button */}
        <Link
          to="/client/login"
          className="ml-2 px-6 py-2.5 rounded-full bg-white text-black font-pixel text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          LOGIN <span className="text-lg">+</span>
        </Link>
      </nav>

      {/* Mobile Navbar */}
      <nav
        className={cn(
          "fixed top-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-4 py-3 transition-all duration-300",
          "navbar-pill"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <span className="font-display text-xs text-white">FG</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
          <Link
            to="/client/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-4 px-8 py-3 rounded-full bg-primary text-black font-pixel text-lg"
          >
            LOGIN
          </Link>
        </div>
      )}
    </>
  );
}
