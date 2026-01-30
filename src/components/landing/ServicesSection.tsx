import { useServices } from "@/hooks/useServices";
import { icons } from "lucide-react";

export function ServicesSection() {
  const { services } = useServices();

  // Placeholder services if none exist
  const placeholderServices = [
    {
      id: "1",
      title: "Identidade Visual",
      short_description: "Criamos identidades visuais memoráveis que comunicam a essência da sua marca.",
      icon: "Palette",
    },
    {
      id: "2",
      title: "Web Design",
      short_description: "Sites e landing pages que convertem visitantes em clientes.",
      icon: "Monitor",
    },
    {
      id: "3",
      title: "Social Media",
      short_description: "Conteúdo estratégico para suas redes sociais com identidade consistente.",
      icon: "Instagram",
    },
    {
      id: "4",
      title: "Motion Graphics",
      short_description: "Animações e vídeos que dão vida às suas ideias.",
      icon: "Play",
    },
  ];

  const displayServices = services.length > 0 
    ? services.filter(s => s.is_active).slice(0, 4) 
    : placeholderServices;

  const getIcon = (iconName: string) => {
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
  };

  return (
    <section id="services" className="section-padding bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Title & Services */}
          <div>
            <h2 className="magnetto-title text-5xl md:text-7xl text-white mb-12">
              SERVICES
            </h2>

            {/* Services Cards */}
            <div className="space-y-4">
              {displayServices.map((service, index) => (
                <div
                  key={service.id}
                  className="group p-6 rounded-[24px] bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700"
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <span className="font-pixel text-zinc-600 text-sm">
                      0{index + 1}
                    </span>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {service.short_description}
                      </p>
                    </div>

                    {/* Icon */}
                    <div className="text-zinc-600 group-hover:text-primary transition-colors">
                      {getIcon(service.icon || "Palette")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-zinc-400 mt-8 text-center lg:text-left">
              Criamos experiências digitais que elevam marcas e engajam audiências. 
              Nossos serviços combinam criatividade com estratégia, garantindo resultados visuais impactantes.
            </p>
          </div>

          {/* Right Column - Milestones */}
          <div className="flex flex-col justify-center">
            <h3 className="magnetto-title text-4xl md:text-5xl text-white mb-12 text-center lg:text-left">
              MILESTONES
            </h3>

            <div className="space-y-12">
              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  7<span className="text-primary">+</span>
                </p>
                <p className="text-zinc-400 font-pixel text-sm tracking-wider">
                  Anos de Experiência
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  50<span className="text-primary">+</span>
                </p>
                <p className="text-zinc-400 font-pixel text-sm tracking-wider">
                  Projetos Entregues
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  30<span className="text-primary">+</span>
                </p>
                <p className="text-zinc-400 font-pixel text-sm tracking-wider">
                  Clientes Satisfeitos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
