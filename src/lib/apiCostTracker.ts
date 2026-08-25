// ============================================================
// Rastreador de custo estimado da API Gemini (client-side).
// A API não expõe fatura em tempo real no browser, então o custo é
// ESTIMADO a partir do usageMetadata real de cada resposta (tokens)
// e da contagem de imagens, multiplicados pela tabela de preços abaixo.
// Acumulado por dia em localStorage; some após 60 dias.
// ============================================================

export interface UsageEvent {
    model: string;
    kind: 'text' | 'image';
    inputTokens?: number;
    outputTokens?: number;
    images?: number;
}

interface ModelBucket {
    inTok: number;
    outTok: number;
    images: number;
    cost: number;
}

interface DayBucket {
    day: string; // YYYY-MM-DD
    byModel: Record<string, ModelBucket>;
}

export interface CostSummary {
    todayCost: number;
    monthCost: number;
    monthImages: number;
    monthInTok: number;
    monthOutTok: number;
    byModelMonth: Array<{ model: string } & ModelBucket>;
}

const STORAGE_KEY = 'designer-api-usage';
export const USAGE_UPDATED_EVENT = 'designer-api-usage-updated';

// ── Tabela de preços (USD) — EDITÁVEL. Valores aproximados; ajuste
//    conforme a tabela oficial do Google AI Studio do seu plano. ──
interface ModelPrice {
    /** USD por 1M tokens de entrada */
    textIn: number;
    /** USD por 1M tokens de saída */
    textOut: number;
    /** USD por imagem gerada (modelos de imagem) */
    perImage: number;
}

const PRICE_TABLE: Record<string, ModelPrice> = {
    'gemini-3-pro-image':          { textIn: 2.00, textOut: 12.00, perImage: 0.134 },
    'gemini-3.1-flash-image':      { textIn: 0.30, textOut: 2.50,  perImage: 0.045 },
    'gemini-3.1-flash-lite-image': { textIn: 0.30, textOut: 2.50,  perImage: 0.034 },
    'gemini-2.5-flash-image':      { textIn: 0.30, textOut: 2.50,  perImage: 0.039 },
    'gemini-3.7-flash':            { textIn: 0.75, textOut: 3.75,  perImage: 0 }, // promo até 31/12/2026 ($1.50/$7.50 depois)
    'gemini-3.6-flash':            { textIn: 0.75, textOut: 3.75,  perImage: 0 }, // promo até 31/12/2026
    'gemini-3.5-flash':            { textIn: 1.50, textOut: 9.00,  perImage: 0 },
    'gemini-3.1-pro-preview':      { textIn: 1.25, textOut: 10.00, perImage: 0 },
    'gemini-3-flash-preview':      { textIn: 0.10, textOut: 0.40,  perImage: 0 },
    'gemini-2.5-flash':            { textIn: 0.30, textOut: 2.50,  perImage: 0 },
};

const DEFAULT_PRICE: ModelPrice = { textIn: 0.50, textOut: 3.00, perImage: 0.06 };

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

function loadDays(): DayBucket[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return [];
}

function saveDays(days: DayBucket[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    } catch { }
}

function costOf(event: UsageEvent): number {
    const price = PRICE_TABLE[event.model] || DEFAULT_PRICE;
    const inCost = ((event.inputTokens || 0) / 1_000_000) * price.textIn;
    const outCost = ((event.outputTokens || 0) / 1_000_000) * price.textOut;
    const imgCost = (event.images || 0) * price.perImage;
    return inCost + outCost + imgCost;
}

export function recordUsage(event: UsageEvent) {
    const day = todayKey();
    // Poda buckets com mais de 60 dias
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const days = loadDays().filter(d => d.day >= cutoff);

    let bucket = days.find(d => d.day === day);
    if (!bucket) {
        bucket = { day, byModel: {} };
        days.push(bucket);
    }
    const m = bucket.byModel[event.model] || { inTok: 0, outTok: 0, images: 0, cost: 0 };
    m.inTok += event.inputTokens || 0;
    m.outTok += event.outputTokens || 0;
    m.images += event.images || 0;
    m.cost += costOf(event);
    bucket.byModel[event.model] = m;

    saveDays(days);
    window.dispatchEvent(new CustomEvent(USAGE_UPDATED_EVENT));
}

export function getCostSummary(): CostSummary {
    const days = loadDays();
    const day = todayKey();
    const monthPrefix = day.slice(0, 7); // YYYY-MM

    let todayCost = 0;
    let monthCost = 0;
    let monthImages = 0;
    let monthInTok = 0;
    let monthOutTok = 0;
    const byModel: Record<string, ModelBucket> = {};

    for (const d of days) {
        const inMonth = d.day.startsWith(monthPrefix);
        for (const [model, m] of Object.entries(d.byModel)) {
            if (d.day === day) todayCost += m.cost;
            if (inMonth) {
                monthCost += m.cost;
                monthImages += m.images;
                monthInTok += m.inTok;
                monthOutTok += m.outTok;
                const agg = byModel[model] || { inTok: 0, outTok: 0, images: 0, cost: 0 };
                agg.inTok += m.inTok;
                agg.outTok += m.outTok;
                agg.images += m.images;
                agg.cost += m.cost;
                byModel[model] = agg;
            }
        }
    }

    return {
        todayCost,
        monthCost,
        monthImages,
        monthInTok,
        monthOutTok,
        byModelMonth: Object.entries(byModel)
            .map(([model, m]) => ({ model, ...m }))
            .sort((a, b) => b.cost - a.cost),
    };
}

export function resetUsage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { }
    window.dispatchEvent(new CustomEvent(USAGE_UPDATED_EVENT));
}

export function formatUsd(v: number): string {
    if (v >= 1) return `$${v.toFixed(2)}`;
    return `$${v.toFixed(3)}`;
}
