import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    Megaphone, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
    ArrowLeft, Image as ImageIcon, FolderOpen, Calendar, GripVertical,
    X, Save, Loader2, ExternalLink
} from 'lucide-react';
import type { Campanha } from '@/types/campanhas';
import { UNIT_LABELS } from '@/types/campanhas';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '@/components/admin/portfolio/ImageUploader';
import { FolderPlus, Users } from 'lucide-react';

interface ClienteBasic { id: string; name: string; }

const EMPTY_FORM: Omit<Campanha, 'id' | 'created_at' | 'updated_at'> & { client_id: string | null } = {
    title: '',
    slug: '',
    unit: 'universitario',
    status: 'active',
    description: '',
    cover_image: '',
    drive_folder_id: '',
    starts_at: null,
    ends_at: null,
    sort_order: 0,
    client_id: null,
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function AdminCampanhas() {
    const navigate = useNavigate();
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [clientes, setClientes] = useState<ClienteBasic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [filterUnit, setFilterUnit] = useState<string>('all');
    const [subfolders, setSubfolders] = useState<string>('Posts Feed, Stories, Vídeos');

    const fetchCampanhas = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('campanhas' as any)
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Erro ao carregar campanhas');
            console.error(error);
        } else {
            setCampanhas((data as any) || []);
        }
        setIsLoading(false);
    };

    const fetchClientes = async () => {
        const { data } = await supabase.from('clients' as any).select('id, name').order('name');
        if (data) setClientes(data as any);
    };

    useEffect(() => {
        fetchCampanhas();
        fetchClientes();
    }, []);

    const handleEdit = (campanha: Campanha) => {
        setEditingId(campanha.id);
        setForm({
            title: campanha.title,
            slug: campanha.slug,
            unit: campanha.unit,
            status: campanha.status,
            description: campanha.description || '',
            cover_image: campanha.cover_image || '',
            drive_folder_id: campanha.drive_folder_id || '',
            starts_at: campanha.starts_at ? campanha.starts_at.split('T')[0] : null,
            ends_at: campanha.ends_at ? campanha.ends_at.split('T')[0] : null,
            sort_order: campanha.sort_order,
            client_id: (campanha as any).client_id || null,
        });
        setShowForm(true);
    };

    const handleNew = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setShowForm(true);
    };

    const handleCreateDriveFolder = async () => {
        if (!form.title.trim()) {
            toast.error('Preencha o título antes de criar a pasta');
            return;
        }

        setIsCreatingFolder(true);
        try {
            const folderName = `[${form.unit.toUpperCase()}] ${form.title}`;
            const { data, error } = await supabase.functions.invoke('drive-files', {
                body: {
                    action: 'CREATE_CAMPAIGN_FOLDER',
                    folder_name: folderName,
                    subfolders: subfolders.split(',').map(s => s.trim()).filter(Boolean)
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            setForm({ ...form, drive_folder_id: data.folder_id });
            toast.success('📁 Pasta criada no Google Drive com subpastas!');
        } catch (err: any) {
            console.error('[handleCreateDriveFolder]', err);
            toast.error(err.message || 'Erro ao criar pasta no Drive');
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error('Título é obrigatório');
            return;
        }

        setIsSaving(true);
        const slug = form.slug || slugify(form.title);
        const payload = {
            ...form,
            slug,
            description: form.description || null,
            cover_image: form.cover_image || null,
            drive_folder_id: form.drive_folder_id || null,
            starts_at: form.starts_at || null,
            ends_at: form.ends_at || null,
        };

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('campanhas' as any)
                    .update(payload as any)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Campanha atualizada!');
            } else {
                const { error } = await supabase
                    .from('campanhas' as any)
                    .insert(payload as any);
                if (error) throw error;
                toast.success('Campanha criada!');
            }
            setShowForm(false);
            fetchCampanhas();
        } catch (err: any) {
            toast.error(err.message || 'Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (campanha: Campanha) => {
        const newStatus = campanha.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase
            .from('campanhas' as any)
            .update({ status: newStatus } as any)
            .eq('id', campanha.id);

        if (error) {
            toast.error('Erro ao atualizar status');
        } else {
            toast.success(`Campanha ${newStatus === 'active' ? 'ativada' : 'desativada'}`);
            fetchCampanhas();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;
        const { error } = await supabase.from('campanhas' as any).delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir');
        } else {
            toast.success('Campanha excluída');
            fetchCampanhas();
        }
    };

    const filtered = filterUnit === 'all'
        ? campanhas
        : filterUnit === 'clientes'
            ? campanhas.filter(c => !!(c as any).client_id)
            : campanhas.filter(c => c.unit === filterUnit && !(c as any).client_id);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Admin
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Megaphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">Campanhas</h1>
                                <p className="text-xs text-white/40">{campanhas.length} campanha(s)</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Campanha
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'universitario', 'fasb', 'clientes'].map(unit => (
                        <button
                            key={unit}
                            onClick={() => setFilterUnit(unit)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterUnit === unit
                                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                                : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
                                }`}
                        >
                            {unit === 'all' ? 'Todas' : unit === 'clientes' ? '👤 Clientes' : UNIT_LABELS[unit] || unit}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                        <Megaphone className="w-12 h-12 text-amber-400/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Nenhuma campanha</h3>
                        <p className="text-white/30 text-sm mb-6">Crie sua primeira campanha clicando no botão acima</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(campanha => (
                            <div
                                key={campanha.id}
                                className="group rounded-xl border border-white/5 bg-[#0a0a0a] p-5 flex items-center gap-5 hover:border-white/10 transition-all"
                            >
                                {/* Cover */}
                                <div className="w-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
                                    {campanha.cover_image ? (
                                        <img src={campanha.cover_image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-white/20" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-white truncate">{campanha.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${campanha.status === 'active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {campanha.status === 'active' ? 'Ativa' : 'Inativa'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40">
                                            {UNIT_LABELS[campanha.unit]}
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-sm truncate">{campanha.description || 'Sem descrição'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                                        {campanha.drive_folder_id && (
                                            <span className="flex items-center gap-1">
                                                <FolderOpen className="w-3 h-3" /> Drive vinculado
                                            </span>
                                        )}
                                        {campanha.starts_at && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(campanha.starts_at).toLocaleDateString('pt-BR')}
                                                {campanha.ends_at && ` — ${new Date(campanha.ends_at).toLocaleDateString('pt-BR')}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleStatus(campanha)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-all"
                                        title={campanha.status === 'active' ? 'Desativar' : 'Ativar'}
                                    >
                                        {campanha.status === 'active' ? (
                                            <ToggleRight className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <ToggleLeft className="w-5 h-5 text-white/30" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(campanha)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-all"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4 text-white/40" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campanha.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400/50" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#111] z-10">
                            <h3 className="text-lg font-semibold">
                                {editingId ? 'Editar Campanha' : 'Nova Campanha'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-5">
                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Título *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                            slug: editingId ? form.slug : slugify(e.target.value),
                                        });
                                    }}
                                    placeholder="Ex: Campanha de Matrícula 2026"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    placeholder="campanha-matricula-2026"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all text-sm font-mono"
                                />
                            </div>

                            {/* Unit + Status */}
                            <div className="grid gap-4" style={{ gridTemplateColumns: form.client_id ? '1fr' : '1fr 1fr' }}>
                                {!form.client_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Unidade *</label>
                                        <div className="flex gap-2">
                                            {(['universitario', 'fasb'] as const).map(unit => (
                                                <button
                                                    key={unit}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, unit })}
                                                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.unit === unit
                                                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                        : 'bg-white/5 border-white/10 text-white/40'
                                                        }`}
                                                >
                                                    {UNIT_LABELS[unit]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
                                    <div className="flex gap-2">
                                        {(['active', 'inactive'] as const).map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setForm({ ...form, status })}
                                                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.status === status
                                                    ? status === 'active'
                                                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                        : 'bg-red-500/20 border-red-500/30 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-white/40'
                                                    }`}
                                            >
                                                {status === 'active' ? 'Ativa' : 'Inativa'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cliente (para materiais de clientes regulares) */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    <Users className="w-4 h-4 inline mr-1.5 text-emerald-400" />
                                    Cliente específico <span className="text-white/30 font-normal">(deixe vazio para campanhas de faculdade)</span>
                                </label>
                                <select
                                    value={form.client_id || ''}
                                    onChange={(e) => setForm({ ...form, client_id: e.target.value || null })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                >
                                    <option value="" className="bg-[#0a0a0a]">— Sem cliente (faculdade) —</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Descrição</label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Descreva a campanha..."
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                                />
                            </div>

                            {/* Capa */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Imagem da Capa (Otimizada)</label>
                                <ImageUploader
                                    folder="campanhas"
                                    value={form.cover_image || ''}
                                    onUpload={(result) => setForm({ ...form, cover_image: result.url })}
                                    onRemove={() => setForm({ ...form, cover_image: '' })}
                                    maxSizeMB={1}
                                    maxWidthOrHeight={1920}
                                />
                            </div>

                            {/* Drive Folder ID */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    <FolderOpen className="w-4 h-4 inline mr-1" />
                                    Google Drive
                                </label>

                                {form.drive_folder_id ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-mono flex items-center gap-2">
                                            <FolderOpen className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{form.drive_folder_id}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.open(`https://drive.google.com/drive/folders/${form.drive_folder_id}`, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="flex items-center gap-1 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
                                            title="Abrir no Drive"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, drive_folder_id: '' })}
                                            className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                                            title="Remover"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3">
                                            <input
                                                type="text"
                                                value={subfolders}
                                                onChange={(e) => setSubfolders(e.target.value)}
                                                placeholder="Subpastas (ex: Feed, Stories, Vídeos) ou deixe vazio"
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateDriveFolder}
                                                disabled={isCreatingFolder || !form.title}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                            >
                                                {isCreatingFolder ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Criando pastas...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FolderOpen className="w-4 h-4" />
                                                        Criar Pasta e Subpastas
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/5"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="bg-[#111] px-2 text-white/20">ou cole o ID de uma pasta que já existe</span>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={form.drive_folder_id || ''}
                                            onChange={(e) => setForm({ ...form, drive_folder_id: e.target.value })}
                                            placeholder="Cole aqui o ID da pasta do Drive"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all font-mono text-sm"

                                        />
                                    </div>
                                )}
                                <p className="text-xs text-white/30 mt-2">
                                    Cria automaticamente subpastas: logos, fotos, social-media, videos, pdfs
                                </p>
                            </div>



                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Ordem de exibição</label>
                                <input
                                    type="number"
                                    value={form.sort_order}
                                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                    className="w-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {editingId ? 'Salvar Alterações' : 'Criar Campanha'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
