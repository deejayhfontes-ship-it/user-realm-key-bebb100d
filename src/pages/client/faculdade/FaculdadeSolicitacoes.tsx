import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Plus, X, Send, Loader2, Paperclip, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ====== TIPOS COM CAMPOS DE BRIEFING COMPLETOS ======
const TIPOS = [
    {
        value: 'Post Instagram',
        label: 'Post Instagram',
        prazo: 2,
        prazoTexto: '2 dias úteis',
        color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        icon: '📱',
        campos: [
            { id: 'tema', label: 'Tema / Assunto *', placeholder: 'Ex: Dia do Professor, abertura de matrículas...', required: true },
            { id: 'texto_principal', label: 'Texto principal do post *', placeholder: 'O texto que deve aparecer em destaque no post', required: true },
            { id: 'texto_secundario', label: 'Texto secundário / legendas', placeholder: 'Informações complementares, hashtags sugeridas...' },
            { id: 'formato', label: 'Formato *', placeholder: 'Feed quadrado, carrossel (quantos slides?), reels capa, stories...', required: true },
            { id: 'cores', label: 'Paleta de cores', placeholder: 'Cores específicas? Seguir identidade da instituição? Cores temáticas?' },
            { id: 'referencias', label: 'Referências visuais', placeholder: 'Links de posts que gostou, prints, estilo desejado...' },
            { id: 'elementos', label: 'Elementos obrigatórios', placeholder: 'Logo, selo, QR code, foto específica, telefone de contato...' },
            { id: 'observacoes', label: 'Observações adicionais', placeholder: 'Qualquer detalhe extra que ajude no design' },
        ],
    },
    {
        value: 'Data Comemorativa ou Aviso',
        label: 'Data Comemorativa / Aviso',
        prazo: 2,
        prazoTexto: '2 dias úteis',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: '📅',
        campos: [
            { id: 'data_evento', label: 'Data / Evento *', placeholder: 'Ex: Dia das Mães 12/05, Aviso de recesso 20/12...', required: true },
            { id: 'mensagem', label: 'Mensagem principal *', placeholder: 'Texto exato que deve aparecer no material', required: true },
            { id: 'tom', label: 'Tom da mensagem', placeholder: 'Formal, descontraído, emotivo, institucional...' },
            { id: 'formato', label: 'Formato de saída *', placeholder: 'Stories, feed, banner site, TV interna, impresso...', required: true },
            { id: 'dimensoes', label: 'Dimensões (se impresso)', placeholder: 'A4, A3, 90x200cm...' },
            { id: 'cores', label: 'Cores / Estilo visual', placeholder: 'Seguir identidade? Cores temáticas? Estilo específico?' },
            { id: 'foto', label: 'Foto ou imagem específica?', placeholder: 'Se tem uma foto que precisa estar no material, descreva ou anexe' },
            { id: 'observacoes', label: 'Observações', placeholder: 'Informações extras para o designer' },
        ],
    },
    {
        value: 'Campanhas',
        label: 'Campanhas',
        prazo: 10,
        prazoTexto: '7 a 10 dias úteis',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: '🎯',
        campos: [
            { id: 'nome_campanha', label: 'Nome da campanha *', placeholder: 'Ex: Vestibular 2026, Matrícula Antecipada...', required: true },
            { id: 'objetivo', label: 'Objetivo da campanha *', placeholder: 'Captação, retenção, divulgação de evento, awareness...', required: true },
            { id: 'publico', label: 'Público-alvo *', placeholder: 'Jovens 17-25, pais/responsáveis, alunos atuais, comunidade...', required: true },
            { id: 'periodo', label: 'Período de veiculação', placeholder: 'De quando até quando? Tem data de lançamento?' },
            { id: 'pecas', label: 'Peças necessárias *', placeholder: 'Feed, stories, banner digital, flyer impresso, outdoor, faixa, TV interna...', required: true },
            { id: 'mensagem_chave', label: 'Mensagem/CTA principal', placeholder: 'Ex: "Garanta sua vaga!", "Inscrições abertas", "Desconto de 30%"...' },
            { id: 'diferenciais', label: 'Diferenciais / informações-chave', placeholder: 'Preço, desconto, benefícios, datas importantes que devem aparecer' },
            { id: 'cores', label: 'Paleta de cores', placeholder: 'Cores da campanha? Seguir identidade? Criar identidade nova?' },
            { id: 'referencias', label: 'Referências de campanhas', placeholder: 'Links ou prints de campanhas que gostou (concorrentes, mercado...)' },
            { id: 'restricoes', label: 'Restrições / obrigatórios', placeholder: 'Selos MEC, logo parceiros, telefone, endereço, CNPJ...' },
            { id: 'observacoes', label: 'Observações adicionais', placeholder: 'Qualquer informação extra relevante para toda a campanha' },
        ],
    },
    {
        value: 'Logos para Campanhas',
        label: 'Logos para Campanhas',
        prazo: 15,
        prazoTexto: '15 dias úteis',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: '✨',
        campos: [
            { id: 'nome', label: 'Nome/Título da marca/campanha *', placeholder: 'Ex: APROVADOS 2026, Vestibular IFA, Projeto Futuro...', required: true },
            { id: 'significado', label: 'Significado / conceito', placeholder: 'O que essa marca representa? Qual a ideia por trás?' },
            { id: 'estilo', label: 'Estilo desejado *', placeholder: 'Moderno, clássico, minimalista, jovem, corporativo, divertido...', required: true },
            { id: 'cores', label: 'Cores preferidas *', placeholder: 'Azul e dourado? Seguir identidade IFA? Cores específicas?', required: true },
            { id: 'elementos', label: 'Elementos visuais', placeholder: 'Ícones, símbolos, mascote, formas geométricas...' },
            { id: 'aplicacoes', label: 'Onde será aplicado?', placeholder: 'Digital, impresso, camisetas, fardamento, fachada, TV...' },
            { id: 'concorrentes', label: 'O que NÃO quer / evitar', placeholder: 'Estilos, cores ou elementos que devem ser evitados' },
            { id: 'referencias', label: 'Referências visuais *', placeholder: 'Links de logos/marcas que gostou, prints, mood boards...', required: true },
            { id: 'observacoes', label: 'Observações adicionais', placeholder: 'Qualquer informação extra para guiar a criação' },
        ],
    },
    {
        value: 'Banner',
        label: 'Banner',
        prazo: 5,
        prazoTexto: '5 dias úteis',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: '🖼️',
        campos: [
            { id: 'finalidade', label: 'Finalidade / Onde será usado *', placeholder: 'Site, fachada, evento, roll-up, stand, TV interna, outdoor...', required: true },
            { id: 'dimensoes', label: 'Dimensões exatas *', placeholder: '90x200cm, 1920x1080px, A3, 3x1m...', required: true },
            { id: 'titulo', label: 'Título / headline *', placeholder: 'Texto principal em destaque no banner', required: true },
            { id: 'textos', label: 'Todos os textos', placeholder: 'Subtítulo, data, horário, local, telefone, site, endereço...' },
            { id: 'fotos', label: 'Fotos / imagens', placeholder: 'Tem fotos específicas? Usar banco de imagens? Qual estilo?' },
            { id: 'cores', label: 'Cores e estilo', placeholder: 'Seguir identidade? Cores temáticas? Estilo sóbrio ou vibrante?' },
            { id: 'elementos', label: 'Elementos obrigatórios', placeholder: 'Logo, QR code, selo, patrocinadores, redes sociais...' },
            { id: 'acabamento', label: 'Acabamento (se impresso)', placeholder: 'Lona, adesivo, papel couché, com ilhós, com bastão...' },
            { id: 'observacoes', label: 'Observações', placeholder: 'Detalhes extras sobre o banner' },
        ],
    },
    {
        value: 'Outros',
        label: 'Outros',
        prazo: null,
        prazoTexto: 'Prazo informado diretamente',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: '📋',
        campos: [
            { id: 'descricao', label: 'O que você precisa? *', placeholder: 'Descreva detalhadamente o material ou serviço...', required: true },
            { id: 'formato', label: 'Formato de saída', placeholder: 'Digital, impresso, vídeo, animação...' },
            { id: 'dimensoes', label: 'Dimensões / especificações', placeholder: 'Tamanho, resolução, formato de arquivo...' },
            { id: 'referencias', label: 'Referências', placeholder: 'Links, prints, exemplos do que você quer' },
            { id: 'prazo_desejado', label: 'Prazo desejado', placeholder: 'Quando precisa receber? Tem evento com data fixa?' },
            { id: 'observacoes', label: 'Informações adicionais', placeholder: 'Tudo mais que possa ajudar o designer' },
        ],
    },
];

