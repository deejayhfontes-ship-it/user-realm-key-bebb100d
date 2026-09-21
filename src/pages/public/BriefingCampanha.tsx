import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// Briefing de campanha — formulário público conversado.
// Uma pergunta por tela, a maioria em clique. Anexos vão para
// uma pasta no Google Drive criada pela edge function.
// ============================================================

type Tipo = 'intro' | 'texto' | 'escolha' | 'multipla' | 'tres' | 'longo' | 'cores' | 'frase' | 'upload' | 'links' | 'escala' | 'fim';

interface Passo {
    id: string;
    tipo: Tipo;
    kicker?: string;
    pergunta: string;
    ajuda?: string;
    placeholder?: string;
    opcoes?: { valor: string; titulo: string; nota?: string }[];
    chips?: string[];
    campos?: string[];
    obrigatorio?: boolean;
    extremos?: [string, string];
}

const PASSOS: Passo[] = [
    { id: 'intro', tipo: 'intro', pergunta: 'Vamos montar a campanha juntos.', ajuda: 'Sem formulário chato. São perguntas rápidas, a maioria é só clicar — e no meio do caminho você vê a campanha tomando forma na tela.' },

    { id: 'nome', tipo: 'texto', kicker: 'Para começar', pergunta: 'Como você se chama?', placeholder: 'Seu nome', obrigatorio: true },
    { id: 'cargo', tipo: 'escolha', pergunta: 'E o que você faz na escola?', opcoes: [
        { valor: 'Direção', titulo: 'Direção' },
        { valor: 'Coordenação pedagógica', titulo: 'Coordenação pedagógica' },
        { valor: 'Marketing e Comunicação', titulo: 'Marketing e Comunicação' },
        { valor: 'Secretaria', titulo: 'Secretaria' },
        { valor: 'Outro', titulo: 'Outra função' },
    ] },
    { id: 'whatsapp', tipo: 'texto', pergunta: 'Qual WhatsApp eu chamo se precisar?', placeholder: '(73) 9 9999-9999', obrigatorio: true },
    { id: 'email', tipo: 'texto', pergunta: 'E o seu e-mail?', placeholder: 'voce@colegio.com.br', obrigatorio: true },
    { id: 'aprovador', tipo: 'texto', pergunta: 'Quem dá a palavra final na arte?', ajuda: 'Uma pessoa só. Aprovação por comitê é o que mais atrasa campanha.', placeholder: 'Nome e cargo — ou "sou eu mesmo"' },

    { id: 'objetivo', tipo: 'escolha', kicker: 'O norte da campanha', pergunta: 'Se a campanha acertasse em uma só coisa, qual seria?', ajuda: 'Escolhe uma. É ela que vai mandar em tudo depois.', opcoes: [
        { valor: 'Trazer alunos novos', titulo: 'Trazer alunos novos', nota: 'Quem ainda não conhece a escola' },
        { valor: 'Segurar a rematrícula', titulo: 'Segurar quem já está aqui', nota: 'Rematrícula em primeiro lugar' },
        { valor: 'Fortalecer a marca', titulo: 'Fortalecer o nome da escola', nota: 'Ser a referência da cidade' },
        { valor: 'Mostrar as aprovações', titulo: 'Mostrar as aprovações', nota: 'Deixar o resultado falar' },
    ] },
    { id: 'series', tipo: 'multipla', pergunta: 'Quais séries precisam encher?', ajuda: 'Pode marcar mais de uma — mas se marcar todas, a campanha fica genérica.', chips: ['Infantil', 'Fund. I', 'Fund. II', '1º ano EM', '2º ano EM', '3º ano EM', 'Pré-vestibular'] },
    { id: 'meta', tipo: 'texto', pergunta: 'Quantas matrículas novas vocês querem?', ajuda: 'Um número, mesmo que seja chute. Serve de régua depois.', placeholder: 'Ex.: 80' },
    { id: 'lancamento', tipo: 'texto', pergunta: 'Quando a campanha precisa estar na rua?', placeholder: 'Ex.: 15 de outubro', obrigatorio: true },
    { id: 'canais', tipo: 'multipla', pergunta: 'Onde ela vai circular?', chips: ['Instagram', 'Outdoor', 'Fachada da escola', 'WhatsApp', 'Panfletagem', 'Rádio', 'Carro de som', 'Site', 'Feiras e eventos'] },

    { id: 'nota2026', tipo: 'escala', kicker: 'O que 2026 ensinou', pergunta: 'Como foi a campanha "Resultado não é sorte"?', extremos: ['Ficou devendo', 'Superou'] },
    { id: 'funcionou', tipo: 'longo', pergunta: 'O que mais funcionou nela?', placeholder: 'Ex.: o outdoor na entrada da cidade gerou ligação direta na secretaria' },
    { id: 'naorepetir', tipo: 'longo', pergunta: 'E o que não dá para repetir?', placeholder: 'Ex.: o folder tinha texto demais, ninguém leu' },
    { id: 'direcao', tipo: 'escolha', pergunta: 'Para 2027, a linha visual…', opcoes: [
        { valor: 'Manter', titulo: 'Mantém como está', nota: 'Azul e verde, peças geométricas' },
        { valor: 'Evoluir', titulo: 'Evolui, mas guarda as cores', nota: 'Mesma família, cara nova' },
        { valor: 'Recomeçar', titulo: 'Começa do zero', nota: 'Algo mudou de verdade na escola' },
    ] },

    { id: 'decisor', tipo: 'escolha', kicker: 'Quem você precisa convencer', pergunta: 'Quem decide a matrícula?', opcoes: [
        { valor: 'Mãe ou pai', titulo: 'Mãe ou pai', nota: 'Querem segurança e resultado' },
        { valor: 'O próprio aluno', titulo: 'O próprio aluno', nota: 'Quer pertencer, quer orgulho' },
        { valor: 'Decisão conjunta', titulo: 'Os dois juntos', nota: 'Conversa em família' },
    ] },
    { id: 'objecoes', tipo: 'tres', pergunta: 'Quando a matrícula não fecha, qual é a desculpa?', ajuda: 'Pensa em quem atende o telefone. Pode ser duro — quanto mais sincero, mais certeira fica a campanha.', campos: [
        'Ex.: é mais caro que o colégio do lado',
        'Ex.: fica longe de casa',
        'Ex.: não conheço os resultados de vocês',
    ] },
    { id: 'concorrentes', tipo: 'longo', pergunta: 'Quem são os concorrentes e o que eles prometem?', placeholder: 'Ex.: Colégio X — fala muito em aprovação na federal' },
    { id: 'porque', tipo: 'longo', pergunta: 'Por que um aluno escolhe vocês e não eles?', ajuda: 'Se a resposta também serve para o concorrente, não é diferencial. Aí eu volto com uma proposta antes de desenhar.', obrigatorio: true },

    { id: 'temfrase', tipo: 'escolha', kicker: 'A mensagem', pergunta: 'Vocês já têm a frase da campanha?', opcoes: [
        { valor: 'Sim', titulo: 'Sim, já está definida' },
        { valor: 'Ideias', titulo: 'Temos ideias soltas' },
        { valor: 'Não', titulo: 'Não — criem para nós', nota: 'Essa parte fica comigo' },
    ] },
    { id: 'diferenciais', tipo: 'multipla', pergunta: 'O que a escola tem de melhor?', ajuda: 'Marca tudo que for verdade. Depois eu escolho o que cabe na peça.', chips: ['Sistema Bernoulli', 'Parceria com a FASB', 'Simulados oficiais', 'Carga horária ampliada', 'Aulas aos sábados', 'Plantão de dúvidas', 'Material digital', 'Professores especialistas', 'Acompanhamento individual'] },
    { id: 'numeros', tipo: 'tres', pergunta: 'Me dá três números de que vocês se orgulham.', ajuda: 'Número específico convence mais que adjetivo. "142 aprovações" vale mais que "excelência comprovada".', campos: [
        'Ex.: 142 aprovações em 2026',
        'Ex.: 28 anos de história',
        'Ex.: 70% acima da média no ENEM',
    ] },
    { id: 'tom', tipo: 'escala', pergunta: 'Que tom a campanha deve ter?', extremos: ['Sóbrio, institucional', 'Jovem, energético'] },
    { id: 'naopode', tipo: 'longo', pergunta: 'Tem algo que não pode aparecer?', placeholder: 'Ex.: não citar nome de universidade, não comparar com outra escola' },

    { id: 'cores', tipo: 'cores', kicker: 'Agora fica divertido', pergunta: 'Mexe nas cores até parecer com 2027.', ajuda: 'Essas são as cores de 2026. Arrasta, troca, testa — o outdoor ao lado muda junto.' },
    { id: 'frase', tipo: 'frase', pergunta: 'E se vocês pudessem dizer uma frase só?', ajuda: 'Escreve e olha ela aparecer no outdoor. Se não tiver ideia, deixa em branco — essa parte é comigo.' },
    { id: 'sensacao', tipo: 'multipla', pergunta: 'O que essas cores precisam transmitir?', chips: ['Seriedade', 'Energia', 'Tradição', 'Inovação', 'Acolhimento', 'Exclusividade', 'Proximidade'] },

    { id: 'referencias', tipo: 'links', kicker: 'Referências', pergunta: 'Me mostra coisas que vocês acham bonitas.', ajuda: 'Cola links do Pinterest, Instagram, site — o que for. Anexo também pode, no próximo passo.' },
    { id: 'naogosta', tipo: 'longo', pergunta: 'E alguma que vocês detestam?', ajuda: 'Elimina um caminho inteiro antes de eu gastar uma rodada nele.', placeholder: 'Link ou descrição, e o motivo' },

    { id: 'fotos', tipo: 'upload', kicker: 'Quase lá', pergunta: 'Manda as fotos dos alunos.', ajuda: 'Sempre no tamanho original — foto que passou por WhatsApp fica pixelada no outdoor. Pode mandar logo, manual de marca e referências aqui também.' },
    { id: 'autorizacao', tipo: 'escolha', pergunta: 'As autorizações de uso de imagem estão assinadas?', ajuda: 'A maioria dos alunos é menor de idade. Sem autorização do responsável, a peça não pode circular.', opcoes: [
        { valor: 'Todas', titulo: 'Sim, de todos os alunos' },
        { valor: 'Parcial', titulo: 'De alguns' },
        { valor: 'Ainda não', titulo: 'Ainda não temos', nota: 'Sigo com as peças que não dependem de foto' },
    ] },

    { id: 'outdoor', tipo: 'tres', kicker: 'Produção', pergunta: 'Sobre o outdoor:', campos: ['Quantos pontos?', 'Medidas em metros', 'Qual gráfica e até quando ela precisa do arquivo'] },
    { id: 'guia', tipo: 'tres', pergunta: 'Sobre o guia acadêmico:', ajuda: 'O contratado é capa e template do miolo. O conteúdo página a página é de vocês.', campos: ['Formato final', 'Quantas páginas', 'Quem entrega o conteúdo'] },
    { id: 'fixos', tipo: 'longo', pergunta: 'O que precisa estar em todas as peças?', placeholder: 'Endereço, telefone, CNPJ, selos, logos de parceiros' },
    { id: 'matriculas', tipo: 'tres', pergunta: 'Informações de matrícula para as peças:', campos: ['Período de matrículas', 'Descontos que podem ser divulgados', 'WhatsApp e @ do Instagram'] },

    { id: 'livre', tipo: 'longo', kicker: 'Última', pergunta: 'Mais alguma coisa que eu precise saber?', placeholder: 'Fica à vontade' },

    { id: 'fim', tipo: 'fim', pergunta: 'É isso. O briefing já está comigo.' },
];

