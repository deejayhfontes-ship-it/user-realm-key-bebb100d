import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicTracking, PUBLIC_STATUS_MAP, getTrackingProgress } from '@/hooks/usePublicTracking';
import { ACTION_LABELS } from '@/hooks/useOrderActivityLog';
import { CheckCircle, Clock, FileText, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicTracking() {
    const { protocolo } = useParams<{ protocolo: string }>();
    const { data, isLoading, error } = usePublicTracking(protocolo);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
                    <p className="text-sm text-gray-400">Buscando pedido...</p>
                </div>
            </div>
        );
    }

    if (!data || error) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 
            flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">Pedido não encontrado</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Verifique se o protocolo está correto ou entre em contato conosco.
                    </p>
                    <Link to="/" className="text-sm text-[#CCFF00] hover:underline inline-flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao início
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = PUBLIC_STATUS_MAP[data.pedido.status] || { label: data.pedido.status, step: 0, color: '#666' };
    const progress = getTrackingProgress(data.pedido.status);

    const steps = [
        { label: 'Briefing', step: 1 },
        { label: 'Orçamento', step: 2 },
        { label: 'Pagamento', step: 3 },
        { label: 'Produção', step: 4 },
        { label: 'Revisão', step: 5 },
        { label: 'Entrega', step: 6 },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a14]">
            {/* Header */}
            <header className="border-b border-white/[0.06] bg-[#0f0f1a]/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                            Acompanhamento
                        </p>
                        <h1 className="text-lg font-semibold text-white font-mono tracking-wider">
                            {data.pedido.protocolo}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">{data.pedido.nome}</p>
                        {data.pedido.servico && (
                            <p className="text-[10px] text-[#CCFF00]">{data.pedido.servico}</p>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* Status Hero */}
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent 
          border border-white/[0.06] p-6 text-center">
                    <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${statusInfo.color}20`, border: `1px solid ${statusInfo.color}40` }}
                    >
                        {data.pedido.status === 'finalizado' ? (
                            <CheckCircle className="w-7 h-7" style={{ color: statusInfo.color }} />
                        ) : (
                            <Clock className="w-7 h-7" style={{ color: statusInfo.color }} />
                        )}
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">{statusInfo.label}</h2>
                    <p className="text-sm text-gray-500">
                        {data.pedido.prazo_final
                            ? `Previsão de entrega: ${format(new Date(data.pedido.prazo_final), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                            : 'Prazo será definido após aprovação'
                        }
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between relative">
                        {/* Connection line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/[0.06]" />
                        <div
                            className="absolute top-4 left-6 h-0.5 bg-[#CCFF00] transition-all duration-500"
                            style={{ width: `${Math.max(0, ((progress.step - 1) / (progress.total - 1)) * 100)}%`, maxWidth: 'calc(100% - 48px)' }}
                        />

                        {steps.map(({ label, step }) => {
                            const isCompleted = progress.step >= step;
                            const isCurrent = progress.step === step;
                            return (
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
                    transition-all duration-300
                    ${isCompleted
                                            ? 'bg-[#CCFF00] text-black font-bold'
                                            : isCurrent
                                                ? 'bg-[#CCFF00]/20 text-[#CCFF00] border-2 border-[#CCFF00]'
                                                : 'bg-white/[0.05] text-gray-600 border border-white/[0.08]'
                                        }
                  `}>
                                        {isCompleted && !isCurrent ? '✓' : step}
                                    </div>
                                    <span className={`text-[10px] mt-2 ${isCompleted ? 'text-[#CCFF00]' : 'text-gray-600'
                                        }`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline */}
                {data.timeline.length > 0 && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                        <h3 className="text-sm font-medium text-gray-300 mb-4">Histórico</h3>
                        <div className="space-y-4 relative">
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
                            {data.timeline.map((event, i) => (
                                <div key={i} className="flex gap-3 relative">
                                    <div className="w-4 h-4 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 
                    flex-shrink-0 mt-0.5 z-10" />
                                    <div>
                                        <p className="text-sm text-white">
                                            {ACTION_LABELS[event.action] || event.action}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deliverables */}
                {data.deliverables.length > 0 && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                        <h3 className="text-sm font-medium text-gray-300 mb-4">Arquivos Disponíveis</h3>
                        <div className="space-y-2">
                            {data.deliverables.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] 
                    border border-white/[0.06] hover:border-[#CCFF00]/20 transition-all"
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center 
                    ${d.is_final ? 'bg-green-500/10' : 'bg-white/[0.05]'}`}>
                                        <FileText className={`w-4 h-4 ${d.is_final ? 'text-green-400' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{d.file_name}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {format(new Date(d.delivered_at), "dd/MM/yyyy", { locale: ptBR })}
                                            {d.is_final && <span className="text-green-400 ml-2">• Entrega Final</span>}
                                        </p>
                                    </div>
                                    {d.download_url && (
                                        <a href={d.download_url} target="_blank" rel="noopener noreferrer"
                                            className="text-[#CCFF00] hover:text-[#CCFF00]/80">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-6">
                    <p className="text-[10px] text-gray-600">
                        © {new Date().getFullYear()} Fontes Graphics • Todos os direitos reservados
                    </p>
                </div>
            </main>
        </div>
    );
}
