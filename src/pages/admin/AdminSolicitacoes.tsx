<<<<<<< HEAD
import { useState, useEffect } from 'react';
import {
    FileText, Search, Clock, CheckCircle, BarChart3, AlertTriangle,
    ChevronDown, ChevronUp, Eye, Save, Filter, RefreshCw, FolderOpen, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendMaterialPronto } from '@/lib/webhooks';
import { useCreateDriveFolder } from '@/hooks/useProtocols';
import { toast } from 'sonner';


const STATUS_OPTIONS = [
    { value: 'novo', label: 'Novo', color: '#2563EB' },
    { value: 'em-producao', label: 'Em Produção', color: '#D97706' },
    { value: 'em-revisao', label: 'Em Revisão', color: '#7C3AED' },
    { value: 'aprovado', label: 'Aprovado', color: '#059669' },
    { value: 'entregue', label: 'Entregue', color: '#10B981' },
];

export default function AdminSolicitacoes() {
    const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editando, setEditando] = useState<string | null>(null);
    const [novoStatus, setNovoStatus] = useState('');
    const [novoProgresso, setNovoProgresso] = useState(0);
    const [atrasado, setAtrasado] = useState(false);
    const [justificativaAtraso, setJustificativaAtraso] = useState('');
    const [observacaoAdmin, setObservacaoAdmin] = useState('');
    const [criandoPasta, setCriandoPasta] = useState<string | null>(null);
    const createDriveFolder = useCreateDriveFolder();

    const carregarSolicitacoes = () => {
        const data = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
        setSolicitacoes(data.sort((a: any, b: any) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        ));
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const iniciarEdicao = (sol: any) => {
        setEditando(sol.protocolo);
        setNovoStatus(sol.status || 'novo');
        setNovoProgresso(sol.progresso || 0);
        setAtrasado(sol.atrasado || false);
        setJustificativaAtraso(sol.justificativaAtraso || '');
        setObservacaoAdmin('');
        setExpandedId(sol.protocolo);
    };

    const salvarAtualizacao = (protocolo: string) => {
        const existentes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
        const index = existentes.findIndex((s: any) => s.protocolo === protocolo);

        if (index === -1) return;

        const statusLabel = STATUS_OPTIONS.find(s => s.value === novoStatus)?.label || novoStatus;

        // Atualizar campos
        existentes[index].status = novoStatus;
        existentes[index].progresso = novoProgresso;
        existentes[index].atrasado = atrasado;
        existentes[index].justificativaAtraso = atrasado ? justificativaAtraso : '';
        existentes[index].ultimaAtualizacao = new Date().toISOString();

        // Adicionar ao histórico
        if (!existentes[index].historico) existentes[index].historico = [];

        existentes[index].historico.push({
            data: new Date().toISOString(),
            acao: `Status atualizado para: ${statusLabel} (${novoProgresso}%)`,
            usuario: 'Admin',
            observacao: observacaoAdmin || undefined
        });

        if (atrasado && justificativaAtraso) {
            existentes[index].historico.push({
                data: new Date().toISOString(),
                acao: `Atraso registrado`,
                usuario: 'Admin',
                observacao: `Justificativa: ${justificativaAtraso}`
            });
        }

        localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(existentes));

        // Se progresso chegou a 100% e ainda não tem pasta Drive, criar automaticamente
        const sol = existentes[index];
        if (novoProgresso === 100 && !sol.driveFolderUrl) {
            setCriandoPasta(protocolo);
            const displayName = sol.projeto?.titulo || sol.solicitante?.nome || protocolo;
            createDriveFolder.mutate(
                { display_name: displayName, type: 'PREFEITURA' as any },
                {
                    onSuccess: (data) => {
                        // Salvar URL da pasta no localStorage
                        const atualizado = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
                        const idx = atualizado.findIndex((s: any) => s.protocolo === protocolo);
                        if (idx !== -1) {
                            atualizado[idx].driveFolderUrl = data.protocol?.drive_folder_url || data.drive_folder_url;
                            atualizado[idx].driveFolderId = data.protocol?.drive_folder_id || data.drive_folder_id;
                            atualizado[idx].protocolCode = data.protocol?.protocol_code || data.protocol_code;
                            localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(atualizado));
                        }
                        setCriandoPasta(null);
                        toast.success('📁 Pasta criada no Google Drive!');
                        carregarSolicitacoes();
                    },
                    onError: () => {
                        setCriandoPasta(null);
                    },
                }
            );
        }

        // Se marcou como entregue/aprovado, notificar o cliente via WhatsApp
        if (novoStatus === 'entregue' || novoStatus === 'aprovado') {
            const telefone = sol.solicitante?.telefone?.replace(/\D/g, '') || '';
            const telefoneFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;

            sendMaterialPronto({
                protocolo: sol.protocolo,
                titulo: sol.projeto?.titulo || 'Material',
                telefoneCliente: telefoneFormatado,
                linkEntrega: `${window.location.origin}/acompanhamento/${sol.protocolo}`,
            });
        }

        setEditando(null);
        carregarSolicitacoes();
    };

    const getStatusColor = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.color || '#888';
    };

    const getStatusLabel = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.label || 'Novo';
    };

    const solicitacoesFiltradas = solicitacoes.filter(sol => {
        const matchStatus = filtroStatus === 'todos' || sol.status === filtroStatus;
        const matchBusca = !filtroBusca ||
            sol.protocolo?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            sol.solicitante?.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            sol.projeto?.titulo?.toLowerCase().includes(filtroBusca.toLowerCase());
        return matchStatus && matchBusca;
    });

    return (
        <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-7 h-7 text-primary" />
                        Solicitações Prefeitura
                    </h1>
                    <p className="text-white/60 text-sm mt-1">{solicitacoes.length} solicitações no sistema</p>
                </div>
                <Button onClick={carregarSolicitacoes} className="bg-primary text-black hover:bg-primary/90 rounded-xl font-semibold">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        placeholder="Buscar por protocolo, nome ou título..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFiltroStatus('todos')}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filtroStatus === 'todos' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Todos
                    </button>
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => setFiltroStatus(s.value)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filtroStatus === s.value ? 'bg-primary text-black' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista */}
            {solicitacoesFiltradas.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-white/5 border border-white/10">
                    <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-lg font-medium">Nenhuma solicitação encontrada</p>
                    <p className="text-white/30 text-sm mt-1">Ajuste os filtros ou aguarde novos envios</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {solicitacoesFiltradas.map(sol => {
                        const isExpanded = expandedId === sol.protocolo;
                        const isEditing = editando === sol.protocolo;

                        return (
                            <div key={sol.protocolo} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all">
                                {/* Cabeçalho do item */}
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all"
                                    onClick={() => setExpandedId(isExpanded ? null : sol.protocolo)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-mono font-bold text-primary">{sol.protocolo}</span>
                                            <span
                                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: `${getStatusColor(sol.status || 'novo')}20`, color: getStatusColor(sol.status || 'novo') }}
                                            >
                                                {getStatusLabel(sol.status || 'novo')}
                                            </span>
                                            {sol.atrasado && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Atrasado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white text-sm font-medium truncate">{sol.projeto?.titulo || 'Sem título'}</p>
                                        <p className="text-white/40 text-xs mt-0.5">
                                            {sol.solicitante?.nome} • {sol.solicitante?.departamento} • {sol.projeto?.tipo}
                                        </p>
                                    </div>

                                    {/* Mini barra de progresso */}
                                    <div className="hidden sm:flex items-center gap-2 w-32">
                                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${sol.progresso || 0}%`, background: '#C7FF10' }} />
                                        </div>
                                        <span className="text-xs text-white/50 w-8 text-right font-mono">{sol.progresso || 0}%</span>
                                    </div>

                                    <div className="text-white/30">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Corpo expandido */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-5 space-y-4">
                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Solicitante</p>
                                                <p className="text-sm text-white mt-0.5">{sol.solicitante?.nome}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Departamento</p>
                                                <p className="text-sm text-white mt-0.5">{sol.solicitante?.departamento}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Prazo</p>
                                                <p className="text-sm text-white mt-0.5">{sol.dataEntrega || 'A definir'}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Prioridade</p>
                                                <p className="text-sm text-white mt-0.5 capitalize">{sol.prioridade}</p>
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        {sol.projeto?.descricao && (
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium mb-1">Descrição</p>
                                                <p className="text-sm text-white/80">{sol.projeto.descricao}</p>
                                            </div>
                                        )}

                                        {/* Pasta do Google Drive */}
                                        {sol.driveFolderUrl && (
                                            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                    <FolderOpen className="w-4.5 h-4.5 text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-green-400 uppercase tracking-wider">Pasta de Entrega</p>
                                                    <p className="text-[11px] text-white/50 mt-0.5 truncate">
                                                        {sol.protocolCode || 'Google Drive'}
                                                    </p>
                                                </div>
                                                <a
                                                    href={sol.driveFolderUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Abrir Pasta
                                                </a>
                                            </div>
                                        )}
                                        {criandoPasta === sol.protocolo && (
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                <p className="text-xs text-primary">Criando pasta no Google Drive...</p>
                                            </div>
                                        )}

                                        {/* Painel de Edição */}
                                        {isEditing ? (
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                                                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Atualizar Solicitação</h4>

                                                {/* Status */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">Status</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {STATUS_OPTIONS.map(s => (
                                                            <button
                                                                key={s.value}
                                                                onClick={() => setNovoStatus(s.value)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${novoStatus === s.value
                                                                    ? 'border-primary bg-primary/20 text-primary'
                                                                    : 'border-white/10 text-white/50 hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Progresso */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">
                                                        Progresso: <span className="text-primary font-bold">{novoProgresso}%</span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="5"
                                                        value={novoProgresso}
                                                        onChange={(e) => setNovoProgresso(Number(e.target.value))}
                                                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                                        style={{ background: `linear-gradient(to right, #C7FF10 0%, #C7FF10 ${novoProgresso}%, rgba(255,255,255,0.1) ${novoProgresso}%, rgba(255,255,255,0.1) 100%)` }}
                                                    />
                                                </div>

                                                {/* Atraso */}
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <button
                                                            onClick={() => setAtrasado(!atrasado)}
                                                            className={`w-10 h-6 rounded-full transition-all relative ${atrasado ? 'bg-amber-500' : 'bg-white/10'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${atrasado ? 'right-1' : 'left-1'}`} />
                                                        </button>
                                                        <label className="text-xs text-white/60 font-medium uppercase">Solicitação Atrasada</label>
                                                    </div>
                                                    {atrasado && (
                                                        <Textarea
                                                            value={justificativaAtraso}
                                                            onChange={(e) => setJustificativaAtraso(e.target.value)}
                                                            placeholder="Justificativa do atraso (visível ao cliente)..."
                                                            rows={2}
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none text-sm"
                                                        />
                                                    )}
                                                </div>

                                                {/* Observação */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">Observação (visível no histórico)</label>
                                                    <Textarea
                                                        value={observacaoAdmin}
                                                        onChange={(e) => setObservacaoAdmin(e.target.value)}
                                                        placeholder="Observação sobre esta atualização..."
                                                        rows={2}
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none text-sm"
                                                    />
                                                </div>

                                                {/* Botões */}
                                                <div className="flex gap-3 pt-1">
                                                    <Button
                                                        onClick={() => salvarAtualizacao(sol.protocolo)}
                                                        className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Salvar Atualização
                                                    </Button>
                                                    <Button
                                                        onClick={() => setEditando(null)}
                                                        variant="ghost"
                                                        className="rounded-xl text-white/60 hover:bg-white/5"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => iniciarEdicao(sol)}
                                                className="rounded-xl bg-primary text-black hover:bg-primary/90 font-semibold"
                                            >
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Atualizar Progresso
                                            </Button>
                                        )}

                                        {/* Histórico */}
                                        {sol.historico && sol.historico.length > 0 && (
                                            <div>
                                                <h4 className="text-xs text-white/40 font-medium uppercase mb-2">Histórico</h4>
                                                <div className="space-y-2">
                                                    {[...sol.historico].reverse().map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: idx === 0 ? '#C7FF10' : 'rgba(255,255,255,0.15)' }} />
                                                            <div>
                                                                <p className="text-xs text-white/80">{item.acao}</p>
                                                                {item.observacao && <p className="text-xs text-white/50 mt-0.5">{item.observacao}</p>}
                                                                <p className="text-[10px] text-white/30 mt-0.5">
                                                                    {new Date(item.data).toLocaleString('pt-BR')} {item.usuario && `• ${item.usuario}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
=======
import { useState, useEffect } from 'react';
import {
    FileText, Search, Clock, CheckCircle, BarChart3, AlertTriangle,
    ChevronDown, ChevronUp, Eye, Save, Filter, RefreshCw, FolderOpen, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendMaterialPronto } from '@/lib/webhooks';
import { useCreateDriveFolder } from '@/hooks/useProtocols';
import { toast } from 'sonner';


const STATUS_OPTIONS = [
    { value: 'novo', label: 'Novo', color: '#2563EB' },
    { value: 'em-producao', label: 'Em Produção', color: '#D97706' },
    { value: 'em-revisao', label: 'Em Revisão', color: '#7C3AED' },
    { value: 'aprovado', label: 'Aprovado', color: '#059669' },
    { value: 'entregue', label: 'Entregue', color: '#10B981' },
];

export default function AdminSolicitacoes() {
    const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editando, setEditando] = useState<string | null>(null);
    const [novoStatus, setNovoStatus] = useState('');
    const [novoProgresso, setNovoProgresso] = useState(0);
    const [atrasado, setAtrasado] = useState(false);
    const [justificativaAtraso, setJustificativaAtraso] = useState('');
    const [observacaoAdmin, setObservacaoAdmin] = useState('');
    const [criandoPasta, setCriandoPasta] = useState<string | null>(null);
    const createDriveFolder = useCreateDriveFolder();

    const carregarSolicitacoes = () => {
        const data = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
        setSolicitacoes(data.sort((a: any, b: any) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        ));
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const iniciarEdicao = (sol: any) => {
        setEditando(sol.protocolo);
        setNovoStatus(sol.status || 'novo');
        setNovoProgresso(sol.progresso || 0);
        setAtrasado(sol.atrasado || false);
        setJustificativaAtraso(sol.justificativaAtraso || '');
        setObservacaoAdmin('');
        setExpandedId(sol.protocolo);
    };

    const salvarAtualizacao = (protocolo: string) => {
        const existentes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
        const index = existentes.findIndex((s: any) => s.protocolo === protocolo);

        if (index === -1) return;

        const statusLabel = STATUS_OPTIONS.find(s => s.value === novoStatus)?.label || novoStatus;

        // Atualizar campos
        existentes[index].status = novoStatus;
        existentes[index].progresso = novoProgresso;
        existentes[index].atrasado = atrasado;
        existentes[index].justificativaAtraso = atrasado ? justificativaAtraso : '';
        existentes[index].ultimaAtualizacao = new Date().toISOString();

        // Adicionar ao histórico
        if (!existentes[index].historico) existentes[index].historico = [];

        existentes[index].historico.push({
            data: new Date().toISOString(),
            acao: `Status atualizado para: ${statusLabel} (${novoProgresso}%)`,
            usuario: 'Admin',
            observacao: observacaoAdmin || undefined
        });

        if (atrasado && justificativaAtraso) {
            existentes[index].historico.push({
                data: new Date().toISOString(),
                acao: `Atraso registrado`,
                usuario: 'Admin',
                observacao: `Justificativa: ${justificativaAtraso}`
            });
        }

        localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(existentes));

        // Se progresso chegou a 100% e ainda não tem pasta Drive, criar automaticamente
        const sol = existentes[index];
        if (novoProgresso === 100 && !sol.driveFolderUrl) {
            setCriandoPasta(protocolo);
            const displayName = sol.projeto?.titulo || sol.solicitante?.nome || protocolo;
            createDriveFolder.mutate(
                { display_name: displayName, type: 'PREFEITURA' as any },
                {
                    onSuccess: (data) => {
                        // Salvar URL da pasta no localStorage
                        const atualizado = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
                        const idx = atualizado.findIndex((s: any) => s.protocolo === protocolo);
                        if (idx !== -1) {
                            atualizado[idx].driveFolderUrl = data.protocol?.drive_folder_url || data.drive_folder_url;
                            atualizado[idx].driveFolderId = data.protocol?.drive_folder_id || data.drive_folder_id;
                            atualizado[idx].protocolCode = data.protocol?.protocol_code || data.protocol_code;
                            localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(atualizado));
                        }
                        setCriandoPasta(null);
                        toast.success('📁 Pasta criada no Google Drive!');
                        carregarSolicitacoes();
                    },
                    onError: () => {
                        setCriandoPasta(null);
                    },
                }
            );
        }

        // Se marcou como entregue/aprovado, notificar o cliente via WhatsApp
        if (novoStatus === 'entregue' || novoStatus === 'aprovado') {
            const telefone = sol.solicitante?.telefone?.replace(/\D/g, '') || '';
            const telefoneFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;

            sendMaterialPronto({
                protocolo: sol.protocolo,
                titulo: sol.projeto?.titulo || 'Material',
                telefoneCliente: telefoneFormatado,
                linkEntrega: `${window.location.origin}/acompanhamento/${sol.protocolo}`,
            });
        }

        setEditando(null);
        carregarSolicitacoes();
    };

    const getStatusColor = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.color || '#888';
    };

    const getStatusLabel = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.label || 'Novo';
    };

    const solicitacoesFiltradas = solicitacoes.filter(sol => {
        const matchStatus = filtroStatus === 'todos' || sol.status === filtroStatus;
        const matchBusca = !filtroBusca ||
            sol.protocolo?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            sol.solicitante?.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            sol.projeto?.titulo?.toLowerCase().includes(filtroBusca.toLowerCase());
        return matchStatus && matchBusca;
    });

    return (
        <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-7 h-7 text-primary" />
                        Solicitações Prefeitura
                    </h1>
                    <p className="text-white/60 text-sm mt-1">{solicitacoes.length} solicitações no sistema</p>
                </div>
                <Button onClick={carregarSolicitacoes} className="bg-primary text-black hover:bg-primary/90 rounded-xl font-semibold">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        placeholder="Buscar por protocolo, nome ou título..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFiltroStatus('todos')}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filtroStatus === 'todos' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Todos
                    </button>
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => setFiltroStatus(s.value)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filtroStatus === s.value ? 'bg-primary text-black' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista */}
            {solicitacoesFiltradas.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-white/5 border border-white/10">
                    <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-lg font-medium">Nenhuma solicitação encontrada</p>
                    <p className="text-white/30 text-sm mt-1">Ajuste os filtros ou aguarde novos envios</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {solicitacoesFiltradas.map(sol => {
                        const isExpanded = expandedId === sol.protocolo;
                        const isEditing = editando === sol.protocolo;

                        return (
                            <div key={sol.protocolo} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all">
                                {/* Cabeçalho do item */}
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all"
                                    onClick={() => setExpandedId(isExpanded ? null : sol.protocolo)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-mono font-bold text-primary">{sol.protocolo}</span>
                                            <span
                                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: `${getStatusColor(sol.status || 'novo')}20`, color: getStatusColor(sol.status || 'novo') }}
                                            >
                                                {getStatusLabel(sol.status || 'novo')}
                                            </span>
                                            {sol.atrasado && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Atrasado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white text-sm font-medium truncate">{sol.projeto?.titulo || 'Sem título'}</p>
                                        <p className="text-white/40 text-xs mt-0.5">
                                            {sol.solicitante?.nome} • {sol.solicitante?.departamento} • {sol.projeto?.tipo}
                                        </p>
                                    </div>

                                    {/* Mini barra de progresso */}
                                    <div className="hidden sm:flex items-center gap-2 w-32">
                                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${sol.progresso || 0}%`, background: '#C7FF10' }} />
                                        </div>
                                        <span className="text-xs text-white/50 w-8 text-right font-mono">{sol.progresso || 0}%</span>
                                    </div>

                                    <div className="text-white/30">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Corpo expandido */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-5 space-y-4">
                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Solicitante</p>
                                                <p className="text-sm text-white mt-0.5">{sol.solicitante?.nome}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Departamento</p>
                                                <p className="text-sm text-white mt-0.5">{sol.solicitante?.departamento}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Prazo</p>
                                                <p className="text-sm text-white mt-0.5">{sol.dataEntrega || 'A definir'}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium">Prioridade</p>
                                                <p className="text-sm text-white mt-0.5 capitalize">{sol.prioridade}</p>
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        {sol.projeto?.descricao && (
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <p className="text-[10px] uppercase text-white/40 font-medium mb-1">Descrição</p>
                                                <p className="text-sm text-white/80">{sol.projeto.descricao}</p>
                                            </div>
                                        )}

                                        {/* Pasta do Google Drive */}
                                        {sol.driveFolderUrl && (
                                            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                    <FolderOpen className="w-4.5 h-4.5 text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-green-400 uppercase tracking-wider">Pasta de Entrega</p>
                                                    <p className="text-[11px] text-white/50 mt-0.5 truncate">
                                                        {sol.protocolCode || 'Google Drive'}
                                                    </p>
                                                </div>
                                                <a
                                                    href={sol.driveFolderUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Abrir Pasta
                                                </a>
                                            </div>
                                        )}
                                        {criandoPasta === sol.protocolo && (
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                <p className="text-xs text-primary">Criando pasta no Google Drive...</p>
                                            </div>
                                        )}

                                        {/* Painel de Edição */}
                                        {isEditing ? (
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                                                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Atualizar Solicitação</h4>

                                                {/* Status */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">Status</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {STATUS_OPTIONS.map(s => (
                                                            <button
                                                                key={s.value}
                                                                onClick={() => setNovoStatus(s.value)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${novoStatus === s.value
                                                                    ? 'border-primary bg-primary/20 text-primary'
                                                                    : 'border-white/10 text-white/50 hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Progresso */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">
                                                        Progresso: <span className="text-primary font-bold">{novoProgresso}%</span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="5"
                                                        value={novoProgresso}
                                                        onChange={(e) => setNovoProgresso(Number(e.target.value))}
                                                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                                        style={{ background: `linear-gradient(to right, #C7FF10 0%, #C7FF10 ${novoProgresso}%, rgba(255,255,255,0.1) ${novoProgresso}%, rgba(255,255,255,0.1) 100%)` }}
                                                    />
                                                </div>

                                                {/* Atraso */}
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <button
                                                            onClick={() => setAtrasado(!atrasado)}
                                                            className={`w-10 h-6 rounded-full transition-all relative ${atrasado ? 'bg-amber-500' : 'bg-white/10'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${atrasado ? 'right-1' : 'left-1'}`} />
                                                        </button>
                                                        <label className="text-xs text-white/60 font-medium uppercase">Solicitação Atrasada</label>
                                                    </div>
                                                    {atrasado && (
                                                        <Textarea
                                                            value={justificativaAtraso}
                                                            onChange={(e) => setJustificativaAtraso(e.target.value)}
                                                            placeholder="Justificativa do atraso (visível ao cliente)..."
                                                            rows={2}
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none text-sm"
                                                        />
                                                    )}
                                                </div>

                                                {/* Observação */}
                                                <div>
                                                    <label className="text-xs text-white/60 font-medium uppercase block mb-1.5">Observação (visível no histórico)</label>
                                                    <Textarea
                                                        value={observacaoAdmin}
                                                        onChange={(e) => setObservacaoAdmin(e.target.value)}
                                                        placeholder="Observação sobre esta atualização..."
                                                        rows={2}
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none text-sm"
                                                    />
                                                </div>

                                                {/* Botões */}
                                                <div className="flex gap-3 pt-1">
                                                    <Button
                                                        onClick={() => salvarAtualizacao(sol.protocolo)}
                                                        className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Salvar Atualização
                                                    </Button>
                                                    <Button
                                                        onClick={() => setEditando(null)}
                                                        variant="ghost"
                                                        className="rounded-xl text-white/60 hover:bg-white/5"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => iniciarEdicao(sol)}
                                                className="rounded-xl bg-primary text-black hover:bg-primary/90 font-semibold"
                                            >
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Atualizar Progresso
                                            </Button>
                                        )}

                                        {/* Histórico */}
                                        {sol.historico && sol.historico.length > 0 && (
                                            <div>
                                                <h4 className="text-xs text-white/40 font-medium uppercase mb-2">Histórico</h4>
                                                <div className="space-y-2">
                                                    {[...sol.historico].reverse().map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: idx === 0 ? '#C7FF10' : 'rgba(255,255,255,0.15)' }} />
                                                            <div>
                                                                <p className="text-xs text-white/80">{item.acao}</p>
                                                                {item.observacao && <p className="text-xs text-white/50 mt-0.5">{item.observacao}</p>}
                                                                <p className="text-[10px] text-white/30 mt-0.5">
                                                                    {new Date(item.data).toLocaleString('pt-BR')} {item.usuario && `• ${item.usuario}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
