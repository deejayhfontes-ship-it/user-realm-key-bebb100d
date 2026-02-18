import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle, Plus, DollarSign, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOrderRevisions, useCreateRevision, useUpdateRevisionStatus } from '@/hooks/useOrderRevisions';
import { REVISION_STATUS_LABELS, REVISION_STATUS_COLORS } from '@/types/order-revision';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RevisionStatus } from '@/types/order-revision';

interface RevisionPanelProps {
    pedidoId: string;
    maxRevisions: number;
    revisionCount: number;
    isAdmin?: boolean;
}

export function RevisionPanel({ pedidoId, maxRevisions, revisionCount, isAdmin = true }: RevisionPanelProps) {
    const { data: revisions = [], isLoading } = useOrderRevisions(pedidoId);
    const createRevision = useCreateRevision();
    const updateStatus = useUpdateRevisionStatus();
    const [isCreating, setIsCreating] = useState(false);
    const [description, setDescription] = useState('');
    const [responseText, setResponseText] = useState('');
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    const hasExhausted = revisionCount >= maxRevisions;
    const remaining = Math.max(0, maxRevisions - revisionCount);

    const handleCreate = () => {
        if (!description.trim()) return;
        createRevision.mutate(
            { pedido_id: pedidoId, description, requested_by: isAdmin ? 'admin' : 'client' },
            { onSuccess: () => { setDescription(''); setIsCreating(false); } }
        );
    };

    const handleStatusUpdate = (id: string, status: RevisionStatus) => {
        updateStatus.mutate({
            id,
            pedido_id: pedidoId,
            status,
            admin_response: respondingTo === id ? responseText : undefined,
        }, {
            onSuccess: () => { setRespondingTo(null); setResponseText(''); }
        });
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'in_progress': return <RotateCcw className="w-4 h-4 text-blue-400" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Revision counter */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasExhausted
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-[#CCFF00]/10 border border-[#CCFF00]/20'
                        }`}>
                        <RotateCcw className={`w-5 h-5 ${hasExhausted ? 'text-amber-400' : 'text-[#CCFF00]'}`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">
                            {revisionCount} / {maxRevisions} revisões
                        </p>
                        <p className="text-[11px] text-gray-500">
                            {hasExhausted ? 'Revisões inclusas esgotadas' : `${remaining} restante(s)`}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-20 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${hasExhausted ? 'bg-amber-400' : 'bg-[#CCFF00]'
                            }`}
                        style={{ width: `${Math.min((revisionCount / maxRevisions) * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Extra revision warning */}
            {hasExhausted && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-amber-400 font-medium">Revisões inclusas esgotadas</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Novas revisões serão cobradas como extras
                        </p>
                    </div>
                </div>
            )}

            {/* Create revision */}
            {!isCreating ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(true)}
                    className="w-full border-dashed border-white/10 text-gray-400 hover:text-[#CCFF00] 
            hover:border-[#CCFF00]/30 bg-transparent"
                >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Solicitar Revisão
                    {hasExhausted && (
                        <span className="ml-2 text-[10px] text-amber-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Extra
                        </span>
                    )}
                </Button>
            ) : (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o que precisa ser ajustado..."
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600
              focus:border-[#CCFF00]/40 min-h-[80px]"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleCreate}
                            disabled={!description.trim() || createRevision.isPending}
                            className="bg-[#CCFF00] text-black hover:bg-[#CCFF00]/80"
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Enviar
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setIsCreating(false); setDescription(''); }}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Revisions timeline */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-3">
                    {revisions.map((rev) => (
                        <div key={rev.id} className="relative pl-6">
                            {/* Timeline line */}
                            <div className="absolute left-[7px] top-8 bottom-0 w-px bg-white/[0.06]" />

                            {/* Timeline dot */}
                            <div className="absolute left-0 top-3">
                                {statusIcon(rev.status)}
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${REVISION_STATUS_COLORS[rev.status]}`}>
                                            {REVISION_STATUS_LABELS[rev.status]}
                                        </span>
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            #{rev.revision_number}
                                        </span>
                                        {rev.is_extra && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                                <DollarSign className="w-2.5 h-2.5" /> Extra
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-600">
                                        {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-300 mb-2">{rev.description}</p>

                                {rev.admin_response && (
                                    <div className="mt-2 p-2 rounded-lg bg-[#CCFF00]/5 border border-[#CCFF00]/10">
                                        <p className="text-[10px] text-[#CCFF00] mb-0.5">Resposta:</p>
                                        <p className="text-xs text-gray-400">{rev.admin_response}</p>
                                    </div>
                                )}

                                {/* Admin actions */}
                                {isAdmin && rev.status === 'pending' && (
                                    <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-2">
                                        {respondingTo === rev.id ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={responseText}
                                                    onChange={(e) => setResponseText(e.target.value)}
                                                    placeholder="Resposta opcional..."
                                                    className="bg-white/[0.03] border-white/[0.08] text-white text-xs min-h-[60px]"
                                                />
                                                <div className="flex gap-1.5">
                                                    <Button size="sm" onClick={() => handleStatusUpdate(rev.id, 'in_progress')}
                                                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs h-7">
                                                        <RotateCcw className="w-3 h-3 mr-1" /> Iniciar
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleStatusUpdate(rev.id, 'completed')}
                                                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs h-7">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Concluir
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleStatusUpdate(rev.id, 'rejected')}
                                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs h-7">
                                                        <XCircle className="w-3 h-3 mr-1" /> Rejeitar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => setRespondingTo(rev.id)}
                                                className="text-gray-500 hover:text-[#CCFF00] text-xs h-7">
                                                Responder
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {rev.resolved_at && (
                                    <p className="text-[10px] text-gray-600 mt-2">
                                        Resolvida em {format(new Date(rev.resolved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
