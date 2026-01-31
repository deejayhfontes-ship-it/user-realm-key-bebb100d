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
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            A agência cria o conceito.
            <br />
            <span className="text-primary">Você cria no seu tempo.</span>
          </h2>
          
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Chega de depender de prazos para criar.
          </p>
        </div>

        {/* NOVA FORMA DE TRABALHAR - Cards lado a lado */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          
          {/* Card 1: Como sempre foi */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            
            <div className="relative bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-10 hover:border-white/20 transition-all h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Como sempre foi</h3>
                  <p className="text-sm text-zinc-500">O modelo tradicional</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 flex-shrink-0" />
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Agência cria a arte principal
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 flex-shrink-0" />
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Cliente precisa de uma variação
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 flex-shrink-0" />
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Novo briefing, novo prazo, nova espera
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-zinc-500 text-sm italic">
                  Cada adaptação = novo processo
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Agora */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            
            <div className="relative bg-zinc-900/40 backdrop-blur-sm border border-primary/20 rounded-2xl p-10 hover:border-primary/40 transition-all h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Agora</h3>
                  <p className="text-sm text-primary">Novo jeito de trabalhar</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 bg-primary" />
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    Agência cria a base criativa
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 bg-primary" />
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    Você gera variações quando precisar
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 bg-primary" />
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    Sem espera, sem novo pedido, sem custo extra
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm font-medium text-primary">
                  Cada adaptação = 1 clique
                </p>
              </div>
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

        {/* EXEMPLO PRÁTICO SIMPLIFICADO */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            
            <div className="text-center mb-10">
              <p className="text-sm text-zinc-500 mb-3">EXEMPLO PRÁTICO</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Um projeto, infinitas versões
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Antes */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 mb-6">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Antes</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  1 arte criada = 1 formato
                </p>
                <div className="space-y-2 text-sm text-zinc-500">
                  <p>Nova versão? Novo pedido.</p>
                  <p>Prazo: 2-5 dias</p>
                </div>
              </div>

              {/* Agora */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-primary/10">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Agora</h4>
                <p className="text-sm mb-4 text-primary">
                  1 arte criada = infinitos formatos
                </p>
                <div className="space-y-2 text-sm text-zinc-300">
                  <p>Stories, posts, banners...</p>
                  <p>Prazo: instantâneo</p>
                </div>
              </div>
            </div>

            {/* CTA da seção */}
            <div className="text-center mt-12 pt-10 border-t border-white/10">
              <p className="text-xl md:text-2xl text-white font-medium mb-2">
                A base é profissional.
              </p>
              <p className="text-lg text-zinc-400">
                O resto é <span className="font-semibold text-primary">com você</span>.
              </p>
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
