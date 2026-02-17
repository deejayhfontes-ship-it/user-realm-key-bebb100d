import { usePublicPartnerLogos } from "@/hooks/usePartnerLogos";
import { landingContent } from "@/data/landingContent";

export function ClientsSection() {
  const { logos, showSection, loading } = usePublicPartnerLogos();
  const content = landingContent.clients;

  // Don't render if section is disabled or not enough logos
  if (loading || !showSection || logos.length < 4) {
    return null;
  }

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="relative py-12 md:py-16 lg:py-20 bg-[#0a0a0a] overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-36 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-36 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-10 md:mb-14">
        {/* Title with decorative line */}
        <div className="text-center">
          <h2 className="text-xs uppercase tracking-[3px] text-white/40 font-medium transition-colors duration-300 hover:text-white/60">
            {content.sectionLabel}
          </h2>
          <div className="w-16 h-px bg-primary/30 mx-auto mt-4" />
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-[1400px] mx-auto">
        {/* Infinite Scrolling Carousel */}
        <div className="carousel-track flex gap-16 md:gap-24 animate-scroll-logos hover:[animation-play-state:paused]">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 w-28 md:w-40 h-16 md:h-20 flex items-center justify-center group"
            >
              {logo.site_url ? (
                <a
                  href={logo.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                  title={logo.nome}
                >
                  <img
                    src={logo.logo_url}
                    alt={logo.nome}
                    className="w-full h-full object-contain filter grayscale brightness-50 opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 group-hover:scale-105 cursor-pointer"
                  />
                </a>
              ) : (
                <img
                  src={logo.logo_url}
                  alt={logo.nome}
                  className="w-full h-full object-contain filter grayscale brightness-50 opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll-logos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-logos {
          animation: scroll-logos 35s linear infinite;
        }
      `}</style>
    </section>
  );
}
