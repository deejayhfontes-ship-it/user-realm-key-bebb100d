import { useEffect, useState } from 'react';
import { CircleDollarSign, RotateCcw, X } from 'lucide-react';
import { getCostSummary, resetUsage, formatUsd, USAGE_UPDATED_EVENT, type CostSummary } from '@/lib/apiCostTracker';

// Pill de custo estimado da API + painel de breakdown por modelo.
// Custos são estimativas locais (usageMetadata × tabela de preços), não fatura oficial.
export function ApiCostBadge() {
    const [summary, setSummary] = useState<CostSummary>(() => getCostSummary());
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const refresh = () => setSummary(getCostSummary());
        window.addEventListener(USAGE_UPDATED_EVENT, refresh);
        return () => window.removeEventListener(USAGE_UPDATED_EVENT, refresh);
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 active:scale-[0.97] border shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${open
                    ? 'bg-lime-400/15 text-lime-300 border-lime-300/30'
                    : 'bg-white/[0.06] text-white/60 border-white/[0.12] hover:bg-white/[0.1] hover:text-white/80 backdrop-blur-xl'
                    }`}
                title="Custo estimado da API (hoje · mês)"
            >
                <CircleDollarSign className="w-3 h-3" />
                {formatUsd(summary.todayCost)} <span className="opacity-50">·</span> {formatUsd(summary.monthCost)}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl border border-white/[0.12] bg-[#141414]/90 backdrop-blur-2xl shadow-2xl shadow-black/50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/70">Custo Estimado da API</span>
                        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="text-[9px] uppercase font-bold text-white/40 mb-0.5">Hoje</div>
                            <div className="text-sm font-bold text-lime-300">{formatUsd(summary.todayCost)}</div>
                        </div>
                        <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="text-[9px] uppercase font-bold text-white/40 mb-0.5">Este Mês</div>
                            <div className="text-sm font-bold text-white">{formatUsd(summary.monthCost)}</div>
                        </div>
                    </div>

                    <div className="text-[9px] text-white/40 mb-2">
                        {summary.monthImages} imagens · {Math.round((summary.monthInTok + summary.monthOutTok) / 1000)}k tokens no mês
                    </div>

                    {summary.byModelMonth.length > 0 && (
                        <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                            {summary.byModelMonth.map(m => (
                                <div key={m.model} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-white/70 truncate">{m.model}</div>
                                        <div className="text-[8px] text-white/35">
                                            {m.images > 0 ? `${m.images} img · ` : ''}{Math.round((m.inTok + m.outTok) / 1000)}k tok
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/80 shrink-0 ml-2">{formatUsd(m.cost)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-[8px] text-white/30 max-w-[160px]">Estimativa local (tokens × tabela de preços editável em apiCostTracker.ts)</span>
                        <button
                            onClick={() => { resetUsage(); }}
                            className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-red-400 transition-colors"
                            title="Zerar histórico de custo"
                        >
                            <RotateCcw className="w-3 h-3" /> Zerar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
