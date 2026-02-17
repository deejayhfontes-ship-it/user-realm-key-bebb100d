import { Loader2, Send, CheckCircle } from "lucide-react";
import type { BriefingFormData } from "@/pages/public/Briefing";
import type { Service } from "@/types/service";

interface BriefingStep4Props {
  formData: BriefingFormData;
  services: Service[];
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function BriefingStep4({
  formData,
  services,
  onSubmit,
  onPrev,
  isSubmitting,
}: BriefingStep4Props) {
  const selectedService = services.find((s) => s.id === formData.serviceId);

  const prazoLabels: Record<string, string> = {
    urgente: "Urgente (até 1 semana)",
    curto: "Curto prazo (1-2 semanas)",
    medio: "Médio prazo (2-4 semanas)",
    longo: "Longo prazo (mais de 1 mês)",
    flexivel: "Flexível",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-8">
        Revise seu briefing
      </h2>

      <div className="space-y-6">
        {/* Service Card */}
        <div className="p-6 rounded-[16px] bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-[#c4ff0d]" />
            <h3 className="text-lg font-semibold text-white">Serviço Selecionado</h3>
          </div>
          <p className="text-[#c4ff0d] font-medium">
            {selectedService?.title || formData.serviceName}
          </p>
        </div>

        {/* Contact Info */}
        <div className="p-6 rounded-[16px] bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Informações de Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/50">Nome:</span>
              <p className="text-white">{formData.nome}</p>
            </div>
            <div>
              <span className="text-white/50">E-mail:</span>
              <p className="text-white">{formData.email}</p>
            </div>
            {formData.telefone && (
              <div>
                <span className="text-white/50">Telefone:</span>
                <p className="text-white">{formData.telefone}</p>
              </div>
            )}
            {formData.empresa && (
              <div>
                <span className="text-white/50">Empresa:</span>
                <p className="text-white">{formData.empresa}</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="p-6 rounded-[16px] bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Detalhes do Projeto</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-white/50 text-sm">Descrição:</span>
              <p className="text-white mt-1">{formData.descricao}</p>
            </div>
            
            {formData.prazo && (
              <div>
                <span className="text-white/50 text-sm">Prazo:</span>
                <p className="text-white mt-1">{prazoLabels[formData.prazo] || formData.prazo}</p>
              </div>
            )}
            
            {formData.referencias && (
              <div>
                <span className="text-white/50 text-sm">Referências:</span>
                <p className="text-white mt-1 whitespace-pre-line">{formData.referencias}</p>
              </div>
            )}
          </div>
        </div>

        {/* Terms Notice */}
        <div className="p-4 rounded-[12px] bg-[#c4ff0d]/10 border border-[#c4ff0d]/30">
          <p className="text-sm text-white/80">
            Ao enviar, você concorda com nossos{" "}
            <a href="/termos" target="_blank" className="text-[#c4ff0d] underline hover:no-underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacidade" target="_blank" className="text-[#c4ff0d] underline hover:no-underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-[24px] font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-[24px] font-semibold bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Briefing
            </>
          )}
        </button>
      </div>
    </div>
  );
}
