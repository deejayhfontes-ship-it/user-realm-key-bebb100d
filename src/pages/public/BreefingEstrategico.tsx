import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SCALES = [
  ["Formal", "Descontraída"],
  ["Tradicional", "Inovadora"],
  ["Séria", "Bem-humorada"],
  ["Institucional", "Próxima do povo"],
  ["Discreta", "Ousada"],
  ["Técnica", "Emocional"]
];

const WORDS = [
  "Confiança", "Juventude", "Energia", "Modernidade", "Transparência", "Força",
  "Acolhimento", "Coragem", "Trabalho", "Futuro", "Simplicidade", "Liderança",
  "Esperança", "Movimento", "Compromisso", "Orgulho local", "Tecnologia", "Proximidade"
];

const ESTILOS = [
  "Minimalista e clean", "Geométrico e moderno", "Tipográfico e forte",
  "Orgânico e humano", "Tech / digital", "Clássico atualizado"
];

const APPS = [
  "Redes sociais", "Vídeos / Reels", "Materiais impressos", "Eventos e palcos",
  "Uniformes / bonés / camisetas", "Placas de obras", "Site / aplicativos",
  "Carro de som / outdoor", "Documentos oficiais", "Adesivos e brindes"
];

const CORES = [
  { cor: "Azul", hex: "#2563EB" },
  { cor: "Verde", hex: "#16A34A" },
  { cor: "Amarelo", hex: "#FACC15" },
  { cor: "Laranja", hex: "#F97316" },
  { cor: "Vermelho", hex: "#DC2626" },
  { cor: "Roxo", hex: "#7C3AED" },
  { cor: "Rosa", hex: "#EC4899" },
  { cor: "Turquesa", hex: "#0D9488" },
  { cor: "Dourado", hex: "#D4A017" },
  { cor: "Preto", hex: "#111827" },
  { cor: "Branco", hex: "#FFFFFF" },
  { cor: "Cinza", hex: "#6B7280" }
];

