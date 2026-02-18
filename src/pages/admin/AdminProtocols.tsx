import { useState } from 'react';
import {
    FolderPlus,
    Send,
    Trash2,
    Search,
    ExternalLink,
    Filter,
    Loader2,
    AlertTriangle,
    FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useProtocols,
    useCreateDriveFolder,
    useEnableDelivery,
    useDeleteDriveFolder,
    useUpdateProtocolStatus,
} from '@/hooks/useProtocols';
import type { Protocol, ProtocolType, ProtocolStatus } from '@/types/protocol';
import {
    PROTOCOL_STATUS_LABELS,
    PROTOCOL_STATUS_COLORS,
    PROTOCOL_TYPE_LABELS,
} from '@/types/protocol';

const ALL_STATUSES: ProtocolStatus[] = [
    'DRAFT', 'SUBMITTED', 'APPROVED', 'IN_PRODUCTION',
    'READY_FOR_PICKUP', 'DELIVERED', 'REJECTED', 'CANCELED',
];

export default function AdminProtocols() {
    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<ProtocolType | ''>('');
    const [filterStatus, setFilterStatus] = useState<ProtocolStatus | ''>('');

    // Dialogs
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState<Protocol | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    // Create form
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<ProtocolType>('CLIENTE');
    const [newEmail, setNewEmail] = useState('');

    // Queries & mutations
    const { data: protocols = [], isLoading } = useProtocols({
        type: filterType || undefined,
        status: filterStatus || undefined,
        search: search || undefined,
    });
    const createFolder = useCreateDriveFolder();
    const enableDelivery = useEnableDelivery();
    const deleteFolder = useDeleteDriveFolder();
    const updateStatus = useUpdateProtocolStatus();

    const handleCreate = () => {
        if (!newName.trim()) return;
        createFolder.mutate(
            {
                display_name: newName,
                type: newType,
                customer_email: newEmail || undefined,
            },
            {
                onSuccess: () => {
                    setShowCreate(false);
                    setNewName('');
                    setNewEmail('');
                },
            }
        );
    };

    const handleDelete = () => {
        if (!showDelete || deleteConfirm !== showDelete.protocol_code) return;
        deleteFolder.mutate(showDelete.protocol_code, {
            onSuccess: () => {
                setShowDelete(null);
                setDeleteConfirm('');
            },
        });
    };

    return (
        <div className="space-y-6 p-6 bg-[#0a0a0a] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FolderOpen className="w-7 h-7 text-primary" />
                        Protocolos & Google Drive
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        {protocols.length} protocolo{protocols.length !== 1 ? 's' : ''} no sistema
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Novo Protocolo
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por código ou nome..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
                    />
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as ProtocolType | '')}>
                    <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white rounded-xl">
                        <Filter className="w-4 h-4 mr-2 text-white/40" />
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="CLIENTE">Cliente</SelectItem>
                        <SelectItem value="PREFEITURA">Prefeitura</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ProtocolStatus | '')}>
                    <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white rounded-xl">
                        <Filter className="w-4 h-4 mr-2 text-white/40" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {ALL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {PROTOCOL_STATUS_LABELS[s]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : protocols.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-white/5 border border-white/10">
                    <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-lg font-medium">Nenhum protocolo encontrado</p>
                    <p className="text-white/30 text-sm mt-1">Crie o primeiro protocolo acima</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Protocolo</th>
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Nome</th>
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Tipo</th>
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Drive</th>
                                <th className="text-left p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Entrega</th>
                                <th className="text-right p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {protocols.map((p) => (
                                <tr key={p.protocol_code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <span className="font-mono text-sm font-bold text-primary">{p.protocol_code}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-white">{p.display_name}</span>
                                        {p.customer_email && (
                                            <span className="block text-xs text-white/40 mt-0.5">{p.customer_email}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                            {PROTOCOL_TYPE_LABELS[p.type]}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge className={`text-xs ${PROTOCOL_STATUS_COLORS[p.status]}`}>
                                            {PROTOCOL_STATUS_LABELS[p.status]}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        {p.drive_folder_url ? (
                                            <a
                                                href={p.drive_folder_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Abrir pasta
                                            </a>
                                        ) : (
                                            <span className="text-xs text-white/30">—</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {p.delivery_link_enabled ? (
                                            <Badge className="text-xs bg-emerald-500/20 text-emerald-400">
                                                ✅ Liberado
                                            </Badge>
                                        ) : (
                                            <Badge className="text-xs bg-white/10 text-white/40">
                                                🔒 Bloqueado
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Enable delivery button */}
                                            {p.drive_folder_id && !p.delivery_link_enabled && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => enableDelivery.mutate(p.protocol_code)}
                                                    disabled={enableDelivery.isPending}
                                                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg"
                                                    title="Liberar entrega"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {/* Status update */}
                                            <Select
                                                value={p.status}
                                                onValueChange={(v) =>
                                                    updateStatus.mutate({ code: p.protocol_code, status: v as ProtocolStatus })
                                                }
                                            >
                                                <SelectTrigger className="w-8 h-8 p-0 bg-transparent border-none text-white/40 hover:text-white rounded-lg [&>svg]:hidden">
                                                    <Filter className="w-4 h-4" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_STATUSES.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {PROTOCOL_STATUS_LABELS[s]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Delete button */}
                                            {p.drive_folder_id && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setShowDelete(p)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                                    title="Apagar pasta"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ Dialog: Criar Protocolo ═══ */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FolderPlus className="w-5 h-5 text-primary" />
                            Novo Protocolo + Pasta Drive
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Cria o protocolo e a pasta no Google Drive automaticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="text-white/60 text-xs uppercase">Nome do Projeto</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Flyer Festa Junina"
                                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-white/60 text-xs uppercase">Tipo</Label>
                            <Select value={newType} onValueChange={(v) => setNewType(v as ProtocolType)}>
                                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                                    <SelectItem value="PREFEITURA">Prefeitura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-white/60 text-xs uppercase">Email do Cliente (opcional)</Label>
                            <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="cliente@email.com"
                                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl"
                            />
                            <p className="text-xs text-white/30 mt-1">
                                Se preenchido, a pasta será compartilhada com este email ao liberar entrega.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-white/60">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newName.trim() || createFolder.isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                        >
                            {createFolder.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FolderPlus className="w-4 h-4 mr-2" />
                            )}
                            Criar Protocolo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ Dialog: Confirmar Exclusão ═══ */}
            <Dialog open={!!showDelete} onOpenChange={() => { setShowDelete(null); setDeleteConfirm(''); }}>
                <DialogContent className="bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Apagar Pasta do Drive
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Esta ação é irreversível. A pasta e todos os arquivos dentro dela serão
                            permanentemente apagados do Google Drive.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-300">
                                Protocolo: <strong className="font-mono">{showDelete?.protocol_code}</strong>
                            </p>
                            <p className="text-sm text-red-300">
                                Projeto: <strong>{showDelete?.display_name}</strong>
                            </p>
                        </div>
                        <div>
                            <Label className="text-white/60 text-xs uppercase">
                                Digite o código do protocolo para confirmar
                            </Label>
                            <Input
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                placeholder={showDelete?.protocol_code}
                                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl font-mono"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => { setShowDelete(null); setDeleteConfirm(''); }}
                            className="text-white/60"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteConfirm !== showDelete?.protocol_code || deleteFolder.isPending}
                            className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
                        >
                            {deleteFolder.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Apagar Permanentemente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
