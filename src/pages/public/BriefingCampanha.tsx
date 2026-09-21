import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// Briefing de campanha — formulário público conversado.
// Uma pergunta por tela, a maioria em clique. Botão visível em toda
// etapa (no celular não existe Enter). Os anexos vão para o Storage
// do Supabase pela edge function briefing-campanha.
// ============================================================

type Tipo =
    | 'intro' | 'texto' | 'escolha' | 'multipla' | 'tres' | 'longo'
    | 'cores' | 'frase' | 'upload' | 'links' | 'escala' | 'fim';

interface Passo {
    id: string;
    tipo: Tipo;
    bloco: number;
    pergunta: string;
    ajuda?: string;
    placeholder?: string;
    opcoes?: { valor: string; titulo: string; nota?: string }[];
    chips?: string[];
    campos?: string[];
    obrigatorio?: boolean;
    extremos?: [string, string];
}

const BLOCOS = [
    'Boas-vindas',
    'Quem pede',
    'O projeto',
    'As peças',
    'O visual',
    'Arquivos',
    'Fechamento',
];

const PASSOS: Passo[] = [
    { id: 'intro', tipo: 'intro', bloco: 0, pergunta: 'Vamos montar sua campanha.', ajuda: 'Umas 20 perguntas rápidas, a maioria é só tocar. No meio do caminho você vai ver a arte tomando forma na tela.' },

    // 1 — Quem pede
    { id: 'nome', tipo: 'texto', bloco: 1, pergunta: 'Como você se chama?', placeholder: 'Seu nome', obrigatorio: true },
    { id: 'cargo', tipo: 'escolha', bloco: 1, pergunta: 'E o que você faz na instituição?', opcoes: [
        { valor: 'Direção', titulo: 'Direção' },
        { valor: 'Coordenação', titulo: 'Coordenação' },
        { valor: 'Marketing e Comunicação', titulo: 'Marketing e Comunicação' },
        { valor: 'Secretaria', titulo: 'Secretaria' },
        { valor: 'Outro', titulo: 'Outra função' },
    ] },
    { id: 'whatsapp', tipo: 'texto', bloco: 1, pergunta: 'Qual WhatsApp eu chamo se precisar?', placeholder: '(73) 9 9999-9999', obrigatorio: true },
    { id: 'email', tipo: 'texto', bloco: 1, pergunta: 'E o seu e-mail?', placeholder: 'voce@instituicao.com.br', obrigatorio: true },

    // 2 — O projeto
    { id: 'projeto', tipo: 'longo', bloco: 2, pergunta: 'Me conta sobre o projeto.', ajuda: 'Do seu jeito, sem formalidade. O que é, por que estão fazendo agora, o que precisa acontecer.', placeholder: 'Ex.: campanha de matrículas 2027, queremos mostrar as aprovações e encher o Ensino Médio', obrigatorio: true },
    { id: 'tipo', tipo: 'escolha', bloco: 2, pergunta: 'Que tipo de campanha é?', opcoes: [
        { valor: 'Matrículas', titulo: 'Matrículas' },
        { valor: 'Evento', titulo: 'Evento ou data comemorativa' },
        { valor: 'Institucional', titulo: 'Institucional' },
        { valor: 'Outro', titulo: 'Outra coisa' },
    ] },
    { id: 'publico', tipo: 'texto', bloco: 2, pergunta: 'Quem vai ver essas peças?', ajuda: 'Muda bastante a arte: pai de aluno pequeno e aluno de Ensino Médio não olham a mesma coisa.', placeholder: 'Ex.: pais e alunos do Ensino Médio' },
    { id: 'tom', tipo: 'escala', bloco: 2, pergunta: 'Que tom a arte deve ter?', extremos: ['Sóbrio, institucional', 'Jovem, energético'] },

    // 3 — As peças
    { id: 'medidas', tipo: 'longo', bloco: 3, pergunta: 'Alguma medida ou exigência da gráfica?', ajuda: 'Se já souberem, adianta muito. Se não souberem, deixa em branco que eu pergunto depois.', placeholder: 'Ex.: outdoor 9x3m, folder A4 dobrado em 3, pasta com bolso' },
    { id: 'textos', tipo: 'longo', bloco: 3, pergunta: 'O que precisa estar escrito nas peças?', ajuda: 'Endereço, telefone, datas, descontos, selos, logos de parceiros — tudo que for obrigatório.', placeholder: 'Ex.: Rua X, 123 · (73) 9 9999-9999 · @colegio · matrículas até 30/10' },

    // 4 — O visual
    { id: 'cores', tipo: 'cores', bloco: 4, pergunta: 'Que cores você imagina?', ajuda: 'Arrasta, troca, testa — a arte ao lado muda junto.' },
    { id: 'frase', tipo: 'frase', bloco: 4, pergunta: 'Tem alguma frase para a campanha?', ajuda: 'Escreve e olha ela aparecer na arte. Se não tiver ideia, deixa em branco — essa parte é comigo.' },
    { id: 'estilo', tipo: 'multipla', bloco: 4, pergunta: 'Que clima a arte precisa ter?', chips: ['Sofisticado', 'Moderno', 'Clássico', 'Jovem', 'Acolhedor', 'Impactante', 'Minimalista', 'Colorido', 'Sério'] },
    { id: 'referencias', tipo: 'links', bloco: 4, pergunta: 'Me mostra referências que você gosta.', ajuda: 'Cola links do Pinterest, Instagram, site — ou de qualquer arte que te agrade.' },
    { id: 'naogosta', tipo: 'longo', bloco: 4, pergunta: 'E alguma coisa que você não quer de jeito nenhum?', ajuda: 'Elimina um caminho inteiro antes de eu gastar uma rodada nele.', placeholder: 'Ex.: nada de fundo escuro, sem foto de banco de imagem' },

    // 5 — Arquivos
    { id: 'fotos', tipo: 'upload', bloco: 5, pergunta: 'Onde estão as fotos?', ajuda: 'Cola o link da pasta — Drive, WeTransfer, Dropbox. É o melhor caminho: a foto chega no tamanho original, sem perder qualidade.', obrigatorio: true },
    { id: 'marca', tipo: 'links', bloco: 5, pergunta: 'E os arquivos da marca?', ajuda: 'Logo em vetor, manual de marca e logos de parceiros. Link da pasta ou do site.' },

    // 6 — Fechamento
    { id: 'prazo', tipo: 'texto', bloco: 6, pergunta: 'Para quando você precisa?', placeholder: 'Ex.: 15 de outubro', obrigatorio: true },
    { id: 'livre', tipo: 'longo', bloco: 6, pergunta: 'Mais alguma coisa que eu precise saber?', placeholder: 'Fica à vontade' },

    { id: 'fim', tipo: 'fim', bloco: 6, pergunta: 'É isso. O briefing já está comigo.' },
];

