import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Plus, X, Send, Loader2, Paperclip, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const TIPOS = [
    'Material Gráfico',
    'Logo',
    'Banner',
    'Post Social Media',
    'Apresentação',
    'Outro',
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

export default function FaculdadeSolicitacoes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        instituicao: 'Geral',
        tipo: '',
        urgencia: 'Média',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.titulo.trim() || !form.tipo) {
            toast.error('Preencha o título e selecione o tipo');
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

            const urgEmoji: Record<string, string> = { Baixa: '🟢', Média: '🟡', Alta: '🟠', Urgente: '🔴' };
            const emoji = urgEmoji[form.urgencia] || '⚪';
            const cardName = `${emoji} [${form.instituicao}] ${form.titulo}`;
            const cardDesc = [
                `**📋 Tipo:** ${form.tipo}`,
                `**🏛️ Instituição:** ${form.instituicao}`,
                `**⚡ Urgência:** ${form.urgencia}`,
                `**📧 Solicitante:** ${user?.email || 'ifa-universitario@edicao.com'}`,
                `**📅 Data:** ${new Date().toLocaleDateString('pt-BR')}`,
                '',
                '---',
                '',
                `**📝 Descrição:**`,
                form.descricao || 'Sem descrição adicional.',
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
            if (files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('name', file.name);
                    await fetch(
                        `https://api.trello.com/1/cards/${card.id}/attachments?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
                        { method: 'POST', body: formData }
                    );
                }
            }

            toast.success('Solicitação enviada com sucesso! 🎉');
            setForm({ titulo: '', descricao: '', instituicao: 'Geral', tipo: '', urgencia: 'Média' });
            setFiles([]);
            setShowForm(false);
        } catch (err: any) {
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

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Welcome Banner */}
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
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nova solicitação
                        </button>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <ClipboardList className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Nova Solicitação</h3>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Título *</label>
                                    <input
                                        type="text"
                                        value={form.titulo}
                                        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                        placeholder="Ex: Banner para evento de abertura"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

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
                                                key={tipo}
                                                type="button"
                                                onClick={() => setForm({ ...form, tipo })}
                                                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.tipo === tipo
                                                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </div>

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

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Descrição</label>
                                    <textarea
                                        value={form.descricao}
                                        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                        placeholder="Descreva o que precisa em detalhes (tamanho, cores, referências...)"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                                    />
                                </div>

                                {/* Upload de Arquivos */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Anexos</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
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
                                        Anexar fotos ou arquivos
                                    </button>
                                    {files.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                                                    <span className="text-white/60 truncate flex-1">{f.name}</span>
                                                    <button
                                                        type="button"
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

                {/* Info Cards */}
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
            </main>
        </div>
    );
}
