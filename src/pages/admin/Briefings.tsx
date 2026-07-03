import { useState } from 'react';
import { useBriefings, Briefing } from '@/hooks/useBriefings';
import { useVideoBriefings } from '@/hooks/useVideoBriefings';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SCALES = [
  ["Formal", "Descontraída"],
  ["Tradicional", "Inovadora"],
  ["Séria", "Bem-humorada"],
  ["Institucional", "Próxima do povo"],
  ["Discreta", "Ousada"],
  ["Técnica", "Emocional"]
];

const SECTIONS = [
  { t: 'Dados básicos', qs: [['nome', 'Nome completo'], ['apelido', 'Como gosta de ser chamado(a)'], ['idade', 'Idade'], ['cidade', 'Cidade / Estado'], ['cargo', 'Cargo e mandato'], ['redes', 'Redes sociais']] },
  { t: '01 · Quem é você', qs: [['q1_1', '1.1 Trajetória'], ['q1_2', '1.2 Motivação para a política'], ['q1_3', '1.3 Três palavras (dos outros)'], ['q1_4', '1.4 Três palavras (suas)'], ['q1_5', '1.5 Fora da política']] },
  { t: '02 · Posicionamento & Visão', qs: [['q2_1', '2.1 Gestão em uma frase'], ['q2_2', '2.2 Três bandeiras'], ['q2_3', '2.3 O que faz diferente'], ['q2_4', '2.4 Legado em 4 anos'], ['q2_5', '2.5 Valor inegociável']] },
  { t: '03 · Público & Percepção', qs: [['q3_1', '3.1 Cidadão típico'], ['q3_2', '3.2 Grupo a conquistar'], ['q3_3', '3.3 Como é visto hoje'], ['q3_4', '3.4 Como gostaria de ser visto'], ['q3_5', '3.5 Crítica/rótulo a combater']] },
  { t: '05 · Direção visual', qs: [['cor_outra', '5.1.c Outras cores específicas'], ['q5_2', '5.2 Cores a evitar'], ['q5_3', '5.3 Referências visuais'], ['q5_4', '5.4 Símbolos locais']] },
  { t: '06 · Aplicações & Próximos passos', qs: [['q6_1', '6.1 Marca da gestão ou pessoal'], ['q6_2', '6.2 Prazo / data de lançamento'], ['q6_3', '6.3 Espaço livre']] }
];