const PADRAO = { c1: '#12336E', c2: '#3DD6A3' };

const CSS = `
.bc-root{
  --paper:#FAF9F7; --card:#FFF; --ink:#101A2B; --ink-soft:#54627A; --ink-mute:#8A96A8;
  --line:#E3E0DA; --navy:#12336E; --mint:#0E8C68; --mint-soft:#E8F5EF; --warm:#C2542F;
  min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:"Hanken Grotesk",system-ui,-apple-system,sans-serif; font-size:16px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.bc-root *{box-sizing:border-box}
.bc-shell{display:grid; grid-template-columns:270px 1fr; min-height:100vh}

.bc-rail{background:var(--navy); color:#fff; padding:34px 28px;
  display:flex; flex-direction:column; gap:30px; position:sticky; top:0; height:100vh}
.bc-brand{font-family:Fraunces,Georgia,serif; font-weight:700; font-size:20px; line-height:1.15; letter-spacing:-.01em}
.bc-brand small{display:block; font-family:"Hanken Grotesk",sans-serif; font-weight:500; font-size:11.5px;
  letter-spacing:.14em; text-transform:uppercase; opacity:.62; margin-bottom:9px}
.bc-blocos{list-style:none; margin:0; padding:0; display:grid; gap:1px; flex:1}
.bc-blocos li{display:flex; align-items:center; gap:11px; font-size:13.5px; padding:7px 0;
  color:rgba(255,255,255,.42); transition:color .3s}
.bc-blocos li .n{width:20px; height:20px; border-radius:50%; border:1.5px solid currentColor;
  display:grid; place-items:center; font-size:10.5px; font-weight:700; flex:none}
.bc-blocos li.feito{color:rgba(255,255,255,.7)}
.bc-blocos li.feito .n{background:var(--mint); border-color:var(--mint); color:var(--navy)}
.bc-blocos li.ativo{color:#fff; font-weight:600}
.bc-blocos li.ativo .n{border-color:var(--mint); color:var(--mint)}
.bc-railfoot{font-size:12px; opacity:.5; line-height:1.45}

.bc-mob{display:none}

.bc-main{display:flex; flex-direction:column; min-height:100vh}
.bc-prog{height:3px; background:var(--line)}
.bc-prog span{display:block; height:100%; background:var(--mint); transition:width .55s cubic-bezier(.4,0,.2,1)}
.bc-stage{flex:1; padding:64px 56px 96px; max-width:920px}
.bc-step{animation:bcrise .5s cubic-bezier(.2,.7,.3,1) both}
@keyframes bcrise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.bc-step{animation:none}}

.bc-eyebrow{font-size:11.5px; font-weight:700; letter-spacing:.15em; text-transform:uppercase;
  color:var(--mint); margin:0 0 16px; display:flex; align-items:center; gap:10px}
.bc-eyebrow::after{content:""; flex:1; height:1px; background:var(--line); max-width:70px}
.bc-q{font-family:Fraunces,Georgia,serif; font-weight:600; font-size:clamp(30px,4.4vw,44px);
  line-height:1.12; letter-spacing:-.02em; margin:0; text-wrap:balance; max-width:17ch}
.bc-help{color:var(--ink-soft); margin:16px 0 0; max-width:48ch; font-size:16px}

.bc-cards{display:grid; gap:11px; margin-top:34px; max-width:540px}
.bc-opt{display:flex; align-items:center; gap:16px; width:100%; text-align:left; background:var(--card);
  border:1px solid var(--line); border-radius:14px; padding:18px 20px; font:inherit; color:var(--ink);
  cursor:pointer; box-shadow:0 1px 2px rgba(16,26,43,.04);
  transition:border-color .16s, transform .16s, box-shadow .16s}
.bc-opt:hover{border-color:var(--navy); transform:translateY(-2px); box-shadow:0 8px 22px -12px rgba(16,26,43,.3)}
.bc-opt:focus-visible{outline:2px solid var(--mint); outline-offset:3px}
.bc-key{font-size:11.5px; font-weight:700; color:var(--ink-mute); border:1px solid var(--line);
  border-radius:8px; width:28px; height:28px; display:grid; place-items:center; flex:none}
.bc-opt:hover .bc-key{border-color:var(--navy); color:var(--navy)}
.bc-opt strong{font-weight:600; display:block; font-size:16.5px}
.bc-opt small{color:var(--ink-mute); font-size:13.5px}

.bc-chips{display:flex; flex-wrap:wrap; gap:9px; margin-top:32px; max-width:640px}
.bc-chip{background:var(--card); border:1px solid var(--line); border-radius:999px; padding:11px 19px;
  font:inherit; font-size:15px; color:var(--ink); cursor:pointer; transition:all .16s}
.bc-chip:hover{border-color:var(--navy)}
.bc-chip[aria-pressed="true"]{background:var(--navy); border-color:var(--navy); color:#fff}
.bc-chip:focus-visible{outline:2px solid var(--mint); outline-offset:3px}

.bc-line{width:100%; max-width:560px; margin-top:32px; background:transparent; border:0;
  border-bottom:2px solid var(--line); padding:10px 2px; font-family:Fraunces,Georgia,serif;
  font-size:clamp(22px,3vw,30px); color:var(--ink); outline:none; transition:border-color .2s}
.bc-line::placeholder{color:var(--ink-mute); opacity:.45}
.bc-line:focus{border-color:var(--mint)}

.bc-stack{display:grid; gap:12px; margin-top:30px; max-width:560px}
.bc-stack input, .bc-area{background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:16px 18px; font:inherit; font-size:16px; color:var(--ink); outline:none; width:100%;
  box-shadow:0 1px 2px rgba(16,26,43,.04)}
.bc-stack input:focus, .bc-area:focus{border-color:var(--mint)}
.bc-area{margin-top:30px; max-width:600px; min-height:150px; resize:vertical; line-height:1.55}

.bc-go{margin-top:36px; display:inline-flex; align-items:center; gap:10px; background:var(--navy);
  color:#fff; border:0; border-radius:12px; padding:16px 30px; font:inherit; font-weight:600;
  font-size:16px; cursor:pointer; box-shadow:0 8px 20px -12px rgba(18,51,110,.8);
  transition:background .16s, transform .16s}
.bc-go:hover{background:var(--mint); transform:translateY(-2px)}
.bc-go:disabled{opacity:.4; cursor:not-allowed; transform:none; box-shadow:none}
.bc-go:focus-visible{outline:2px solid var(--mint); outline-offset:3px}
.bc-hint{margin-top:14px; font-size:13px; color:var(--ink-mute)}
.bc-so-desktop{display:none}
@media(hover:hover) and (pointer:fine){.bc-so-desktop{display:block}}
.bc-back{background:none; border:0; color:var(--ink-mute); font:inherit; font-size:14px; cursor:pointer;
  text-decoration:underline; margin-top:26px; display:block; padding:6px 0}

.bc-split{display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:start; margin-top:34px}
.bc-colorset{display:grid; gap:14px; max-width:340px}
.bc-pick{display:flex; align-items:center; gap:15px; background:var(--card); border:1px solid var(--line);
  border-radius:14px; padding:14px 16px; cursor:pointer; box-shadow:0 1px 2px rgba(16,26,43,.04)}
.bc-pick input{width:46px; height:46px; border:0; border-radius:10px; background:none; cursor:pointer; padding:0; flex:none}
.bc-pick b{display:block; font-size:15px; font-weight:600}
.bc-pick code{font-size:13px; color:var(--ink-mute); font-family:ui-monospace,monospace}
.bc-plabel{font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-mute);
  margin:0 0 12px; font-weight:700}

.bc-od{position:relative; aspect-ratio:16/9; border-radius:12px; overflow:hidden;
  box-shadow:0 24px 48px -26px rgba(16,26,43,.6); transition:background .35s}
.bc-od i{position:absolute; display:block; transition:background .35s}
.bc-od .s1{width:30%;height:12%;right:6%;top:16%;border-radius:3px}
.bc-od .s2{width:12%;height:34%;right:24%;top:16%;border-radius:3px}
.bc-od .s3{width:22%;height:11%;right:6%;top:47%;border-radius:3px;opacity:.55}
.bc-person{position:absolute;right:8%;bottom:0;width:26%;height:72%;background:rgba(255,255,255,.14);border-radius:46% 46% 0 0}
.bc-person::after{content:"";position:absolute;left:50%;top:-14%;transform:translateX(-50%);width:42%;
  aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.14)}
.bc-odcopy{position:absolute;left:7%;bottom:13%;width:58%}
.bc-odcopy h3{font-family:Fraunces,Georgia,serif;font-weight:700;color:#fff;font-size:clamp(15px,2.9vw,26px);
  line-height:1.04;margin:0;text-transform:uppercase;letter-spacing:-.01em;text-wrap:balance}
.bc-odtag{position:absolute;left:7%;top:11%;color:#fff;font-size:clamp(8px,1.4vw,11px);font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;opacity:.8}
.bc-odfoot{position:absolute;left:7%;bottom:5.5%;color:#fff;opacity:.55;font-size:clamp(7px,1.1vw,9.5px);
  letter-spacing:.12em;text-transform:uppercase}

.bc-drop{margin-top:14px; max-width:560px; border:1.5px dashed var(--line); border-radius:14px;
  background:var(--card); padding:26px 24px; text-align:center; cursor:pointer; transition:all .16s; display:block}
.bc-drop:hover{border-color:var(--mint); background:var(--mint-soft)}
.bc-drop b{display:block; font-size:15.5px}
.bc-drop small{color:var(--ink-mute); font-size:13.5px}
.bc-files{display:grid; gap:7px; margin-top:14px; max-width:560px}
.bc-file{display:flex; justify-content:space-between; align-items:center; gap:12px; background:var(--card);
  border:1px solid var(--line); border-radius:10px; padding:11px 14px; font-size:14.5px}
.bc-file small{color:var(--ink-mute); flex:none}
.bc-file button{background:none; border:0; color:var(--warm); cursor:pointer; font:inherit; font-size:13px}

.bc-react{display:inline-flex; align-items:center; gap:9px; background:var(--mint-soft); color:var(--mint);
  border-radius:999px; padding:8px 17px; font-size:14.5px; font-weight:600; margin-bottom:22px}
.bc-err{background:#FBEAE5; color:#9B3B20; border-radius:12px; padding:16px 18px; margin-top:22px;
  max-width:560px; font-size:14.5px}
.bc-scale{display:flex; gap:9px; margin-top:32px; max-width:460px}
.bc-scale button{flex:1; background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:20px 0; font:inherit; font-size:18px; font-weight:600; color:var(--ink); cursor:pointer;
  box-shadow:0 1px 2px rgba(16,26,43,.04); transition:all .16s}
.bc-scale button:hover, .bc-scale button[aria-pressed="true"]{background:var(--navy); border-color:var(--navy); color:#fff}
.bc-ends{display:flex; justify-content:space-between; max-width:460px; margin-top:10px; font-size:12.5px; color:var(--ink-mute)}
.bc-done{background:var(--card); border:1px solid var(--line); border-radius:18px; padding:30px;
  margin-top:30px; max-width:600px; box-shadow:0 12px 32px -20px rgba(16,26,43,.4)}
.bc-done dl{display:grid; gap:13px; margin:0}
.bc-done .row{display:flex; gap:18px; justify-content:space-between; align-items:baseline;
  border-bottom:1px solid var(--line); padding-bottom:11px}
.bc-done .row:last-child{border-bottom:0; padding-bottom:0}
.bc-done dt{color:var(--ink-mute); font-size:13.5px; flex:none}
.bc-done dd{margin:0; font-weight:600; text-align:right}
.bc-sw{display:inline-block;width:15px;height:15px;border-radius:4px;vertical-align:-2px;margin-right:5px;border:1px solid rgba(0,0,0,.12)}

@media(max-width:900px){
  .bc-shell{grid-template-columns:1fr}
  .bc-rail{display:none}
  .bc-mob{display:flex; align-items:center; justify-content:space-between; gap:12px;
    background:var(--navy); color:#fff; padding:13px 18px; font-size:12.5px; position:sticky; top:0; z-index:5}
  .bc-mob b{font-weight:600; font-size:13.5px}
  .bc-mob span{opacity:.65}
  .bc-stage{padding:38px 20px 72px}
  .bc-q{font-size:28px; max-width:100%}
  .bc-help{font-size:15.5px}
  .bc-split{grid-template-columns:1fr; gap:26px}
  .bc-go{width:100%; justify-content:center; padding:18px 24px; font-size:16.5px; margin-top:30px}
  .bc-opt{padding:18px 16px}
  .bc-chip{padding:12px 18px}
  .bc-scale button{padding:22px 0}
  .bc-key{display:none}
  .bc-line{font-size:22px}
}
`;

