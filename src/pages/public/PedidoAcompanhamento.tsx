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
  Wallet
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, TIPO_PAGAMENTO_LABELS, TIPO_PAGAMENTO_COLORS } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PedidoAcompanhamento() {
  const { protocolo } = useParams<{ protocolo: string }>();
  const { data: pedido, isLoading, error } = usePedidoByProtocolo(protocolo);
  const aprovarOrcamento = useAprovarOrcamento();
  const recusarOrcamento = useRecusarOrcamento();
  const aprovarEntrega = useAprovarEntrega();
  const solicitarAjustes = useSolicitarAjustes();
  const avaliarPedido = useAvaliarPedido();

  const [showRecusarModal, setShowRecusarModal] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [avaliacao, setAvaliacao] = useState({ nota: 5, comentario: "" });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      
      {/* Hero */}
      <section 
        className="pt-32 pb-12 px-6"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#c4ff0d] text-sm font-medium mb-2">Acompanhamento</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pedido.protocolo}</h1>
          <Badge className={`${STATUS_COLORS[pedido.status]} text-sm px-4 py-1`}>
            {STATUS_LABELS[pedido.status]}
          </Badge>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Quick Info */}
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

          {/* Orçamento enviado - Aguardando aprovação */}
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

              {/* Payment type badge */}
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

              {/* Payment info based on type */}
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

          {/* Aguardando pagamento */}
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

          {/* Em confecção */}
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

              <p className="text-sm text-white/50">
                Estamos trabalhando no seu projeto. Você receberá uma notificação quando a prévia estiver disponível.
              </p>
            </div>
          )}

          {/* Aguardando aprovação do cliente */}
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

          {/* Aguardando pagamento final */}
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

          {/* Finalizado */}
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

              {/* Rating */}
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

          {/* Recusado */}
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
            <div className="space-y-4">
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
      </section>

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
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={completed ? 'text-white' : 'text-white/50'}>{label}</p>
        <p className="text-xs text-white/40">{date}</p>
      </div>
    </div>
  );
}
