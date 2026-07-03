import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Autosave local do rascunho (client-side apenas, isolado do briefing político)
const STORAGE_KEY = 'fg_briefing_video_draft_v1';
const loadDraft = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const EXIBICAO = ['Telão de LED', 'Backdrop de evento', 'Painel de fundo', 'Abertura de evento', 'Redes sociais', 'Outro'];
const SENSACOES = ['Elegante', 'Institucional', 'Cinematográfico', 'Moderno', 'Emocionante', 'Tecnológico', 'Luxuoso', 'Religioso / solene', 'Festivo, mas sofisticado', 'Minimalista', 'Outro'];
const INFOS = ['Logo', 'Nome do evento', 'Data', 'Horário', 'Local', 'Atrações', 'Realização', 'Apoio', 'Patrocinadores', 'Redes sociais', 'Nenhuma informação textual além das frases'];
const FORMATOS = ['Horizontal 1920x1080', 'Vertical 1080x1920', 'Feed 1080x1350', 'Story/Reels', 'Formato específico para telão de LED', 'Ainda não sei'];
const DURACOES = ['Até 10 segundos', '10 a 20 segundos', '20 a 30 segundos', 'Mais de 30 segundos', 'Ainda não sei'];
const AUDIOS = ['Sim, com trilha sonora', 'Sim, com locução', 'Sim, com efeitos sonoros', 'Não, será sem áudio', 'Ainda não sei'];
const LOGO_OPCOES = ['Sim', 'Não', 'Ainda vou enviar'];

const TIPOS = [
  { id: 'simples', nome: 'Vídeo simples', valor: 400, desc: 'Vídeo mais direto, com animação simples, frases, logo, efeitos visuais moderados e acabamento profissional.' },
  { id: 'completo', nome: 'Vídeo completo', valor: 1000, desc: 'Vídeo mais elaborado, com direção visual mais cinematográfica, motion mais trabalhado, maior riqueza visual, transições, ritmo, ambientação e acabamento premium.' },
];

// Respostas genéricas que devem ser bloqueadas nos campos descritivos
const GENERICAS = ['algo bonito', 'algo moderno', 'nao sei', 'não sei', 'do seu jeito', 'faz algo top', 'algo top', 'qualquer coisa', 'tanto faz', 'voce que sabe', 'você que sabe', 'a seu criterio', 'a seu critério'];

const isGenerica = (v: string) => {
  const n = v.trim().toLowerCase().replace(/\s+/g, ' ');
  return GENERICAS.some(g => n === g || n.replace(/[.!]/g, '') === g);
};

