import React from 'react';
import { FileText, Download, Image, Film, FileArchive, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderDeliverables, useMarkDownloaded } from '@/hooks/useOrderDeliverables';
import { isDeliverableExpired } from '@/types/order-deliverable';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliverablesPanelProps {
    pedidoId: string;
}

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
    'image': Image,
    'video': Film,
    'application/zip': FileArchive,
    'application/pdf': FileText,
};

function getFileIcon(fileType: string | null) {
    if (!fileType) return FileText;
    for (const [key, Icon] of Object.entries(FILE_TYPE_ICONS)) {
        if (fileType.includes(key)) return Icon;
    }
    return FileText;
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeliverablesPanel({ pedidoId }: DeliverablesPanelProps) {
    const { data: deliverables = [], isLoading } = useOrderDeliverables(pedidoId);
    const markDownloaded = useMarkDownloaded();

    const finals = deliverables.filter(d => d.is_final);
    const partials = deliverables.filter(d => !d.is_final);

    const handleDownload = (id: string, url: string, pedidoId: string) => {
        markDownloaded.mutate({ id, pedido_id: pedidoId });
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
            </div>
        );
    }

    if (deliverables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <FileText className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-sm">Nenhum entregável ainda</p>
                <p className="text-xs text-gray-600 mt-1">Os arquivos aparecerão aqui quando enviados</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Final deliverables */}
            {finals.length > 0 && (
                <div>
                    <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Entrega Final ({finals.length})
                    </h4>
                    <div className="space-y-2">
                        {finals.map(d => (
                            <DeliverableItem key={d.id} deliverable={d} onDownload={handleDownload} pedidoId={pedidoId} />
                        ))}
                    </div>
                </div>
            )}

            {/* Partial deliverables */}
            {partials.length > 0 && (
                <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Entregas Parciais ({partials.length})
                    </h4>
                    <div className="space-y-2">
                        {partials.map(d => (
                            <DeliverableItem key={d.id} deliverable={d} onDownload={handleDownload} pedidoId={pedidoId} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DeliverableItem({ deliverable: d, onDownload, pedidoId }: {
    deliverable: import('@/types/order-deliverable').OrderDeliverable;
    onDownload: (id: string, url: string, pedidoId: string) => void;
    pedidoId: string;
}) {
    const expired = isDeliverableExpired(d);
    const Icon = getFileIcon(d.file_type);

    return (
        <div className={`
      flex items-center gap-3 p-3 rounded-xl border transition-all
      ${expired
                ? 'bg-red-500/5 border-red-500/20 opacity-60'
                : 'bg-white/[0.03] border-white/[0.06] hover:border-[#CCFF00]/20'
            }
    `}>
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${expired
                    ? 'bg-red-500/10'
                    : d.is_final
                        ? 'bg-green-500/10'
                        : 'bg-white/[0.05]'
                }`}>
                <Icon className={`w-4 h-4 ${expired ? 'text-red-400' : d.is_final ? 'text-green-400' : 'text-gray-400'
                    }`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{d.file_name}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    {d.file_size && <span>{formatFileSize(d.file_size)}</span>}
                    <span>•</span>
                    <span>{format(new Date(d.delivered_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    {d.downloaded_at && (
                        <>
                            <span>•</span>
                            <span className="text-green-500 flex items-center gap-0.5">
                                <Download className="w-2.5 h-2.5" /> Baixado
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            {expired ? (
                <div className="flex items-center gap-1.5 text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Expirado</span>
                </div>
            ) : (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(d.id, d.file_url, pedidoId)}
                    className="text-gray-400 hover:text-[#CCFF00] h-8"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </Button>
            )}

            {/* Expiry info */}
            {!expired && d.expires_at && (
                <span className="text-[10px] text-gray-600 hidden lg:block">
                    Expira {formatDistanceToNow(new Date(d.expires_at), { addSuffix: true, locale: ptBR })}
                </span>
            )}
        </div>
    );
}
