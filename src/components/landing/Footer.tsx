import { Link, useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";
import { landingContent } from "@/data/landingContent";

const socialIconMap: Record<string, typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function Footer() {
  const content = landingContent.footer;
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
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
              {content.stayConnected.label}
            </p>
            <a
              href={`mailto:${content.stayConnected.emailHref}`}
              className="magnetto-title text-2xl md:text-3xl text-white hover:text-primary transition-colors whitespace-pre-line"
            >
              {content.stayConnected.email}
            </a>
            <p className="text-zinc-500 mt-6 max-w-xs">
              {content.stayConnected.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <nav className="space-y-4">
              {content.navigation.map((link, index) => (
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
              {content.socialLabel}
            </p>
            <div className="flex items-center gap-4">
              {content.socialLinks.map((social) => {
                const IconComponent = socialIconMap[social.platform];
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                    aria-label={social.platform}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Logo Watermark */}
        <div className="flex justify-center mb-12">
          <h2 className="magnetto-title text-[15vw] md:text-[10vw] text-zinc-900 select-none pointer-events-none">
            {content.watermark}
          </h2>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            ©{new Date().getFullYear()} {content.copyright}
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <Link to={content.legalLinks.terms.href} className="hover:text-zinc-400 transition-colors">
              {content.legalLinks.terms.label}
            </Link>
            <Link to={content.legalLinks.privacy.href} className="hover:text-zinc-400 transition-colors">
              {content.legalLinks.privacy.label}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
