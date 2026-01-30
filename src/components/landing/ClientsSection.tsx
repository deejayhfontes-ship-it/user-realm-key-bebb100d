import { landingContent } from "@/data/landingContent";

const placeholderClients = [
  { name: "Client 1", logo: null },
  { name: "Client 2", logo: null },
  { name: "Client 3", logo: null },
  { name: "Client 4", logo: null },
  { name: "Client 5", logo: null },
];

export function ClientsSection() {
  const content = landingContent.clients;

  return (
    <section className="section-padding bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
          <h2 className="magnetto-title text-5xl md:text-7xl lg:text-8xl text-white">
            {content.title}
          </h2>
          <p className="text-zinc-400 max-w-md text-lg lg:text-right">
            Colaboramos com marcas visionárias, startups inovadoras e líderes de 
            mercado que ousam desafiar o convencional.
          </p>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {placeholderClients.map((client, index) => (
            <div
              key={index}
              className="client-card aspect-square flex items-center justify-center group"
            >
              {client.logo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  className="max-w-[60%] max-h-[60%] object-contain opacity-40 group-hover:opacity-80 transition-opacity filter grayscale group-hover:grayscale-0"
                />
              ) : (
                <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
