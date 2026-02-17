import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { usePedidoByProtocolo, useAprovarOrcamento, useRecusarOrcamento, useAprovarEntrega, useSolicitarAjustes, useAvaliarPedido } from "@/hooks/usePedidos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  CreditCard, 
  Palette, 
  Package, 
  Check, 
  X, 
  Clock, 
  Loader2,
  Home,
  Copy,
  AlertTriangle,
  Download,
  Star,
  Gift,
  Wallet,
  RefreshCw,
  Calendar,
  DollarSign,
  AlertCircle,
  Share2,
  CheckCircle2
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, TIPO_PAGAMENTO_LABELS, TIPO_PAGAMENTO_COLORS, StatusPedido } from "@/types/pedido";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// CSS for animations
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
`;

// Status step mapping
const STATUS_STEPS: StatusPedido[] = [
  'briefing',
  'orcamento_enviado',
  'aguardando_pagamento',
  'em_confeccao',
  'finalizado'
];

const STEP_LABELS = ['Briefing', 'Orçamento', 'Pagamento', 'Confecção', 'Entrega'];

function getStepIndex(status: StatusPedido): number {
  const statusToStep: Record<StatusPedido, number> = {
    'briefing': 0,
    'orcamento_enviado': 1,
    'orcamento_aprovado': 2,
    'aguardando_pagamento': 2,
    'pagamento_confirmado': 3,
    'em_confeccao': 3,
    'aguardando_aprovacao_cliente': 3,
    'em_ajustes': 3,
    'aguardando_pagamento_final': 4,
    'finalizado': 4,
    'cancelado': -1,
    'recusado': -1,
  };
  return statusToStep[status] ?? 0;
}

function getStatusIcon(status: StatusPedido) {
  const icons: Partial<Record<StatusPedido, React.ElementType>> = {
    'briefing': FileText,
    'orcamento_enviado': CreditCard,
    'aguardando_pagamento': Clock,
    'pagamento_confirmado': CheckCircle2,
    'em_confeccao': Palette,
    'aguardando_aprovacao_cliente': Package,
    'em_ajustes': RefreshCw,
    'aguardando_pagamento_final': Wallet,
    'finalizado': Check,
    'cancelado': X,
    'recusado': X,
  };
  return icons[status] || FileText;
}

export default function PedidoAcompanhamento() {
  const { protocolo } = useParams<{ protocolo: string }>();
  const { data: pedido, isLoading, error, refetch } = usePedidoByProtocolo(protocolo);
  const queryClient = useQueryClient();
  const aprovarOrcamento = useAprovarOrcamento();
  const recusarOrcamento = useRecusarOrcamento();
  const aprovarEntrega = useAprovarEntrega();
  const solicitarAjustes = useSolicitarAjustes();
  const avaliarPedido = useAvaliarPedido();

  const [showRecusarModal, setShowRecusarModal] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [avaliacao, setAvaliacao] = useState({ nota: 5, comentario: "" });
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showStatusPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showStatusPopup]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowStatusPopup(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDateShort = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  const getDaysRemaining = () => {
    if (!pedido?.prazo_final) return null;
    const days = differenceInDays(new Date(pedido.prazo_final), new Date());
    return days;
  };

  const handleCopyProtocolo = () => {
    if (pedido?.protocolo) {
      navigator.clipboard.writeText(pedido.protocolo);
      setCopied(true);
      toast.success("Protocolo copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAprovar = () => {
    if (!pedido) return;
    aprovarOrcamento.mutate({ id: pedido.id, pedido });
  };

  const handleRecusar = () => {
    if (!pedido) return;
    recusarOrcamento.mutate({ id: pedido.id, motivo: motivoRecusa }, {
      onSuccess: () => setShowRecusarModal(false),
    });
  };

  const handleAprovarEntrega = () => {
    if (!pedido) return;
    aprovarEntrega.mutate({ id: pedido.id, pedido });
  };

  const handleSolicitarAjustes = () => {
    if (!pedido) return;
    solicitarAjustes.mutate({ id: pedido.id });
  };

  const handleAvaliar = () => {
    if (!pedido) return;
    avaliarPedido.mutate({ id: pedido.id, nota: avaliacao.nota, comentario: avaliacao.comentario }, {
      onSuccess: () => setShowAvaliacaoModal(false),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#c4ff0d]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <X className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <p className="text-white/60 mb-6">Verifique se o protocolo está correto.</p>
          <Link to="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStep = getStepIndex(pedido.status);
  const daysRemaining = getDaysRemaining();
  const StatusIcon = getStatusIcon(pedido.status);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <style>{animationStyles}</style>
      <Navbar />
      
      {/* Header */}
      <section 
        className="relative pt-28 pb-8 px-6"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-base text-white/70 uppercase tracking-wide mb-2">Pedido</p>
          <h1 className="text-4xl font-bold mb-4">{pedido.protocolo}</h1>
          <Badge className={`${STATUS_COLORS[pedido.status]} text-sm px-5 py-1.5`}>
            {STATUS_LABELS[pedido.status]}
          </Badge>
        </div>

        {/* Atualizar Status Button */}
        <button
          onClick={() => setShowStatusPopup(true)}
          className="absolute top-8 right-6 md:top-8 md:right-8 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
            bg-[#c4ff0d]/10 border border-[#c4ff0d] text-[#c4ff0d] hover:bg-[#c4ff0d]/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden md:inline">Atualizar Status</span>
        </button>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
            
            {/* Main Column - Timeline */}
            <div className="space-y-8">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/50">Serviço</p>
                  <p className="font-medium truncate">{pedido.services?.title || "Não definido"}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/50">Valor</p>
                  <p className="font-medium">{pedido.valor_orcado ? formatCurrency(pedido.valor_orcado) : "-"}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/50">Prazo</p>
                  <p className="font-medium">{pedido.prazo_orcado ? `${pedido.prazo_orcado} dias` : "-"}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/50">Data</p>
                  <p className="font-medium">{format(new Date(pedido.created_at), "dd/MM/yy", { locale: ptBR })}</p>
                </div>
              </div>

              {/* Status-specific content */}
              {pedido.status === 'orcamento_enviado' && pedido.valor_orcado && (
                <div className="bg-white/5 border border-[#c4ff0d]/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-[#c4ff0d]" />
                    <h2 className="text-xl font-semibold">Orçamento Disponível</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-white/50">Valor total</p>
                      <p className="text-3xl font-bold text-[#c4ff0d]">{formatCurrency(pedido.valor_orcado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Prazo de entrega</p>
                      <p className="text-xl font-semibold">{pedido.prazo_orcado} dias úteis</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge className={TIPO_PAGAMENTO_COLORS[pedido.tipo_pagamento]}>
                      {pedido.tipo_pagamento === 'antecipado' && <CreditCard className="w-3 h-3 mr-1" />}
                      {pedido.tipo_pagamento === 'faturamento' && <FileText className="w-3 h-3 mr-1" />}
                      {pedido.tipo_pagamento === 'pos_entrega' && <Package className="w-3 h-3 mr-1" />}
                      {pedido.tipo_pagamento === 'parcelado' && <Wallet className="w-3 h-3 mr-1" />}
                      {pedido.tipo_pagamento === 'sem_custo' && <Gift className="w-3 h-3 mr-1" />}
                      {TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento]}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 mb-4 text-sm space-y-2">
                    {pedido.tipo_pagamento === 'antecipado' && (
                      <p className="text-white/70">O projeto iniciará após confirmação do pagamento.</p>
                    )}
                    {pedido.tipo_pagamento === 'faturamento' && (
                      <>
                        <p className="text-white/70">O projeto iniciará imediatamente após sua aprovação.</p>
                        {pedido.condicao_pagamento && (
                          <p className="text-white/70">Condição: {pedido.condicao_pagamento}</p>
                        )}
                      </>
                    )}
                    {pedido.tipo_pagamento === 'pos_entrega' && (
                      <>
                        <p className="text-white/70">O projeto iniciará imediatamente após sua aprovação.</p>
                        <p className="text-white/70">O pagamento será solicitado após a entrega.</p>
                      </>
                    )}
                    {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada && (
                      <>
                        <p className="text-white/70">Entrada: {formatCurrency(pedido.valor_entrada)}</p>
                        <p className="text-white/70">Saldo na entrega: {formatCurrency(pedido.valor_orcado - pedido.valor_entrada)}</p>
                      </>
                    )}
                    {pedido.tipo_pagamento === 'sem_custo' && (
                      <p className="text-white/70">Não há custo para este projeto.</p>
                    )}
                  </div>

                  {pedido.observacoes_admin && (
                    <div className="p-4 rounded-xl bg-white/5 mb-6">
                      <p className="text-xs text-white/50 mb-1">Observações</p>
                      <p className="text-sm">{pedido.observacoes_admin}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAprovar}
                      disabled={aprovarOrcamento.isPending}
                      className="flex-1 bg-[#c4ff0d] text-[#1a1a1a] hover:bg-[#b3e60d]"
                    >
                      {aprovarOrcamento.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Aprovar Orçamento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRecusarModal(true)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Recusar
                    </Button>
                  </div>
                </div>
              )}

              {pedido.status === 'aguardando_pagamento' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-semibold text-orange-400">
                      {pedido.tipo_pagamento === 'parcelado' ? 'Aguardando Pagamento da Entrada' : 'Aguardando Pagamento'}
                    </h2>
                  </div>

                  <p className="text-2xl font-bold mb-4">
                    {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada
                      ? formatCurrency(pedido.valor_entrada)
                      : formatCurrency(pedido.valor_orcado!)}
                  </p>

                  <div className="p-4 rounded-xl bg-white/5 mb-4">
                    <p className="text-sm text-white/70 mb-2">
                      Realize o pagamento e envie o comprovante por email ou aguarde a confirmação.
                    </p>
                    <p className="text-xs text-white/50">
                      Após a confirmação, o projeto será iniciado imediatamente.
                    </p>
                  </div>
                </div>
              )}

              {(pedido.status === 'em_confeccao' || pedido.status === 'em_ajustes') && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold text-purple-400">
                      {pedido.status === 'em_ajustes' ? 'Em Ajustes' : 'Em Confecção'}
                    </h2>
                  </div>

                  {pedido.prazo_final && (
                    <p className="text-white/70 mb-4">
                      Prazo de entrega: {format(new Date(pedido.prazo_final), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  )}

                  {daysRemaining !== null && (
                    <p className={`text-lg font-semibold mb-4 ${daysRemaining < 0 ? 'text-red-400' : 'text-[#c4ff0d]'}`}>
                      {daysRemaining < 0 ? `Atrasado em ${Math.abs(daysRemaining)} dias` : `${daysRemaining} dias restantes`}
                    </p>
                  )}

                  <p className="text-sm text-white/50">
                    Estamos trabalhando no seu projeto. Você receberá uma notificação quando a prévia estiver disponível.
                  </p>
                </div>
              )}

              {pedido.status === 'aguardando_aprovacao_cliente' && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-semibold text-cyan-400">Prévia Disponível</h2>
                  </div>

                  {pedido.mensagem_entrega && (
                    <div className="p-4 rounded-xl bg-white/5 mb-4">
                      <p className="text-sm">{pedido.mensagem_entrega}</p>
                    </div>
                  )}

                  {pedido.arquivos_entregues && pedido.arquivos_entregues.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-white/50">Arquivos:</p>
                      {pedido.arquivos_entregues.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm truncate flex-1">Arquivo {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAprovarEntrega}
                      disabled={aprovarEntrega.isPending}
                      className="flex-1 bg-[#c4ff0d] text-[#1a1a1a] hover:bg-[#b3e60d]"
                    >
                      {aprovarEntrega.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Aprovar Entrega
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSolicitarAjustes}
                      disabled={solicitarAjustes.isPending}
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Solicitar Ajustes
                    </Button>
                  </div>
                </div>
              )}

              {pedido.status === 'aguardando_pagamento_final' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-semibold text-orange-400">Aguardando Pagamento Final</h2>
                  </div>

                  <p className="text-2xl font-bold mb-4">
                    {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada
                      ? formatCurrency(pedido.valor_orcado! - pedido.valor_entrada)
                      : formatCurrency(pedido.valor_orcado!)}
                  </p>

                  {pedido.arquivos_entregues && pedido.arquivos_entregues.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-white/50">Prévia dos arquivos:</p>
                      {pedido.arquivos_entregues.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm truncate flex-1">Arquivo {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-white/50">
                    Realize o pagamento para receber os arquivos finais.
                  </p>
                </div>
              )}

              {pedido.status === 'finalizado' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-semibold text-green-400">Projeto Finalizado</h2>
                  </div>

                  {pedido.data_entrega && (
                    <p className="text-white/70 mb-4">
                      Entregue em {format(new Date(pedido.data_entrega), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  )}

                  {pedido.arquivos_entregues && pedido.arquivos_entregues.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-white/50">Seus arquivos:</p>
                      {pedido.arquivos_entregues.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm truncate flex-1">Arquivo {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {pedido.avaliacao_nota ? (
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-white/50 mb-2">Sua avaliação</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < pedido.avaliacao_nota! ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} 
                          />
                        ))}
                      </div>
                      {pedido.avaliacao_comentario && (
                        <p className="text-sm mt-2 italic">"{pedido.avaliacao_comentario}"</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowAvaliacaoModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Avaliar experiência
                    </Button>
                  )}
                </div>
              )}

              {pedido.status === 'recusado' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                  <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-red-400 mb-2">Orçamento Recusado</h2>
                  {pedido.motivo_recusa && (
                    <p className="text-white/70">Motivo: {pedido.motivo_recusa}</p>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-6">Histórico</h3>
                <div className="relative pl-12 space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-5 bottom-5 w-1 bg-white/10" />

                  <TimelineItem
                    icon={FileText}
                    label="Briefing enviado"
                    date={formatDate(pedido.data_briefing)}
                    completed
                  />
                  {pedido.data_orcamento && (
                    <TimelineItem
                      icon={CreditCard}
                      label="Orçamento enviado"
                      date={formatDate(pedido.data_orcamento)}
                      completed
                    />
                  )}
                  {pedido.data_aprovacao && (
                    <TimelineItem
                      icon={Check}
                      label="Orçamento aprovado"
                      date={formatDate(pedido.data_aprovacao)}
                      completed
                    />
                  )}
                  {pedido.data_pagamento && (
                    <TimelineItem
                      icon={CreditCard}
                      label="Pagamento confirmado"
                      date={formatDate(pedido.data_pagamento)}
                      completed
                    />
                  )}
                  {pedido.data_inicio_confeccao && (
                    <TimelineItem
                      icon={Palette}
                      label="Produção iniciada"
                      date={formatDate(pedido.data_inicio_confeccao)}
                      completed
                    />
                  )}
                  {pedido.data_entrega && (
                    <TimelineItem
                      icon={Package}
                      label="Projeto entregue"
                      date={formatDate(pedido.data_entrega)}
                      completed
                    />
                  )}
                  {pedido.data_pagamento_final && (
                    <TimelineItem
                      icon={Check}
                      label="Pagamento final confirmado"
                      date={formatDate(pedido.data_pagamento_final)}
                      completed
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold mb-4">Informações do pedido</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/50">Serviço</p>
                    <p className="font-medium">{pedido.services?.title || "Não definido"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-white/50">Data do pedido</p>
                    <p className="font-medium">{formatDateShort(pedido.data_briefing)}</p>
                  </div>
                  
                  {pedido.prazo_solicitado && (
                    <div>
                      <p className="text-xs text-white/50">Prazo solicitado</p>
                      <p className="font-medium">{pedido.prazo_solicitado}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-white/50">Status atual</p>
                    <Badge className={`${STATUS_COLORS[pedido.status]} mt-1`}>
                      {STATUS_LABELS[pedido.status]}
                    </Badge>
                  </div>

                  {daysRemaining !== null && pedido.status === 'em_confeccao' && (
                    <div>
                      <p className="text-xs text-white/50">Dias restantes</p>
                      <p className={`font-bold text-lg ${daysRemaining < 0 ? 'text-red-400' : 'text-[#c4ff0d]'}`}>
                        {daysRemaining < 0 ? 'Atrasado' : `${daysRemaining} dias`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShareLink}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Popup */}
      {showStatusPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            animation: 'fadeIn 200ms ease-out',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStatusPopup(false);
          }}
        >
          <div 
            className="w-full max-w-[500px] rounded-3xl overflow-hidden"
            style={{ 
              animation: 'scaleIn 300ms ease-out',
              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
              border: '1px solid rgba(196,255,13,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-[#c4ff0d]/10 border-b border-[#c4ff0d]/20">
              <h2 className="text-xl font-semibold">Status do Pedido</h2>
              <button
                onClick={() => setShowStatusPopup(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Protocolo */}
              <div className="text-center mb-6">
                <button
                  onClick={handleCopyProtocolo}
                  className="inline-flex items-center gap-2 text-3xl font-bold text-[#c4ff0d] hover:opacity-80 transition-opacity"
                >
                  {pedido.protocolo}
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Current Status Card */}
              <div className="p-5 rounded-2xl mb-6 bg-[#c4ff0d]/10 border-2 border-[#c4ff0d]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#c4ff0d]/20 flex items-center justify-center">
                    <StatusIcon className="w-6 h-6 text-[#c4ff0d]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Status Atual</p>
                    <p className="text-lg font-bold">{STATUS_LABELS[pedido.status]}</p>
                    <p className="text-xs text-white/50">{getTimeAgo(pedido.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mb-6">
                <div className="flex items-center justify-between px-2">
                  {STEP_LABELS.map((label, i) => {
                    const isComplete = i < currentStep;
                    const isActive = i === currentStep;
                    const isIncomplete = i > currentStep;

                    return (
                      <div key={label} className="flex flex-col items-center relative">
                        {/* Connector line */}
                        {i > 0 && (
                          <div 
                            className={`absolute right-full top-4 w-full h-0.5 -mr-4 ${
                              isComplete || isActive ? 'bg-[#c4ff0d]' : 'bg-white/10'
                            }`}
                            style={{ width: 'calc(100% - 16px)' }}
                          />
                        )}
                        
                        {/* Dot */}
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                            isComplete 
                              ? 'bg-[#c4ff0d]' 
                              : isActive 
                                ? 'bg-[#c4ff0d]/20 border-2 border-[#c4ff0d]' 
                                : 'bg-white/10 border-2 border-white/20'
                          }`}
                          style={isActive ? { animation: 'pulse 2s infinite' } : undefined}
                        >
                          {isComplete && <Check className="w-4 h-4 text-[#1a1a1a]" />}
                        </div>
                        
                        {/* Label */}
                        <p className={`text-[11px] mt-2 text-center hidden md:block ${
                          isComplete || isActive ? 'text-white/80' : 'text-white/40'
                        }`}>
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-[#c4ff0d] mx-auto mb-2" />
                  <p className="text-[11px] text-white/60">Prazo</p>
                  <p className={`text-sm font-medium ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-400' : ''}`}>
                    {pedido.prazo_final ? formatDateShort(pedido.prazo_final) : '-'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-[#c4ff0d] mx-auto mb-2" />
                  <p className="text-[11px] text-white/60">Restantes</p>
                  <p className={`text-sm font-medium ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-400' : ''}`}>
                    {daysRemaining !== null 
                      ? (daysRemaining < 0 ? 'Atrasado' : `${daysRemaining} dias`) 
                      : '-'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-[#c4ff0d] mx-auto mb-2" />
                  <p className="text-[11px] text-white/60">Valor</p>
                  <p className="text-sm font-medium">
                    {pedido.valor_orcado ? formatCurrency(pedido.valor_orcado) : '-'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <RefreshCw className="w-6 h-6 text-[#c4ff0d] mx-auto mb-2" />
                  <p className="text-[11px] text-white/60">Atualização</p>
                  <p className="text-sm font-medium">{getTimeAgo(pedido.updated_at)}</p>
                </div>
              </div>

              {/* Next Step Alert */}
              {pedido.status !== 'finalizado' && pedido.status !== 'cancelado' && pedido.status !== 'recusado' && (
                <div className="p-4 rounded-xl mb-6 bg-amber-500/10 border-l-4 border-amber-500">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      {pedido.status === 'orcamento_enviado' && (
                        <p className="text-sm">⏳ Aguardando sua aprovação do orçamento</p>
                      )}
                      {pedido.status === 'aguardando_pagamento' && (
                        <p className="text-sm">💳 Aguardando confirmação de pagamento</p>
                      )}
                      {pedido.status === 'em_confeccao' && (
                        <p className="text-sm">🎨 Projeto em produção</p>
                      )}
                      {pedido.status === 'aguardando_aprovacao_cliente' && (
                        <p className="text-sm">📦 Prévia disponível para aprovação</p>
                      )}
                      {pedido.status === 'aguardando_pagamento_final' && (
                        <p className="text-sm">💰 Projeto pronto, aguardando pagamento final</p>
                      )}
                      {pedido.status === 'briefing' && (
                        <p className="text-sm">📝 Analisando seu briefing</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {pedido.status === 'finalizado' && (
                <div className="p-4 rounded-xl mb-6 bg-green-500/10 border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">✅ Projeto concluído!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-5 border-t border-white/10">
              <button
                onClick={() => setShowStatusPopup(false)}
                className="text-sm text-[#c4ff0d] hover:underline"
              >
                Ver detalhes completos
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  bg-[#c4ff0d]/10 border border-[#c4ff0d] text-[#c4ff0d] hover:bg-[#c4ff0d]/20 transition-colors
                  disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recusar Modal */}
      <Dialog open={showRecusarModal} onOpenChange={setShowRecusarModal}>
        <DialogContent className="bg-[#1a1a1a] border-white/10">
          <DialogHeader>
            <DialogTitle>Recusar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo da recusa (opcional)"
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRecusarModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRecusar}
              disabled={recusarOrcamento.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {recusarOrcamento.isPending ? "Recusando..." : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avaliação Modal */}
      <Dialog open={showAvaliacaoModal} onOpenChange={setShowAvaliacaoModal}>
        <DialogContent className="bg-[#1a1a1a] border-white/10">
          <DialogHeader>
            <DialogTitle>Avalie sua experiência</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAvaliacao(prev => ({ ...prev, nota: i + 1 }))}
                  className="p-1"
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      i < avaliacao.nota 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-white/20 hover:text-yellow-400/50'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Deixe um comentário (opcional)"
              value={avaliacao.comentario}
              onChange={(e) => setAvaliacao(prev => ({ ...prev, comentario: e.target.value }))}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAvaliacaoModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAvaliar}
              disabled={avaliarPedido.isPending}
              className="bg-[#c4ff0d] text-[#1a1a1a] hover:bg-[#b3e60d]"
            >
              {avaliarPedido.isPending ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// Timeline item component
function TimelineItem({ 
  icon: Icon, 
  label, 
  date, 
  completed 
}: { 
  icon: React.ElementType; 
  label: string; 
  date: string; 
  completed: boolean;
}) {
  return (
    <div className="relative pb-8 last:pb-0">
      <div className={`absolute -left-7 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
        completed ? 'bg-[#c4ff0d] text-[#1a1a1a]' : 'bg-white/10 text-white/30'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-6">
        <p className={completed ? 'text-white font-medium' : 'text-white/50'}>{label}</p>
        <p className="text-xs text-white/40">{date}</p>
      </div>
    </div>
  );
}