const CSS = `
.bc-root { --paper:#F3F2EF; --card:#FFF; --ink:#1A2230; --ink-soft:#5A6678; --ink-mute:#8C97A6;
  --line:#DFDDD7; --go:#0F9B6C; --go-soft:#E4F4ED; --warm:#D9603B;
  background:var(--paper); color:var(--ink); min-height:100vh;
  font-family:"Hanken Grotesk",system-ui,-apple-system,sans-serif; font-size:16px; line-height:1.5; }
.bc-root *{box-sizing:border-box}
.bc-top{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:1px solid var(--line)}
.bc-bar{height:3px;background:var(--line)}
.bc-bar span{display:block;height:100%;background:var(--go);transition:width .5s cubic-bezier(.4,0,.2,1)}
.bc-topin{max-width:1000px;margin:0 auto;padding:10px 20px;display:flex;justify-content:space-between;
  align-items:center;font-size:12.5px;color:var(--ink-mute)}
.bc-stage{max-width:1000px;margin:0 auto;padding:48px 20px 90px}
.bc-step{animation:bcrise .45s cubic-bezier(.2,.7,.3,1) both}
@keyframes bcrise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.bc-step{animation:none}}
.bc-kicker{font-size:12.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--go);margin:0 0 14px}
.bc-q{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(27px,4.6vw,40px);line-height:1.16;
  letter-spacing:-.015em;margin:0;text-wrap:balance;max-width:19ch}
.bc-help{color:var(--ink-soft);margin:14px 0 0;max-width:46ch;font-size:15.5px}
.bc-cards{display:grid;gap:10px;margin-top:30px;max-width:520px}
.bc-opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:var(--card);
  border:1.5px solid var(--line);border-radius:12px;padding:16px 18px;font:inherit;color:var(--ink);
  cursor:pointer;transition:border-color .15s,transform .15s}
.bc-opt:hover{border-color:var(--go);transform:translateX(3px)}
.bc-opt:focus-visible{outline:2px solid var(--go);outline-offset:2px}
.bc-key{font-size:12px;font-weight:700;color:var(--ink-mute);border:1.5px solid var(--line);border-radius:6px;
  width:26px;height:26px;display:grid;place-items:center;flex:none}
.bc-opt:hover .bc-key{border-color:var(--go);color:var(--go)}
.bc-opt strong{font-weight:600;display:block}
.bc-opt small{color:var(--ink-mute);font-size:13px}
.bc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px;max-width:600px}
.bc-chip{background:var(--card);border:1.5px solid var(--line);border-radius:999px;padding:9px 16px;
  font:inherit;font-size:15px;color:var(--ink);cursor:pointer;transition:all .15s}
.bc-chip[aria-pressed="true"]{background:var(--go);border-color:var(--go);color:#fff}
.bc-line{width:100%;max-width:520px;margin-top:28px;background:transparent;border:0;
  border-bottom:2px solid var(--line);padding:8px 2px;font-family:Fraunces,Georgia,serif;
  font-size:clamp(21px,3.2vw,28px);color:var(--ink);outline:none;transition:border-color .2s}
.bc-line::placeholder{color:var(--ink-mute);opacity:.5}
.bc-line:focus{border-color:var(--go)}
.bc-stack{display:grid;gap:12px;margin-top:26px;max-width:520px}
.bc-stack input,.bc-area{background:var(--card);border:1.5px solid var(--line);border-radius:10px;
  padding:14px 16px;font:inherit;font-size:15.5px;color:var(--ink);outline:none;width:100%}
.bc-stack input:focus,.bc-area:focus{border-color:var(--go)}
.bc-area{margin-top:26px;max-width:560px;min-height:130px;resize:vertical;line-height:1.55}
.bc-go{margin-top:32px;display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:#fff;
  border:0;border-radius:10px;padding:14px 24px;font:inherit;font-weight:600;font-size:15.5px;cursor:pointer;
  transition:background .15s,transform .15s}
.bc-go:hover{background:var(--go);transform:translateY(-1px)}
.bc-go:disabled{opacity:.5;cursor:not-allowed;transform:none}
.bc-hint{margin-top:14px;font-size:13px;color:var(--ink-mute)}
.bc-back{background:none;border:0;color:var(--ink-mute);font:inherit;font-size:14px;cursor:pointer;
  text-decoration:underline;margin-top:20px;display:block}
.bc-split{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start;margin-top:30px}
@media(max-width:800px){.bc-split{grid-template-columns:1fr;gap:28px}}
.bc-colorset{display:grid;gap:14px;max-width:340px}
.bc-pick{display:flex;align-items:center;gap:14px;background:var(--card);border:1.5px solid var(--line);
  border-radius:12px;padding:12px 14px;cursor:pointer}
.bc-pick input{width:42px;height:42px;border:0;border-radius:8px;background:none;cursor:pointer;padding:0;flex:none}
.bc-pick b{display:block;font-size:14.5px;font-weight:600}
.bc-pick code{font-size:12.5px;color:var(--ink-mute);font-family:ui-monospace,monospace}
.bc-plabel{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-mute);
  margin:0 0 10px;font-weight:600}
.bc-od{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;
  box-shadow:0 18px 40px -22px rgba(26,34,48,.55);transition:background .3s}
.bc-od i{position:absolute;display:block;transition:background .3s}
.bc-od .s1{width:30%;height:12%;right:6%;top:16%;border-radius:3px}
.bc-od .s2{width:12%;height:34%;right:24%;top:16%;border-radius:3px}
.bc-od .s3{width:22%;height:11%;right:6%;top:47%;border-radius:3px;opacity:.55}
.bc-person{position:absolute;right:8%;bottom:0;width:26%;height:72%;background:rgba(255,255,255,.14);
  border-radius:46% 46% 0 0}
.bc-person::after{content:"";position:absolute;left:50%;top:-14%;transform:translateX(-50%);width:42%;
  aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.14)}
.bc-odcopy{position:absolute;left:7%;bottom:13%;width:56%}
.bc-odcopy h3{font-family:Fraunces,Georgia,serif;font-weight:700;color:#fff;font-size:clamp(15px,3.1vw,27px);
  line-height:1.04;margin:0;text-transform:uppercase;letter-spacing:-.01em;text-wrap:balance}
.bc-odtag{position:absolute;left:7%;top:11%;color:#fff;font-size:clamp(8px,1.5vw,12px);font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;opacity:.82}
.bc-odfoot{position:absolute;left:7%;bottom:5.5%;color:#fff;opacity:.6;font-size:clamp(7px,1.2vw,10px);
  letter-spacing:.1em;text-transform:uppercase}
.bc-drop{margin-top:28px;max-width:520px;border:2px dashed var(--line);border-radius:14px;background:var(--card);
  padding:34px 24px;text-align:center;cursor:pointer;transition:all .15s;display:block}
.bc-drop:hover{border-color:var(--go);background:var(--go-soft)}
.bc-drop b{display:block;font-size:16px}
.bc-drop small{color:var(--ink-mute);font-size:13.5px}
.bc-files{display:grid;gap:6px;margin-top:14px;max-width:520px}
.bc-file{display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--card);
  border:1px solid var(--line);border-radius:8px;padding:9px 12px;font-size:14px}
.bc-file small{color:var(--ink-mute);flex:none}
.bc-file button{background:none;border:0;color:var(--warm);cursor:pointer;font:inherit;font-size:13px}
.bc-react{display:inline-flex;align-items:center;gap:9px;background:var(--go-soft);color:var(--go);
  border-radius:999px;padding:7px 15px;font-size:14px;font-weight:600;margin-bottom:20px}
.bc-err{background:#FBEAE5;color:#9B3B20;border-radius:10px;padding:14px 16px;margin-top:20px;
  max-width:520px;font-size:14.5px}
.bc-scale{display:flex;gap:8px;margin-top:28px;max-width:420px}
.bc-scale button{flex:1;background:var(--card);border:1.5px solid var(--line);border-radius:10px;
  padding:16px 0;font:inherit;font-size:17px;font-weight:600;color:var(--ink);cursor:pointer;transition:all .15s}
.bc-scale button:hover,.bc-scale button[aria-pressed="true"]{background:var(--go);border-color:var(--go);color:#fff}
.bc-ends{display:flex;justify-content:space-between;max-width:420px;margin-top:8px;font-size:12.5px;color:var(--ink-mute)}
.bc-done{background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:28px;margin-top:28px;max-width:560px}
`;

