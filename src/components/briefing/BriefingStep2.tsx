import { cn } from "@/lib/utils";
import type { BriefingFormData } from "@/pages/public/Briefing";

interface BriefingStep2Props {
  formData: BriefingFormData;
  onChange: (updates: Partial<BriefingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
}

export function BriefingStep2({
  formData,
  onChange,
  onNext,
  onPrev,
  canNext,
}: BriefingStep2Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-8">
        Conte-nos mais sobre seu projeto
      </h2>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Descrição do projeto <span className="text-[#c4ff0d]">*</span>
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => onChange({ descricao: e.target.value })}
            placeholder="Descreva seu projeto em detalhes..."
            rows={5}
            className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors resize-none"
          />
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Seu nome <span className="text-[#c4ff0d]">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">
              E-mail <span className="text-[#c4ff0d]">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors"
            />
          </div>
        </div>

        {/* Phone and Company Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => onChange({ telefone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Empresa
            </label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => onChange({ empresa: e.target.value })}
              placeholder="Nome da empresa"
              className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors"
            />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Prazo desejado
          </label>
          <select
            value={formData.prazo}
            onChange={(e) => onChange({ prazo: e.target.value })}
            className="w-full px-4 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c4ff0d] transition-colors appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "20px" }}
          >
            <option value="" className="bg-[#1a1a1a]">Selecione um prazo</option>
            <option value="urgente" className="bg-[#1a1a1a]">Urgente (até 1 semana)</option>
            <option value="curto" className="bg-[#1a1a1a]">Curto prazo (1-2 semanas)</option>
            <option value="medio" className="bg-[#1a1a1a]">Médio prazo (2-4 semanas)</option>
            <option value="longo" className="bg-[#1a1a1a]">Longo prazo (mais de 1 mês)</option>
            <option value="flexivel" className="bg-[#1a1a1a]">Flexível</option>
          </select>
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
          disabled={!canNext}
          className={cn(
            "px-8 py-3 rounded-[24px] font-semibold transition-all duration-300",
            canNext
              ? "bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90"
              : "bg-[#c4ff0d]/50 text-[#1a1a1a]/50 cursor-not-allowed"
          )}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