function Outdoor({ c1, c2, frase }: { c1: string; c2: string; frase: string }) {
    const t = frase.trim();
    let l1 = 'Resultado não é sorte,';
    let l2 = 'é preparação.';
    if (t) {
        const p = t.split(/,|\./).filter((x) => x.trim());
        if (p.length > 1) { l1 = p[0].trim() + ','; l2 = p.slice(1).join(' ').trim(); }
        else { l1 = ''; l2 = t; }
    }
    return (
        <div className="bc-od" style={{ background: c1 }}>
            <i className="s1" style={{ background: c2 }} />
            <i className="s2" style={{ background: c2 }} />
            <i className="s3" style={{ background: c2 }} />
            <div className="bc-person" />
            <span className="bc-odtag">Matrículas 2027</span>
            <div className="bc-odcopy">
                <h3>{l1 && <>{l1}<br /></>}<span style={{ color: c2 }}>{l2}</span></h3>
            </div>
            <span className="bc-odfoot">Colégio Universitário · Teixeira de Freitas</span>
        </div>
    );
}

export default function BriefingCampanha() {
    const [i, setI] = useState(0);
    const [resp, setResp] = useState<Record<string, any>>({
        instituicao: 'Colégio Universitário',
        cidade: 'Teixeira de Freitas - BA',
    });
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [resultado, setResultado] = useState<{ enviados: number } | null>(null);
    const [progresso, setProgresso] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const passo = PASSOS[i];
    const total = PASSOS.length - 1;
    const pct = Math.round((i / total) * 100);
    const mins = Math.max(1, Math.round(10 - (i / total) * 9));

    const set = (id: string, v: any) => setResp((p) => ({ ...p, [id]: v }));

    const avancar = useCallback(() => {
        setErro(null);
        setI((n) => Math.min(n + 1, total));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [total]);

    const voltar = () => { setI((n) => Math.max(n - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 340);
        return () => clearTimeout(t);
    }, [i]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (passo.tipo !== 'escolha' || !passo.opcoes) return;
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= passo.opcoes.length) { set(passo.id, passo.opcoes[n - 1].valor); avancar(); }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [passo, avancar]);

    const toBase64 = (f: File): Promise<string> =>
        new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result).split(',')[1]);
            r.onerror = rej;
            r.readAsDataURL(f);
        });

    const enviar = async () => {
        setEnviando(true);
        setErro(null);
        try {
            setProgresso('Enviando suas respostas...');
            const { data, error } = await supabase.functions.invoke('briefing-campanha', {
                body: {
                    action: 'SUBMIT',
                    nome: resp.nome || 'Sem nome',
                    cidade: resp.cidade,
                    cargo: resp.cargo || null,
                    respostas: resp,
                },
            });
            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            let enviados = 0;
            for (let k = 0; k < arquivos.length; k++) {
                const f = arquivos[k];
                setProgresso(`Enviando arquivo ${k + 1} de ${arquivos.length}: ${f.name}`);
                try {
                    const base64 = await toBase64(f);
                    const up = await supabase.functions.invoke('briefing-campanha', {
                        body: { action: 'UPLOAD', briefing_id: data.briefing_id, name: f.name, mime: f.type, base64 },
                    });
                    if (!up.error && !up.data?.error) enviados++;
                } catch { /* segue para o próximo */ }
            }

            setResultado({ enviados });
            setProgresso('');
            setI(total);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não consegui enviar agora. Tente de novo em instantes.');
        } finally {
            setEnviando(false);
        }
    };

    const podeAvancar = !passo.obrigatorio || String(resp[passo.id] || '').trim().length > 0;
    const c1 = resp.c1 || PADRAO.c1;
    const c2 = resp.c2 || PADRAO.c2;

    return (
        <div className="bc-root">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" />
            <style>{CSS}</style>

            <div className="bc-shell">
                <aside className="bc-rail">
                    <div className="bc-brand">
                        <small>Briefing de campanha</small>
                        Colégio Universitário
                    </div>
                    <ol className="bc-blocos">
                        {BLOCOS.slice(1).map((b, n) => {
                            const num = n + 1;
                            const cls = passo.bloco === num ? 'ativo' : passo.bloco > num ? 'feito' : '';
                            return (
                                <li key={b} className={cls}>
                                    <span className="n">{passo.bloco > num ? '✓' : num}</span>
                                    {b}
                                </li>
                            );
                        })}
                    </ol>
                    <div className="bc-railfoot">
                        Matrículas 2027 · Teixeira de Freitas<br />
                        {i === total ? 'Concluído' : `cerca de ${mins} min restantes`}
                    </div>
                </aside>

                <div className="bc-main">
                    <div className="bc-mob">
                        <b>{BLOCOS[passo.bloco]}</b>
                        <span>{i === total ? 'Concluído' : `${mins} min`}</span>
                    </div>
                    <div className="bc-prog"><span style={{ width: `${pct}%` }} /></div>

                    <main className="bc-stage">
                        <section className="bc-step" key={passo.id}>
                            {passo.bloco > 0 && passo.tipo !== 'fim' && (
                                <p className="bc-eyebrow">{BLOCOS[passo.bloco]}</p>
                            )}
                            {passo.id === 'cargo' && resp.nome && (
                                <p className="bc-react">Prazer, {String(resp.nome).split(' ')[0]} 👋</p>
                            )}
                            {passo.tipo === 'fim' && <p className="bc-react">Pronto ✓</p>}

                            <h1 className="bc-q">{passo.pergunta}</h1>
                            {passo.ajuda && <p className="bc-help">{passo.ajuda}</p>}

                            {passo.tipo === 'intro' && (
                                <>
                                    <button className="bc-go" onClick={avancar}>Começar &nbsp;→</button>
                                    <p className="bc-hint">Cerca de 10 minutos. Pode parar e voltar depois.</p>
                                </>
                            )}

                            {passo.tipo === 'texto' && (
                                <>
                                    <input
                                        ref={inputRef as any}
                                        className="bc-line"
                                        placeholder={passo.placeholder}
                                        value={resp[passo.id] || ''}
                                        type={passo.id === 'email' ? 'email' : passo.id === 'whatsapp' ? 'tel' : 'text'}
                                        inputMode={passo.id === 'whatsapp' ? 'tel' : passo.id === 'email' ? 'email'
                                            : ['meta', 'vagas', 'quantosalunos'].indexOf(passo.id) >= 0 ? 'numeric' : 'text'}
                                        enterKeyHint="next"
                                        autoComplete={passo.id === 'email' ? 'email' : passo.id === 'whatsapp' ? 'tel' : passo.id === 'nome' ? 'name' : 'off'}
                                        onChange={(e) => set(passo.id, e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && podeAvancar) avancar(); }}
                                    />
                                    <button className="bc-go" onClick={avancar} disabled={!podeAvancar}>Continuar &nbsp;→</button>
                                    <p className="bc-hint bc-so-desktop">ou aperte Enter</p>
                                </>
                            )}

                            {passo.tipo === 'escolha' && (
                                <div className="bc-cards">
                                    {passo.opcoes?.map((o, n) => (
                                        <button key={o.valor} className="bc-opt" onClick={() => { set(passo.id, o.valor); avancar(); }}>
                                            <span className="bc-key">{n + 1}</span>
                                            <span><strong>{o.titulo}</strong>{o.nota && <small>{o.nota}</small>}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {passo.tipo === 'multipla' && (
                                <>
                                    <div className="bc-chips">
                                        {passo.chips?.map((c) => {
                                            const sel: string[] = resp[passo.id] || [];
                                            const on = sel.indexOf(c) >= 0;
                                            return (
                                                <button key={c} className="bc-chip" aria-pressed={on}
                                                    onClick={() => set(passo.id, on ? sel.filter((x) => x !== c) : [...sel, c])}>
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                                </>
                            )}

                            {passo.tipo === 'tres' && (
                                <>
                                    <div className="bc-stack">
                                        {passo.campos?.map((ph, n) => (
                                            <input key={n} ref={n === 0 ? (inputRef as any) : undefined} placeholder={ph}
                                                enterKeyHint="next"
                                                value={(resp[passo.id] || [])[n] || ''}
                                                onChange={(e) => {
                                                    const arr = [...(resp[passo.id] || ['', '', ''])];
                                                    arr[n] = e.target.value;
                                                    set(passo.id, arr);
                                                }} />
                                        ))}
                                    </div>
                                    <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                                </>
                            )}

                            {passo.tipo === 'longo' && (
                                <>
                                    <textarea ref={inputRef as any} className="bc-area" placeholder={passo.placeholder}
                                        value={resp[passo.id] || ''} onChange={(e) => set(passo.id, e.target.value)} />
                                    <button className="bc-go" onClick={avancar} disabled={!podeAvancar}>Continuar &nbsp;→</button>
                                </>
                            )}

                            {passo.tipo === 'escala' && (
                                <>
                                    <div className="bc-scale">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button key={n} aria-pressed={resp[passo.id] === n}
                                                onClick={() => { set(passo.id, n); avancar(); }}>{n}</button>
                                        ))}
                                    </div>
                                    <div className="bc-ends"><span>{passo.extremos?.[0]}</span><span>{passo.extremos?.[1]}</span></div>
                                </>
                            )}

                            {passo.tipo === 'cores' && (
                                <div className="bc-split">
                                    <div>
                                        <div className="bc-colorset">
                                            <label className="bc-pick">
                                                <input type="color" value={c1} onChange={(e) => set('c1', e.target.value)} />
                                                <div><b>Cor principal</b><code>{c1.toUpperCase()}</code></div>
                                            </label>
                                            <label className="bc-pick">
                                                <input type="color" value={c2} onChange={(e) => set('c2', e.target.value)} />
                                                <div><b>Cor de destaque</b><code>{c2.toUpperCase()}</code></div>
                                            </label>
                                        </div>
                                        <button className="bc-go" onClick={avancar}>Gostei &nbsp;→</button>
                                    </div>
                                    <div>
                                        <p className="bc-plabel">Seu outdoor, ao vivo</p>
                                        <Outdoor c1={c1} c2={c2} frase={resp.frase || ''} />
                                        <p className="bc-hint">Rascunho para sentir a cor — não é a arte final.</p>
                                    </div>
                                </div>
                            )}

                            {passo.tipo === 'frase' && (
                                <div className="bc-split">
                                    <div>
                                        <input ref={inputRef as any} className="bc-line" style={{ fontSize: 22 }}
                                            enterKeyHint="next" autoComplete="off"
                                            placeholder="Digite a frase..." value={resp.frase || ''}
                                            onChange={(e) => set('frase', e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') avancar(); }} />
                                        <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                                    </div>
                                    <div>
                                        <p className="bc-plabel">Seu outdoor, ao vivo</p>
                                        <Outdoor c1={c1} c2={c2} frase={resp.frase || ''} />
                                    </div>
                                </div>
                            )}

                            {passo.tipo === 'links' && (
                                <>
                                    <div className="bc-stack">
                                        {[0, 1, 2].map((n) => (
                                            <input key={n} ref={n === 0 ? (inputRef as any) : undefined}
                                                enterKeyHint="next" inputMode="url"
                                                placeholder={n === 0 ? 'Cole um link aqui' : 'Outro link (opcional)'}
                                                value={(resp[passo.id] || [])[n] || ''}
                                                onChange={(e) => {
                                                    const arr = [...(resp[passo.id] || ['', '', ''])];
                                                    arr[n] = e.target.value;
                                                    set(passo.id, arr);
                                                }} />
                                        ))}
                                    </div>
                                    <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                                </>
                            )}

                            {passo.tipo === 'upload' && (
                                <>
                                    <div className="bc-stack">
                                        {[0, 1].map((n) => (
                                            <input key={n} ref={n === 0 ? (inputRef as any) : undefined}
                                                enterKeyHint="next" inputMode="url"
                                                placeholder={n === 0 ? 'Cole aqui o link da pasta de fotos' : 'Outro link (opcional)'}
                                                value={(resp.links_arquivos || [])[n] || ''}
                                                onChange={(e) => {
                                                    const arr = [...(resp.links_arquivos || ['', ''])];
                                                    arr[n] = e.target.value;
                                                    set('links_arquivos', arr);
                                                    set('fotos', arr.filter(Boolean).join(' · '));
                                                }} />
                                        ))}
                                    </div>
                                    <p className="bc-hint" style={{ marginTop: 22 }}>Não tem link? Anexa por aqui:</p>
                                    <label className="bc-drop" htmlFor="bc-files">
                                        <b>Anexar arquivos</b>
                                        <small>melhor para coisas leves, como o logo ou um PDF</small>
                                    </label>
                                    <input id="bc-files" type="file" multiple hidden
                                        onChange={(e) => {
                                            setArquivos((p) => [...p, ...Array.from(e.target.files || [])]);
                                            e.target.value = '';
                                        }} />
                                    {arquivos.length > 0 && (
                                        <div className="bc-files">
                                            {arquivos.map((f, n) => (
                                                <div className="bc-file" key={n}>
                                                    <span>{f.name}</span>
                                                    <small>{(f.size / 1024 / 1024).toFixed(1)} MB</small>
                                                    <button onClick={() => setArquivos((p) => p.filter((_, x) => x !== n))}>remover</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button className="bc-go" onClick={avancar} disabled={!podeAvancar}>Continuar &nbsp;→</button>
                                </>
                            )}

                            {passo.tipo === 'fim' && (
                                <>
                                    {!resultado ? (
                                        <>
                                            <p className="bc-help">
                                                Confere se está tudo certo e envia.
                                                {arquivos.length > 0 && ` ${arquivos.length} arquivo(s) vão junto.`}
                                            </p>
                                            <div className="bc-done">
                                                <dl>
                                                    <div className="row"><dt>Quem respondeu</dt><dd>{resp.nome || '—'}{resp.cargo ? ` · ${resp.cargo}` : ''}</dd></div>
                                                    <div className="row"><dt>Tipo</dt><dd>{resp.tipo || '—'}</dd></div>
                                                    <div className="row"><dt>Quem vai ver</dt><dd>{resp.publico || '—'}</dd></div>
                                                    <div className="row"><dt>Cores</dt><dd>
                                                        <span className="bc-sw" style={{ background: c1 }} />{c1.toUpperCase()}
                                                        &nbsp; <span className="bc-sw" style={{ background: c2 }} />{c2.toUpperCase()}
                                                    </dd></div>
                                                    <div className="row"><dt>Frase</dt><dd>{resp.frase || 'a criar'}</dd></div>
                                                    <div className="row"><dt>Prazo</dt><dd>{resp.prazo || '—'}</dd></div>
                                                </dl>
                                            </div>
                                            {erro && <div className="bc-err">{erro}</div>}
                                            {progresso && <p className="bc-hint">{progresso}</p>}
                                            <button className="bc-go" onClick={enviar} disabled={enviando}>
                                                {enviando ? 'Enviando...' : 'Enviar briefing  →'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="bc-help">
                                                Levou menos que um café. Vou usar exatamente o que você respondeu — e
                                                chamo no WhatsApp se faltar alguma coisa.
                                            </p>
                                            <div className="bc-done">
                                                <p style={{ margin: 0 }}>
                                                    <b>{resultado.enviados}</b> arquivo(s) guardado(s) com segurança.<br />
                                                    <span style={{ color: 'var(--ink-soft)', fontSize: 14.5 }}>
                                                        Suas respostas já estão com a equipe da Fontes Graphics.
                                                    </span>
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {i > 0 && i < total && <button className="bc-back" onClick={voltar}>← voltar</button>}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
