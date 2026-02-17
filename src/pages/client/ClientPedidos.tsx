<<<<<<< HEAD
import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ShoppingBag, FileText, DollarSign, Hammer, RefreshCw,
    Download, Hash, ChevronDown, ChevronRight, Check, Lock,
    Clock, ArrowLeft, ExternalLink, AlertTriangle, Package,
    Send, Loader2, CreditCard, Eye
} from 'lucide-react';
import { useClientPedidos } from '@/hooks/usePedidos';
import { useClientPedidoDetail } from '@/hooks/useClientPedidoDetail';
import { STATUS_LABELS, ORDER_TYPE_LABELS } from '@/types/pedido';
import type { Pedido, StatusPedido } from '@/types/pedido';
import type { OrderRevision } from '@/types/order-revision';
import type { PaymentInstallment } from '@/types/payment-installment';
import type { OrderDeliverable } from '@/types/order-deliverable';
import { isDeliverableExpired } from '@/types/order-deliverable';

/* ─── CONSTANTS ─── */
const BG = '#1a1a1a';
const CARD_BG = '#f5f5f0';
const ACCENT = '#c8e632';
const RADIUS = 12;

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '—';

/* ─── STATUS → step mapping ─── */
const STATUS_STEP_MAP: Record<StatusPedido, number> = {
    briefing: 1,
    orcamento_enviado: 2,
    orcamento_aprovado: 2,
    aguardando_pagamento: 3,
    pagamento_confirmado: 4,
    em_confeccao: 4,
    aguardando_aprovacao_cliente: 5,
    em_ajustes: 5,
    aguardando_pagamento_final: 6,
    finalizado: 7,
    cancelado: 0,
    recusado: 0,
};

function getStepIndex(status: StatusPedido): number {
    return STATUS_STEP_MAP[status] ?? 0;
}

