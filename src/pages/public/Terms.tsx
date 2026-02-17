import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/platform" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <span className="text-white font-semibold">Fontes Graphics</span>
              <span className="text-lime-400 font-semibold"> Platform</span>
            </div>
          </Link>
          <Link to="/platform">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-4 md:mb-6">
              <FileText className="w-4 h-4 text-lime-400" />
              <span className="text-lime-400 text-sm font-medium">Documento Legal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Termos de Uso
            </h1>
            <p className="text-zinc-400 text-base md:text-lg">Fontes Graphics Platform</p>
            <p className="text-zinc-500 text-sm mt-2">Última atualização: 29 de Janeiro de 2026</p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Ao acessar e usar a Fontes Graphics Platform, você aceita estes termos em sua totalidade. 
                Se não concordar com qualquer parte destes termos, você não deve utilizar nosso serviço.
              </p>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">2. Descrição do Serviço</h2>
              <p className="text-zinc-300 leading-relaxed">
                A Fontes Graphics Platform é uma plataforma SaaS (Software as a Service) que oferece 
                ferramentas de inteligência artificial para geração de artes digitais, incluindo stories, 
                posts e carrosséis para redes sociais, mediante compra de créditos.
              </p>
            </section>

            {/* Section 3 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">3. Cadastro e Conta</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Você deve fornecer informações verdadeiras e atualizadas (seja Pessoa Física ou Jurídica)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Você é responsável pela segurança da sua senha e conta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Apenas uma conta por empresa ou pessoa é permitida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Podemos suspender ou encerrar contas fraudulentas ou que violem estes termos</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">4. Sistema de Créditos</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Créditos são pré-pagos e não reembolsáveis (exceto em caso de defeito técnico comprovado)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Validade: 30 dias ou conforme o plano contratado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Créditos não são acumulativos entre períodos (salvo planos específicos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>1 crédito = 1 geração de imagem</span>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">5. Uso da Tecnologia de IA</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>As imagens são geradas por inteligência artificial (OpenAI, Stable Diffusion, entre outros)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Não garantimos resultados específicos – os resultados variam conforme o prompt fornecido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>O cliente tem direito de uso comercial das imagens geradas com seus créditos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>É proibido usar para gerar conteúdo ilegal, ofensivo, discriminatório ou que viole direitos autorais de terceiros</span>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">6. Propriedade Intelectual</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Você mantém os direitos sobre as artes geradas usando seus créditos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Nós mantemos os direitos sobre a plataforma, código-fonte e tecnologia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Templates disponibilizados são de uso licenciado exclusivamente na plataforma</span>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                A plataforma é fornecida "como está" (as is). Não nos responsabilizamos por:
              </p>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Resultados específicos de negócio (engajamento, vendas, conversões)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Indisponibilidade temporária do servidor ou manutenções programadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Perda de dados por falha do usuário em fazer backup</span>
                </li>
              </ul>
              <p className="text-zinc-400 text-sm mt-4">
                A responsabilidade máxima é limitada ao valor pago nos últimos 30 dias.
              </p>
            </section>

            {/* Section 8 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">8. Cancelamento e Reembolso</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Você pode cancelar sua conta a qualquer momento (perdendo créditos não utilizados).
              </p>
              <p className="text-zinc-300 leading-relaxed mb-2">
                <strong className="text-white">Reembolso é concedido apenas em caso de:</strong>
              </p>
              <ul className="text-zinc-300 space-y-2 leading-relaxed mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Defeito técnico comprovado da plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Cobrança indevida (erro nosso)</span>
                </li>
              </ul>
              <p className="text-zinc-400 text-sm">
                Não reembolsamos: mudança de ideia, não saber usar a plataforma, resultados insatisfatórios.
              </p>
            </section>

            {/* Section 9 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">9. Modificações</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos alterar estes termos a qualquer momento. As alterações entrarão em vigor 
                após publicação nesta página. Continuar usando a plataforma após alterações 
                significa que você aceita os novos termos.
              </p>
            </section>

            {/* Section 10 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">10. Contato</h2>
              <p className="text-zinc-300 leading-relaxed">
                Dúvidas sobre estes termos? Entre em contato conosco:
              </p>
              <a 
                href="mailto:fontescampanhas@gmail.com" 
                className="text-lime-400 hover:underline mt-2 inline-block"
              >
                fontescampanhas@gmail.com
              </a>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link to="/platform">
              <Button className="bg-lime-400 hover:bg-lime-500 text-black font-semibold rounded-xl px-8 py-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} Fontes Graphics. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
