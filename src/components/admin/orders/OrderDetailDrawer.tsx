<<<<<<< HEAD
import React, { useState } from 'react';
import { X, FileText, DollarSign, RotateCcw, Package, Clock, Send, User, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevisionPanel } from './RevisionPanel';
import { DeliverablesPanel } from './DeliverablesPanel';
import { PaymentInstallmentsPanel } from './PaymentInstallmentsPanel';
import { OrderTimeline } from './OrderTimeline';
import { DynamicBriefingForm } from './DynamicBriefingForm';
import { useBriefingTemplate } from '@/hooks/useBriefingTemplates';
import { STATUS_LABELS, STATUS_COLORS, ORDER_TYPE_LABELS, PAYMENT_MODE_LABELS } from '@/types/pedido';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pedido } from '@/types/pedido';
import type { BriefingSchemaJson } from '@/types/briefing-template';

interface OrderDetailDrawerProps {
    pedido: Pedido | null;
    onClose: () => void;
}

export function OrderDetailDrawer({ pedido, onClose }: OrderDetailDrawerProps) {
    const [activeTab, setActiveTab] = useState('resumo');
    const { data: briefingTemplate } = useBriefingTemplate(pedido?.briefing_template_id || undefined);

    if (!pedido) return null;

    const valor = pedido.valor_orcado
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_orcado / 100)
        : 'Não definido';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 
        bg-[#0f0f1a] border-l border-white/[0.06] shadow-2xl
        animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div>
                        <span className="text-xs font-mono text-[#CCFF00] tracking-wider">
                            {pedido.protocolo}
                        </span>
                        <h2 className="text-lg font-semibold text-white mt-0.5">{pedido.nome}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}
                        className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Status bar */}
                <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[pedido.status]}`}>
                        {STATUS_LABELS[pedido.status]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/[0.06]">
                        {ORDER_TYPE_LABELS[pedido.order_type]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/[0.06]">
                        {PAYMENT_MODE_LABELS[pedido.payment_mode]}
                    </span>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="px-5 pt-3 pb-0 bg-transparent justify-start gap-1 shrink-0">
                        <TabsTrigger value="resumo" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <FileText className="w-3.5 h-3.5 mr-1.5" />Resumo
                        </TabsTrigger>
                        <TabsTrigger value="briefing" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Send className="w-3.5 h-3.5 mr-1.5" />Briefing
                        </TabsTrigger>
                        <TabsTrigger value="pagamento" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <DollarSign className="w-3.5 h-3.5 mr-1.5" />Pagamento
                        </TabsTrigger>
                        <TabsTrigger value="revisoes" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Revisões
                        </TabsTrigger>
                        <TabsTrigger value="entregas" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Package className="w-3.5 h-3.5 mr-1.5" />Entregas
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />Timeline
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Resumo */}
                        <TabsContent value="resumo" className="mt-0 space-y-4">
                            {/* Client info */}
                            <Section title="Cliente" icon={User}>
                                <InfoRow label="Nome" value={pedido.nome} />
                                <InfoRow label="Email" value={pedido.email} />
                                {pedido.telefone && <InfoRow label="Telefone" value={pedido.telefone} />}
                                {pedido.empresa && <InfoRow label="Empresa" value={pedido.empresa} />}
                            </Section>

                            {/* Service / Description */}
                            <Section title="Serviço" icon={Tag}>
                                {pedido.services && <InfoRow label="Serviço" value={pedido.services.title} />}
                                <InfoRow label="Descrição" value={pedido.descricao} multiline />
                                {pedido.referencias && <InfoRow label="Referências" value={pedido.referencias} multiline />}
                            </Section>

                            {/* Financial */}
                            <Section title="Financeiro" icon={DollarSign}>
                                <InfoRow label="Valor Orçado" value={valor} highlight />
                                {pedido.discount_amount > 0 && (
                                    <InfoRow
                                        label="Desconto"
                                        value={`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.discount_amount / 100)}${pedido.discount_reason ? ` (${pedido.discount_reason})` : ''}`}
                                    />
                                )}
                                <InfoRow label="Pagamento" value={PAYMENT_MODE_LABELS[pedido.payment_mode]} />
                            </Section>

                            {/* Dates */}
                            <Section title="Datas" icon={Calendar}>
                                <InfoRow label="Briefing" value={format(new Date(pedido.data_briefing), "dd/MM/yyyy", { locale: ptBR })} />
                                {pedido.data_orcamento && <InfoRow label="Orçamento" value={format(new Date(pedido.data_orcamento), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.data_aprovacao && <InfoRow label="Aprovação" value={format(new Date(pedido.data_aprovacao), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.prazo_final && <InfoRow label="Prazo Final" value={format(new Date(pedido.prazo_final), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.data_entrega && <InfoRow label="Entrega" value={format(new Date(pedido.data_entrega), "dd/MM/yyyy", { locale: ptBR })} />}
                            </Section>

                            {/* NPS */}
                            {pedido.nps_score !== null && (
                                <Section title="Avaliação" icon={Clock}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-[#CCFF00]">{pedido.nps_score}</span>
                                        <span className="text-xs text-gray-500">/10</span>
                                    </div>
                                    {pedido.nps_comment && <p className="text-xs text-gray-400 mt-1">{pedido.nps_comment}</p>}
                                </Section>
                            )}
                        </TabsContent>

                        {/* Briefing */}
                        <TabsContent value="briefing" className="mt-0">
                            {briefingTemplate ? (
                                <DynamicBriefingForm
                                    schema={briefingTemplate.schema_json}
                                    values={pedido.briefing_data || {}}
                                    onChange={() => { }}
                                    readOnly
                                />
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-300">{pedido.descricao}</p>
                                    {pedido.referencias && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Referências:</p>
                                            <p className="text-sm text-gray-400">{pedido.referencias}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Pagamento */}
                        <TabsContent value="pagamento" className="mt-0">
                            <PaymentInstallmentsPanel pedidoId={pedido.id} paymentMode={pedido.payment_mode} />
                        </TabsContent>

                        {/* Revisões */}
                        <TabsContent value="revisoes" className="mt-0">
                            <RevisionPanel
                                pedidoId={pedido.id}
                                maxRevisions={pedido.max_revisions}
                                revisionCount={pedido.revision_count}
                            />
                        </TabsContent>

                        {/* Entregas */}
                        <TabsContent value="entregas" className="mt-0">
                            <DeliverablesPanel pedidoId={pedido.id} />
                        </TabsContent>

                        {/* Timeline */}
                        <TabsContent value="timeline" className="mt-0">
                            <OrderTimeline pedidoId={pedido.id} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </>
    );
}

// Helper components
function Section({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
                <Icon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span className="text-xs font-medium text-gray-300">{title}</span>
            </div>
            <div className="px-3 py-3 space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, highlight, multiline }: {
    label: string;
    value: string;
    highlight?: boolean;
    multiline?: boolean;
}) {
    return (
        <div className={multiline ? '' : 'flex items-center justify-between'}>
            <span className="text-[11px] text-gray-500">{label}</span>
            <span className={`text-sm ${highlight ? 'text-[#CCFF00] font-semibold' : 'text-gray-300'} ${multiline ? 'block mt-0.5' : ''}`}>
                {value}
            </span>
        </div>
    );
}
=======
import React, { useState } from 'react';
import { X, FileText, DollarSign, RotateCcw, Package, Clock, Send, User, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevisionPanel } from './RevisionPanel';
import { DeliverablesPanel } from './DeliverablesPanel';
import { PaymentInstallmentsPanel } from './PaymentInstallmentsPanel';
import { OrderTimeline } from './OrderTimeline';
import { DynamicBriefingForm } from './DynamicBriefingForm';
import { useBriefingTemplate } from '@/hooks/useBriefingTemplates';
import { STATUS_LABELS, STATUS_COLORS, ORDER_TYPE_LABELS, PAYMENT_MODE_LABELS } from '@/types/pedido';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pedido } from '@/types/pedido';
import type { BriefingSchemaJson } from '@/types/briefing-template';

interface OrderDetailDrawerProps {
    pedido: Pedido | null;
    onClose: () => void;
}

export function OrderDetailDrawer({ pedido, onClose }: OrderDetailDrawerProps) {
    const [activeTab, setActiveTab] = useState('resumo');
    const { data: briefingTemplate } = useBriefingTemplate(pedido?.briefing_template_id || undefined);

    if (!pedido) return null;

    const valor = pedido.valor_orcado
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_orcado / 100)
        : 'Não definido';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 
        bg-[#0f0f1a] border-l border-white/[0.06] shadow-2xl
        animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div>
                        <span className="text-xs font-mono text-[#CCFF00] tracking-wider">
                            {pedido.protocolo}
                        </span>
                        <h2 className="text-lg font-semibold text-white mt-0.5">{pedido.nome}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}
                        className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Status bar */}
                <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[pedido.status]}`}>
                        {STATUS_LABELS[pedido.status]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/[0.06]">
                        {ORDER_TYPE_LABELS[pedido.order_type]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/[0.06]">
                        {PAYMENT_MODE_LABELS[pedido.payment_mode]}
                    </span>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="px-5 pt-3 pb-0 bg-transparent justify-start gap-1 shrink-0">
                        <TabsTrigger value="resumo" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <FileText className="w-3.5 h-3.5 mr-1.5" />Resumo
                        </TabsTrigger>
                        <TabsTrigger value="briefing" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Send className="w-3.5 h-3.5 mr-1.5" />Briefing
                        </TabsTrigger>
                        <TabsTrigger value="pagamento" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <DollarSign className="w-3.5 h-3.5 mr-1.5" />Pagamento
                        </TabsTrigger>
                        <TabsTrigger value="revisoes" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Revisões
                        </TabsTrigger>
                        <TabsTrigger value="entregas" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Package className="w-3.5 h-3.5 mr-1.5" />Entregas
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#CCFF00] text-xs rounded-lg">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />Timeline
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Resumo */}
                        <TabsContent value="resumo" className="mt-0 space-y-4">
                            {/* Client info */}
                            <Section title="Cliente" icon={User}>
                                <InfoRow label="Nome" value={pedido.nome} />
                                <InfoRow label="Email" value={pedido.email} />
                                {pedido.telefone && <InfoRow label="Telefone" value={pedido.telefone} />}
                                {pedido.empresa && <InfoRow label="Empresa" value={pedido.empresa} />}
                            </Section>

                            {/* Service / Description */}
                            <Section title="Serviço" icon={Tag}>
                                {pedido.services && <InfoRow label="Serviço" value={pedido.services.title} />}
                                <InfoRow label="Descrição" value={pedido.descricao} multiline />
                                {pedido.referencias && <InfoRow label="Referências" value={pedido.referencias} multiline />}
                            </Section>

                            {/* Financial */}
                            <Section title="Financeiro" icon={DollarSign}>
                                <InfoRow label="Valor Orçado" value={valor} highlight />
                                {pedido.discount_amount > 0 && (
                                    <InfoRow
                                        label="Desconto"
                                        value={`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.discount_amount / 100)}${pedido.discount_reason ? ` (${pedido.discount_reason})` : ''}`}
                                    />
                                )}
                                <InfoRow label="Pagamento" value={PAYMENT_MODE_LABELS[pedido.payment_mode]} />
                            </Section>

                            {/* Dates */}
                            <Section title="Datas" icon={Calendar}>
                                <InfoRow label="Briefing" value={format(new Date(pedido.data_briefing), "dd/MM/yyyy", { locale: ptBR })} />
                                {pedido.data_orcamento && <InfoRow label="Orçamento" value={format(new Date(pedido.data_orcamento), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.data_aprovacao && <InfoRow label="Aprovação" value={format(new Date(pedido.data_aprovacao), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.prazo_final && <InfoRow label="Prazo Final" value={format(new Date(pedido.prazo_final), "dd/MM/yyyy", { locale: ptBR })} />}
                                {pedido.data_entrega && <InfoRow label="Entrega" value={format(new Date(pedido.data_entrega), "dd/MM/yyyy", { locale: ptBR })} />}
                            </Section>

                            {/* NPS */}
                            {pedido.nps_score !== null && (
                                <Section title="Avaliação" icon={Clock}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-[#CCFF00]">{pedido.nps_score}</span>
                                        <span className="text-xs text-gray-500">/10</span>
                                    </div>
                                    {pedido.nps_comment && <p className="text-xs text-gray-400 mt-1">{pedido.nps_comment}</p>}
                                </Section>
                            )}
                        </TabsContent>

                        {/* Briefing */}
                        <TabsContent value="briefing" className="mt-0">
                            {briefingTemplate ? (
                                <DynamicBriefingForm
                                    schema={briefingTemplate.schema_json}
                                    values={pedido.briefing_data || {}}
                                    onChange={() => { }}
                                    readOnly
                                />
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-300">{pedido.descricao}</p>
                                    {pedido.referencias && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Referências:</p>
                                            <p className="text-sm text-gray-400">{pedido.referencias}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Pagamento */}
                        <TabsContent value="pagamento" className="mt-0">
                            <PaymentInstallmentsPanel pedidoId={pedido.id} paymentMode={pedido.payment_mode} />
                        </TabsContent>

                        {/* Revisões */}
                        <TabsContent value="revisoes" className="mt-0">
                            <RevisionPanel
                                pedidoId={pedido.id}
                                maxRevisions={pedido.max_revisions}
                                revisionCount={pedido.revision_count}
                            />
                        </TabsContent>

                        {/* Entregas */}
                        <TabsContent value="entregas" className="mt-0">
                            <DeliverablesPanel pedidoId={pedido.id} />
                        </TabsContent>

                        {/* Timeline */}
                        <TabsContent value="timeline" className="mt-0">
                            <OrderTimeline pedidoId={pedido.id} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </>
    );
}

// Helper components
function Section({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
                <Icon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span className="text-xs font-medium text-gray-300">{title}</span>
            </div>
            <div className="px-3 py-3 space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, highlight, multiline }: {
    label: string;
    value: string;
    highlight?: boolean;
    multiline?: boolean;
}) {
    return (
        <div className={multiline ? '' : 'flex items-center justify-between'}>
            <span className="text-[11px] text-gray-500">{label}</span>
            <span className={`text-sm ${highlight ? 'text-[#CCFF00] font-semibold' : 'text-gray-300'} ${multiline ? 'block mt-0.5' : ''}`}>
                {value}
            </span>
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
