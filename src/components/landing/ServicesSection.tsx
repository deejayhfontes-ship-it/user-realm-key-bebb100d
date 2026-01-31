import { useServices } from "@/hooks/useServices";
import { icons } from "lucide-react";
import { landingContent } from "@/data/landingContent";

export function ServicesSection() {
  const { services } = useServices();
  const content = landingContent.services;

  const displayServices = services.length > 0 
    ? services.filter(s => s.is_active).slice(0, 4) 
    : content.placeholderServices;

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
              {content.sectionTitle}
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
              {content.description}
            </p>
          </div>

          {/* Right Column - Milestones */}
          <div className="flex flex-col justify-center">
            {/* Title with label */}
            <div className="text-center lg:text-left mb-12">
              <p 
                className="text-xs uppercase tracking-widest mb-3" 
                style={{ 
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '3px'
                }}
              >
                {content.milestonesLabel}
              </p>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {content.milestonesTitle}
              </h3>
            </div>

            <div className="space-y-12">
              <div className="text-center lg:text-left">
                <p className="text-6xl md:text-7xl lg:text-8xl font-bold mb-2">
                  <span className="text-white">{content.milestones.years.value}</span>
                  <span className="text-primary">{content.milestones.years.suffix}</span>
                </p>
                <p className="text-zinc-400 text-sm uppercase tracking-wider">
                  {content.milestones.years.label}
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="text-6xl md:text-7xl lg:text-8xl font-bold mb-2">
                  <span className="text-white">{content.milestones.projects.value}</span>
                  <span className="text-primary">{content.milestones.projects.suffix}</span>
                </p>
                <p className="text-zinc-400 text-sm uppercase tracking-wider">
                  {content.milestones.projects.label}
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="text-6xl md:text-7xl lg:text-8xl font-bold mb-2">
                  <span className="text-white">{content.milestones.clients.value}</span>
                  <span className="text-primary">{content.milestones.clients.suffix}</span>
                </p>
                <p className="text-zinc-400 text-sm uppercase tracking-wider">
                  {content.milestones.clients.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