/* ─── STATUS pill colors (inline) ─── */
function statusPillStyle(s: StatusPedido): React.CSSProperties {
    const map: Record<string, { bg: string; color: string }> = {
        briefing: { bg: '#3b82f620', color: '#60a5fa' },
        orcamento_enviado: { bg: '#eab30820', color: '#fbbf24' },
        orcamento_aprovado: { bg: '#22c55e20', color: '#4ade80' },
        aguardando_pagamento: { bg: '#f9731620', color: '#fb923c' },
        pagamento_confirmado: { bg: '#10b98120', color: '#34d399' },
        em_confeccao: { bg: '#a855f720', color: '#c084fc' },
        aguardando_aprovacao_cliente: { bg: '#06b6d420', color: '#22d3ee' },
        em_ajustes: { bg: '#f59e0b20', color: '#fbbf24' },
        aguardando_pagamento_final: { bg: '#f9731620', color: '#fb923c' },
        finalizado: { bg: '#22c55e20', color: '#4ade80' },
        cancelado: { bg: '#ef444420', color: '#f87171' },
        recusado: { bg: '#ef444420', color: '#f87171' },
    };
    const c = map[s] || map.briefing;
    return {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
    };
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ClientPedidos() {
    const { data: pedidos, isLoading } = useClientPedidos();
    const [selected, setSelected] = useState<Pedido | null>(null);

    if (selected) {
        return <PedidoDetail pedido={selected} onBack={() => setSelected(null)} />;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BG, padding: '32px 24px' }}>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                Meus Pedidos
            </h1>
            <p style={{ color: '#999', fontSize: 14, marginBottom: 32 }}>
                Acompanhe o progresso de todas as suas solicitações
            </p>

            {isLoading ? (
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 160, borderRadius: RADIUS, backgroundColor: '#252525' }} className="animate-pulse" />
                    ))}
                </div>
            ) : !pedidos?.length ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <ShoppingBag size={48} style={{ color: '#555', margin: '0 auto 16px' }} />
                    <p style={{ color: '#888', fontSize: 16 }}>Nenhum pedido encontrado</p>
                    <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Seus pedidos aparecerão aqui quando forem criados.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>
                    {pedidos.map(p => (
                        <PedidoCard key={p.id} pedido={p} onClick={() => setSelected(p)} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PEDIDO CARD (listagem)
   ═══════════════════════════════════════════════════════════ */
function PedidoCard({ pedido, onClick }: { pedido: Pedido; onClick: () => void }) {
    const isCancelled = pedido.status === 'cancelado' || pedido.status === 'recusado';

    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: CARD_BG,
                borderRadius: RADIUS,
                padding: 20,
                border: 'none',
                cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
                opacity: isCancelled ? 0.55 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={18} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: 0 }}>#{pedido.protocolo}</p>
                        <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{fmtDate(pedido.created_at)}</p>
                    </div>
                </div>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
                {pedido.services?.title || pedido.descricao?.slice(0, 50) || 'Pedido personalizado'}
            </p>
            <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                {ORDER_TYPE_LABELS[pedido.order_type]}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0db' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                    {pedido.valor_orcado ? fmt(pedido.valor_orcado) : '—'}
                </span>
                <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver detalhes <ChevronRight size={14} />
                </span>
            </div>
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════
   PEDIDO DETAIL (stepper com 8 cards)
   ═══════════════════════════════════════════════════════════ */
function PedidoDetail({ pedido, onBack }: { pedido: Pedido; onBack: () => void }) {
    const {
        revisions, deliverables, installments, pixConfig,
        isLoading, markDownloaded,
        markPaymentDone, isMarkingPayment,
        uploadComprovante, isUploadingComprovante,
    } = useClientPedidoDetail(pedido.id);

    const currentStep = getStepIndex(pedido.status);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BG, padding: '32px 24px' }}>
            {/* Header */}
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14 }}
            >
                <ArrowLeft size={16} /> Voltar
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
                        Pedido #{pedido.protocolo}
                    </h1>
                    <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                        {pedido.services?.title || pedido.descricao?.slice(0, 60)}
                    </p>
                </div>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <Loader2 size={32} color="#555" className="animate-spin" />
                </div>
            ) : (
                <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <StepCard
                        index={0} currentStep={currentStep}
                        icon={ShoppingBag} title="Serviço"
                        completed
                    >
                        <CardServiço pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={1} currentStep={currentStep}
                        icon={FileText} title="Briefing"
                        completed={pedido.briefing_completeness_score >= 80}
                    >
                        <CardBriefing pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={2} currentStep={currentStep}
                        icon={Eye} title="Orçamento"
                        completed={['orcamento_aprovado', 'aguardando_pagamento', 'pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                    >
                        <CardOrcamento pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={3} currentStep={currentStep}
                        icon={CreditCard} title="Pagamento"
                        completed={['pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'finalizado'].includes(pedido.status)}
                    >
                        <CardPagamento
                            pedido={pedido}
                            installments={installments}
                            pixConfig={pixConfig}
                            markPaymentDone={markPaymentDone}
                            isMarkingPayment={isMarkingPayment}
                            uploadComprovante={uploadComprovante}
                            isUploadingComprovante={isUploadingComprovante}
                        />
                    </StepCard>

                    <StepCard
                        index={4} currentStep={currentStep}
                        icon={Hammer} title="Produção"
                        completed={['aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                        blocked={['briefing', 'orcamento_enviado', 'orcamento_aprovado', 'aguardando_pagamento'].includes(pedido.status)}
                        blockedText="Aguardando confirmação de pagamento"
                    >
                        <CardProducao pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={5} currentStep={currentStep}
                        icon={RefreshCw} title="Revisão"
                        completed={pedido.status === 'finalizado' || pedido.status === 'aguardando_pagamento_final'}
                        blocked={!['aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                    >
                        <CardRevisao pedido={pedido} revisions={revisions} />
                    </StepCard>

                    <StepCard
                        index={6} currentStep={currentStep}
                        icon={Download} title="Entrega"
                        completed={pedido.status === 'finalizado' && deliverables.length > 0}
                        blocked={pedido.status !== 'finalizado' && pedido.status !== 'aguardando_pagamento_final'}
                        blockedText="Aguardando pagamento final"
                    >
                        <CardEntrega deliverables={deliverables} markDownloaded={markDownloaded} />
                    </StepCard>

                    {/* Card 8 — Protocolo: sempre visível */}
                    <StepCard
                        index={7} currentStep={currentStep}
                        icon={Hash} title="Protocolo"
                        completed
                        alwaysVisible
                    >
                        <CardProtocolo pedido={pedido} />
                    </StepCard>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   STEP CARD (generic stepper wrapper)
   ═══════════════════════════════════════════════════════════ */
interface StepCardProps {
    index: number;
    currentStep: number;
    icon: LucideIcon;
    title: string;
    completed: boolean;
    blocked?: boolean;
    blockedText?: string;
    alwaysVisible?: boolean;
    children: React.ReactNode;
}

function StepCard({ index, currentStep, icon: Icon, title, completed, blocked, blockedText, alwaysVisible, children }: StepCardProps) {
    const isCurrent = !blocked && !completed && index === currentStep;
    const isFuture = !blocked && !completed && index > currentStep;
    const isClickable = completed || isCurrent || alwaysVisible;

    const [expanded, setExpanded] = useState(isCurrent || alwaysVisible || false);

    const opacity = blocked ? 0.5 : isFuture ? 0.7 : 1;
    const borderColor = isCurrent ? ACCENT : 'transparent';

    return (
        <div style={{ position: 'relative', paddingLeft: 36 }}>
            {/* Vertical line */}
            {index < 7 && (
                <div style={{
                    position: 'absolute', left: 15, top: 40, bottom: -4,
                    width: 2, backgroundColor: completed ? ACCENT : '#333',
                }} />
            )}
            {/* Step dot */}
            <div style={{
                position: 'absolute', left: 4, top: 14,
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: completed ? ACCENT : blocked ? '#333' : isCurrent ? ACCENT : '#444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: isCurrent ? `2px solid ${ACCENT}` : 'none',
                zIndex: 1,
            }}>
                {completed ? <Check size={14} color="#1a1a1a" /> : blocked ? <Lock size={12} color="#666" /> : null}
            </div>

            {/* Card */}
            <div
                style={{
                    backgroundColor: CARD_BG,
                    borderRadius: RADIUS,
                    marginBottom: 12,
                    border: `2px solid ${borderColor}`,
                    opacity,
                    overflow: 'hidden',
                    transition: 'all .2s',
                }}
            >
                {/* Header */}
                <button
                    onClick={() => isClickable && setExpanded(!expanded)}
                    disabled={!isClickable}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'none',
                        border: 'none',
                        cursor: isClickable ? 'pointer' : 'default',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} color={blocked ? '#999' : '#1a1a1a'} />
                        <span style={{ fontWeight: 600, fontSize: 15, color: blocked ? '#999' : '#1a1a1a' }}>{title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {blocked && <span style={{ fontSize: 12, color: '#999' }}>{blockedText || 'Bloqueado'}</span>}
                        {completed && !blocked && (
                            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={14} /> Concluído
                            </span>
                        )}
                        {isCurrent && (
                            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>Em andamento</span>
                        )}
                        {isClickable && (expanded ? <ChevronDown size={16} color="#999" /> : <ChevronRight size={16} color="#999" />)}
                    </div>
                </button>

                {/* Content */}
                {expanded && (
                    <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e0e0db' }}>
                        <div style={{ paddingTop: 14 }}>{children}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 1 — SERVIÇO
   ═══════════════════════════════════════════════════════════ */
function CardServiço({ pedido }: { pedido: Pedido }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Serviço</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                    {pedido.services?.title || 'Personalizado'}
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Tipo</span>
                <span style={{ fontSize: 14, color: '#1a1a1a' }}>{ORDER_TYPE_LABELS[pedido.order_type]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Data de criação</span>
                <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.created_at)}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 2 — BRIEFING
   ═══════════════════════════════════════════════════════════ */
function CardBriefing({ pedido }: { pedido: Pedido }) {
    const score = pedido.briefing_completeness_score ?? 0;
    const fields = pedido.briefing_data ? Object.keys(pedido.briefing_data) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Progress bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Completude do briefing</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: score >= 80 ? '#22c55e' : '#f59e0b' }}>{score}%</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#e0e0db' }}>
                    <div style={{
                        width: `${score}%`, height: '100%', borderRadius: 4,
                        backgroundColor: score >= 80 ? '#22c55e' : '#f59e0b',
                        transition: 'width .3s',
                    }} />
                </div>
            </div>

            {/* Fields filled */}
            {fields.length > 0 && (
                <div>
                    <p style={{ fontSize: 13, color: '#777', marginBottom: 6 }}>Campos preenchidos:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {fields.slice(0, 6).map(f => (
                            <span key={f} style={{
                                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                                backgroundColor: '#1a1a1a15', color: '#555',
                            }}>
                                {f.replace(/_/g, ' ')}
                            </span>
                        ))}
                        {fields.length > 6 && (
                            <span style={{ fontSize: 11, padding: '3px 8px', color: '#999' }}>+{fields.length - 6} mais</span>
                        )}
                    </div>
                </div>
            )}

            {score < 80 && (
                <button style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none',
                    backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                    fontSize: 13, cursor: 'pointer', marginTop: 4,
                }}>
                    Completar Briefing
                </button>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 3 — ORÇAMENTO
   ═══════════════════════════════════════════════════════════ */
function CardOrcamento({ pedido }: { pedido: Pedido }) {
    const isApproved = ['orcamento_aprovado', 'aguardando_pagamento', 'pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status);
    const isSent = pedido.status === 'orcamento_enviado';
    const isPending = pedido.status === 'briefing';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isPending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999', fontSize: 14 }}>
                    <Clock size={16} /> Aguardando envio do orçamento pelo admin
                </div>
            )}

            {isSent && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Valor</span>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                    </div>
                    {pedido.prazo_orcado && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Prazo</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{pedido.prazo_orcado} dias úteis</span>
                        </div>
                    )}
                    <a
                        href="/client/orcamentos"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '10px 16px', borderRadius: 10, border: 'none',
                            backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                            fontSize: 13, cursor: 'pointer', textDecoration: 'none', marginTop: 4,
                        }}
                    >
                        Ver e Aprovar <ExternalLink size={14} />
                    </a>
                </>
            )}

            {isApproved && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
                        <Check size={16} /> Orçamento aprovado
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Valor aprovado</span>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                    </div>
                    {pedido.data_aprovacao && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Data de aprovação</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.data_aprovacao)}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 4 — PAGAMENTO
   ═══════════════════════════════════════════════════════════ */
function CardPagamento({
    pedido,
    installments,
    pixConfig,
    markPaymentDone,
    isMarkingPayment,
    uploadComprovante,
    isUploadingComprovante,
}: {
    pedido: Pedido;
    installments: PaymentInstallment[];
    pixConfig: { pix_key: string; merchant_name: string; merchant_city: string } | null;
    markPaymentDone: (id: string) => void;
    isMarkingPayment: boolean;
    uploadComprovante: (args: { installmentId: string; file: File }) => void;
    isUploadingComprovante: boolean;
}) {
    const [copiedPix, setCopiedPix] = useState(false);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const paidCount = installments.filter(i => i.status === 'paid').length;
    const totalCount = installments.length || 1;
    const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
    const isComplete = pedido.data_pagamento_final || pedido.status === 'finalizado' || paidPercent === 100;

    const isFull = pedido.payment_mode === 'full';

    const copyPixKey = () => {
        if (!pixConfig?.pix_key) return;
        navigator.clipboard.writeText(pixConfig.pix_key);
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
    };

    const handleFileUpload = (installmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadComprovante({ installmentId, file });
    };

    const handleMarkPaid = (installmentId: string) => {
        setConfirmingId(installmentId);
        markPaymentDone(installmentId);
    };

    const getInstBg = (status: string): string => {
        if (status === 'paid') return '#22c55e12';
        if (status === 'overdue') return '#ef444412';
        if ((status as string) === 'awaiting_confirmation') return '#3b82f612';
        return '#1a1a1a08';
    };

    const getInstBorder = (status: string): string => {
        if (status === 'paid') return '1px solid #22c55e30';
        if (status === 'overdue') return '1px solid #ef444430';
        if ((status as string) === 'awaiting_confirmation') return '1px solid #3b82f630';
        return '1px solid transparent';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Resumo do orçamento */}
            <div style={{ padding: '14px 16px', borderRadius: 10, backgroundColor: '#1a1a1a08', border: '1px solid #e0e0db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Serviço</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{pedido.services?.title || 'Personalizado'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Valor total</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                </div>
                {pedido.condicao_pagamento && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Condições</span>
                        <span style={{ fontSize: 13, color: '#555' }}>{pedido.condicao_pagamento}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Modalidade</span>
                    <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        {isFull ? 'Pagamento Único' : pedido.payment_mode === 'split_50_50' ? '50/50' : pedido.payment_mode === 'split_30_70' ? '30/70' : 'Parcelado'}
                    </span>
                </div>
            </div>

            {/* Barra de progresso */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Progresso do pagamento</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: isComplete ? '#22c55e' : '#f59e0b' }}>
                        {isComplete ? '100%' : `${paidPercent}%`} · {paidCount}/{totalCount} parcela(s)
                    </span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#e0e0db' }}>
                    <div style={{
                        width: `${isComplete ? 100 : paidPercent}%`, height: '100%', borderRadius: 4,
                        backgroundColor: isComplete ? '#22c55e' : '#f59e0b', transition: 'width .3s',
                    }} />
                </div>
            </div>

            {/* Método Pix */}
            {pixConfig && !isComplete && (
                <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    backgroundColor: '#00968810', border: '1px solid #00968825',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#009688', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>P</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Pagar via Pix</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', borderRadius: 8, backgroundColor: '#fff',
                        border: '1px solid #e0e0db',
                    }}>
                        <code style={{ flex: 1, fontSize: 13, color: '#333', wordBreak: 'break-all' }}>
                            {pixConfig.pix_key}
                        </code>
                        <button
                            onClick={copyPixKey}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                backgroundColor: copiedPix ? '#22c55e' : ACCENT,
                                color: '#1a1a1a', fontWeight: 700, fontSize: 12,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'background-color .2s',
                            }}
                        >
                            {copiedPix ? '✓ Copiado!' : 'Copiar Chave'}
                        </button>
                    </div>
                    <p style={{ fontSize: 11, color: '#666', margin: '8px 0 0' }}>
                        Titular: {pixConfig.merchant_name} · {pixConfig.merchant_city}
                    </p>
                </div>
            )}

            {/* Lista de parcelas */}
            {installments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {installments.map(inst => {
                        const isOverdue = inst.status === 'overdue';
                        const isPaid = inst.status === 'paid';
                        const isAwaiting = (inst.status as string) === 'awaiting_confirmation';

                        return (
                            <div key={inst.id} style={{
                                padding: '14px 16px', borderRadius: 10,
                                backgroundColor: getInstBg(inst.status),
                                border: getInstBorder(inst.status),
                            }}>
                                {/* Header da parcela */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {isPaid ? (
                                            <Check size={18} color="#22c55e" />
                                        ) : isOverdue ? (
                                            <AlertTriangle size={18} color="#ef4444" />
                                        ) : isAwaiting ? (
                                            <Loader2 size={18} color="#3b82f6" className="animate-spin" />
                                        ) : (
                                            <Clock size={18} color="#f59e0b" />
                                        )}
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                                            Parcela {inst.installment_number}
                                        </span>
                                        {isOverdue && (
                                            <span style={{
                                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                                backgroundColor: '#ef444420', color: '#ef4444', fontWeight: 700,
                                            }}>
                                                Em atraso
                                            </span>
                                        )}
                                        {isAwaiting && (
                                            <span style={{
                                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                                backgroundColor: '#3b82f620', color: '#3b82f6', fontWeight: 600,
                                            }}>
                                                Em análise
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
                                        {fmt(inst.amount)}
                                    </span>
                                </div>

                                {/* Detalhes da parcela */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#777', marginBottom: isPaid || isAwaiting ? 0 : 10 }}>
                                    <span>Vencimento: {fmtDate(inst.due_date)}</span>
                                    {isPaid && <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Pago em {fmtDate(inst.paid_at)}</span>}
                                    {inst.payment_method && <span>Método: {inst.payment_method}</span>}
                                </div>

                                {/* Comprovante já enviado */}
                                {inst.comprovante_url && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                                        padding: '8px 12px', borderRadius: 8, backgroundColor: '#fff',
                                        border: '1px solid #e0e0db',
                                    }}>
                                        <Package size={14} color="#777" />
                                        <a
                                            href={inst.comprovante_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                                        >
                                            Ver comprovante enviado
                                        </a>
                                    </div>
                                )}

                                {/* Ações: apenas se parcela não foi paga nem está em análise */}
                                {!isPaid && !isAwaiting && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                        {/* Upload de comprovante */}
                                        <label style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '8px 14px', borderRadius: 8,
                                            backgroundColor: '#fff', border: '1px solid #ddd',
                                            fontSize: 12, color: '#555', cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                        }}>
                                            <Send size={13} />
                                            {isUploadingComprovante ? 'Enviando...' : 'Enviar comprovante'}
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(inst.id, e)}
                                                disabled={isUploadingComprovante}
                                            />
                                        </label>

                                        {/* Botão Já realizei pagamento */}
                                        <button
                                            onClick={() => handleMarkPaid(inst.id)}
                                            disabled={isMarkingPayment}
                                            style={{
                                                padding: '10px 16px', borderRadius: 10, border: 'none',
                                                backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                                                fontSize: 13, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                alignSelf: 'flex-start',
                                                opacity: isMarkingPayment ? 0.6 : 1,
                                            }}
                                        >
                                            <CreditCard size={14} />
                                            {isMarkingPayment && confirmingId === inst.id ? 'Registrando...' : 'Já realizei o pagamento'}
                                        </button>
                                    </div>
                                )}

                                {/* Mensagem de aguardando confirmação */}
                                {isAwaiting && (
                                    <div style={{
                                        marginTop: 8, padding: '10px 14px', borderRadius: 8,
                                        backgroundColor: '#3b82f608', border: '1px solid #3b82f615',
                                    }}>
                                        <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, margin: 0 }}>
                                            Pagamento em análise
                                        </p>
                                        <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
                                            Você será notificado quando o pagamento for confirmado pelo administrador.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mensagem: pagamento único sem parcelas */}
            {isFull && installments.length === 0 && !isComplete && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 14, color: '#555' }}>
                        Valor total: <strong>{fmt(pedido.valor_orcado || 0)}</strong>
                    </p>
                    {pixConfig && (
                        <p style={{ fontSize: 13, color: '#777' }}>
                            Use a chave Pix acima para realizar o pagamento.
                        </p>
                    )}
                </div>
            )}

            {!isComplete && installments.length === 0 && !isFull && (
                <p style={{ fontSize: 13, color: '#999' }}>Aguardando configuração do pagamento.</p>
            )}

            {/* Pagamento completo */}
            {isComplete && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 10,
                    backgroundColor: '#22c55e10', border: '1px solid #22c55e25',
                }}>
                    <Check size={20} color="#22c55e" />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', margin: 0 }}>Pagamento concluído!</p>
                        {pedido.data_pagamento_final && (
                            <p style={{ fontSize: 12, color: '#777', margin: '2px 0 0' }}>
                                Finalizado em {fmtDate(pedido.data_pagamento_final)}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 5 — PRODUÇÃO
   ═══════════════════════════════════════════════════════════ */
function CardProducao({ pedido }: { pedido: Pedido }) {
    const isInProgress = ['em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes'].includes(pedido.status);
    const isComplete = ['aguardando_pagamento_final', 'finalizado'].includes(pedido.status);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isInProgress && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', fontWeight: 600, fontSize: 14 }}>
                        <Hammer size={16} /> Sua arte está sendo produzida
                    </div>
                    {pedido.prazo_final && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Previsão de entrega</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>{fmtDate(pedido.prazo_final)}</span>
                        </div>
                    )}
                    {pedido.data_inicio_confeccao && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Início da produção</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.data_inicio_confeccao)}</span>
                        </div>
                    )}
                </>
            )}

            {isComplete && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
                    <Check size={16} /> Produção concluída
                </div>
            )}

            {!isInProgress && !isComplete && (
                <p style={{ fontSize: 13, color: '#999' }}>A produção começará após o pagamento.</p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 6 — REVISÃO
   ═══════════════════════════════════════════════════════════ */
function CardRevisao({ pedido, revisions }: { pedido: Pedido; revisions: OrderRevision[] }) {
    const [feedbackText, setFeedbackText] = useState('');
    const current = pedido.revision_count || 0;
    const max = pedido.max_revisions || 0;
    const activeRevision = revisions.find(r => r.status === 'pending' || r.status === 'in_progress');
    const isExhausted = current >= max;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Revisões</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                    {current} / {max} inclusas
                </span>
            </div>

            {/* Past revisions */}
            {revisions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {revisions.map(rev => (
                        <div key={rev.id} style={{
                            padding: '10px 12px', borderRadius: 8, backgroundColor: '#1a1a1a08',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                                    Revisão {rev.revision_number}
                                    {rev.is_extra && <span style={{ color: '#f59e0b', fontSize: 11, marginLeft: 6 }}>(extra — {fmt(rev.extra_cost)})</span>}
                                </span>
                                <span style={{
                                    fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                    backgroundColor: rev.status === 'completed' ? '#22c55e20' : rev.status === 'pending' ? '#f59e0b20' : '#3b82f620',
                                    color: rev.status === 'completed' ? '#22c55e' : rev.status === 'pending' ? '#f59e0b' : '#60a5fa',
                                }}>
                                    {rev.status === 'completed' ? 'Concluída' : rev.status === 'pending' ? 'Pendente' : 'Em andamento'}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{rev.description}</p>
                            {rev.admin_response && (
                                <p style={{ fontSize: 12, color: '#777', margin: '6px 0 0', fontStyle: 'italic' }}>
                                    Resposta: {rev.admin_response}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback form */}
            {['aguardando_aprovacao_cliente', 'em_ajustes'].includes(pedido.status) && !activeRevision && !isExhausted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Descreva as alterações que gostaria..."
                        style={{
                            width: '100%', minHeight: 80, padding: 12, borderRadius: 8,
                            border: '1px solid #ddd', fontSize: 13, resize: 'vertical',
                            fontFamily: 'inherit',
                        }}
                    />
                    <button
                        disabled={!feedbackText.trim()}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: 'none',
                            backgroundColor: feedbackText.trim() ? ACCENT : '#ccc',
                            color: '#1a1a1a', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                            opacity: feedbackText.trim() ? 1 : 0.6,
                        }}
                    >
                        <Send size={14} /> Enviar Feedback
                    </button>
                </div>
            )}

            {/* Exhausted warning */}
            {isExhausted && (
                <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                    <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontSize: 13, color: '#b45309', fontWeight: 600, margin: 0 }}>Revisões inclusas esgotadas</p>
                        <p style={{ fontSize: 12, color: '#92400e', margin: '4px 0 0' }}>
                            Revisão adicional sob consulta. Entre em contato para solicitar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 7 — ENTREGA
   ═══════════════════════════════════════════════════════════ */
function CardEntrega({ deliverables, markDownloaded }: { deliverables: OrderDeliverable[]; markDownloaded: (id: string) => void; }) {
    if (deliverables.length === 0) {
        return <p style={{ fontSize: 13, color: '#999' }}>Nenhuma entrega disponível ainda.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deliverables.map(d => {
                const expired = isDeliverableExpired(d);
                return (
                    <div key={d.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: 8, backgroundColor: '#1a1a1a08',
                        opacity: expired ? 0.5 : 1,
                    }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{d.file_name}</p>
                            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
                                Entregue em {fmtDate(d.delivered_at)}
                                {d.expires_at && ` · Expira ${fmtDate(d.expires_at)}`}
                            </p>
                        </div>
                        {expired ? (
                            <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Expirado</span>
                        ) : (
                            <a
                                href={d.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => !d.downloaded_at && markDownloaded(d.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '6px 12px', borderRadius: 8,
                                    backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 600,
                                    fontSize: 12, textDecoration: 'none',
                                }}
                            >
                                <Download size={14} /> Download
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 8 — PROTOCOLO (sempre visível)
   ═══════════════════════════════════════════════════════════ */
function CardProtocolo({ pedido }: { pedido: Pedido }) {
    const publicUrl = `/acompanhar/${pedido.protocolo}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Protocolo</span>
                <span style={{
                    fontWeight: 700, fontSize: 18, color: '#1a1a1a',
                    letterSpacing: 1, fontFamily: 'monospace',
                }}>
                    #{pedido.protocolo}
                </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Status atual</span>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10, border: `1px solid #ddd`,
                    color: '#1a1a1a', fontWeight: 600, fontSize: 13,
                    textDecoration: 'none', marginTop: 4,
                }}
            >
                <ExternalLink size={14} /> Acompanhar pela página pública
            </a>

            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                Use este código para consultar seu pedido a qualquer momento.
            </p>
        </div>
    );
}
=======
import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ShoppingBag, FileText, DollarSign, Hammer, RefreshCw,
    Download, Hash, ChevronDown, ChevronRight, Check, Lock,
    Clock, ArrowLeft, ExternalLink, AlertTriangle, Package,
    Send, Loader2, CreditCard, Eye
} from 'lucide-react';
import { useClientPedidos } from '@/hooks/usePedidos';
import { useClientPedidoDetail } from '@/hooks/useClientPedidoDetail';
import { STATUS_LABELS, ORDER_TYPE_LABELS } from '@/types/pedido';
import type { Pedido, StatusPedido } from '@/types/pedido';
import type { OrderRevision } from '@/types/order-revision';
import type { PaymentInstallment } from '@/types/payment-installment';
import type { OrderDeliverable } from '@/types/order-deliverable';
import { isDeliverableExpired } from '@/types/order-deliverable';

/* ─── CONSTANTS ─── */
const BG = '#1a1a1a';
const CARD_BG = '#f5f5f0';
const ACCENT = '#c8e632';
const RADIUS = 12;

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '—';

/* ─── STATUS → step mapping ─── */
const STATUS_STEP_MAP: Record<StatusPedido, number> = {
    briefing: 1,
    orcamento_enviado: 2,
    orcamento_aprovado: 2,
    aguardando_pagamento: 3,
    pagamento_confirmado: 4,
    em_confeccao: 4,
    aguardando_aprovacao_cliente: 5,
    em_ajustes: 5,
    aguardando_pagamento_final: 6,
    finalizado: 7,
    cancelado: 0,
    recusado: 0,
};

function getStepIndex(status: StatusPedido): number {
    return STATUS_STEP_MAP[status] ?? 0;
}

/* ─── STATUS pill colors (inline) ─── */
function statusPillStyle(s: StatusPedido): React.CSSProperties {
    const map: Record<string, { bg: string; color: string }> = {
        briefing: { bg: '#3b82f620', color: '#60a5fa' },
        orcamento_enviado: { bg: '#eab30820', color: '#fbbf24' },
        orcamento_aprovado: { bg: '#22c55e20', color: '#4ade80' },
        aguardando_pagamento: { bg: '#f9731620', color: '#fb923c' },
        pagamento_confirmado: { bg: '#10b98120', color: '#34d399' },
        em_confeccao: { bg: '#a855f720', color: '#c084fc' },
        aguardando_aprovacao_cliente: { bg: '#06b6d420', color: '#22d3ee' },
        em_ajustes: { bg: '#f59e0b20', color: '#fbbf24' },
        aguardando_pagamento_final: { bg: '#f9731620', color: '#fb923c' },
        finalizado: { bg: '#22c55e20', color: '#4ade80' },
        cancelado: { bg: '#ef444420', color: '#f87171' },
        recusado: { bg: '#ef444420', color: '#f87171' },
    };
    const c = map[s] || map.briefing;
    return {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
    };
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ClientPedidos() {
    const { data: pedidos, isLoading } = useClientPedidos();
    const [selected, setSelected] = useState<Pedido | null>(null);

    if (selected) {
        return <PedidoDetail pedido={selected} onBack={() => setSelected(null)} />;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BG, padding: '32px 24px' }}>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                Meus Pedidos
            </h1>
            <p style={{ color: '#999', fontSize: 14, marginBottom: 32 }}>
                Acompanhe o progresso de todas as suas solicitações
            </p>

            {isLoading ? (
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 160, borderRadius: RADIUS, backgroundColor: '#252525' }} className="animate-pulse" />
                    ))}
                </div>
            ) : !pedidos?.length ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <ShoppingBag size={48} style={{ color: '#555', margin: '0 auto 16px' }} />
                    <p style={{ color: '#888', fontSize: 16 }}>Nenhum pedido encontrado</p>
                    <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Seus pedidos aparecerão aqui quando forem criados.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>
                    {pedidos.map(p => (
                        <PedidoCard key={p.id} pedido={p} onClick={() => setSelected(p)} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PEDIDO CARD (listagem)
   ═══════════════════════════════════════════════════════════ */
function PedidoCard({ pedido, onClick }: { pedido: Pedido; onClick: () => void }) {
    const isCancelled = pedido.status === 'cancelado' || pedido.status === 'recusado';

    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: CARD_BG,
                borderRadius: RADIUS,
                padding: 20,
                border: 'none',
                cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
                opacity: isCancelled ? 0.55 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={18} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: 0 }}>#{pedido.protocolo}</p>
                        <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{fmtDate(pedido.created_at)}</p>
                    </div>
                </div>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
                {pedido.services?.title || pedido.descricao?.slice(0, 50) || 'Pedido personalizado'}
            </p>
            <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                {ORDER_TYPE_LABELS[pedido.order_type]}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0db' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                    {pedido.valor_orcado ? fmt(pedido.valor_orcado) : '—'}
                </span>
                <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver detalhes <ChevronRight size={14} />
                </span>
            </div>
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════
   PEDIDO DETAIL (stepper com 8 cards)
   ═══════════════════════════════════════════════════════════ */
function PedidoDetail({ pedido, onBack }: { pedido: Pedido; onBack: () => void }) {
    const {
        revisions, deliverables, installments, pixConfig,
        isLoading, markDownloaded,
        markPaymentDone, isMarkingPayment,
        uploadComprovante, isUploadingComprovante,
    } = useClientPedidoDetail(pedido.id);

    const currentStep = getStepIndex(pedido.status);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BG, padding: '32px 24px' }}>
            {/* Header */}
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14 }}
            >
                <ArrowLeft size={16} /> Voltar
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
                        Pedido #{pedido.protocolo}
                    </h1>
                    <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                        {pedido.services?.title || pedido.descricao?.slice(0, 60)}
                    </p>
                </div>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <Loader2 size={32} color="#555" className="animate-spin" />
                </div>
            ) : (
                <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <StepCard
                        index={0} currentStep={currentStep}
                        icon={ShoppingBag} title="Serviço"
                        completed
                    >
                        <CardServiço pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={1} currentStep={currentStep}
                        icon={FileText} title="Briefing"
                        completed={pedido.briefing_completeness_score >= 80}
                    >
                        <CardBriefing pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={2} currentStep={currentStep}
                        icon={Eye} title="Orçamento"
                        completed={['orcamento_aprovado', 'aguardando_pagamento', 'pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                    >
                        <CardOrcamento pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={3} currentStep={currentStep}
                        icon={CreditCard} title="Pagamento"
                        completed={['pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'finalizado'].includes(pedido.status)}
                    >
                        <CardPagamento
                            pedido={pedido}
                            installments={installments}
                            pixConfig={pixConfig}
                            markPaymentDone={markPaymentDone}
                            isMarkingPayment={isMarkingPayment}
                            uploadComprovante={uploadComprovante}
                            isUploadingComprovante={isUploadingComprovante}
                        />
                    </StepCard>

                    <StepCard
                        index={4} currentStep={currentStep}
                        icon={Hammer} title="Produção"
                        completed={['aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                        blocked={['briefing', 'orcamento_enviado', 'orcamento_aprovado', 'aguardando_pagamento'].includes(pedido.status)}
                        blockedText="Aguardando confirmação de pagamento"
                    >
                        <CardProducao pedido={pedido} />
                    </StepCard>

                    <StepCard
                        index={5} currentStep={currentStep}
                        icon={RefreshCw} title="Revisão"
                        completed={pedido.status === 'finalizado' || pedido.status === 'aguardando_pagamento_final'}
                        blocked={!['aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status)}
                    >
                        <CardRevisao pedido={pedido} revisions={revisions} />
                    </StepCard>

                    <StepCard
                        index={6} currentStep={currentStep}
                        icon={Download} title="Entrega"
                        completed={pedido.status === 'finalizado' && deliverables.length > 0}
                        blocked={pedido.status !== 'finalizado' && pedido.status !== 'aguardando_pagamento_final'}
                        blockedText="Aguardando pagamento final"
                    >
                        <CardEntrega deliverables={deliverables} markDownloaded={markDownloaded} />
                    </StepCard>

                    {/* Card 8 — Protocolo: sempre visível */}
                    <StepCard
                        index={7} currentStep={currentStep}
                        icon={Hash} title="Protocolo"
                        completed
                        alwaysVisible
                    >
                        <CardProtocolo pedido={pedido} />
                    </StepCard>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   STEP CARD (generic stepper wrapper)
   ═══════════════════════════════════════════════════════════ */
interface StepCardProps {
    index: number;
    currentStep: number;
    icon: LucideIcon;
    title: string;
    completed: boolean;
    blocked?: boolean;
    blockedText?: string;
    alwaysVisible?: boolean;
    children: React.ReactNode;
}

function StepCard({ index, currentStep, icon: Icon, title, completed, blocked, blockedText, alwaysVisible, children }: StepCardProps) {
    const isCurrent = !blocked && !completed && index === currentStep;
    const isFuture = !blocked && !completed && index > currentStep;
    const isClickable = completed || isCurrent || alwaysVisible;

    const [expanded, setExpanded] = useState(isCurrent || alwaysVisible || false);

    const opacity = blocked ? 0.5 : isFuture ? 0.7 : 1;
    const borderColor = isCurrent ? ACCENT : 'transparent';

    return (
        <div style={{ position: 'relative', paddingLeft: 36 }}>
            {/* Vertical line */}
            {index < 7 && (
                <div style={{
                    position: 'absolute', left: 15, top: 40, bottom: -4,
                    width: 2, backgroundColor: completed ? ACCENT : '#333',
                }} />
            )}
            {/* Step dot */}
            <div style={{
                position: 'absolute', left: 4, top: 14,
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: completed ? ACCENT : blocked ? '#333' : isCurrent ? ACCENT : '#444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: isCurrent ? `2px solid ${ACCENT}` : 'none',
                zIndex: 1,
            }}>
                {completed ? <Check size={14} color="#1a1a1a" /> : blocked ? <Lock size={12} color="#666" /> : null}
            </div>

            {/* Card */}
            <div
                style={{
                    backgroundColor: CARD_BG,
                    borderRadius: RADIUS,
                    marginBottom: 12,
                    border: `2px solid ${borderColor}`,
                    opacity,
                    overflow: 'hidden',
                    transition: 'all .2s',
                }}
            >
                {/* Header */}
                <button
                    onClick={() => isClickable && setExpanded(!expanded)}
                    disabled={!isClickable}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'none',
                        border: 'none',
                        cursor: isClickable ? 'pointer' : 'default',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} color={blocked ? '#999' : '#1a1a1a'} />
                        <span style={{ fontWeight: 600, fontSize: 15, color: blocked ? '#999' : '#1a1a1a' }}>{title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {blocked && <span style={{ fontSize: 12, color: '#999' }}>{blockedText || 'Bloqueado'}</span>}
                        {completed && !blocked && (
                            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={14} /> Concluído
                            </span>
                        )}
                        {isCurrent && (
                            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>Em andamento</span>
                        )}
                        {isClickable && (expanded ? <ChevronDown size={16} color="#999" /> : <ChevronRight size={16} color="#999" />)}
                    </div>
                </button>

                {/* Content */}
                {expanded && (
                    <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e0e0db' }}>
                        <div style={{ paddingTop: 14 }}>{children}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 1 — SERVIÇO
   ═══════════════════════════════════════════════════════════ */
function CardServiço({ pedido }: { pedido: Pedido }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Serviço</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                    {pedido.services?.title || 'Personalizado'}
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Tipo</span>
                <span style={{ fontSize: 14, color: '#1a1a1a' }}>{ORDER_TYPE_LABELS[pedido.order_type]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Data de criação</span>
                <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.created_at)}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 2 — BRIEFING
   ═══════════════════════════════════════════════════════════ */
function CardBriefing({ pedido }: { pedido: Pedido }) {
    const score = pedido.briefing_completeness_score ?? 0;
    const fields = pedido.briefing_data ? Object.keys(pedido.briefing_data) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Progress bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Completude do briefing</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: score >= 80 ? '#22c55e' : '#f59e0b' }}>{score}%</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#e0e0db' }}>
                    <div style={{
                        width: `${score}%`, height: '100%', borderRadius: 4,
                        backgroundColor: score >= 80 ? '#22c55e' : '#f59e0b',
                        transition: 'width .3s',
                    }} />
                </div>
            </div>

            {/* Fields filled */}
            {fields.length > 0 && (
                <div>
                    <p style={{ fontSize: 13, color: '#777', marginBottom: 6 }}>Campos preenchidos:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {fields.slice(0, 6).map(f => (
                            <span key={f} style={{
                                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                                backgroundColor: '#1a1a1a15', color: '#555',
                            }}>
                                {f.replace(/_/g, ' ')}
                            </span>
                        ))}
                        {fields.length > 6 && (
                            <span style={{ fontSize: 11, padding: '3px 8px', color: '#999' }}>+{fields.length - 6} mais</span>
                        )}
                    </div>
                </div>
            )}

            {score < 80 && (
                <button style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none',
                    backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                    fontSize: 13, cursor: 'pointer', marginTop: 4,
                }}>
                    Completar Briefing
                </button>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 3 — ORÇAMENTO
   ═══════════════════════════════════════════════════════════ */
function CardOrcamento({ pedido }: { pedido: Pedido }) {
    const isApproved = ['orcamento_aprovado', 'aguardando_pagamento', 'pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status);
    const isSent = pedido.status === 'orcamento_enviado';
    const isPending = pedido.status === 'briefing';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isPending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999', fontSize: 14 }}>
                    <Clock size={16} /> Aguardando envio do orçamento pelo admin
                </div>
            )}

            {isSent && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Valor</span>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                    </div>
                    {pedido.prazo_orcado && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Prazo</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{pedido.prazo_orcado} dias úteis</span>
                        </div>
                    )}
                    <a
                        href="/client/orcamentos"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '10px 16px', borderRadius: 10, border: 'none',
                            backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                            fontSize: 13, cursor: 'pointer', textDecoration: 'none', marginTop: 4,
                        }}
                    >
                        Ver e Aprovar <ExternalLink size={14} />
                    </a>
                </>
            )}

            {isApproved && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
                        <Check size={16} /> Orçamento aprovado
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Valor aprovado</span>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                    </div>
                    {pedido.data_aprovacao && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Data de aprovação</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.data_aprovacao)}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 4 — PAGAMENTO
   ═══════════════════════════════════════════════════════════ */
function CardPagamento({
    pedido,
    installments,
    pixConfig,
    markPaymentDone,
    isMarkingPayment,
    uploadComprovante,
    isUploadingComprovante,
}: {
    pedido: Pedido;
    installments: PaymentInstallment[];
    pixConfig: { pix_key: string; merchant_name: string; merchant_city: string } | null;
    markPaymentDone: (id: string) => void;
    isMarkingPayment: boolean;
    uploadComprovante: (args: { installmentId: string; file: File }) => void;
    isUploadingComprovante: boolean;
}) {
    const [copiedPix, setCopiedPix] = useState(false);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const paidCount = installments.filter(i => i.status === 'paid').length;
    const totalCount = installments.length || 1;
    const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
    const isComplete = pedido.data_pagamento_final || pedido.status === 'finalizado' || paidPercent === 100;

    const isFull = pedido.payment_mode === 'full';

    const copyPixKey = () => {
        if (!pixConfig?.pix_key) return;
        navigator.clipboard.writeText(pixConfig.pix_key);
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
    };

    const handleFileUpload = (installmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadComprovante({ installmentId, file });
    };

    const handleMarkPaid = (installmentId: string) => {
        setConfirmingId(installmentId);
        markPaymentDone(installmentId);
    };

    const getInstBg = (status: string): string => {
        if (status === 'paid') return '#22c55e12';
        if (status === 'overdue') return '#ef444412';
        if ((status as string) === 'awaiting_confirmation') return '#3b82f612';
        return '#1a1a1a08';
    };

    const getInstBorder = (status: string): string => {
        if (status === 'paid') return '1px solid #22c55e30';
        if (status === 'overdue') return '1px solid #ef444430';
        if ((status as string) === 'awaiting_confirmation') return '1px solid #3b82f630';
        return '1px solid transparent';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Resumo do orçamento */}
            <div style={{ padding: '14px 16px', borderRadius: 10, backgroundColor: '#1a1a1a08', border: '1px solid #e0e0db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Serviço</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{pedido.services?.title || 'Personalizado'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Valor total</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{fmt(pedido.valor_orcado || 0)}</span>
                </div>
                {pedido.condicao_pagamento && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777', fontSize: 13 }}>Condições</span>
                        <span style={{ fontSize: 13, color: '#555' }}>{pedido.condicao_pagamento}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Modalidade</span>
                    <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        {isFull ? 'Pagamento Único' : pedido.payment_mode === 'split_50_50' ? '50/50' : pedido.payment_mode === 'split_30_70' ? '30/70' : 'Parcelado'}
                    </span>
                </div>
            </div>

            {/* Barra de progresso */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#777', fontSize: 13 }}>Progresso do pagamento</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: isComplete ? '#22c55e' : '#f59e0b' }}>
                        {isComplete ? '100%' : `${paidPercent}%`} · {paidCount}/{totalCount} parcela(s)
                    </span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#e0e0db' }}>
                    <div style={{
                        width: `${isComplete ? 100 : paidPercent}%`, height: '100%', borderRadius: 4,
                        backgroundColor: isComplete ? '#22c55e' : '#f59e0b', transition: 'width .3s',
                    }} />
                </div>
            </div>

            {/* Método Pix */}
            {pixConfig && !isComplete && (
                <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    backgroundColor: '#00968810', border: '1px solid #00968825',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#009688', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>P</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Pagar via Pix</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', borderRadius: 8, backgroundColor: '#fff',
                        border: '1px solid #e0e0db',
                    }}>
                        <code style={{ flex: 1, fontSize: 13, color: '#333', wordBreak: 'break-all' }}>
                            {pixConfig.pix_key}
                        </code>
                        <button
                            onClick={copyPixKey}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                backgroundColor: copiedPix ? '#22c55e' : ACCENT,
                                color: '#1a1a1a', fontWeight: 700, fontSize: 12,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'background-color .2s',
                            }}
                        >
                            {copiedPix ? '✓ Copiado!' : 'Copiar Chave'}
                        </button>
                    </div>
                    <p style={{ fontSize: 11, color: '#666', margin: '8px 0 0' }}>
                        Titular: {pixConfig.merchant_name} · {pixConfig.merchant_city}
                    </p>
                </div>
            )}

            {/* Lista de parcelas */}
            {installments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {installments.map(inst => {
                        const isOverdue = inst.status === 'overdue';
                        const isPaid = inst.status === 'paid';
                        const isAwaiting = (inst.status as string) === 'awaiting_confirmation';

                        return (
                            <div key={inst.id} style={{
                                padding: '14px 16px', borderRadius: 10,
                                backgroundColor: getInstBg(inst.status),
                                border: getInstBorder(inst.status),
                            }}>
                                {/* Header da parcela */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {isPaid ? (
                                            <Check size={18} color="#22c55e" />
                                        ) : isOverdue ? (
                                            <AlertTriangle size={18} color="#ef4444" />
                                        ) : isAwaiting ? (
                                            <Loader2 size={18} color="#3b82f6" className="animate-spin" />
                                        ) : (
                                            <Clock size={18} color="#f59e0b" />
                                        )}
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                                            Parcela {inst.installment_number}
                                        </span>
                                        {isOverdue && (
                                            <span style={{
                                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                                backgroundColor: '#ef444420', color: '#ef4444', fontWeight: 700,
                                            }}>
                                                Em atraso
                                            </span>
                                        )}
                                        {isAwaiting && (
                                            <span style={{
                                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                                backgroundColor: '#3b82f620', color: '#3b82f6', fontWeight: 600,
                                            }}>
                                                Em análise
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
                                        {fmt(inst.amount)}
                                    </span>
                                </div>

                                {/* Detalhes da parcela */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#777', marginBottom: isPaid || isAwaiting ? 0 : 10 }}>
                                    <span>Vencimento: {fmtDate(inst.due_date)}</span>
                                    {isPaid && <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Pago em {fmtDate(inst.paid_at)}</span>}
                                    {inst.payment_method && <span>Método: {inst.payment_method}</span>}
                                </div>

                                {/* Comprovante já enviado */}
                                {inst.comprovante_url && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                                        padding: '8px 12px', borderRadius: 8, backgroundColor: '#fff',
                                        border: '1px solid #e0e0db',
                                    }}>
                                        <Package size={14} color="#777" />
                                        <a
                                            href={inst.comprovante_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                                        >
                                            Ver comprovante enviado
                                        </a>
                                    </div>
                                )}

                                {/* Ações: apenas se parcela não foi paga nem está em análise */}
                                {!isPaid && !isAwaiting && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                        {/* Upload de comprovante */}
                                        <label style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '8px 14px', borderRadius: 8,
                                            backgroundColor: '#fff', border: '1px solid #ddd',
                                            fontSize: 12, color: '#555', cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                        }}>
                                            <Send size={13} />
                                            {isUploadingComprovante ? 'Enviando...' : 'Enviar comprovante'}
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(inst.id, e)}
                                                disabled={isUploadingComprovante}
                                            />
                                        </label>

                                        {/* Botão Já realizei pagamento */}
                                        <button
                                            onClick={() => handleMarkPaid(inst.id)}
                                            disabled={isMarkingPayment}
                                            style={{
                                                padding: '10px 16px', borderRadius: 10, border: 'none',
                                                backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 700,
                                                fontSize: 13, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                alignSelf: 'flex-start',
                                                opacity: isMarkingPayment ? 0.6 : 1,
                                            }}
                                        >
                                            <CreditCard size={14} />
                                            {isMarkingPayment && confirmingId === inst.id ? 'Registrando...' : 'Já realizei o pagamento'}
                                        </button>
                                    </div>
                                )}

                                {/* Mensagem de aguardando confirmação */}
                                {isAwaiting && (
                                    <div style={{
                                        marginTop: 8, padding: '10px 14px', borderRadius: 8,
                                        backgroundColor: '#3b82f608', border: '1px solid #3b82f615',
                                    }}>
                                        <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, margin: 0 }}>
                                            Pagamento em análise
                                        </p>
                                        <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
                                            Você será notificado quando o pagamento for confirmado pelo administrador.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mensagem: pagamento único sem parcelas */}
            {isFull && installments.length === 0 && !isComplete && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 14, color: '#555' }}>
                        Valor total: <strong>{fmt(pedido.valor_orcado || 0)}</strong>
                    </p>
                    {pixConfig && (
                        <p style={{ fontSize: 13, color: '#777' }}>
                            Use a chave Pix acima para realizar o pagamento.
                        </p>
                    )}
                </div>
            )}

            {!isComplete && installments.length === 0 && !isFull && (
                <p style={{ fontSize: 13, color: '#999' }}>Aguardando configuração do pagamento.</p>
            )}

            {/* Pagamento completo */}
            {isComplete && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 10,
                    backgroundColor: '#22c55e10', border: '1px solid #22c55e25',
                }}>
                    <Check size={20} color="#22c55e" />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', margin: 0 }}>Pagamento concluído!</p>
                        {pedido.data_pagamento_final && (
                            <p style={{ fontSize: 12, color: '#777', margin: '2px 0 0' }}>
                                Finalizado em {fmtDate(pedido.data_pagamento_final)}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 5 — PRODUÇÃO
   ═══════════════════════════════════════════════════════════ */
function CardProducao({ pedido }: { pedido: Pedido }) {
    const isInProgress = ['em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes'].includes(pedido.status);
    const isComplete = ['aguardando_pagamento_final', 'finalizado'].includes(pedido.status);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isInProgress && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', fontWeight: 600, fontSize: 14 }}>
                        <Hammer size={16} /> Sua arte está sendo produzida
                    </div>
                    {pedido.prazo_final && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Previsão de entrega</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>{fmtDate(pedido.prazo_final)}</span>
                        </div>
                    )}
                    {pedido.data_inicio_confeccao && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#777', fontSize: 13 }}>Início da produção</span>
                            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{fmtDate(pedido.data_inicio_confeccao)}</span>
                        </div>
                    )}
                </>
            )}

            {isComplete && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
                    <Check size={16} /> Produção concluída
                </div>
            )}

            {!isInProgress && !isComplete && (
                <p style={{ fontSize: 13, color: '#999' }}>A produção começará após o pagamento.</p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 6 — REVISÃO
   ═══════════════════════════════════════════════════════════ */
function CardRevisao({ pedido, revisions }: { pedido: Pedido; revisions: OrderRevision[] }) {
    const [feedbackText, setFeedbackText] = useState('');
    const current = pedido.revision_count || 0;
    const max = pedido.max_revisions || 0;
    const activeRevision = revisions.find(r => r.status === 'pending' || r.status === 'in_progress');
    const isExhausted = current >= max;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Revisões</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                    {current} / {max} inclusas
                </span>
            </div>

            {/* Past revisions */}
            {revisions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {revisions.map(rev => (
                        <div key={rev.id} style={{
                            padding: '10px 12px', borderRadius: 8, backgroundColor: '#1a1a1a08',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                                    Revisão {rev.revision_number}
                                    {rev.is_extra && <span style={{ color: '#f59e0b', fontSize: 11, marginLeft: 6 }}>(extra — {fmt(rev.extra_cost)})</span>}
                                </span>
                                <span style={{
                                    fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                    backgroundColor: rev.status === 'completed' ? '#22c55e20' : rev.status === 'pending' ? '#f59e0b20' : '#3b82f620',
                                    color: rev.status === 'completed' ? '#22c55e' : rev.status === 'pending' ? '#f59e0b' : '#60a5fa',
                                }}>
                                    {rev.status === 'completed' ? 'Concluída' : rev.status === 'pending' ? 'Pendente' : 'Em andamento'}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{rev.description}</p>
                            {rev.admin_response && (
                                <p style={{ fontSize: 12, color: '#777', margin: '6px 0 0', fontStyle: 'italic' }}>
                                    Resposta: {rev.admin_response}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback form */}
            {['aguardando_aprovacao_cliente', 'em_ajustes'].includes(pedido.status) && !activeRevision && !isExhausted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Descreva as alterações que gostaria..."
                        style={{
                            width: '100%', minHeight: 80, padding: 12, borderRadius: 8,
                            border: '1px solid #ddd', fontSize: 13, resize: 'vertical',
                            fontFamily: 'inherit',
                        }}
                    />
                    <button
                        disabled={!feedbackText.trim()}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: 'none',
                            backgroundColor: feedbackText.trim() ? ACCENT : '#ccc',
                            color: '#1a1a1a', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                            opacity: feedbackText.trim() ? 1 : 0.6,
                        }}
                    >
                        <Send size={14} /> Enviar Feedback
                    </button>
                </div>
            )}

            {/* Exhausted warning */}
            {isExhausted && (
                <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                    <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontSize: 13, color: '#b45309', fontWeight: 600, margin: 0 }}>Revisões inclusas esgotadas</p>
                        <p style={{ fontSize: 12, color: '#92400e', margin: '4px 0 0' }}>
                            Revisão adicional sob consulta. Entre em contato para solicitar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 7 — ENTREGA
   ═══════════════════════════════════════════════════════════ */
function CardEntrega({ deliverables, markDownloaded }: { deliverables: OrderDeliverable[]; markDownloaded: (id: string) => void; }) {
    if (deliverables.length === 0) {
        return <p style={{ fontSize: 13, color: '#999' }}>Nenhuma entrega disponível ainda.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deliverables.map(d => {
                const expired = isDeliverableExpired(d);
                return (
                    <div key={d.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: 8, backgroundColor: '#1a1a1a08',
                        opacity: expired ? 0.5 : 1,
                    }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{d.file_name}</p>
                            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
                                Entregue em {fmtDate(d.delivered_at)}
                                {d.expires_at && ` · Expira ${fmtDate(d.expires_at)}`}
                            </p>
                        </div>
                        {expired ? (
                            <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Expirado</span>
                        ) : (
                            <a
                                href={d.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => !d.downloaded_at && markDownloaded(d.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '6px 12px', borderRadius: 8,
                                    backgroundColor: ACCENT, color: '#1a1a1a', fontWeight: 600,
                                    fontSize: 12, textDecoration: 'none',
                                }}
                            >
                                <Download size={14} /> Download
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CARD 8 — PROTOCOLO (sempre visível)
   ═══════════════════════════════════════════════════════════ */
function CardProtocolo({ pedido }: { pedido: Pedido }) {
    const publicUrl = `/acompanhar/${pedido.protocolo}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Protocolo</span>
                <span style={{
                    fontWeight: 700, fontSize: 18, color: '#1a1a1a',
                    letterSpacing: 1, fontFamily: 'monospace',
                }}>
                    #{pedido.protocolo}
                </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#777', fontSize: 13 }}>Status atual</span>
                <span style={statusPillStyle(pedido.status)}>{STATUS_LABELS[pedido.status]}</span>
            </div>

            <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10, border: `1px solid #ddd`,
                    color: '#1a1a1a', fontWeight: 600, fontSize: 13,
                    textDecoration: 'none', marginTop: 4,
                }}
            >
                <ExternalLink size={14} /> Acompanhar pela página pública
            </a>

            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                Use este código para consultar seu pedido a qualquer momento.
            </p>
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
