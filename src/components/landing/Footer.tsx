import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/fontesgraphics", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/fontesgraphics", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "https://wa.me/5535999999999", label: "WhatsApp" },
];

export function Footer() {
  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#050505] pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Stay Connected */}
          <div>
            <p className="font-pixel text-xs text-zinc-500 tracking-[0.2em] mb-4">
              STAY CONNECTED.
            </p>
            <a
              href="mailto:contato@fontesgraphics.com"
              className="magnetto-title text-2xl md:text-3xl text-white hover:text-primary transition-colors"
            >
              CONTATO@FONTES
              <br />
              GRAPHICS.COM
            </a>
            <p className="text-zinc-500 mt-6 max-w-xs">
              Na Fontes Graphics, quebramos barreiras para criar designs que 
              se destacam e entregam resultados.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <nav className="space-y-4">
              {navLinks.map((link, index) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="block text-xl font-pixel text-white hover:text-primary transition-colors"
                >
                  {link.label}
                  <sup className="text-xs text-zinc-600 ml-1">
                    ({String(index + 1).padStart(2, "0")})
                  </sup>
                </button>
              ))}
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <p className="font-pixel text-sm text-zinc-500 tracking-[0.15em] mb-6">
              Social Media
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Logo Watermark */}
        <div className="flex justify-center mb-12">
          <h2 className="magnetto-title text-[15vw] md:text-[10vw] text-zinc-900 select-none pointer-events-none">
            Fontes
          </h2>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            ©{new Date().getFullYear()} Fontes Graphics. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <Link to="/termos" className="hover:text-zinc-400 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-zinc-400 transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
