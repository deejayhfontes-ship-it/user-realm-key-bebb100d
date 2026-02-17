import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que são créditos?",
    answer: "Créditos são a moeda da plataforma. Cada arte gerada consome 1 crédito. Se você tem um plano de 100 créditos/mês, pode gerar até 100 artes no período."
  },
  {
    question: "Posso trocar de plano?",
    answer: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. Se fizer upgrade, a diferença será calculada proporcionalmente. Se fizer downgrade, a mudança entra no próximo ciclo."
  },
  {
    question: "Como funciona a renovação?",
    answer: "Os créditos são renovados automaticamente todo mês na data da sua assinatura. Créditos não utilizados não acumulam para o mês seguinte."
  },
  {
    question: "Suporte técnico está incluído?",
    answer: "Sim! Todos os planos incluem suporte técnico. Planos Pro têm suporte prioritário e Enterprise têm suporte dedicado 24/7."
  },
  {
    question: "Posso testar antes de contratar?",
    answer: "Sim! Oferecemos período de teste gratuito com créditos limitados para você conhecer a plataforma antes de decidir."
  },
  {
    question: "As artes geradas são exclusivas?",
    answer: "Cada arte é gerada de forma única com base no seu prompt. Você tem total direito de uso comercial sobre tudo que criar na plataforma."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-lime-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Perguntas e Respostas
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/5 border border-white/10 rounded-xl px-6 data-[state=open]:border-lime-400/30"
              >
                <AccordionTrigger className="text-white hover:text-lime-400 hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
