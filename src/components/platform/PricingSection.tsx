import { PricingCard } from "./PricingCard";

// EDITAR: Substitua os valores de preço pelos reais
const plans = [
  {
    name: "Starter",
    price: "R$ 97", // EDITAR
    features: [
      "50 créditos/mês", // EDITAR
      "2 geradores ativos",
      "Templates básicos",
      "Suporte por email",
      "Exportação em PNG"
    ],
    ctaText: "Começar Agora"
  },
  {
    name: "Pro",
    price: "R$ 197", // EDITAR
    features: [
      "200 créditos/mês", // EDITAR
      "Todos os geradores",
      "Templates premium",
      "Suporte prioritário",
      "Exportação PNG + PDF",
      "Histórico completo"
    ],
    highlighted: true,
    badge: "Mais Popular",
    ctaText: "Escolher Pro"
  },
  {
    name: "Enterprise",
    price: "Sob consulta", // EDITAR ou "R$ 497"
    period: "",
    features: [
      "Créditos ilimitados",
      "Geradores customizados",
      "IA treinada com sua marca",
      "API de integração",
      "Suporte dedicado 24/7",
      "Onboarding exclusivo"
    ],
    ctaText: "Falar com Vendas"
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative" id="pricing">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-lime-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            Planos e Preços
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Comece pequeno e escale conforme sua necessidade. Sem taxas ocultas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>

        {/* Trust text */}
        <p className="text-center text-zinc-500 text-sm mt-12">
          ✓ Cancele quando quiser &nbsp;&nbsp; ✓ Sem fidelidade &nbsp;&nbsp; ✓ Suporte incluso
        </p>
      </div>
    </section>
  );
}