export default function AdminBriefings() {
  const { briefings, isLoading, deleteBriefing, isDeleting } = useBriefings();
  const { videoBriefings, isLoading: vLoading, deleteVideoBriefing, isDeleting: vDeleting } = useVideoBriefings();
  const [tab, setTab] = useState<'politico' | 'video'>('politico');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeBriefing = briefings.find(b => b.id === activeId);
  const activeVideo = videoBriefings.find(b => b.id === activeVideoId);

  const handleCopy = () => {
    if (!activeBriefing) return;
    navigator.clipboard.writeText(JSON.stringify(activeBriefing.respostas, null, 2));
    toast.success('Respostas copiadas em JSON.');
  };

  const handleDelete = () => {
    if (!activeBriefing) return;
    if (confirm('Excluir este briefing? Esta ação não pode ser desfeita.')) {
      deleteBriefing(activeBriefing.id);
      setActiveId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVideoCopy = () => {
    if (!activeVideo) return;
    navigator.clipboard.writeText(JSON.stringify(activeVideo.respostas, null, 2));
    toast.success('Respostas copiadas em JSON.');
  };

  const handleVideoDelete = () => {
    if (!activeVideo) return;
    if (confirm('Excluir este briefing de vídeo? Esta ação não pode ser desfeita.')) {
      deleteVideoBriefing(activeVideo.id);
      setActiveVideoId(null);
    }
  };

  // Rótulos e ordem de exibição das respostas do briefing de vídeo
  const VIDEO_SECTIONS: Array<{ t: string; rows: Array<[string, string]> }> = [
    { t: 'Dados do cliente', rows: [['whatsapp', 'WhatsApp'], ['email', 'E-mail']] },
    { t: 'Dados do evento', rows: [['evento', 'Nome do evento'], ['data', 'Data do evento']] },
    { t: 'Direção criativa', rows: [['ideia', 'Ideia principal'], ['cores', 'Cores / identidade'], ['naoQuero', 'O que NÃO quer']] },
    { t: 'Frases e informações', rows: [['frases', 'Frases do vídeo'], ['ordemFrases', 'Ordem das frases'], ['logo', 'Precisa de logo?']] },
    { t: 'Referências', rows: [['referenciaAnterior', 'Referência anterior']] },
    { t: 'Formato técnico', rows: [['duracao', 'Duração'], ['audio', 'Áudio']] },
    { t: 'Observações', rows: [['observacoes', 'Observações finais']] },
  ];

  return (
    <>
      <style>{`
        :root { --navy:#0B1C37; --azure:#3B82F6; --lime:#C6F432; --off:#FAFAF8; --grey:#73808F; --line:#E4E8EF; }
        .b-admin { font-family: 'DM Sans', sans-serif; background: var(--off); color: var(--navy); height: calc(100vh - 64px); display: flex; flex-direction: column; overflow: hidden; }
        .b-admin .header-b { background: var(--navy); color: #fff; padding: 22px 28px; display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        .b-admin .header-b .dot { width: 14px; height: 14px; background: var(--lime); border-radius: 50%; }
        .b-admin .header-b h1 { font-family: 'Archivo Black', sans-serif; font-size: 1.1rem; text-transform: uppercase; letter-spacing: .03em; margin: 0; }
        .b-admin .header-b span { color: var(--azure); font-size: .85rem; margin-left: auto; }
        .b-admin .tabs-bar { display: flex; gap: 8px; background: #fff; border-bottom: 1px solid var(--line); padding: 10px 22px 0; flex-shrink: 0; }
        .b-admin .tab-btn { font: inherit; font-weight: 700; font-size: .9rem; color: var(--grey); background: none; border: none; border-bottom: 3px solid transparent; padding: 12px 18px; cursor: pointer; }
        .b-admin .tab-btn:hover { color: var(--navy); }
        .b-admin .tab-btn.active { color: var(--navy); border-bottom-color: var(--azure); }
        .b-admin .val-chip { display: inline-block; background: var(--navy); color: var(--lime); border-radius: 999px; padding: 4px 12px; font-size: .82rem; font-weight: 700; }
        .b-admin .layout { display: grid; grid-template-columns: 360px 1fr; flex: 1; min-height: 0; }
        @media(max-width:900px) { .b-admin .layout { grid-template-columns: 1fr; } }
        
        /* LISTA */
        .b-admin .list { border-right: 1px solid var(--line); background: #fff; overflow-y: auto; }
        .b-admin .list h2 { font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; color: var(--grey); padding: 20px 22px 10px; margin: 0; }
        .b-admin .item { display: block; width: 100%; text-align: left; background: none; border: none; border-bottom: 1px solid var(--line); padding: 16px 22px; cursor: pointer; font: inherit; }
        .b-admin .item:hover { background: #F1F5FD; }
        .b-admin .item.active { background: #EAF1FE; border-left: 4px solid var(--azure); }
        .b-admin .item b { display: block; font-size: 1rem; color: var(--navy); }
        .b-admin .item small { color: var(--grey); }
        .b-admin .empty { padding: 30px 22px; color: var(--grey); }
        
        /* DETALHE */
        .b-admin .detail { padding: 34px 40px; overflow-y: auto; background: var(--off); }
        .b-admin .detail .placeholder { color: var(--grey); margin-top: 60px; text-align: center; }
        .b-admin .d-head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 6px; }
        .b-admin .d-head h2 { font-family: 'Archivo Black', sans-serif; font-size: 1.6rem; margin: 0; color: var(--navy); }
        .b-admin .d-head .meta { color: var(--grey); font-size: .9rem; width: 100%; margin: 0; }
        .b-admin .actions { margin: 14px 0 26px; display: flex; gap: 12px; flex-wrap: wrap; }
        .b-admin .actions button { font: inherit; font-weight: 700; border-radius: 999px; padding: 10px 22px; cursor: pointer; border: 1.5px solid var(--navy); background: #fff; color: var(--navy); }
        .b-admin .actions button.primary { background: var(--navy); color: var(--lime); border-color: var(--navy); }
        .b-admin .actions button.danger { border-color: #B42318; color: #B42318; }
        .b-admin .sec { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 24px 26px; margin-bottom: 20px; }
        .b-admin .sec h3 { font-family: 'Archivo Black', sans-serif; font-size: .95rem; text-transform: uppercase; color: var(--navy); border-bottom: 3px solid var(--azure); display: inline-block; padding-bottom: 6px; margin-bottom: 18px; margin-top: 0; }
        .b-admin .qa { margin-bottom: 16px; }
        .b-admin .qa .q { font-weight: 700; font-size: .92rem; color: var(--navy); }
        .b-admin .qa .a { white-space: pre-wrap; color: #33404F; margin-top: 4px; background: var(--off); border-radius: 10px; padding: 10px 14px; font-size: .95rem; min-height: 24px; }
        .b-admin .qa .a:empty::before { content: '— não respondido —'; color: #A7B0BC; }
        .b-admin .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .b-admin .tags span { background: var(--navy); color: var(--lime); border-radius: 999px; padding: 6px 14px; font-size: .82rem; font-weight: 500; }
        .b-admin .scalerow { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; font-size: .9rem; color: var(--navy); }
        .b-admin .scaleval { display: flex; gap: 6px; }
        .b-admin .scaleval i { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--azure); display: inline-block; }
        .b-admin .scaleval i.on { background: var(--azure); }
        
        @media print {
          body * { visibility: hidden; }
          .b-admin, .b-admin .detail, .b-admin .detail * { visibility: visible; }
          .b-admin .detail { position: absolute; left: 0; top: 0; width: 100%; height: auto; overflow: visible; padding: 0; background: #fff; }
          .b-admin .actions { display: none; }
          .b-admin .sec { border: none; margin-bottom: 10px; padding: 0; break-inside: avoid; }
        }
        
        .b-admin .swatch-admin-grid { display: grid; gap: 16px; margin-bottom: 24px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        .b-admin .swatch-admin-item { display: flex; flex-direction: column; gap: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px; border-radius: 14px; }
        .b-admin .swatch-admin-head { display: flex; align-items: center; gap: 12px; font-weight: 700; color: var(--navy); font-size: 1.05rem; }
        .b-admin .swatch-admin-circle { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #E5E7EB; flex-shrink: 0; }
        .b-admin .swatch-admin-desc { font-size: .92rem; color: #33404F; margin: 0; line-height: 1.5; white-space: pre-wrap; }
      `}</style>
      <div className="b-admin">
        <header className="header-b">
          <div className="dot"></div>
          <h1>Briefings Recebidos</h1>
          <span>Fontes Graphics · Painel ADM</span>
        </header>

        <div className="tabs-bar">
          <button className={`tab-btn ${tab === 'politico' ? 'active' : ''}`} onClick={() => setTab('politico')}>
            Briefings Políticos {briefings.length > 0 && `(${briefings.length})`}
          </button>
          <button className={`tab-btn ${tab === 'video' ? 'active' : ''}`} onClick={() => setTab('video')}>
            Briefings de Vídeo {videoBriefings.length > 0 && `(${videoBriefings.length})`}
          </button>
        </div>

        {tab === 'politico' && (
        <div className="layout">
          <aside className="list">
            <h2>Formulários preenchidos</h2>
            {isLoading ? (
              <p className="empty">Carregando…</p>
            ) : briefings.length === 0 ? (
              <p className="empty">Nenhum briefing recebido ainda. Compartilhe o link <b>/breefingestrategico</b> com o cliente.</p>
            ) : (
              briefings.map(b => (
                <button 
                  key={b.id} 
                  className={`item ${activeId === b.id ? 'active' : ''}`}
                  onClick={() => setActiveId(b.id)}
                >
                  <b>{b.nome}</b>
                  <small>{b.cidade} · {format(new Date(b.created_at), 'dd/MM/yyyy HH:mm')}</small>
                </button>
              ))
            )}
          </aside>
          
          <main className="detail">
            {!activeBriefing ? (
              <p className="placeholder">Selecione um briefing na lista para visualizar as respostas.</p>
            ) : (
              <>
                <div className="d-head">
                  <h2>{activeBriefing.respostas?.nome || '(sem nome)'}</h2>
                  <p className="meta">
                    {activeBriefing.cargo || ''} · {activeBriefing.cidade || ''} · recebido em {format(new Date(activeBriefing.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="actions">
                  <button className="primary" onClick={handlePrint}>Imprimir / PDF</button>
                  <button onClick={handleCopy}>Copiar respostas</button>
                  <button className="danger" onClick={handleDelete} disabled={isDeleting}>Excluir</button>
                </div>

                {SECTIONS.map((sec, idx) => (
                  <div className="sec" key={idx}>
                    <h3>{sec.t}</h3>
                    
                    {sec.t === '05 · Direção visual' && activeBriefing.respostas?.cores && activeBriefing.respostas.cores.length > 0 && (
                      <div className="qa">
                        <div className="q">5.1 Cores escolhidas & Significados</div>
                        <div className="swatch-admin-grid" style={{ marginTop: '12px' }}>
                          {activeBriefing.respostas.cores.map((corItem: any, cIdx: number) => (
                            <div className="swatch-admin-item" key={cIdx}>
                              <div className="swatch-admin-head">
                                <div className="swatch-admin-circle" style={{ backgroundColor: corItem.hex }}></div>
                                {corItem.cor}
                              </div>
                              {corItem.significado && (
                                <p className="swatch-admin-desc">{corItem.significado}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.qs.map(([k, label]) => {
                      if (!activeBriefing.respostas?.[k]) return null;
                      return (
                        <div className="qa" key={k}>
                          <div className="q">{label}</div>
                          <div className="a">{activeBriefing.respostas[k]}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div className="sec">
                  <h3>04 · Personalidade da marca</h3>
                  {SCALES.map((s, i) => {
                    const v = parseInt(activeBriefing.respostas?.[`escala_${i}`] || '0');
                    return (
                      <div className="scalerow" key={i}>
                        <span>{s[0]}</span>
                        <span className="scaleval">
                          {[1, 2, 3, 4, 5].map(n => (
                            <i key={n} className={n === v ? 'on' : ''}></i>
                          ))}
                        </span>
                        <span>{s[1]}</span>
                      </div>
                    );
                  })}

                  <div className="qa" style={{ marginTop: '14px' }}>
                    <div className="q">Palavras selecionadas</div>
                    <div className="tags">
                      {(activeBriefing.respostas?.palavras || []).length > 0 ? (
                        activeBriefing.respostas.palavras.map((p: string, i: number) => (
                          <span key={i}>{p}</span>
                        ))
                      ) : (
                        <span style={{ background: '#eee', color: '#888' }}>nenhuma</span>
                      )}
                    </div>
                  </div>

                  <div className="qa">
                    <div className="q">4.1 Comunicação que admira</div>
                    <div className="a">{activeBriefing.respostas?.q4_1 || ''}</div>
                  </div>
                </div>

                <div className="sec">
                  <h3>Seleções rápidas</h3>
                  <div className="qa">
                    <div className="q">Estilos visuais preferidos</div>
                    <div className="tags">
                      {(activeBriefing.respostas?.estilos || []).length > 0 ? (
                        activeBriefing.respostas.estilos.map((e: string, i: number) => (
                          <span key={i}>{e}</span>
                        ))
                      ) : (
                        <span style={{ background: 'transparent', color: '#888', padding: 0 }}>—</span>
                      )}
                    </div>
                  </div>
                  <div className="qa">
                    <div className="q">Onde a marca será usada</div>
                    <div className="tags">
                      {(activeBriefing.respostas?.aplicacoes || []).length > 0 ? (
                        activeBriefing.respostas.aplicacoes.map((a: string, i: number) => (
                          <span key={i}>{a}</span>
                        ))
                      ) : (
                        <span style={{ background: 'transparent', color: '#888', padding: 0 }}>—</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
        )}

        {tab === 'video' && (
          <div className="layout">
            <aside className="list">
              <h2>Briefings de vídeo</h2>
              {vLoading ? (
                <p className="empty">Carregando…</p>
              ) : videoBriefings.length === 0 ? (
                <p className="empty">Nenhum briefing de vídeo recebido ainda. Compartilhe o link <b>/briefing-video</b> com o cliente.</p>
              ) : (
                videoBriefings.map(b => (
                  <button
                    key={b.id}
                    className={`item ${activeVideoId === b.id ? 'active' : ''}`}
                    onClick={() => setActiveVideoId(b.id)}
                  >
                    <b>{b.nome}</b>
                    <small>{b.evento || '—'} · {format(new Date(b.created_at), 'dd/MM/yyyy HH:mm')}</small>
                  </button>
                ))
              )}
            </aside>

            <main className="detail">
              {!activeVideo ? (
                <p className="placeholder">Selecione um briefing de vídeo na lista para visualizar as respostas.</p>
              ) : (
                <>
                  <div className="d-head">
                    <h2>{activeVideo.nome}</h2>
                    <p className="meta">
                      {activeVideo.evento || ''}
                      {activeVideo.respostas?.tipo_video ? ` · ${activeVideo.respostas.tipo_video}` : ''}
                      {activeVideo.valor ? ` · R$ ${activeVideo.valor.toLocaleString('pt-BR')},00 (sinal R$ ${(activeVideo.valor / 2).toLocaleString('pt-BR')},00)` : ''}
                      {' · recebido em '}{format(new Date(activeVideo.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="actions">
                    <button className="primary" onClick={handlePrint}>Imprimir / PDF</button>
                    <button onClick={handleVideoCopy}>Copiar respostas</button>
                    <button className="danger" onClick={handleVideoDelete} disabled={vDeleting}>Excluir</button>
                  </div>

                  <div className="sec">
                    <h3>Tipo de vídeo e investimento</h3>
                    <div className="qa">
                      <div className="q">Tipo escolhido</div>
                      <div className="a">
                        {activeVideo.respostas?.tipo_video || '—'}
                        {activeVideo.valor ? <> · <span className="val-chip">R$ {activeVideo.valor.toLocaleString('pt-BR')},00</span></> : null}
                      </div>
                    </div>
                  </div>

                  {VIDEO_SECTIONS.map((sec, i) => (
                    <div className="sec" key={i}>
                      <h3>{sec.t}</h3>
                      {sec.rows.map(([k, label]) => (
                        <div className="qa" key={k}>
                          <div className="q">{label}</div>
                          <div className="a">{activeVideo.respostas?.[k] || ''}</div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="sec">
                    <h3>Seleções</h3>
                    {([
                      ['exibicao', 'Onde será exibido'],
                      ['sensacoes', 'Sensações'],
                      ['infos', 'Informações obrigatórias'],
                      ['formatos', 'Formatos'],
                      ['links', 'Links de referência'],
                    ] as Array<[string, string]>).map(([k, label]) => {
                      const arr = activeVideo.respostas?.[k];
                      return (
                        <div className="qa" key={k}>
                          <div className="q">{label}</div>
                          <div className="tags">
                            {Array.isArray(arr) && arr.length > 0
                              ? arr.map((v: string, idx: number) => <span key={idx}>{v}</span>)
                              : <span style={{ background: 'transparent', color: '#888', padding: 0 }}>—</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </>
  );
}
