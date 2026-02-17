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
    <section id="services" className="py-16 md:py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Title & Services */}
          <div>
            <h2 className="magnetto-title text-4xl md:text-5xl lg:text-6xl text-white mb-8 md:mb-12">
              {content.sectionTitle}
            </h2>

            {/* Services Cards */}
            <div className="space-y-4">
              {displayServices.map((service, index) => (
                <div
                  key={service.id}
                  className="group p-5 md:p-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700 min-h-[100px]"
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <span className="font-pixel text-zinc-600 text-sm">
                      0{index + 1}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {service.short_description}
                      </p>
                    </div>

                    {/* Icon */}
                    <div className="text-zinc-600 group-hover:text-primary transition-colors flex-shrink-0">
                      {getIcon(service.icon || "Palette")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-zinc-400 mt-6 md:mt-8 text-center lg:text-left text-sm md:text-base">
              {content.description}
            </p>
          </div>

          {/* Right Column - Milestones */}
          <div className="flex flex-col justify-center">
            <h3 className="magnetto-title text-3xl md:text-4xl lg:text-5xl text-white mb-8 md:mb-12 text-center lg:text-left">
              {content.milestonesTitle}
            </h3>

            <div className="space-y-8 md:space-y-12">
              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  {content.milestones.years.value}<span className="text-primary">{content.milestones.years.suffix}</span>
                </p>
                <p className="text-zinc-400 font-pixel text-xs md:text-sm tracking-wider">
                  {content.milestones.years.label}
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  {content.milestones.projects.value}<span className="text-primary">{content.milestones.projects.suffix}</span>
                </p>
                <p className="text-zinc-400 font-pixel text-xs md:text-sm tracking-wider">
                  {content.milestones.projects.label}
                </p>
              </div>

              <div className="border-t border-zinc-800" />

              <div className="text-center lg:text-left">
                <p className="stat-number text-white">
                  {content.milestones.clients.value}<span className="text-primary">{content.milestones.clients.suffix}</span>
                </p>
                <p className="text-zinc-400 font-pixel text-xs md:text-sm tracking-wider">
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
