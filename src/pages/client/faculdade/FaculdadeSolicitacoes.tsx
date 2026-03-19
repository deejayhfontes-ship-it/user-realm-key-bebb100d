import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Plus, X, Send, Loader2, Paperclip, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Tipos com prazos e campos de briefing
const TIPOS = [
    {
        value: 'Post Instagram',
        label: 'Post Instagram',
        prazo: 2,
        prazoTexto: '2 dias úteis',
        color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        campos: [
            { id: 'tema', label: 'Tema do post', placeholder: 'Ex: Dia do Professor, promoção de matrícula...' },
            { id: 'referencias', label: 'Referências visuais', placeholder: 'Links ou descrição de estilo desejado' },
            { id: 'texto', label: 'Texto para o post', placeholder: 'Texto principal que deve aparecer no post' },
        ],
    },
    {
        value: 'Data Comemorativa ou Aviso',
        label: 'Data Comemorativa ou Aviso',
        prazo: 2,
        prazoTexto: '2 dias úteis',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        campos: [
            { id: 'data', label: 'Data ou evento', placeholder: 'Ex: Dia das Mães - 12/05, Aviso de feriado...' },
            { id: 'mensagem', label: 'Mensagem principal', placeholder: 'Texto que deve aparecer no material' },
            { id: 'formato', label: 'Formato', placeholder: 'Ex: Stories, feed quadrado, banner site...' },
        ],
    },
    {
        value: 'Campanhas',
        label: 'Campanhas',
        prazo: 10,
        prazoTexto: '7 a 10 dias úteis',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        campos: [
            { id: 'objetivo', label: 'Objetivo da campanha', placeholder: 'Ex: Captação de alunos, retenção, evento...' },
            { id: 'publico', label: 'Público-alvo', placeholder: 'Ex: Jovens 17-25 anos, responsáveis...' },
            { id: 'pecas', label: 'Peças necessárias', placeholder: 'Ex: Post feed, stories, banner digital, flyer...' },
            { id: 'referencias', label: 'Referências', placeholder: 'Links ou descrição de campanhas que gostou' },
        ],
    },
    {
        value: 'Logos para Campanhas',
        label: 'Logos para Campanhas',
        prazo: 15,
        prazoTexto: '15 dias úteis',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        campos: [
            { id: 'nome', label: 'Nome da campanha/marca', placeholder: 'Ex: APROVADOS 2026, Vestibular IFA...' },
            { id: 'estilo', label: 'Estilo desejado', placeholder: 'Ex: Moderno, clássico, jovem, corporativo...' },
            { id: 'cores', label: 'Cores preferidas', placeholder: 'Ex: Azul e dourado, seguir identidade da IFA...' },
            { id: 'referencias', label: 'Referências', placeholder: 'Links de logos que gostou' },
        ],
    },
    {
        value: 'Banner',
        label: 'Banner',
        prazo: 5,
        prazoTexto: '5 dias úteis',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        campos: [
            { id: 'finalidade', label: 'Finalidade', placeholder: 'Ex: Site, fachada, evento, roll-up...' },
            { id: 'dimensoes', label: 'Dimensões', placeholder: 'Ex: 90x200cm, 1920x1080px, A4...' },
            { id: 'texto', label: 'Textos e informações', placeholder: 'Todos os textos que devem aparecer no banner' },
        ],
    },
    {
        value: 'Outros',
        label: 'Outros',
        prazo: null,
        prazoTexto: 'Prazo informado ao cliente',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        campos: [
            { id: 'descricao', label: 'Descreva o que precisa', placeholder: 'Explique detalhadamente o que você precisa...' },
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
    const now = new Date();
    let count = 0;
    const d = new Date(now);
    while (count < prazo) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) count++;
    }
    return d.toLocaleDateString('pt-BR');
}

interface SuccessData {
    protocolo: string;
    prazoTexto: string;
    prazoData: string | null;
    tipo: string;
}