export default function BriefingVideo() {
  const draft = loadDraft();
  const [formData, setFormData] = useState<Record<string, string>>(() => draft.formData ?? {});
  const [exibicao, setExibicao] = useState<string[]>(() => draft.exibicao ?? []);
  const [sensacoes, setSensacoes] = useState<string[]>(() => draft.sensacoes ?? []);
  const [infos, setInfos] = useState<string[]>(() => draft.infos ?? []);
  const [formatos, setFormatos] = useState<string[]>(() => draft.formatos ?? []);
  const [tipoVideo, setTipoVideo] = useState<string>(() => draft.tipoVideo ?? '');
  const [logo, setLogo] = useState<string>(() => draft.logo ?? '');
  const [audio, setAudio] = useState<string>(() => draft.audio ?? '');
  const [duracao, setDuracao] = useState<string>(() => draft.duracao ?? '');
  const [links, setLinks] = useState<string[]>(() => draft.links ?? ['']);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Persiste rascunho (isolado; não encosta em nenhuma chave do briefing político)
  useEffect(() => {
    try {
      const payload = { formData, exibicao, sensacoes, infos, formatos, tipoVideo, logo, audio, duracao, links };
      const hasData = Object.keys(formData).length > 0 || tipoVideo || exibicao.length > 0;
      if (hasData) localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage indisponível — segue sem autosave */ }
  }, [formData, exibicao, sensacoes, infos, formatos, tipoVideo, logo, audio, duracao, links]);

  const setField = (name: string, value: string) => setFormData(p => ({ ...p, [name]: value }));
  const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(e.target.name, e.target.value);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const setLink = (i: number, v: string) => setLinks(links.map((l, idx) => idx === i ? v : l));
  const addLink = () => setLinks([...links, '']);
  const removeLink = (i: number) => setLinks(links.length > 1 ? links.filter((_, idx) => idx !== i) : ['']);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.nome?.trim()) e.nome = 'Informe o nome do cliente ou empresa.';
    if (!formData.whatsapp?.trim()) e.whatsapp = 'Informe um WhatsApp para contato.';
    if (!formData.evento?.trim()) e.evento = 'Informe o nome do evento.';
    if (!formData.data?.trim()) e.data = 'Informe a data do evento.';
    if (!tipoVideo) e.tipoVideo = 'Escolha o tipo de vídeo.';

    if (exibicao.includes('Outro') && !formData.exibicaoOutro?.trim()) e.exibicaoOutro = 'Explique onde será exibido.';
    if (sensacoes.includes('Outro') && !formData.sensacaoOutro?.trim()) e.sensacaoOutro = 'Explique a sensação desejada.';

    const ideia = formData.ideia?.trim() || '';
    if (!ideia) e.ideia = 'Descreva a ideia principal do vídeo.';
    else if (ideia.length < 120) e.ideia = `Descreva melhor a sua ideia. Evite respostas como "algo bonito" ou "algo moderno". Explique o clima, o estilo, as frases, as cores e a sensação que o vídeo deve passar. (mín. 120 caracteres — faltam ${120 - ideia.length})`;
    else if (isGenerica(ideia)) e.ideia = 'Descreva melhor a sua ideia. Evite respostas genéricas — explique o clima, o estilo, as cores e a sensação.';

    const frases = formData.frases?.trim() || '';
    if (!frases) e.frases = 'Digite as frases que devem aparecer no vídeo.';
    else if (frases.length < 30) e.frases = `Detalhe melhor as frases (mín. 30 caracteres — faltam ${30 - frases.length}).`;

    const naoQuero = formData.naoQuero?.trim() || '';
    if (!naoQuero) e.naoQuero = 'Diga o que você NÃO quer no vídeo.';
    else if (naoQuero.length < 40) e.naoQuero = `Detalhe melhor o que evitar (mín. 40 caracteres — faltam ${40 - naoQuero.length}).`;
    else if (isGenerica(naoQuero)) e.naoQuero = 'Seja específico sobre o que evitar.';

    return e;
  };

  const goReview = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setStatus({ type: 'err', msg: 'Alguns campos precisam de atenção. Veja as mensagens em vermelho.' });
      const first = document.querySelector('.field-error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStatus(null);
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tipoSel = TIPOS.find(t => t.id === tipoVideo);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    const linksLimpos = links.map(l => l.trim()).filter(Boolean);
    const respostas = {
      ...formData,
      exibicao, sensacoes, infos, formatos, logo, audio, duracao,
      links: linksLimpos,
      tipo_video: tipoSel?.nome,
      valor: tipoSel?.valor,
    };
    try {
      const { error } = await supabase.from('video_briefings').insert({
        nome: formData.nome,
        contato: formData.whatsapp,
        email: formData.email || null,
        evento: formData.evento,
        tipo_video: tipoSel?.id ?? null,
        valor: tipoSel?.valor ?? null,
        respostas,
      });
      if (error) throw error;
      setStatus({ type: 'ok', msg: 'Briefing enviado com sucesso! Recebemos suas informações e vamos analisar os detalhes para iniciar a criação do seu vídeo.' });
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'err', msg: 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const err = (k: string) => errors[k] ? <p className="field-error">{errors[k]}</p> : null;

  // ---------- TELA DE SUCESSO ----------
  if (status?.type === 'ok') {
    return (
      <>
        <style>{styles}</style>
        <div className="bv-page">
          <div className="bv-hero"><div className="bv-hero-inner">
            <span className="bv-kicker">Fontes Graphics · Vídeo de Evento</span>
            <h1>Briefing<br />Recebido</h1>
          </div></div>
          <div className="bv-wrap">
            <section className="bv-card bv-success">
              <div className="bv-check">✓</div>
              <h2>Briefing enviado com sucesso!</h2>
              <p>Recebemos suas informações e vamos analisar os detalhes para iniciar a criação do seu vídeo.</p>
              <div className="bv-pix">
                <h3>Próximo passo — sinal de 50%</h3>
                <p>Para iniciar a produção, envie um <b>Pix de 50% do valor (sinal obrigatório)</b> para:</p>
                <div className="bv-pix-key">fontescampanhas@gmail.com</div>
                {tipoSel && (
                  <p className="bv-pix-val">
                    {tipoSel.nome} — R$ {tipoSel.valor.toLocaleString('pt-BR')},00 · sinal de <b>R$ {(tipoSel.valor / 2).toLocaleString('pt-BR')},00</b>
                  </p>
                )}
                <p className="bv-prazo">
                  Prazo de entrega após a confirmação do sinal:<br />
                  <b>Vídeo simples:</b> 2 dias úteis · <b>Vídeo completo:</b> 5 dias úteis <span>(exceto finais de semana)</span>
                </p>
              </div>
            </section>
            <footer className="bv-footer">Fontes Graphics — Comunicação Visual · <b>Briefing de Vídeo</b></footer>
          </div>
        </div>
      </>
    );
  }

  // ---------- TELA DE REVISÃO ----------
  if (step === 'review') {
    const linhas: Array<[string, string]> = [
      ['Cliente / empresa', formData.nome || '—'],
      ['WhatsApp', formData.whatsapp || '—'],
      ['E-mail', formData.email || '—'],
      ['Evento', formData.evento || '—'],
      ['Data do evento', formData.data || '—'],
      ['Onde será exibido', [...exibicao, formData.exibicaoOutro && `Outro: ${formData.exibicaoOutro}`].filter(Boolean).join(', ') || '—'],
      ['Tipo de vídeo', tipoSel ? `${tipoSel.nome} — R$ ${tipoSel.valor.toLocaleString('pt-BR')},00` : '—'],
      ['Ideia principal', formData.ideia || '—'],
      ['Sensações', [...sensacoes, formData.sensacaoOutro && `Outro: ${formData.sensacaoOutro}`].filter(Boolean).join(', ') || '—'],
      ['Frases do vídeo', formData.frases || '—'],
      ['Ordem das frases', formData.ordemFrases || '—'],
      ['Precisa de logo?', logo || '—'],
      ['Informações obrigatórias', infos.join(', ') || '—'],
      ['Cores / identidade', formData.cores || '—'],
      ['O que NÃO quer', formData.naoQuero || '—'],
      ['Links de referência', links.map(l => l.trim()).filter(Boolean).join('\n') || '—'],
      ['Referência anterior', formData.referenciaAnterior || '—'],
      ['Formato', formatos.join(', ') || '—'],
      ['Duração', duracao || '—'],
      ['Áudio', audio || '—'],
      ['Observações finais', formData.observacoes || '—'],
    ];
    return (
      <>
        <style>{styles}</style>
        <div className="bv-page">
          <div className="bv-hero"><div className="bv-hero-inner">
            <span className="bv-kicker">Fontes Graphics · Vídeo de Evento</span>
            <h1>Revise seu<br />Briefing</h1>
            <p className="bv-sub">Confira as respostas antes de enviar. Se estiver tudo certo, confirme o envio.</p>
          </div></div>
          <div className="bv-wrap">
            <section className="bv-card">
              <table className="bv-review">
                <tbody>
                  {linhas.map(([campo, resp], i) => (
                    <tr key={i}>
                      <th>{campo}</th>
                      <td>{resp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {status?.type === 'err' && <div className="bv-msg err">{status.msg}</div>}

            <div className="bv-actions">
              <button type="button" className="bv-btn-ghost" onClick={() => { setStep('form'); window.scrollTo({ top: 0 }); }} disabled={loading}>
                ← Voltar e editar
              </button>
              <button type="button" className="bv-send" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar briefing de vídeo'}
              </button>
            </div>
            <footer className="bv-footer">Fontes Graphics — Comunicação Visual · <b>Briefing de Vídeo</b></footer>
          </div>
        </div>
      </>
    );
  }

  // ---------- FORMULÁRIO ----------
  const Section = ({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) => (
    <section className="bv-card">
      <div className="bv-sec-head"><div className="bv-badge">{n}</div><h2>{title}</h2></div>
      {sub && <p className="bv-sec-sub">{sub}</p>}
      <hr className="bv-rule" />
      <div className="bv-rows">{children}</div>
    </section>
  );

  const Row = ({ label, required, hint, children, error }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; error?: string }) => (
    <div className={`bv-row ${error ? 'has-error' : ''}`}>
      <div className="bv-row-label">
        <label>{label}{required && <span className="bv-req"> *</span>}</label>
        {hint && <p className="bv-hint">{hint}</p>}
      </div>
      <div className="bv-row-input">{children}{error && <p className="field-error">{error}</p>}</div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="bv-page">
        <div className="bv-hero">
          <div className="bv-hero-inner">
            <span className="bv-kicker">Fontes Graphics · Vídeo de Evento</span>
            <h1>Briefing para<br />Vídeo de Evento</h1>
            <hr className="bv-hr-lime" />
            <p className="bv-sub">Preencha com o máximo de detalhes possível. Quanto mais clara for a sua ideia, mais preciso será o resultado final.</p>
          </div>
        </div>

        <form className="bv-wrap" onSubmit={(e) => { e.preventDefault(); goReview(); }} noValidate>

          {/* 1 — DADOS DO CLIENTE */}
          <Section n="01" title="Dados do cliente" sub="Para entrarmos em contato e organizar seu projeto.">
            <Row label="Nome do cliente ou empresa" required error={errors.nome}>
              <input type="text" name="nome" value={formData.nome || ''} onChange={handleText} placeholder="Ex.: Prefeitura de Heliodora" />
            </Row>
            <Row label="WhatsApp para contato" required error={errors.whatsapp}>
              <input type="tel" name="whatsapp" value={formData.whatsapp || ''} onChange={handleText} placeholder="(35) 99999-9999" />
            </Row>
            <Row label="E-mail" hint="Opcional.">
              <input type="email" name="email" value={formData.email || ''} onChange={handleText} placeholder="voce@email.com" />
            </Row>
          </Section>

          {/* 2 — DADOS DO EVENTO */}
          <Section n="02" title="Dados do evento" sub="Sobre o evento onde o vídeo será usado.">
            <Row label="Nome do evento" required error={errors.evento}>
              <input type="text" name="evento" value={formData.evento || ''} onChange={handleText} placeholder="Ex.: Festa de Santa Isabel 2026" />
            </Row>
            <Row label="Data do evento" required error={errors.data}>
              <input type="date" name="data" value={formData.data || ''} onChange={handleText} />
            </Row>
            <Row label="Onde o vídeo será exibido?" error={errors.exibicaoOutro}>
              <div className="bv-checks">
                {EXIBICAO.map(o => (
                  <label key={o} className="bv-chk">
                    <input type="checkbox" checked={exibicao.includes(o)} onChange={() => toggle(exibicao, setExibicao, o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              {exibicao.includes('Outro') && (
                <input type="text" name="exibicaoOutro" value={formData.exibicaoOutro || ''} onChange={handleText} placeholder="Explique onde será exibido" style={{ marginTop: 10 }} />
              )}
            </Row>
          </Section>

          {/* 3 — TIPO DE VÍDEO E INVESTIMENTO */}
          <Section n="03" title="Tipo de vídeo e investimento" sub="Escolha o nível de produção do seu vídeo.">
            <div className={`bv-row ${errors.tipoVideo ? 'has-error' : ''}`}>
              <div className="bv-row-label"><label>Tipo de vídeo desejado<span className="bv-req"> *</span></label></div>
              <div className="bv-row-input">
                <div className="bv-tipos">
                  {TIPOS.map(t => (
                    <label key={t.id} className={`bv-tipo ${tipoVideo === t.id ? 'sel' : ''}`}>
                      <input type="radio" name="tipoVideo" checked={tipoVideo === t.id} onChange={() => setTipoVideo(t.id)} />
                      <div className="bv-tipo-head">
                        <span className="bv-tipo-nome">{t.nome}</span>
                        <span className="bv-tipo-valor">R$ {t.valor.toLocaleString('pt-BR')},00</span>
                      </div>
                      <p className="bv-tipo-desc">{t.desc}</p>
                    </label>
                  ))}
                </div>
                {errors.tipoVideo && <p className="field-error">{errors.tipoVideo}</p>}
              </div>
            </div>
          </Section>

          {/* 4 — DIREÇÃO CRIATIVA */}
          <Section n="04" title="Direção criativa" sub="O coração do briefing. Quanto mais detalhe, melhor o resultado.">
            <Row label="Qual é a ideia principal do vídeo?" required error={errors.ideia}>
              <textarea name="ideia" value={formData.ideia || ''} onChange={handleText} className="bv-big"
                placeholder="Explique com detalhes o que você imagina para esse vídeo. Exemplo: quero algo elegante, com fundo escuro, partículas suaves, entrada da logo, frases aparecendo em momentos diferentes e sensação de evento premium." />
              <p className="bv-counter">{(formData.ideia?.trim().length || 0)}/120 caracteres mínimos</p>
            </Row>
            <Row label="Qual sensação o vídeo deve transmitir?" error={errors.sensacaoOutro}>
              <div className="bv-checks">
                {SENSACOES.map(o => (
                  <label key={o} className="bv-chk">
                    <input type="checkbox" checked={sensacoes.includes(o)} onChange={() => toggle(sensacoes, setSensacoes, o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              {sensacoes.includes('Outro') && (
                <input type="text" name="sensacaoOutro" value={formData.sensacaoOutro || ''} onChange={handleText} placeholder="Explique a sensação desejada" style={{ marginTop: 10 }} />
              )}
            </Row>
            <Row label="Cores ou identidade visual desejada" hint="Opcional.">
              <textarea name="cores" value={formData.cores || ''} onChange={handleText}
                placeholder="Informe cores, estilo da identidade, paleta ou alguma referência visual que deve ser seguida." />
            </Row>
            <Row label="O que você NÃO quer no vídeo?" required error={errors.naoQuero}>
              <textarea name="naoQuero" value={formData.naoQuero || ''} onChange={handleText}
                placeholder="Exemplo: não quero algo infantil, não quero excesso de efeitos, não quero cara de festa eletrônica, não quero muitas luzes piscando." />
              <p className="bv-counter">{(formData.naoQuero?.trim().length || 0)}/40 caracteres mínimos</p>
            </Row>
          </Section>

          {/* 5 — FRASES E INFORMAÇÕES OBRIGATÓRIAS */}
          <Section n="05" title="Frases e informações obrigatórias" sub="O texto exato que precisa aparecer no vídeo.">
            <Row label="Quais frases devem aparecer no vídeo?" required
              hint="Digite todas as frases exatamente como devem ser escritas. Uma frase por linha." error={errors.frases}>
              <textarea name="frases" value={formData.frases || ''} onChange={handleText} className="bv-big"
                placeholder={"Exemplo:\nBem-vindos à Festa de Santa Isabel\nTradição, fé e cultura\nDe 03 a 05 de julho\nPrefeitura Municipal de Heliodora"} />
              <p className="bv-counter">{(formData.frases?.trim().length || 0)}/30 caracteres mínimos</p>
            </Row>
            <Row label="Existe alguma ordem para as frases aparecerem?" hint="Opcional.">
              <textarea name="ordemFrases" value={formData.ordemFrases || ''} onChange={handleText}
                placeholder="Exemplo: primeiro aparece a logo, depois a frase de boas-vindas, depois a data, depois as atrações." />
            </Row>
            <Row label="O vídeo precisa ter logo?">
              <div className="bv-radios">
                {LOGO_OPCOES.map(o => (
                  <label key={o} className="bv-radio">
                    <input type="radio" name="logo" checked={logo === o} onChange={() => setLogo(o)} /><span>{o}</span>
                  </label>
                ))}
              </div>
            </Row>
            <Row label="Quais informações obrigatórias precisam aparecer?">
              <div className="bv-checks">
                {INFOS.map(o => (
                  <label key={o} className="bv-chk">
                    <input type="checkbox" checked={infos.includes(o)} onChange={() => toggle(infos, setInfos, o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </Row>
          </Section>

          {/* 6 — REFERÊNCIAS VISUAIS */}
          <Section n="06" title="Referências visuais" sub="Mostre exemplos parecidos com o que você espera.">
            <Row label="Links de referências visuais" hint="Instagram, YouTube, Pinterest, Behance, Drive, WeTransfer, Dropbox… Envie vídeos, artes ou motions parecidos com o estilo que você espera.">
              <div className="bv-links">
                {links.map((l, i) => (
                  <div className="bv-link-row" key={i}>
                    <input type="url" value={l} onChange={(e) => setLink(i, e.target.value)} placeholder="https://..." />
                    <button type="button" className="bv-link-del" onClick={() => removeLink(i)} aria-label="Remover link">✕</button>
                  </div>
                ))}
                <button type="button" className="bv-link-add" onClick={addLink}>+ Adicionar outro link</button>
              </div>
            </Row>
            <Row label="Existe algum vídeo ou arte anterior que deve ser seguida?" hint="Opcional.">
              <textarea name="referenciaAnterior" value={formData.referenciaAnterior || ''} onChange={handleText}
                placeholder="Descreva ou cole o link do material anterior que serve de base." />
            </Row>
          </Section>

          {/* 7 — FORMATO TÉCNICO */}
          <Section n="07" title="Formato técnico" sub="Especificações de exibição do vídeo.">
            <Row label="Formato do vídeo">
              <div className="bv-checks">
                {FORMATOS.map(o => (
                  <label key={o} className="bv-chk">
                    <input type="checkbox" checked={formatos.includes(o)} onChange={() => toggle(formatos, setFormatos, o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </Row>
            <Row label="Duração estimada do vídeo">
              <select value={duracao} onChange={(e) => setDuracao(e.target.value)}>
                <option value="">Selecione…</option>
                {DURACOES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Row>
            <Row label="O vídeo terá áudio?">
              <div className="bv-radios">
                {AUDIOS.map(o => (
                  <label key={o} className="bv-radio">
                    <input type="radio" name="audio" checked={audio === o} onChange={() => setAudio(o)} /><span>{o}</span>
                  </label>
                ))}
              </div>
            </Row>
          </Section>

          {/* 8 — REVISÃO E ENVIO */}
          <Section n="08" title="Revisão e envio" sub="Um último espaço livre antes de revisar tudo.">
            <Row label="Observações finais" hint="Opcional.">
              <textarea name="observacoes" value={formData.observacoes || ''} onChange={handleText}
                placeholder="Use este espaço para explicar qualquer detalhe importante que não foi perguntado acima." />
            </Row>
          </Section>

          {status?.type === 'err' && <div className="bv-msg err">{status.msg}</div>}

          <div className="bv-submit-bar">
            <div className="bv-bar"></div>
            <p>Revise suas respostas antes de enviar. Quanto mais detalhes, mais preciso será o vídeo.</p>
            <button type="submit" className="bv-send">Revisar respostas →</button>
          </div>

          <footer className="bv-footer">Fontes Graphics — Comunicação Visual · <b>Briefing de Vídeo</b></footer>
        </form>
      </div>
    </>
  );
}

const styles = `
  .bv-page { --navy:#0B1C37; --azure:#3B82F6; --azure-soft:#9FC2FF; --lime:#C6F432; --off:#F4F2EC; --paper:#fff; --grey:#73808F; --line:#E4E8EF; --ink:#33404F;
    font-family:'DM Sans',sans-serif; background:var(--off); color:var(--navy); line-height:1.55; min-height:100vh; }
  .bv-page * { box-sizing:border-box; }

  .bv-hero { background:var(--navy); color:#fff; padding:60px 24px 84px; }
  .bv-hero-inner { max-width:960px; margin:0 auto; }
  .bv-kicker { display:block; color:var(--azure-soft); font-size:.72rem; font-weight:600; letter-spacing:.22em; text-transform:uppercase; margin-bottom:22px; }
  .bv-hero h1 { font-family:'Archivo Black',sans-serif; font-size:clamp(2rem,5.2vw,3.4rem); line-height:1.04; text-transform:uppercase; letter-spacing:-.01em; margin:0; }
  .bv-hr-lime { border:none; height:3px; background:var(--lime); width:96px; margin:24px 0 20px; }
  .bv-sub { color:var(--azure-soft); font-size:1.05rem; font-weight:500; max-width:620px; margin:0; line-height:1.6; }

  .bv-wrap { max-width:960px; margin:-40px auto 0; padding:0 24px 96px; position:relative; z-index:1; }

  .bv-card { background:var(--paper); border:1px solid var(--line); border-radius:18px; padding:40px 44px; margin-top:24px;
    box-shadow:0 1px 2px rgba(11,28,55,.04),0 20px 40px -24px rgba(11,28,55,.18); }
  .bv-card:first-of-type { margin-top:0; }
  @media(max-width:640px){ .bv-card { padding:28px 20px; } }

  .bv-sec-head { display:flex; align-items:center; gap:18px; margin-bottom:4px; }
  .bv-badge { flex:0 0 50px; height:50px; border-radius:12px; background:var(--navy); color:var(--lime);
    font-family:'Archivo Black',sans-serif; font-size:1.15rem; display:flex; align-items:center; justify-content:center; }
  .bv-sec-head h2 { font-family:'Archivo Black',sans-serif; font-size:1.3rem; line-height:1.1; text-transform:uppercase; letter-spacing:-.005em; margin:0; }
  .bv-sec-sub { color:var(--grey); margin:10px 0 14px; font-size:.95rem; }
  .bv-rule { height:3px; width:100%; background:linear-gradient(90deg,var(--azure) 0,var(--azure) 60px,var(--line) 60px,var(--line) 100%); border:none; margin:0 0 26px; }

  .bv-rows { display:flex; flex-direction:column; }
  .bv-row { display:grid; grid-template-columns:230px 1fr; gap:24px; padding:20px 0; border-bottom:1px solid var(--line); align-items:start; }
  .bv-row:last-child { border-bottom:none; padding-bottom:0; }
  .bv-row:first-child { padding-top:0; }
  @media(max-width:720px){ .bv-row { grid-template-columns:1fr; gap:10px; } }
  .bv-row-label label { font-weight:700; font-size:.98rem; color:var(--navy); }
  .bv-req { color:var(--azure); }
  .bv-hint { color:var(--grey); font-size:.85rem; margin:6px 0 0; line-height:1.45; }

  .bv-page input[type=text], .bv-page input[type=tel], .bv-page input[type=email], .bv-page input[type=date],
  .bv-page input[type=url], .bv-page textarea, .bv-page select {
    width:100%; border:1.5px solid var(--line); border-radius:12px; background:#fff; padding:13px 15px; font:inherit; color:var(--navy);
    transition:border-color .15s, box-shadow .15s; }
  .bv-page textarea { min-height:96px; resize:vertical; }
  .bv-page textarea.bv-big { min-height:140px; }
  .bv-page input:hover, .bv-page textarea:hover, .bv-page select:hover { border-color:#C7CEDA; }
  .bv-page input:focus, .bv-page textarea:focus, .bv-page select:focus { outline:none; border-color:var(--azure); box-shadow:0 0 0 3px rgba(59,130,246,.15); }
  .bv-counter { color:var(--grey); font-size:.78rem; margin:6px 0 0; }

  .field-error { color:#B42318; font-size:.84rem; font-weight:600; margin:8px 0 0; }
  .bv-row.has-error input, .bv-row.has-error textarea { border-color:#E4A0A0; }

  .bv-checks { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; }
  .bv-chk { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:.94rem; }
  .bv-chk input { width:20px; height:20px; accent-color:var(--azure); flex:0 0 auto; }
  .bv-chk input:focus-visible { outline:3px solid var(--azure); outline-offset:2px; }

  .bv-radios { display:flex; flex-wrap:wrap; gap:10px; }
  .bv-radio { display:flex; align-items:center; gap:8px; cursor:pointer; border:1.5px solid var(--line); border-radius:999px; padding:9px 16px; font-size:.92rem; transition:.15s; }
  .bv-radio input { accent-color:var(--azure); }
  .bv-radio:has(input:checked) { background:var(--navy); color:var(--lime); border-color:var(--navy); }

  .bv-tipos { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:640px){ .bv-tipos { grid-template-columns:1fr; } }
  .bv-tipo { display:block; border:2px solid var(--line); border-radius:16px; padding:20px; cursor:pointer; transition:.15s; position:relative; }
  .bv-tipo:hover { border-color:#C7CEDA; }
  .bv-tipo input { position:absolute; opacity:0; width:1px; height:1px; }
  .bv-tipo.sel { border-color:var(--azure); box-shadow:0 0 0 3px rgba(59,130,246,.15); }
  .bv-tipo input:focus-visible ~ .bv-tipo-head { outline:2px solid var(--azure); outline-offset:4px; }
  .bv-tipo-head { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:8px; flex-wrap:wrap; }
  .bv-tipo-nome { font-family:'Archivo Black',sans-serif; font-size:1.05rem; text-transform:uppercase; }
  .bv-tipo-valor { font-weight:700; color:var(--azure); font-size:1.05rem; }
  .bv-tipo.sel .bv-tipo-valor { color:var(--navy); }
  .bv-tipo-desc { color:var(--grey); font-size:.88rem; margin:0; line-height:1.5; }

  .bv-links { display:flex; flex-direction:column; gap:10px; }
  .bv-link-row { display:flex; gap:8px; }
  .bv-link-del { flex:0 0 44px; border:1.5px solid var(--line); background:#fff; border-radius:10px; cursor:pointer; color:var(--grey); font-size:.9rem; }
  .bv-link-del:hover { border-color:#E4A0A0; color:#B42318; }
  .bv-link-add { align-self:flex-start; background:none; border:1.5px dashed var(--azure); color:var(--azure); border-radius:999px; padding:9px 18px; font-weight:600; cursor:pointer; font-size:.9rem; }
  .bv-link-add:hover { background:rgba(59,130,246,.08); }

  .bv-submit-bar { margin-top:32px; background:var(--navy); border-radius:18px; padding:32px; display:flex; gap:22px; align-items:center; flex-wrap:wrap;
    box-shadow:0 20px 40px -24px rgba(11,28,55,.4); }
  .bv-submit-bar .bv-bar { width:8px; align-self:stretch; background:var(--lime); border-radius:4px; }
  .bv-submit-bar p { color:#fff; font-weight:700; flex:1; min-width:220px; margin:0; line-height:1.5; }
  .bv-send { background:var(--lime); color:var(--navy); font:inherit; font-weight:700; font-size:1.02rem; border:none; border-radius:999px; padding:15px 34px; cursor:pointer; transition:transform .15s, box-shadow .15s; }
  .bv-send:hover { transform:translateY(-2px); box-shadow:0 10px 24px -8px rgba(198,244,50,.5); }
  .bv-send:disabled { opacity:.6; cursor:wait; transform:none; box-shadow:none; }
  .bv-send:focus-visible { outline:3px solid #fff; outline-offset:3px; }

  .bv-actions { display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin-top:26px; justify-content:space-between; }
  .bv-btn-ghost { background:#fff; border:1.5px solid var(--navy); color:var(--navy); border-radius:999px; padding:14px 26px; font-weight:700; cursor:pointer; font:inherit; }
  .bv-btn-ghost:hover { background:var(--navy); color:#fff; }

  .bv-review { width:100%; border-collapse:collapse; }
  .bv-review th, .bv-review td { text-align:left; vertical-align:top; padding:14px 16px; border-bottom:1px solid var(--line); font-size:.94rem; }
  .bv-review th { width:230px; color:var(--navy); font-weight:700; background:#F8FAFC; }
  .bv-review td { color:var(--ink); white-space:pre-wrap; }
  @media(max-width:640px){ .bv-review, .bv-review tbody, .bv-review tr, .bv-review th, .bv-review td { display:block; width:auto; }
    .bv-review th { border-bottom:none; padding-bottom:2px; } .bv-review td { padding-top:2px; border-bottom:1px solid var(--line); } }

  .bv-msg { margin-top:16px; font-weight:700; padding:14px 18px; border-radius:12px; }
  .bv-msg.err { background:#FDE8E8; color:#B42318; }

  .bv-success { text-align:center; }
  .bv-check { width:64px; height:64px; border-radius:50%; background:var(--lime); color:var(--navy); font-size:2rem; font-weight:700; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
  .bv-success h2 { font-family:'Archivo Black',sans-serif; text-transform:uppercase; font-size:1.5rem; margin:0 0 10px; }
  .bv-success > p { color:var(--ink); max-width:520px; margin:0 auto; }
  .bv-pix { margin-top:28px; background:var(--navy); color:#fff; border-radius:16px; padding:28px; text-align:left; }
  .bv-pix h3 { font-family:'Archivo Black',sans-serif; text-transform:uppercase; font-size:1.05rem; color:var(--lime); margin:0 0 12px; }
  .bv-pix p { color:#D8DDE5; margin:0 0 12px; line-height:1.55; }
  .bv-pix-key { display:inline-block; background:var(--lime); color:var(--navy); font-weight:700; border-radius:10px; padding:10px 18px; letter-spacing:.02em; word-break:break-all; }
  .bv-pix-val { margin-top:14px !important; font-weight:600; color:#fff !important; }
  .bv-prazo { margin-top:14px !important; border-top:1px solid rgba(255,255,255,.15); padding-top:14px; }
  .bv-prazo span { color:var(--azure-soft); }

  .bv-footer { color:var(--grey); font-size:.8rem; text-align:center; margin-top:40px; }
  .bv-footer b { color:var(--navy); }
`;