export default function BreefingEstrategico() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [palavras, setPalavras] = useState<string[]>([]);
  const [estilos, setEstilos] = useState<string[]>([]);
  const [aplicacoes, setAplicacoes] = useState<string[]>([]);
  const [escalas, setEscalas] = useState<Record<string, string>>({});
  const [coresSelecionadas, setCoresSelecionadas] = useState<Array<{cor: string, hex: string, significado: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePalavraToggle = (w: string) => {
    if (palavras.includes(w)) {
      setPalavras(palavras.filter(x => x !== w));
    } else if (palavras.length < 5) {
      setPalavras([...palavras, w]);
    }
  };

  const handleEstiloToggle = (e: string) => {
    if (estilos.includes(e)) {
      setEstilos(estilos.filter(x => x !== e));
    } else if (estilos.length < 2) {
      setEstilos([...estilos, e]);
    }
  };

  const handleAplicacaoToggle = (a: string) => {
    if (aplicacoes.includes(a)) {
      setAplicacoes(aplicacoes.filter(x => x !== a));
    } else {
      setAplicacoes([...aplicacoes, a]);
    }
  };

  const handleCorToggle = (c: {cor: string, hex: string}) => {
    const isSelected = coresSelecionadas.some(x => x.cor === c.cor);
    if (isSelected) {
      setCoresSelecionadas(coresSelecionadas.filter(x => x.cor !== c.cor));
    } else if (coresSelecionadas.length < 3) {
      setCoresSelecionadas([...coresSelecionadas, { ...c, significado: '' }]);
    }
  };

  const handleCorSignificado = (cor: string, value: string) => {
    setCoresSelecionadas(coresSelecionadas.map(c => c.cor === cor ? { ...c, significado: value } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome?.trim() || !formData.cidade?.trim()) {
      setStatus({ type: 'err', msg: 'Preencha ao menos Nome completo e Cidade/Estado.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const respostasCompletas = {
      ...formData,
      palavras,
      estilos,
      aplicacoes,
      cores: coresSelecionadas
    };

    SCALES.forEach((s, i) => {
      respostasCompletas[`escala_${i}`] = escalas[`escala_${i}`];
      respostasCompletas[`escala_${i}_label`] = `${s[0]} × ${s[1]}`;
    });

    try {
      const { error } = await supabase.from('briefings').insert({
        nome: formData.nome,
        cidade: formData.cidade,
        cargo: formData.cargo || null,
        respostas: respostasCompletas
      });

      if (error) throw error;

      setStatus({ type: 'ok', msg: 'Briefing enviado com sucesso! Obrigado — nossa equipe já recebeu suas respostas.' });
      // Reset form (optional, depending on preference, but we just leave it for now or clear states)
      setFormData({});
      setPalavras([]);
      setEstilos([]);
      setAplicacoes([]);
      setEscalas({});
      setCoresSelecionadas([]);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'err', msg: 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.' });
    } finally {
      setLoading(false);
      const msgEl = document.getElementById('form-msg');
      if (msgEl) msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <style>{`
        :root {
          --navy: #0B1C37; --azure: #3B82F6; --lime: #C6F432;
          --off: #FAFAF8; --grey: #73808F; --line: #C7CEDA; --white: #fff;
        }
        .breefing-page { font-family: 'DM Sans', sans-serif; background: var(--off); color: var(--navy); line-height: 1.5; min-height: 100vh; }
        .breefing-page .wrap { max-width: 860px; margin: 0 auto; padding: 0 20px 80px; }
        .breefing-page .hero { background: var(--navy); color: #fff; padding: 72px 20px 64px; }
        .breefing-page .hero-inner { max-width: 860px; margin: 0 auto; }
        .breefing-page .tag { display: inline-block; background: var(--lime); color: var(--navy); font-weight: 700; font-size: .8rem; letter-spacing: .12em; padding: 10px 22px; border-radius: 999px; margin-bottom: 28px; }
        .breefing-page .hero h1 { font-family: 'Archivo Black', sans-serif; font-size: clamp(2.2rem, 6vw, 4rem); line-height: 1; text-transform: uppercase; margin: 0; }
        .breefing-page .hero p.sub { color: var(--azure); font-size: 1.15rem; font-weight: 500; margin: 18px 0 22px; }
        .breefing-page .hero hr { border: none; height: 3px; background: var(--lime); width: 120px; margin-bottom: 22px; }
        .breefing-page .hero p.intro { color: #D8DDE5; max-width: 640px; font-size: 1rem; margin: 0; }
        .breefing-page section.card { background: var(--white); border: 1px solid #E4E8EF; border-radius: 20px; padding: 36px 32px; margin-top: 32px; }
        .breefing-page .sec-head { display: flex; align-items: center; gap: 18px; margin-bottom: 6px; }
        .breefing-page .badge { flex: 0 0 56px; height: 56px; border-radius: 14px; background: var(--navy); color: var(--lime); font-family: 'Archivo Black', sans-serif; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; }
        .breefing-page .sec-head h2 { font-family: 'Archivo Black', sans-serif; font-size: 1.35rem; text-transform: uppercase; letter-spacing: .01em; margin: 0; }
        .breefing-page .sec-sub { color: var(--grey); margin: 6px 0 10px; font-size: .95rem; }
        .breefing-page .sec-rule { height: 3px; background: var(--azure); border: none; margin-bottom: 26px; }
        .breefing-page .q { margin-bottom: 28px; }
        .breefing-page .q label.qt { display: flex; gap: 12px; font-weight: 700; font-size: 1.02rem; margin-bottom: 6px; }
        .breefing-page .qnum { flex: 0 0 auto; background: var(--azure); color: #fff; font-size: .8rem; font-weight: 700; border-radius: 999px; padding: 4px 10px; height: fit-content; margin-top: 2px; }
        .breefing-page .hint { color: var(--grey); font-size: .88rem; margin: 0 0 10px 54px; }
        .breefing-page textarea, .breefing-page input[type=text], .breefing-page input[type=date] { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; padding: 14px 16px; font: inherit; color: var(--navy); resize: vertical; }
        .breefing-page textarea { min-height: 110px; }
        .breefing-page textarea:focus, .breefing-page input:focus { outline: 2px solid var(--azure); border-color: var(--azure); }
        .breefing-page .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media(max-width:640px) { .breefing-page .grid2 { grid-template-columns: 1fr; } }
        .breefing-page .f label { display: block; font-weight: 700; font-size: .78rem; letter-spacing: .08em; color: var(--azure); margin-bottom: 8px; text-transform: uppercase; }
        .breefing-page .scale { display: grid; grid-template-columns: 110px 1fr 130px; align-items: center; gap: 12px; margin-bottom: 20px; }
        .breefing-page .scale .l { font-weight: 700; font-size: .92rem; }
        .breefing-page .scale .r { font-weight: 700; font-size: .92rem; text-align: right; }
        .breefing-page .dots { display: flex; justify-content: space-between; position: relative; }
        .breefing-page .dots::before { content: ''; position: absolute; left: 14px; right: 14px; top: 50%; height: 3px; background: var(--line); border-radius: 2px; }
        .breefing-page .dots input { appearance: none; width: 28px; height: 28px; border: 2.5px solid var(--azure); border-radius: 50%; background: #fff; cursor: pointer; position: relative; z-index: 1; }
        .breefing-page .dots input:checked { background: var(--azure); box-shadow: inset 0 0 0 4px #fff; }
        @media(max-width:560px) { .breefing-page .scale { grid-template-columns: 1fr; gap: 6px; } .breefing-page .scale .r { text-align: left; } }
        .breefing-page .pills { display: flex; flex-wrap: wrap; gap: 12px; }
        .breefing-page .pill input { display: none; }
        .breefing-page .pill span { display: inline-block; border: 1.5px solid var(--line); background: #fff; border-radius: 999px; padding: 11px 20px; font-weight: 500; cursor: pointer; transition: .15s; }
        .breefing-page .pill input:checked + span { background: var(--navy); color: var(--lime); border-color: var(--navy); }
        .breefing-page .pill.disabled span { opacity: 0.5; cursor: not-allowed; }
        .breefing-page .checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
        .breefing-page .chk { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .breefing-page .chk input { width: 24px; height: 24px; accent-color: var(--azure); }
        .breefing-page .chk.disabled { opacity: 0.5; cursor: not-allowed; }
        .breefing-page .subhead { font-weight: 700; font-size: .82rem; letter-spacing: .08em; color: var(--azure); text-transform: uppercase; margin: 6px 0 16px; }
        .breefing-page .submit-bar { margin-top: 36px; background: var(--navy); border-radius: 20px; padding: 32px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .breefing-page .submit-bar .bar { width: 8px; align-self: stretch; background: var(--lime); border-radius: 4px; }
        .breefing-page .submit-bar p { color: #fff; font-weight: 700; flex: 1; min-width: 220px; margin: 0; }
        .breefing-page button.send { background: var(--lime); color: var(--navy); font: inherit; font-weight: 700; font-size: 1.05rem; border: none; border-radius: 999px; padding: 16px 40px; cursor: pointer; transition: .15s; }
        .breefing-page button.send:hover { transform: translateY(-2px); }
        .breefing-page button.send:disabled { opacity: .6; cursor: wait; transform: none; }
        .breefing-page .msg { margin-top: 16px; font-weight: 700; display: none; padding: 14px 18px; border-radius: 12px; }
        .breefing-page .msg.ok { display: block; background: #E6F7E9; color: #146C2E; }
        .breefing-page .msg.err { display: block; background: #FDE8E8; color: #B42318; }
        .breefing-page footer { color: var(--grey); font-size: .8rem; text-align: center; margin-top: 40px; }
        .breefing-page footer b { color: var(--navy); }
        .breefing-page .swatch-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .breefing-page .swatch-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; width: 72px; }
        .breefing-page .swatch-circle { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #E5E7EB; transition: .2s; position: relative; }
        .breefing-page .swatch-item input { display: none; }
        .breefing-page .swatch-item input:checked + .swatch-circle { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--azure); border-color: transparent; }
        .breefing-page .swatch-item input:checked + .swatch-circle::after { content: '✓'; position: absolute; color: white; background: var(--azure); width: 18px; height: 18px; border-radius: 50%; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; bottom: -2px; right: -2px; }
        .breefing-page .swatch-name { font-size: .75rem; font-weight: 600; text-align: center; color: var(--navy); }
        .breefing-page .swatch-item.disabled { opacity: 0.4; cursor: not-allowed; }
        .breefing-page .cor-meanings { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0; }
        .breefing-page .cor-meanings:empty { display: none; }
      `}</style>
      <div className="breefing-page">
        <div className="hero">
          <div className="hero-inner">
            <span className="tag">BRIEFING ESTRATÉGICO</span>
            <h1>Identidade<br />Visual &amp; Marca</h1>
            <p className="sub">Construção de marca pessoal para gestão pública</p>
            <hr />
            <p className="intro">Este formulário captura tudo o que precisamos para desenvolver uma marca autêntica, moderna e estratégica. Reserve um momento tranquilo — quanto mais sinceridade e detalhe, mais forte será o resultado. Suas respostas são salvas com segurança e vistas apenas pela equipe de criação.</p>
          </div>
        </div>

        <form className="wrap" onSubmit={handleSubmit} noValidate>
          {/* DADOS BÁSICOS */}
          <section className="card">
            <div className="sec-head"><div className="badge">i</div><h2>Dados básicos</h2></div>
            <p className="sec-sub">Antes de começar, alguns dados rápidos de identificação.</p>
            <hr className="sec-rule" />
            <div className="grid2">
              <div className="f"><label htmlFor="nome">Nome completo *</label><input type="text" id="nome" name="nome" value={formData.nome || ''} onChange={handleTextChange} required /></div>
              <div className="f"><label htmlFor="apelido">Como gosta de ser chamado(a)</label><input type="text" id="apelido" name="apelido" value={formData.apelido || ''} onChange={handleTextChange} /></div>
              <div className="f"><label htmlFor="idade">Idade</label><input type="text" id="idade" name="idade" value={formData.idade || ''} onChange={handleTextChange} /></div>
              <div className="f"><label htmlFor="cidade">Cidade / Estado *</label><input type="text" id="cidade" name="cidade" value={formData.cidade || ''} onChange={handleTextChange} required /></div>
              <div className="f"><label htmlFor="cargo">Cargo atual e mandato</label><input type="text" id="cargo" name="cargo" placeholder="Ex.: Prefeito 2025–2028" value={formData.cargo || ''} onChange={handleTextChange} /></div>
              <div className="f"><label htmlFor="redes">Redes sociais ativas (@)</label><input type="text" id="redes" name="redes" value={formData.redes || ''} onChange={handleTextChange} /></div>
            </div>
          </section>

          {/* SEÇÃO 01 */}
          <section className="card">
            <div className="sec-head"><div className="badge">01</div><h2>Quem é você</h2></div>
            <p className="sec-sub">Sua história é a matéria-prima da marca. Aqui queremos conhecer a pessoa por trás do cargo.</p>
            <hr className="sec-rule" />
            <div className="q"><label className="qt" htmlFor="q11"><span className="qnum">1.1</span>Conte sua trajetória em poucas linhas: de onde você veio e como chegou até aqui?</label>
              <p className="hint">Origem, família, formação, primeiros trabalhos, entrada na vida pública.</p>
              <textarea id="q11" name="q1_1" value={formData.q1_1 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q12"><span className="qnum">1.2</span>O que te motivou a entrar na política? Existe um momento ou história que marcou essa decisão?</label>
              <textarea id="q12" name="q1_2" value={formData.q1_2 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q13"><span className="qnum">1.3</span>Quais são as três palavras que as pessoas mais usam para descrever você?</label>
              <textarea id="q13" name="q1_3" style={{ minHeight: '64px' }} value={formData.q1_3 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q14"><span className="qnum">1.4</span>E quais três palavras VOCÊ usaria para se descrever?</label>
              <textarea id="q14" name="q1_4" style={{ minHeight: '64px' }} value={formData.q1_4 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q15"><span className="qnum">1.5</span>O que você faz fora da política que revela quem você é? (hobbies, esportes, música, fé, família)</label>
              <textarea id="q15" name="q1_5" value={formData.q1_5 || ''} onChange={handleTextChange}></textarea></div>
          </section>

          {/* SEÇÃO 02 */}
          <section className="card">
            <div className="sec-head"><div className="badge">02</div><h2>Posicionamento &amp; Visão</h2></div>
            <p className="sec-sub">O que a sua gestão representa. É daqui que nasce o conceito da marca.</p>
            <hr className="sec-rule" />
            <div className="q"><label className="qt" htmlFor="q21"><span className="qnum">2.1</span>Se a sua gestão fosse resumida em UMA frase, qual seria?</label>
              <p className="hint">Pense como um slogan interno — o coração da sua administração.</p>
              <textarea id="q21" name="q2_1" style={{ minHeight: '64px' }} value={formData.q2_1 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q22"><span className="qnum">2.2</span>Quais são as 3 principais bandeiras / prioridades do seu mandato?</label>
              <p className="hint">Ex.: saúde de qualidade, cidade digital, juventude, infraestrutura, transparência.</p>
              <textarea id="q22" name="q2_2" value={formData.q2_2 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q23"><span className="qnum">2.3</span>O que a sua gestão faz DIFERENTE das anteriores? Qual é a quebra de padrão?</label>
              <textarea id="q23" name="q2_3" value={formData.q2_3 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q24"><span className="qnum">2.4</span>Daqui a 4 anos, o que você quer que as pessoas digam sobre a sua administração?</label>
              <textarea id="q24" name="q2_4" value={formData.q2_4 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q25"><span className="qnum">2.5</span>Existe algum valor inegociável para você? Algo que a marca jamais pode contradizer?</label>
              <textarea id="q25" name="q2_5" style={{ minHeight: '64px' }} value={formData.q2_5 || ''} onChange={handleTextChange}></textarea></div>
          </section>

          {/* SEÇÃO 03 */}
          <section className="card">
            <div className="sec-head"><div className="badge">03</div><h2>Público &amp; Percepção</h2></div>
            <p className="sec-sub">Marca forte é construída de fora para dentro. Precisamos entender quem recebe a mensagem.</p>
            <hr className="sec-rule" />
            <div className="q"><label className="qt" htmlFor="q31"><span className="qnum">3.1</span>Descreva o cidadão típico da sua cidade: idade, rotina, o que valoriza, o que o preocupa.</label>
              <textarea id="q31" name="q3_1" value={formData.q3_1 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q32"><span className="qnum">3.2</span>Qual grupo você mais quer conquistar ou se aproximar? (jovens, idosos, empreendedores, zona rural...)</label>
              <textarea id="q32" name="q3_2" style={{ minHeight: '64px' }} value={formData.q3_2 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q33"><span className="qnum">3.3</span>Hoje, como você acredita que a população te enxerga? Seja honesto.</label>
              <textarea id="q33" name="q3_3" value={formData.q3_3 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q34"><span className="qnum">3.4</span>E como você GOSTARIA de ser percebido? Qual é a distância entre os dois?</label>
              <textarea id="q34" name="q3_4" value={formData.q3_4 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q35"><span className="qnum">3.5</span>Existe alguma crítica ou rótulo que você quer combater com a nova marca?</label>
              <textarea id="q35" name="q3_5" style={{ minHeight: '64px' }} value={formData.q3_5 || ''} onChange={handleTextChange}></textarea></div>
          </section>

          {/* SEÇÃO 04 */}
          <section className="card">
            <div className="sec-head"><div className="badge">04</div><h2>Personalidade da marca</h2></div>
            <p className="sec-sub">Se a sua marca fosse uma pessoa, como ela falaria e se comportaria? Marque na escala onde ela está.</p>
            <hr className="sec-rule" />
            <p className="subhead">Marque um ponto em cada escala</p>
            
            <div id="scales">
              {SCALES.map((s, i) => (
                <div className="scale" key={i}>
                  <span className="l">{s[0]}</span>
                  <div className="dots">
                    {[1, 2, 3, 4, 5].map(v => (
                      <input 
                        key={v}
                        type="radio" 
                        name={`escala_${i}`} 
                        value={v} 
                        aria-label={`${s[0]} ${v} de 5 ${s[1]}`}
                        checked={escalas[`escala_${i}`] === String(v)}
                        onChange={() => setEscalas({ ...escalas, [`escala_${i}`]: String(v) })}
                      />
                    ))}
                  </div>
                  <span className="r">{s[1]}</span>
                </div>
              ))}
            </div>

            <p className="subhead" style={{ marginTop: '28px' }}>Selecione até 5 palavras que a marca deve transmitir</p>
            <div className="pills" id="pills">
              {WORDS.map(w => {
                const isSelected = palavras.includes(w);
                const isDisabled = !isSelected && palavras.length >= 5;
                return (
                  <label key={w} className={`pill ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      value={w} 
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handlePalavraToggle(w)} 
                    />
                    <span>{w}</span>
                  </label>
                )
              })}
            </div>
            <div className="q" style={{ marginTop: '28px' }}>
              <label className="qt" htmlFor="q41"><span className="qnum">4.1</span>Alguma personalidade pública (política ou não) cuja comunicação você admira? Por quê?</label>
              <textarea id="q41" name="q4_1" style={{ minHeight: '64px' }} value={formData.q4_1 || ''} onChange={handleTextChange}></textarea>
            </div>
          </section>

          {/* SEÇÃO 05 */}
          <section className="card">
            <div className="sec-head"><div className="badge">05</div><h2>Direção visual</h2></div>
            <p className="sec-sub">Suas preferências estéticas. Aqui não decidimos o design — coletamos repertório.</p>
            <hr className="sec-rule" />
            
            <div className="q">
              <label className="qt" htmlFor="q51"><span className="qnum">5.1</span>Quais cores têm a ver com você? Escolha até 3.</label>
              
              <div className="swatch-grid">
                {CORES.map(c => {
                  const isSelected = coresSelecionadas.some(x => x.cor === c.cor);
                  const isDisabled = !isSelected && coresSelecionadas.length >= 3;
                  return (
                    <label key={c.cor} className={`swatch-item ${isDisabled ? 'disabled' : ''}`}>
                      <input 
                        type="checkbox" 
                        value={c.cor}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleCorToggle(c)}
                      />
                      <div className="swatch-circle" style={{ backgroundColor: c.hex }} data-cor={c.cor}></div>
                      <span className="swatch-name">{c.cor}</span>
                    </label>
                  );
                })}
              </div>

              <div className="cor-meanings">
                {coresSelecionadas.map(c => (
                  <div key={c.cor} className="f">
                    <label>O que o {c.cor.toUpperCase()} significa pra você? Que sentimento, memória ou valor essa cor carrega na sua história?</label>
                    <p className="hint" style={{ margin: '0 0 8px 0' }}>Ex.: 'o verde me lembra a roça onde cresci', 'o azul é a cor do time que uni a cidade', 'o amarelo é energia, sou movido a isso'.</p>
                    <textarea 
                      value={c.significado} 
                      onChange={(e) => handleCorSignificado(c.cor, e.target.value)}
                      style={{ minHeight: '64px' }}
                    ></textarea>
                  </div>
                ))}
              </div>

              <div className="f" style={{ marginTop: '16px' }}>
                <label className="qt" htmlFor="cor_outra"><span className="qnum">5.1.c</span>Alguma outra cor específica que não está aí em cima? Descreva ela e o que significa.</label>
                <textarea id="cor_outra" name="cor_outra" style={{ minHeight: '64px' }} value={formData.cor_outra || ''} onChange={handleTextChange}></textarea>
              </div>
            </div>

            <div className="q"><label className="qt" htmlFor="q52"><span className="qnum">5.2</span>E cores que devemos EVITAR?</label>
              <p className="hint">E por quê? Rivais, partidos, gestões anteriores...</p>
              <textarea id="q52" name="q5_2" style={{ minHeight: '64px' }} value={formData.q5_2 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q53"><span className="qnum">5.3</span>Marcas, logos ou perfis (de qualquer área) que você acha visualmente incríveis. Cite ou cole links.</label>
              <p className="hint">Podem ser marcas de empresas, artistas, outros políticos, times — o que te atrai visualmente.</p>
              <textarea id="q53" name="q5_3" value={formData.q5_3 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q54"><span className="qnum">5.4</span>Algum símbolo, elemento local ou referência da cidade que poderia (ou NÃO deveria) aparecer na marca?</label>
              <p className="hint">Ex.: montanhas, igreja histórica, cultura local, apelido da cidade.</p>
              <textarea id="q54" name="q5_4" value={formData.q5_4 || ''} onChange={handleTextChange}></textarea></div>
            
            <p className="subhead">Qual estilo mais combina com você? (marque até 2)</p>
            <div className="checks" id="estilos">
              {ESTILOS.map(e => {
                const isSelected = estilos.includes(e);
                const isDisabled = !isSelected && estilos.length >= 2;
                return (
                  <label key={e} className={`chk ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      value={e}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleEstiloToggle(e)}
                    />
                    {e}
                  </label>
                )
              })}
            </div>
          </section>

          {/* SEÇÃO 06 */}
          <section className="card">
            <div className="sec-head"><div className="badge">06</div><h2>Aplicações &amp; Próximos passos</h2></div>
            <p className="sec-sub">Onde a marca vai viver — e o espaço para o que ficou de fora.</p>
            <hr className="sec-rule" />
            <p className="subhead">Onde a marca será usada? (marque tudo que se aplica)</p>
            <div className="checks" id="apps" style={{ marginBottom: '28px' }}>
              {APPS.map(a => (
                <label key={a} className="chk">
                  <input 
                    type="checkbox" 
                    value={a}
                    checked={aplicacoes.includes(a)}
                    onChange={() => handleAplicacaoToggle(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
            <div className="q"><label className="qt" htmlFor="q61"><span className="qnum">6.1</span>A marca é da GESTÃO (prefeitura) ou PESSOAL (o político)? Ou as duas devem conversar entre si?</label>
              <textarea id="q61" name="q6_1" style={{ minHeight: '64px' }} value={formData.q6_1 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q62"><span className="qnum">6.2</span>Existe prazo, evento ou data importante para o lançamento da nova identidade?</label>
              <textarea id="q62" name="q6_2" style={{ minHeight: '64px' }} value={formData.q6_2 || ''} onChange={handleTextChange}></textarea></div>
            <div className="q"><label className="qt" htmlFor="q63"><span className="qnum">6.3</span>Espaço livre: algo que não perguntamos e você acha essencial que a gente saiba?</label>
              <textarea id="q63" name="q6_3" value={formData.q6_3 || ''} onChange={handleTextChange}></textarea></div>
          </section>

          <div className="submit-bar">
            <div className="bar"></div>
            <p>Obrigado! Com essas respostas, vamos transformar a sua essência em uma marca à altura da sua história.</p>
            <button type="submit" className="send" disabled={loading}>
              {loading ? 'Enviando...' : (status?.type === 'ok' ? 'Enviado ✓' : 'Enviar briefing')}
            </button>
          </div>
          
          <div id="form-msg">
            {status && (
              <div className={`msg ${status.type}`}>
                {status.msg}
              </div>
            )}
          </div>

          <footer>Fontes Graphics — Comunicação Visual · <b>Briefing Estratégico</b></footer>
        </form>
      </div>
    </>
  );
}