export default function FaculdadeSolicitacoes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [briefingFields, setBriefingFields] = useState<Record<string, string>>({});
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        instituicao: 'Geral',
        tipo: '',
        urgencia: 'Média',
    });

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

        setIsSubmitting(true);

        try {
            const TRELLO_KEY = import.meta.env.VITE_TRELLO_KEY;
            const TRELLO_TOKEN = import.meta.env.VITE_TRELLO_TOKEN;
            const LIST_ID = import.meta.env.VITE_TRELLO_LIST_ID;

            if (!TRELLO_KEY || !TRELLO_TOKEN || !LIST_ID) {
                throw new Error('Configuração Trello não encontrada');
            }

            const protocolo = gerarProtocolo();
            const prazoData = calcularPrazo(tipoSelecionado?.prazo ?? null);
            const prazoTexto = tipoSelecionado?.prazoTexto ?? 'A combinar';

            const urgEmoji: Record<string, string> = { Baixa: '🟢', Média: '🟡', Alta: '🟠', Urgente: '🔴' };
            const emoji = urgEmoji[form.urgencia] || '⚪';
            const cardName = `${emoji} [${form.instituicao}] ${form.tipo} — ${protocolo}`;

            const briefingLines = tipoSelecionado?.campos.map(campo =>
                `**${campo.label}:** ${briefingFields[campo.id] || '(não informado)'}`
            ).join('\n') || '';

            const cardDesc = [
                `**🎫 Protocolo:** ${protocolo}`,
                `**📋 Tipo:** ${form.tipo}`,
                `**🏛️ Instituição:** ${form.instituicao}`,
                `**⚡ Urgência:** ${form.urgencia}`,
                `**📧 Solicitante:** ${user?.email || ''}`,
                `**📅 Data da solicitação:** ${new Date().toLocaleDateString('pt-BR')}`,
                `**⏰ Prazo estimado:** ${prazoTexto}${prazoData ? ` (até ${prazoData})` : ''}`,
                '',
                '---',
                '',
                '**📝 Briefing:**',
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

            setSuccessData({ protocolo, prazoTexto, prazoData, tipo: form.tipo });
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
                                Faça e acompanhe suas solicitações de materiais e serviços.
                                Cada pedido é enviado diretamente para nossa equipe.
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
                            {successData.prazoData && <span className="text-white/50"> (até {successData.prazoData})</span>}
                        </p>
                        <p className="text-white/30 text-xs mt-2">Guarde o número do protocolo para acompanhamento.</p>
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
                                        <ClipboardList className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Nova Solicitação</h3>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    title="Fechar"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                                    <label className="block text-sm font-medium text-white/70 mb-2">Tipo *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TIPOS.map((tipo) => (
                                            <button
                                                key={tipo.value}
                                                type="button"
                                                onClick={() => handleTipoChange(tipo.value)}
                                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${form.tipo === tipo.value
                                                    ? tipo.color + ' ring-1 ring-current'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                <div>{tipo.label}</div>
                                                <div className="text-xs opacity-60 mt-0.5">{tipo.prazoTexto}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Campos de briefing dinâmicos */}
                                {tipoSelecionado && (
                                    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Briefing — {tipoSelecionado.label}</p>
                                        {tipoSelecionado.campos.map((campo) => (
                                            <div key={campo.id}>
                                                <label className="block text-sm font-medium text-white/70 mb-1.5">{campo.label}</label>
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
                                    <label className="block text-sm font-medium text-white/70 mb-2">Anexos</label>
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
                                        Anexar fotos ou arquivos de referência
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

                                {/* Prazo estimado */}
                                {tipoSelecionado && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                        <span className="text-yellow-400 text-lg">⏰</span>
                                        <div>
                                            <p className="text-xs text-white/40">Prazo estimado para entrega</p>
                                            <p className="text-sm font-medium text-yellow-400">
                                                {tipoSelecionado.prazoTexto}
                                                {tipoSelecionado.prazo && (
                                                    <span className="text-white/40 text-xs ml-2">
                                                        (até {calcularPrazo(tipoSelecionado.prazo)})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
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

                {/* Empty state */}
                {!successData && (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <ClipboardList className="w-8 h-8 text-emerald-400/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Suas solicitações</h3>
                        <p className="text-white/30 text-sm max-w-xs mx-auto mb-6">
                            Clique em "Nova solicitação" para enviar um pedido. Ele será recebido diretamente pela nossa equipe no Trello.
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
            </main>
        </div>
    );
}
