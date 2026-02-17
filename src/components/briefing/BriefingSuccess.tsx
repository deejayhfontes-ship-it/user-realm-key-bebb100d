import { CheckCircle, ArrowRight, Home, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface BriefingSuccessProps {
  protocolo?: string | null;
}

export function BriefingSuccess({ protocolo }: BriefingSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (protocolo) {
      navigator.clipboard.writeText(protocolo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section 
      className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 pt-24"
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
    >
      <div className="text-center max-w-lg">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#c4ff0d]/20 mb-4">
            <CheckCircle className="w-12 h-12 text-[#c4ff0d]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Pedido Enviado!
        </h1>

        {/* Protocol */}
        {protocolo && (
          <div className="mb-6">
            <p className="text-sm text-white/50 mb-2">Seu protocolo de acompanhamento:</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c4ff0d]/20 border border-[#c4ff0d]/30 hover:bg-[#c4ff0d]/30 transition-all"
            >
              <span className="font-mono text-xl font-bold text-[#c4ff0d]">{protocolo}</span>
              {copied ? (
                <Check className="w-5 h-5 text-[#c4ff0d]" />
              ) : (
                <Copy className="w-5 h-5 text-[#c4ff0d]" />
              )}
            </button>
            <p className="text-xs text-white/40 mt-2">Clique para copiar</p>
          </div>
        )}

        {/* Description */}
        <p className="text-lg text-white/70 mb-8">
          Recebemos seu projeto com sucesso. Nossa equipe entrará em contato em breve com um orçamento personalizado.
        </p>

        {/* Timeline */}
        <div className="p-6 rounded-[16px] bg-white/5 border border-white/10 mb-8">
          <h3 className="text-sm font-semibold text-[#c4ff0d] mb-4 uppercase tracking-wide">
            Próximos Passos
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c4ff0d] text-[#1a1a1a] flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <p className="text-sm text-white/80">Análise do seu briefing pela nossa equipe</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c4ff0d]/50 text-[#1a1a1a] flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <p className="text-sm text-white/80">Envio do orçamento detalhado por e-mail</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c4ff0d]/30 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <p className="text-sm text-white/80">Aprovação e início do projeto</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-[24px] font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
          {protocolo && (
            <Link
              to={`/pedido/${protocolo}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-[24px] font-semibold bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90 transition-all duration-300"
            >
              Acompanhar Pedido
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
