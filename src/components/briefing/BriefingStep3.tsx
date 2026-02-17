import type { BriefingFormData } from "@/pages/public/Briefing";

interface BriefingStep3Props {
  formData: BriefingFormData;
  onChange: (updates: Partial<BriefingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BriefingStep3({
  formData,
  onChange,
  onNext,
  onPrev,
}: BriefingStep3Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-8">
        Referências e inspirações
      </h2>

      <div className="space-y-6">
        {/* References Text */}
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Links de referência
          </label>
          <textarea
            value={formData.referencias}
            onChange={(e) => onChange({ referencias: e.target.value })}
            placeholder="Cole aqui links de sites, imagens ou projetos que te inspiram..."
            rows={4}
            className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors resize-none"
          />
          <p className="text-xs text-white/50 mt-2">
            Separe múltiplos links por linha ou vírgula
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Observações adicionais
          </label>
          <textarea
            value={formData.referencias}
            onChange={(e) => onChange({ referencias: e.target.value })}
            placeholder="Tem algo mais que gostaria de compartilhar? Cores preferidas, estilos, o que evitar..."
            rows={4}
            className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-[12px] bg-[#c4ff0d]/10 border border-[#c4ff0d]/30">
          <p className="text-sm text-white/80">
            <span className="text-[#c4ff0d] font-semibold">Dica:</span> Quanto mais referências e detalhes você compartilhar, melhor conseguiremos entender sua visão e entregar um projeto alinhado às suas expectativas.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-[24px] font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-[24px] font-semibold bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90 transition-all duration-300"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
