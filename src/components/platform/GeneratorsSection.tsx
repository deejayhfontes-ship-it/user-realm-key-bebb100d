import { Smartphone, Image, Layers } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const generators = [
  {
    icon: Smartphone,
    title: "Gerador de Stories",
    description: "Stories verticais para Instagram e Facebook em 10 segundos. Formatos 9:16 otimizados.",
    color: "text-purple-400"
  },
  {
    icon: Image,
    title: "Gerador de Posts",
    description: "Posts para feed com templates profissionais. Formatos quadrados e retangulares.",
    color: "text-blue-400"
  },
  {
    icon: Layers,
    title: "Carrossel Interativo",
    description: "Carrosséis multi-slide automáticos para engajamento máximo no Instagram.",
    color: "text-lime-400"
  }
];

export function GeneratorsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-black relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-lime-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            Ferramentas Poderosas
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Geradores para todas as necessidades
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Escolha o tipo de arte que precisa e deixe a IA fazer a mágica.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {generators.map((generator, index) => (
            <FeatureCard
              key={index}
              icon={generator.icon}
              title={generator.title}
              description={generator.description}
              iconColor={generator.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
