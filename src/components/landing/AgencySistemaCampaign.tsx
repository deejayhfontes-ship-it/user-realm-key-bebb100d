import { Link } from "react-router-dom";

export function AgencySistemaCampaign() {
  return (
    <section className="py-32 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      
      {/* Background minimalista */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-primary rounded-full blur-[250px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* HEADLINE PRINCIPAL */}
        <div className="text-center mb-24">
          <div className="inline-block mb-8">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">
              CRIAÇÃO CENTRAL • DESDOBRAMENTOS INFINITOS
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            A agência cria o conceito.
            <br />
            <span className="text-primary">Você controla os desdobramentos.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto leading-relaxed font-light">
            Tipografia, cores, linguagem e direção criativa definidas por profissionais.
            <br className="hidden md:block" />
            Depois disso, você gera variações no formato e no tempo que quiser.
          </p>
        </div>

        {/* A VIRADA DE CHAVE */}
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-3xl p-12 mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              O gargalo que sua agência nunca resolveu
            </h3>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Agências sempre trabalharam com <span className="text-white font-semibold">arte-matriz</span>.
              <br />
              Tudo depois são <span className="text-white font-semibold">variações</span>.
              <br />
              O problema: <span className="text-red-400 font-semibold">cada variação virava pedido, prazo e custo</span>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="text-4xl mb-4">📐</div>
                <p className="text-zinc-300 font-medium">Existe uma arte-matriz</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="text-4xl mb-4">🔄</div>
                <p className="text-zinc-300 font-medium">Tudo depois são variações</p>
              </div>
              <div className="bg-red-500/10 rounded-2xl p-8 border border-red-500/20">
                <div className="text-4xl mb-4">💸</div>
                <p className="text-red-400 font-medium">Cada variação = novo pedido</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-2xl font-bold text-primary">
                → Sua plataforma quebra esse gargalo.
              </p>
            </div>
          </div>
        </div>

        {/* PILARES DA CAMPANHA */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          
          {/* Pilar 1 */}
          <div className="group">
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-10 hover:border-primary/30 transition-all duration-500">
              <div className="mb-8">
                <div className="text-sm font-semibold mb-3 text-primary">
                  01
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Criação com assinatura
                </h3>
                <p className="text-sm text-zinc-500 font-medium mb-6">
                  Nada genérico. Nada improvisado.
                </p>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                A primeira arte nasce com direção criativa, tipografia correta e identidade consistente.
              </p>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="group">
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-10 hover:border-primary/30 transition-all duration-500">
              <div className="mb-8">
                <div className="text-sm font-semibold mb-3 text-primary">
                  02
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Desdobramentos sem fricção
                </h3>
                <p className="text-sm text-zinc-500 font-medium mb-6">
                  Stories, feed, banner, anúncio, variação de texto…
                </p>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                O conceito já está aprovado. Você só adapta.
              </p>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="group">
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-10 hover:border-primary/30 transition-all duration-500">
              <div className="mb-8">
                <div className="text-sm font-semibold mb-3 text-primary">
                  03
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Controle no tempo do cliente
                </h3>
                <p className="text-sm text-zinc-500 font-medium mb-6">
                  Hoje, amanhã ou daqui a 2 meses.
                </p>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Sua comunicação não depende mais da agenda de ninguém.
              </p>
            </div>
          </div>
        </div>

        {/* FRASE-CHAVE (OURO) */}
        <div className="text-center mb-24 py-12 border-y border-white/10">
          <p className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            A criação nasce profissional.
            <br />
            <span className="text-primary">As variações nascem livres.</span>
          </p>
        </div>

        {/* EXEMPLO CONCRETO (VENDE MUITO) */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden mb-24">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            {/* ANTES */}
            <div className="p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <span className="text-red-400 text-2xl font-bold">✕</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Modelo antigo</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">Agência cria post de lançamento</p>
                  <p className="text-zinc-400 text-sm mb-4">Cliente pede:</p>
                  <div className="space-y-2">
                    {[
                      'Versão stories',
                      'Versão anúncio',
                      'Versão WhatsApp',
                      'Versão com outro texto'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <div className="inline-flex items-center gap-3 text-red-400 font-bold">
                    <span>→</span>
                    <span>5 pedidos, 5 prazos, 5 custos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AGORA */}
            <div className="p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <span className="text-primary text-2xl font-bold">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Novo modelo</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-white font-semibold mb-3">Agência cria 1 arte central</p>
                    <p className="text-zinc-400 text-sm mb-4">Cliente gera:</p>
                    <div className="space-y-2">
                      {[
                        '10 stories',
                        '3 variações de texto',
                        '5 formatos',
                        'Quando quiser'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-zinc-300 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <div className="inline-flex items-center gap-3 font-bold text-primary">
                      <span>→</span>
                      <span>Zero espera. Zero retrabalho.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMO FUNCIONA NA PRÁTICA */}
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm border border-white/10 rounded-3xl p-12 mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              A arte principal vira um sistema
            </h3>
            <p className="text-zinc-400 text-lg">
              Depois que a base criativa está aprovada:
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-white font-medium">A base visual já está pronta</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-white font-medium">A identidade já está definida</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-white font-medium">O padrão já foi aprovado</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-primary">
              → Agora é só desdobrar.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 mb-12">
            <Link
              to="/platform"
              className="group px-10 py-5 rounded-xl font-semibold text-lg transition-all hover:scale-105 inline-flex items-center gap-3 bg-primary text-primary-foreground"
            >
              Criar minha base criativa
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link
              to="/platform#como-funciona"
              className="px-10 py-5 rounded-xl font-semibold text-lg border-2 border-white/20 text-white hover:bg-white/5 transition-all"
            >
              Ver como os desdobramentos funcionam
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mb-16">
            Teste 7 dias grátis • Sem cartão de crédito • Cancele quando quiser
          </p>

          {/* FRASE FINAL */}
          <div className="max-w-4xl mx-auto pt-16 border-t border-white/10">
            <p className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              A agência define o padrão.
              <br />
              <span className="text-primary">Você define o ritmo.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