const OUTDOOR_PADRAO = { c1: '#12336E', c2: '#3DD6A3' };

function Outdoor({ c1, c2, frase }: { c1: string; c2: string; frase: string }) {
    const t = frase.trim();
    let linha1 = 'Resultado não é sorte,';
    let linha2 = 'é preparação.';
    if (t) {
        const partes = t.split(/,|\./).filter((s) => s.trim());
        if (partes.length > 1) {
            linha1 = partes[0].trim() + ',';
            linha2 = partes.slice(1).join(' ').trim();
        } else {
            linha1 = '';
            linha2 = t;
        }
    }
    return (
        <div className="bc-od" style={{ background: c1 }}>
            <i className="s1" style={{ background: c2 }} />
            <i className="s2" style={{ background: c2 }} />
            <i className="s3" style={{ background: c2 }} />
            <div className="bc-person" />
            <span className="bc-odtag">Matrículas 2027</span>
            <div className="bc-odcopy">
                <h3>
                    {linha1 && <>{linha1}<br /></>}
                    <span style={{ color: c2 }}>{linha2}</span>
                </h3>
            </div>
            <span className="bc-odfoot">Colégio Universitário · Teixeira de Freitas</span>
        </div>
    );
}

export default function BriefingCampanha() {
    const [i, setI] = useState(0);
    const [resp, setResp] = useState<Record<string, any>>({ instituicao: 'Colégio Universitário', cidade: 'Teixeira de Freitas - BA' });
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [resultado, setResultado] = useState<{ folder_url: string; enviados: number } | null>(null);
    const [progresso, setProgresso] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const passo = PASSOS[i];
    const total = PASSOS.length - 1;
    const pct = Math.round((i / total) * 100);
    const mins = Math.max(1, Math.round(8 - (i / total) * 7));

    const set = (id: string, v: any) => setResp((p) => ({ ...p, [id]: v }));

    const avancar = useCallback(() => {
        setErro(null);
        setI((n) => Math.min(n + 1, total));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [total]);

    const voltar = () => { setI((n) => Math.max(n - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 320);
        return () => clearTimeout(t);
    }, [i]);

    // Atalhos numéricos nas telas de escolha
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (passo.tipo !== 'escolha' || !passo.opcoes) return;
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= passo.opcoes.length) {
                set(passo.id, passo.opcoes[n - 1].valor);
                avancar();
            }
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
                setProgresso(`Enviando anexo ${k + 1} de ${arquivos.length}: ${f.name}`);
                try {
                    const base64 = await toBase64(f);
                    const up = await supabase.functions.invoke('briefing-campanha', {
                        body: { action: 'UPLOAD', folder_id: data.folder_id, name: f.name, mime: f.type, base64 },
                    });
                    if (!up.error && !up.data?.error) enviados++;
                } catch {
                    /* segue para o próximo arquivo */
                }
            }

            setResultado({ folder_url: data.folder_url, enviados });
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

    return (
        <div className="bc-root">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" />
            <style>{CSS}</style>

            <div className="bc-top">
                <div className="bc-bar"><span style={{ width: `${pct}%` }} /></div>
                <div className="bc-topin">
                    <span>Briefing de campanha · Colégio Universitário</span>
                    <span>{i === total ? 'Concluído' : `${mins} ${mins === 1 ? 'minuto' : 'minutos'}`}</span>
                </div>
            </div>

            <main className="bc-stage">
                <section className="bc-step" key={passo.id}>
                    {passo.kicker && <p className="bc-kicker">{passo.kicker}</p>}
                    {passo.id === 'cargo' && resp.nome && (
                        <p className="bc-react">Prazer, {String(resp.nome).split(' ')[0]} 👋</p>
                    )}
                    {passo.tipo === 'fim' && <p className="bc-react">Pronto ✓</p>}

                    <h1 className="bc-q">{passo.pergunta}</h1>
                    {passo.ajuda && <p className="bc-help">{passo.ajuda}</p>}

                    {/* INTRO */}
                    {passo.tipo === 'intro' && (
                        <>
                            <button className="bc-go" onClick={avancar}>Começar &nbsp;→</button>
                            <p className="bc-hint">Leva uns 8 minutos. A maioria das perguntas é só clicar.</p>
                        </>
                    )}

                    {/* TEXTO */}
                    {passo.tipo === 'texto' && (
                        <>
                            <input
                                ref={inputRef as any}
                                className="bc-line"
                                placeholder={passo.placeholder}
                                value={resp[passo.id] || ''}
                                onChange={(e) => set(passo.id, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && podeAvancar) avancar(); }}
                            />
                            <p className="bc-hint">Enter para continuar</p>
                        </>
                    )}

                    {/* ESCOLHA */}
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

                    {/* MÚLTIPLA */}
                    {passo.tipo === 'multipla' && (
                        <>
                            <div className="bc-chips">
                                {passo.chips?.map((c) => {
                                    const sel: string[] = resp[passo.id] || [];
                                    const on = sel.includes(c);
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

                    {/* TRÊS CAMPOS */}
                    {passo.tipo === 'tres' && (
                        <>
                            <div className="bc-stack">
                                {passo.campos?.map((ph, n) => (
                                    <input key={n} ref={n === 0 ? (inputRef as any) : undefined} placeholder={ph}
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

                    {/* TEXTO LONGO */}
                    {passo.tipo === 'longo' && (
                        <>
                            <textarea ref={inputRef as any} className="bc-area" placeholder={passo.placeholder}
                                value={resp[passo.id] || ''} onChange={(e) => set(passo.id, e.target.value)} />
                            <button className="bc-go" onClick={avancar} disabled={!podeAvancar}>Continuar &nbsp;→</button>
                        </>
                    )}

                    {/* ESCALA */}
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

                    {/* CORES */}
                    {passo.tipo === 'cores' && (
                        <div className="bc-split">
                            <div>
                                <div className="bc-colorset">
                                    <label className="bc-pick">
                                        <input type="color" value={resp.c1 || OUTDOOR_PADRAO.c1} onChange={(e) => set('c1', e.target.value)} />
                                        <div><b>Cor principal</b><code>{(resp.c1 || OUTDOOR_PADRAO.c1).toUpperCase()}</code></div>
                                    </label>
                                    <label className="bc-pick">
                                        <input type="color" value={resp.c2 || OUTDOOR_PADRAO.c2} onChange={(e) => set('c2', e.target.value)} />
                                        <div><b>Cor de destaque</b><code>{(resp.c2 || OUTDOOR_PADRAO.c2).toUpperCase()}</code></div>
                                    </label>
                                </div>
                                <button className="bc-go" onClick={avancar}>Gostei &nbsp;→</button>
                            </div>
                            <div>
                                <p className="bc-plabel">Seu outdoor, ao vivo</p>
                                <Outdoor c1={resp.c1 || OUTDOOR_PADRAO.c1} c2={resp.c2 || OUTDOOR_PADRAO.c2} frase={resp.frase || ''} />
                                <p className="bc-hint">Rascunho para sentir a cor — não é a arte final.</p>
                            </div>
                        </div>
                    )}

                    {/* FRASE */}
                    {passo.tipo === 'frase' && (
                        <div className="bc-split">
                            <div>
                                <input ref={inputRef as any} className="bc-line" style={{ fontSize: 23 }}
                                    placeholder="Digite a frase..." value={resp.frase || ''}
                                    onChange={(e) => set('frase', e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') avancar(); }} />
                                <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                            </div>
                            <div>
                                <p className="bc-plabel">Seu outdoor, ao vivo</p>
                                <Outdoor c1={resp.c1 || OUTDOOR_PADRAO.c1} c2={resp.c2 || OUTDOOR_PADRAO.c2} frase={resp.frase || ''} />
                            </div>
                        </div>
                    )}

                    {/* LINKS */}
                    {passo.tipo === 'links' && (
                        <>
                            <div className="bc-stack">
                                {[0, 1, 2].map((n) => (
                                    <input key={n} ref={n === 0 ? (inputRef as any) : undefined}
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

                    {/* UPLOAD */}
                    {passo.tipo === 'upload' && (
                        <>
                            <label className="bc-drop" htmlFor="bc-files">
                                <b>Solta os arquivos aqui</b>
                                <small>ou clique para escolher · fotos, logo, PDF, o que precisar</small>
                            </label>
                            <input id="bc-files" type="file" multiple hidden
                                onChange={(e) => {
                                    const novos = Array.from(e.target.files || []);
                                    setArquivos((p) => [...p, ...novos]);
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
                            <button className="bc-go" onClick={avancar}>Continuar &nbsp;→</button>
                        </>
                    )}

                    {/* FIM */}
                    {passo.tipo === 'fim' && (
                        <>
                            {!resultado ? (
                                <>
                                    <p className="bc-help">
                                        Confere se está tudo certo e envia. {arquivos.length > 0 && `${arquivos.length} arquivo(s) vão junto.`}
                                    </p>
                                    <div className="bc-done">
                                        <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-soft)' }}>
                                            <b>{resp.nome || '—'}</b> · {resp.cargo || '—'}<br />
                                            Objetivo: {resp.objetivo || '—'}<br />
                                            Séries: {(resp.series || []).join(', ') || '—'}<br />
                                            Cores: {(resp.c1 || OUTDOOR_PADRAO.c1).toUpperCase()} e {(resp.c2 || OUTDOOR_PADRAO.c2).toUpperCase()}<br />
                                            Frase: {resp.frase || 'a criar'}<br />
                                            Anexos: {arquivos.length}
                                        </p>
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
                                        Levou menos que um café. Vou usar exatamente o que você respondeu — e chamo no
                                        WhatsApp se faltar alguma coisa.
                                    </p>
                                    <div className="bc-done">
                                        <p style={{ margin: 0 }}>
                                            <b>{resultado.enviados}</b> anexo(s) guardado(s) com segurança.<br />
                                            <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
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
    );
}