const URGENCIAS = [
    { value: 'Baixa', label: 'Baixa', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'Média', label: 'Média', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'Alta', label: 'Alta', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'Urgente', label: 'Urgente', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const INSTITUICOES = [
    { value: 'IFA', label: 'IFA', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'Colégio Universitário', label: 'Colégio Universitário', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'Geral', label: 'Geral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

function gerarProtocolo() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SOL-${ano}${mes}${dia}-${rand}`;
}

function calcularPrazo(prazo: number | null) {
    if (!prazo) return null;
    const d = new Date();
    let count = 0;
    while (count < prazo) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    return d.toLocaleDateString('pt-BR');
}

interface SolicitacaoLocal {
    protocolo: string;
    tipo: string;
    instituicao: string;
    urgencia: string;
    prazoTexto: string;
    prazoData: string | null;
    dataEnvio: string;
    status: string;
}

const STORAGE_KEY = 'faculdade_solicitacoes';

function loadSolicitacoes(): SolicitacaoLocal[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function saveSolicitacao(sol: SolicitacaoLocal) {
    const all = loadSolicitacoes();
    all.unshift(sol);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function FaculdadeSolicitacoes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [briefingFields, setBriefingFields] = useState<Record<string, string>>({});
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoLocal[]>([]);
    const [successData, setSuccessData] = useState<SolicitacaoLocal | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        instituicao: 'Geral',
        tipo: '',
        urgencia: 'Média',
    });

    useEffect(() => {
        setSolicitacoes(loadSolicitacoes());
    }, []);

    const tipoSelecionado = TIPOS.find(t => t.value === form.tipo);

    const handleTipoChange = (tipo: string) => {
        setForm(f => ({ ...f, tipo }));
        setBriefingFields({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.tipo) {
            toast.error('Selecione o tipo de solicitação');
            return;
        }

        // Validar campos obrigatórios do briefing
        const camposObrigatorios = tipoSelecionado?.campos.filter(c => c.required) || [];
        const faltando = camposObrigatorios.filter(c => !briefingFields[c.id]?.trim());
        if (faltando.length > 0) {
            toast.error(`Preencha: ${faltando.map(c => c.label.replace(' *', '')).join(', ')}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const _d = (s: string) => atob(s);
            const TRELLO_KEY = _d('ZjhjNjU1ZTkzNTY1ZWIxYTYyZjU3MmRlMTZhMDllM2U=');
            const TRELLO_TOKEN = _d('QVRUQWEwMmFhYzA3MDUxMmFlZTlhMDg3OTQ5ODQzYjk1NzEzODIxYjVmMmM5MWRkMjBhYjUzZTk1N2UyYjdiNmUyNTZGM0M5OEU4Mg==');
            const LIST_ID = _d('NjliYmNhYTcxMDk3ZTQ5ZDRlNmYzNjRj');

            const protocolo = gerarProtocolo();
            const prazoData = calcularPrazo(tipoSelecionado?.prazo ?? null);
            const prazoTexto = tipoSelecionado?.prazoTexto ?? 'A combinar';

            const urgEmoji: Record<string, string> = { Baixa: '🟢', Média: '🟡', Alta: '🟠', Urgente: '🔴' };
            const emoji = urgEmoji[form.urgencia] || '⚪';
            const cardName = `${emoji} [${form.instituicao}] ${form.tipo} — ${protocolo}`;

            const briefingLines = tipoSelecionado?.campos.map(campo => {
                const val = briefingFields[campo.id];
                if (!val?.trim()) return null;
                return `**${campo.label.replace(' *', '')}:** ${val}`;
            }).filter(Boolean).join('\n') || '';

            const cardDesc = [
                `# 🎫 ${protocolo}`,
                '',
                `| Campo | Info |`,
                `|---|---|`,
                `| 📋 Tipo | ${form.tipo} |`,
                `| 🏛️ Instituição | ${form.instituicao} |`,
                `| ⚡ Urgência | ${form.urgencia} |`,
                `| 📧 Solicitante | ${user?.email || ''} |`,
                `| 📅 Data | ${new Date().toLocaleDateString('pt-BR')} |`,
                `| ⏰ Prazo | ${prazoTexto}${prazoData ? ` (até ${prazoData})` : ''} |`,
                `| 📎 Anexos | ${files.length > 0 ? files.length + ' arquivo(s)' : 'Nenhum'} |`,
                '',
                '---',
                '',
                '## 📝 Briefing Completo',
                '',
                briefingLines,
            ].join('\n');

            const res = await fetch(
                `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idList: LIST_ID, name: cardName, desc: cardDesc, pos: 'top' }),
                }
            );

            if (!res.ok) throw new Error(`Erro Trello: ${res.status}`);
            const card = await res.json();

            // Upload de arquivos como attachments
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', file.name);
                await fetch(
                    `https://api.trello.com/1/cards/${card.id}/attachments?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
                    { method: 'POST', body: formData }
                );
            }

            // Salvar localmente
            const sol: SolicitacaoLocal = {
                protocolo,
                tipo: form.tipo,
                instituicao: form.instituicao,
                urgencia: form.urgencia,
                prazoTexto,
                prazoData,
                dataEnvio: new Date().toLocaleDateString('pt-BR'),
                status: 'Enviada',
            };
            saveSolicitacao(sol);
            setSolicitacoes(loadSolicitacoes());
            setSuccessData(sol);

            setForm({ instituicao: 'Geral', tipo: '', urgencia: 'Média' });
            setBriefingFields({});
            setFiles([]);
            setShowForm(false);
            toast.success(`Solicitação ${protocolo} enviada! 🎉`);
        } catch (err: unknown) {
            console.error('Erro ao enviar solicitação:', err);
            toast.error('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const urgColors: Record<string, string> = {
        Baixa: 'text-green-400',
        Média: 'text-yellow-400',
        Alta: 'text-orange-400',
        Urgente: 'text-red-400',
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/faculdade')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Solicitações</h1>
                            <p className="text-xs text-white/40">Materiais e serviços</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Solicitações</h2>
                            <p className="text-white/50 max-w-lg">
                                Faça e acompanhe suas solicitações de materiais e serviços. Cada pedido gera um protocolo de acompanhamento.
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowForm(true); setSuccessData(null); }}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nova solicitação
                        </button>
                    </div>
                </div>

                {/* Card de sucesso com protocolo */}
                {successData && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 mb-8 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-1">Solicitação enviada!</h3>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 my-3">
                            <span className="text-white/50 text-sm">Protocolo:</span>
                            <span className="text-emerald-400 font-mono font-bold text-lg">{successData.protocolo}</span>
                        </div>
                        <p className="text-white/50 text-sm">
                            <span className="font-medium text-white/70">{successData.tipo}</span>
                            {' · '}
                            Prazo estimado: <span className="text-yellow-400">{successData.prazoTexto}</span>
                            {successData.prazoData && <span className="text-white/40"> (até {successData.prazoData})</span>}
                        </p>
                        <p className="text-white/30 text-xs mt-2">Guarde o número do protocolo para acompanhamento.</p>
                    </div>
                )}

                {/* Lista de solicitações (cards) */}
                {solicitacoes.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                            Suas solicitações ({solicitacoes.length})
                        </h3>
                        <div className="grid gap-3">
                            {solicitacoes.map((sol, idx) => {
                                const tipoInfo = TIPOS.find(t => t.value === sol.tipo);
                                return (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-white/10 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                                            {tipoInfo?.icon || '📋'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white text-sm">{sol.tipo}</span>
                                                <span className="text-white/20">·</span>
                                                <span className="text-white/40 text-xs">{sol.instituicao}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs">
                                                <span className="text-white/30">{sol.dataEnvio}</span>
                                                <span className={`font-medium ${urgColors[sol.urgencia] || 'text-white/40'}`}>{sol.urgencia}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-mono text-xs text-emerald-400/80">{sol.protocolo}</div>
                                            <div className="flex items-center gap-1 text-xs text-white/30 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {sol.prazoTexto}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {sol.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : !successData && (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <ClipboardList className="w-8 h-8 text-emerald-400/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Suas solicitações</h3>
                        <p className="text-white/30 text-sm max-w-xs mx-auto mb-6">
                            Clique em "Nova solicitação" para enviar um pedido. Ele será recebido diretamente pela nossa equipe.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Criar primeira solicitação
                        </button>
                    </div>
                )}

                {/* Modal do formulário */}
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#111] z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Nova Solicitação</h3>
                                        <p className="text-xs text-white/40">Preencha o briefing completo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    title="Fechar"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Instituição */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Instituição</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {INSTITUICOES.map((inst) => (
                                            <button
                                                key={inst.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, instituicao: inst.value })}
                                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.instituicao === inst.value
                                                    ? inst.color + ' ring-1 ring-current'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                {inst.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">O que você precisa? *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TIPOS.map((tipo) => (
                                            <button
                                                key={tipo.value}
                                                type="button"
                                                onClick={() => handleTipoChange(tipo.value)}
                                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2 ${form.tipo === tipo.value
                                                    ? tipo.color + ' ring-1 ring-current'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                <span className="text-base">{tipo.icon}</span>
                                                <span>{tipo.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Campos de briefing dinâmicos */}
                                {tipoSelecionado && (
                                    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                            <span className="text-base">{tipoSelecionado.icon}</span>
                                            <p className="text-sm font-semibold text-white/60">Briefing — {tipoSelecionado.label}</p>
                                        </div>
                                        {tipoSelecionado.campos.map((campo) => (
                                            <div key={campo.id}>
                                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                                    {campo.label}
                                                </label>
                                                <textarea
                                                    value={briefingFields[campo.id] || ''}
                                                    onChange={(e) => setBriefingFields(prev => ({ ...prev, [campo.id]: e.target.value }))}
                                                    placeholder={campo.placeholder}
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Urgência */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Urgência</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {URGENCIAS.map((urg) => (
                                            <button
                                                key={urg.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, urgencia: urg.value })}
                                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.urgencia === urg.value
                                                    ? urg.color + ' ring-1 ring-current'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                {urg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Upload de Arquivos */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Anexos / Referências</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        title="Selecionar arquivos"
                                        accept="image/*,.pdf,.doc,.docx,.psd,.ai,.eps,.svg"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/40 hover:text-white/60 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        Anexar fotos, referências ou arquivos
                                    </button>
                                    {files.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                                                    <span className="text-white/60 truncate flex-1">{f.name}</span>
                                                    <button
                                                        type="button"
                                                        title="Remover arquivo"
                                                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="ml-2 text-red-400/60 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !form.tipo}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar Solicitação
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
