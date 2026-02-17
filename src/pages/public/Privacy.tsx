import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
              <Shield className="w-4 h-4 text-lime-400" />
              <span className="text-lime-400 text-sm font-medium">LGPD Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Política de Privacidade
            </h1>
            <p className="text-zinc-400 text-base md:text-lg">Como tratamos seus dados</p>
            <p className="text-zinc-500 text-sm mt-2">Última atualização: 29 de Janeiro de 2026</p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">1. Quais Dados Coletamos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para fornecer nossos serviços, coletamos os seguintes dados:
              </p>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Nome ou Razão Social (empresa ou pessoa física)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Email corporativo ou pessoal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>CPF ou CNPJ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Telefone/WhatsApp (opcional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Endereço IP e dados de navegação (logs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Prompts e imagens geradas (para histórico e suporte)</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">2. Como Usamos os Dados</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Criar e gerenciar sua conta na plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Processar pagamentos (quando gateway de pagamento estiver ativo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Enviar comunicações importantes sobre o serviço</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Melhorar a plataforma através de análise de uso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Fornecer suporte técnico quando necessário</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">3. Compartilhamento de Dados</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                <strong className="text-white">Não vendemos seus dados.</strong> Compartilhamos apenas com:
              </p>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Provedores de IA</strong> (OpenAI, etc.) – para gerar as imagens solicitadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Gateway de pagamento</strong> (futuro) – para processar pagamentos de forma segura</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Serviços essenciais</strong> (Supabase, hospedagem) – para manter a plataforma funcionando</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">4. Segurança</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Dados criptografados em trânsito (HTTPS) e em repouso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Acesso restrito apenas a pessoal autorizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Backups regulares para proteção contra perda de dados</span>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">5. Seus Direitos (LGPD)</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Conforme a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
              </p>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Acessar</strong> seus dados pessoais armazenados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Corrigir</strong> informações incorretas ou desatualizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Solicitar exclusão</strong> da conta e todos os dados associados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span><strong className="text-white">Revogar consentimento</strong> (encerrando sua conta)</span>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">6. Retenção de Dados</h2>
              <ul className="text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Mantemos seus dados enquanto a conta estiver ativa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Após cancelamento: mantemos por 1 ano para fins fiscais, depois excluímos permanentemente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  <span>Imagens geradas: mantidas enquanto houver créditos ativos ou conta ativa</span>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">7. Cookies</h2>
              <p className="text-zinc-300 leading-relaxed">
                Usamos cookies essenciais (para login e funcionamento) e cookies de analytics (opcional, 
                para entender como a plataforma é usada). Ao usar a plataforma, você aceita os cookies 
                essenciais. Cookies de analytics podem ser desativados nas configurações do seu navegador.
              </p>
            </section>

            {/* Section 8 */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8">
              <h2 className="text-xl font-semibold text-lime-400 mb-4">8. Contato DPO (Encarregado de Dados)</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato 
                com nosso Encarregado de Proteção de Dados:
              </p>
              <a 
                href="mailto:fontescampanhas@gmail.com" 
                className="text-lime-400 hover:underline inline-block"
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
