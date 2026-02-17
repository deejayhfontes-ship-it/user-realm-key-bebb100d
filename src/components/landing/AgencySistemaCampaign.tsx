import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";

export function AgencySistemaCampaign() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      
      {/* Background otimizado - gradiente ao invés de blur */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        
        {/* HEADLINE PRINCIPAL */}
        <ScrollReveal direction="up">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-block mb-6">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">
                CRIAÇÃO CENTRAL • DESDOBRAMENTOS INFINITOS
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
              A agência cria o conceito.
              <br />
              <span className="text-primary">Você cria no seu tempo.</span>
            </h2>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
              Chega de depender de prazos para criar.
            </p>
          </div>
        </ScrollReveal>

        {/* NOVA FORMA DE TRABALHAR - Cards lado a lado */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-20 md:mb-24">
          
          {/* Card 1: Como sempre foi */}
          <ScrollReveal direction="left" delay={100}>
            <div className="relative group h-full">
              <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 md:p-8 lg:p-10 hover:border-white/20 transition-all h-full min-h-[320px] flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Como sempre foi</h3>
                    <p className="text-sm text-zinc-500">O modelo tradicional</p>
                  </div>
                </div>
                
                <div className="space-y-3 flex-1">
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

                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-zinc-500 text-sm">
                    Cada adaptação é um novo processo
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Agora - COM EFEITO PULSE FORTE */}
          <ScrollReveal direction="right" delay={200}>
            <div className="relative group h-full">
              {/* Glow pulsante forte com blur */}
              <div 
                className="absolute -inset-4 rounded-3xl blur-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.6) 0%, hsl(var(--primary) / 0.3) 40%, transparent 70%)',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              {/* Segunda camada mais intensa */}
              <div 
                className="absolute -inset-2 rounded-2xl blur-lg"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.2) 50%, transparent 80%)',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '0.3s'
                }}
              />
              
              <div className="relative bg-zinc-900/90 border border-primary/40 rounded-2xl p-6 md:p-8 lg:p-10 hover:border-primary/60 transition-all h-full min-h-[320px] flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Agora</h3>
                    <p className="text-sm text-primary">Novo jeito de trabalhar</p>
                  </div>
                </div>
                
                <div className="space-y-3 flex-1">
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

                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-sm text-primary font-medium">
                    Cada adaptação é só um clique
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* PILARES DA CAMPANHA - Cards iguais */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-24">
          {[
            {
              num: '01',
              title: 'Criação com assinatura',
              subtitle: 'Nada genérico. Nada improvisado.',
              text: 'A primeira arte nasce com direção criativa, tipografia correta e identidade consistente.'
            },
            {
              num: '02',
              title: 'Desdobramentos sem fricção',
              subtitle: 'Stories, feed, banner, anúncio, variação de texto…',
              text: 'O conceito já está aprovado. Você só adapta.'
            },
            {
              num: '03',
              title: 'Controle no tempo do cliente',
              subtitle: 'Hoje, amanhã ou daqui a 2 meses.',
              text: 'Sua comunicação não depende mais da agenda de ninguém.'
            }
          ].map((pilar, idx) => (
            <ScrollReveal key={pilar.num} direction="up" delay={idx * 100}>
              <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 h-full min-h-[280px] flex flex-col">
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-3 text-primary">
                    {pilar.num}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3">
                    {pilar.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    {pilar.subtitle}
                  </p>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mt-auto">
                  {pilar.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* FRASE-CHAVE (OURO) */}
        <ScrollReveal direction="fade" duration={800}>
          <div className="text-center mb-16 md:mb-20 py-8 md:py-12 border-y border-white/10">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              A criação nasce profissional.
              <br />
              <span className="text-primary">As variações nascem livres.</span>
            </p>
          </div>
        </ScrollReveal>

        {/* EXEMPLO PRÁTICO SIMPLIFICADO */}
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto mb-16 md:mb-20">
            <div className="bg-zinc-900/90 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12">
              
              <div className="text-center mb-8 md:mb-10">
                <p className="text-sm text-zinc-500 mb-3">EXEMPLO PRÁTICO</p>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Um projeto, infinitas versões
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                
                {/* Antes */}
                <div className="text-center p-4 md:p-6 bg-white/[0.02] rounded-xl min-h-[200px] flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-800/50 mb-4 md:mb-6">
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 md:mb-3">Antes</h4>
                  <p className="text-zinc-400 text-sm mb-3 md:mb-4">
                    1 arte criada = 1 formato
                  </p>
                  <div className="space-y-1.5 md:space-y-2 text-sm text-zinc-500">
                    <p>Nova versão? Novo pedido.</p>
                    <p>Prazo: 2-5 dias</p>
                  </div>
                </div>

                {/* Agora */}
                <div className="text-center p-4 md:p-6 bg-primary/5 rounded-xl border border-primary/20 min-h-[200px] flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-4 md:mb-6 bg-primary/10">
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 md:mb-3">Agora</h4>
                  <p className="text-sm mb-3 md:mb-4 text-primary">
                    1 arte criada = infinitos formatos
                  </p>
                  <div className="space-y-1.5 md:space-y-2 text-sm text-zinc-300">
                    <p>Stories, posts, banners...</p>
                    <p>Prazo: instantâneo</p>
                  </div>
                </div>
              </div>

              {/* CTA da seção */}
              <div className="text-center mt-8 md:mt-12 pt-6 md:pt-10 border-t border-white/10">
                <p className="text-lg md:text-xl lg:text-2xl text-white font-medium mb-2">
                  A base é profissional.
                </p>
                <p className="text-base md:text-lg text-zinc-400">
                  O resto é <span className="font-semibold text-primary">com você</span>.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* COMO FUNCIONA NA PRÁTICA */}
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 mb-16 md:mb-20">
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4">
                A arte principal vira um sistema
              </h3>
              <p className="text-zinc-400 text-base md:text-lg">
                Depois que a base criativa está aprovada:
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
              {[
                'A base visual já está pronta',
                'A identidade já está definida',
                'O padrão já foi aprovado'
              ].map((text, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm md:text-base">{text}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:mt-12">
              <p className="text-xl md:text-2xl font-bold text-primary">
                → Agora é só desdobrar.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ESPAÇO PARA VÍDEO PUBLICITÁRIO */}
        <ScrollReveal direction="fade">
          <div className="max-w-4xl mx-auto mb-16 md:mb-20">
            <div className="bg-zinc-900/90 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12">
              <div className="aspect-video bg-zinc-800/50 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 text-sm">Vídeo em breve</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTAs */}
        <ScrollReveal direction="up">
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-8 md:mb-12">
              <Link
                to="/platform"
                className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg transition-all hover:scale-105 inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground"
              >
                Criar minha base criativa
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link
                to="/platform#como-funciona"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg border-2 border-white/20 text-white hover:bg-white/5 transition-all text-center"
              >
                Ver como os desdobramentos funcionam
              </Link>
            </div>

            <p className="text-sm text-zinc-500 mb-12 md:mb-16">
              Solicite um teste
            </p>

            {/* FRASE FINAL */}
            <div className="max-w-4xl mx-auto pt-12 md:pt-16 border-t border-white/10">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                A agência define o padrão.
                <br />
                <span className="text-primary">Você define o ritmo.</span>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
