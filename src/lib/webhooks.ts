<<<<<<< HEAD
/**
 * webhooks.ts — Helper centralizado para disparo de webhooks n8n
 *
 * Dois webhooks disponíveis:
 *   1. sendNovaSolicitacao  → notifica o ADMIN via WhatsApp
 *   2. sendMaterialPronto   → notifica o CLIENTE via WhatsApp
 *
 * Características:
 *   - Fire-and-forget: nunca bloqueia a UI
 *   - Timeout de 5s (AbortController)
 *   - Secret enviado no body para validação no n8n (IF node)
 *   - Log de erro no console sem impactar o usuário
 */

// ─── Tipos ────────────────────────────────────────────────────────

export interface NovaSolicitacaoPayload {
    /** Protocolo gerado (ex: SB-DG-202602-123456) */
    protocolo: string;
    /** Nome do cliente/solicitante */
    cliente: string;
    /** Título do projeto/material */
    titulo: string;
    /** Prazo estimado (formato legível, ex: "20/02/2026") */
    prazo: string;
    /** Link direto para o painel admin */
    linkAdmin: string;
}

export interface MaterialProntoPayload {
    /** Protocolo da solicitação */
    protocolo: string;
    /** Título do projeto/material */
    titulo: string;
    /** Telefone do cliente no formato 55DDDNUMERO (ex: 5511999998888) */
    telefoneCliente: string;
    /** Link para download/visualização da entrega */
    linkEntrega: string;
}

// ─── Configuração ─────────────────────────────────────────────────

const TIMEOUT_MS = 5000;

function getConfig() {
    return {
        urlNovaSolicitacao: import.meta.env.VITE_WEBHOOK_NOVA_SOLICITACAO || '',
        urlMaterialPronto: import.meta.env.VITE_WEBHOOK_MATERIAL_PRONTO || '',
        secret: import.meta.env.VITE_WEBHOOK_SECRET || '',
    };
}

// ─── Função genérica de disparo ───────────────────────────────────

async function dispararWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
    if (!url) {
        console.warn('[webhook] URL não configurada, pulando disparo.');
        return;
    }

    const { secret } = getConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret,
                ...payload,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            console.warn(`[webhook] Resposta ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.warn('[webhook] Timeout de 5s atingido, seguindo sem aguardar.');
        } else {
            console.warn('[webhook] Erro ao disparar:', error);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── Funções públicas ─────────────────────────────────────────────

/**
 * Notifica o ADMIN (você) via WhatsApp que uma nova solicitação chegou.
 * Chamado após salvar a solicitação no localStorage.
 *
 * @example
 * sendNovaSolicitacao({
 *   protocolo: 'SB-DG-202602-123456',
 *   cliente: 'João Silva',
 *   titulo: 'Banner Festa Junina',
 *   prazo: '20/02/2026',
 *   linkAdmin: 'https://seusite.com/admin/solicitacoes-prefeitura',
 * });
 */
export function sendNovaSolicitacao(payload: NovaSolicitacaoPayload): void {
    const { urlNovaSolicitacao } = getConfig();

    // Fire-and-forget: não retorna a Promise, não interfere na UI
    dispararWebhook(urlNovaSolicitacao, {
        tipo: 'nova-solicitacao',
        ...payload,
        timestamp: new Date().toISOString(),
    }).catch(() => { }); // segurança extra
}

/**
 * Notifica o CLIENTE via WhatsApp que o material está pronto.
 * Chamado quando o admin marca status como "entregue" ou "aprovado".
 *
 * @example
 * sendMaterialPronto({
 *   protocolo: 'SB-DG-202602-123456',
 *   titulo: 'Banner Festa Junina',
 *   telefoneCliente: '5511999998888',
 *   linkEntrega: 'https://seusite.com/entregas/xyz',
 * });
 */
export function sendMaterialPronto(payload: MaterialProntoPayload): void {
    const { urlMaterialPronto } = getConfig();

    // Fire-and-forget
    dispararWebhook(urlMaterialPronto, {
        tipo: 'material-pronto',
        ...payload,
        timestamp: new Date().toISOString(),
    }).catch(() => { }); // segurança extra
}
=======
/**
 * webhooks.ts — Helper centralizado para disparo de webhooks n8n
 *
 * Dois webhooks disponíveis:
 *   1. sendNovaSolicitacao  → notifica o ADMIN via WhatsApp
 *   2. sendMaterialPronto   → notifica o CLIENTE via WhatsApp
 *
 * Características:
 *   - Fire-and-forget: nunca bloqueia a UI
 *   - Timeout de 5s (AbortController)
 *   - Secret enviado no body para validação no n8n (IF node)
 *   - Log de erro no console sem impactar o usuário
 */

// ─── Tipos ────────────────────────────────────────────────────────

export interface NovaSolicitacaoPayload {
    /** Protocolo gerado (ex: SB-DG-202602-123456) */
    protocolo: string;
    /** Nome do cliente/solicitante */
    cliente: string;
    /** Título do projeto/material */
    titulo: string;
    /** Prazo estimado (formato legível, ex: "20/02/2026") */
    prazo: string;
    /** Link direto para o painel admin */
    linkAdmin: string;
}

export interface MaterialProntoPayload {
    /** Protocolo da solicitação */
    protocolo: string;
    /** Título do projeto/material */
    titulo: string;
    /** Telefone do cliente no formato 55DDDNUMERO (ex: 5511999998888) */
    telefoneCliente: string;
    /** Link para download/visualização da entrega */
    linkEntrega: string;
}

// ─── Configuração ─────────────────────────────────────────────────

const TIMEOUT_MS = 5000;

function getConfig() {
    return {
        urlNovaSolicitacao: import.meta.env.VITE_WEBHOOK_NOVA_SOLICITACAO || '',
        urlMaterialPronto: import.meta.env.VITE_WEBHOOK_MATERIAL_PRONTO || '',
        secret: import.meta.env.VITE_WEBHOOK_SECRET || '',
    };
}

// ─── Função genérica de disparo ───────────────────────────────────

async function dispararWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
    if (!url) {
        console.warn('[webhook] URL não configurada, pulando disparo.');
        return;
    }

    const { secret } = getConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret,
                ...payload,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            console.warn(`[webhook] Resposta ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.warn('[webhook] Timeout de 5s atingido, seguindo sem aguardar.');
        } else {
            console.warn('[webhook] Erro ao disparar:', error);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── Funções públicas ─────────────────────────────────────────────

/**
 * Notifica o ADMIN (você) via WhatsApp que uma nova solicitação chegou.
 * Chamado após salvar a solicitação no localStorage.
 *
 * @example
 * sendNovaSolicitacao({
 *   protocolo: 'SB-DG-202602-123456',
 *   cliente: 'João Silva',
 *   titulo: 'Banner Festa Junina',
 *   prazo: '20/02/2026',
 *   linkAdmin: 'https://seusite.com/admin/solicitacoes-prefeitura',
 * });
 */
export function sendNovaSolicitacao(payload: NovaSolicitacaoPayload): void {
    const { urlNovaSolicitacao } = getConfig();

    // Fire-and-forget: não retorna a Promise, não interfere na UI
    dispararWebhook(urlNovaSolicitacao, {
        tipo: 'nova-solicitacao',
        ...payload,
        timestamp: new Date().toISOString(),
    }).catch(() => { }); // segurança extra
}

/**
 * Notifica o CLIENTE via WhatsApp que o material está pronto.
 * Chamado quando o admin marca status como "entregue" ou "aprovado".
 *
 * @example
 * sendMaterialPronto({
 *   protocolo: 'SB-DG-202602-123456',
 *   titulo: 'Banner Festa Junina',
 *   telefoneCliente: '5511999998888',
 *   linkEntrega: 'https://seusite.com/entregas/xyz',
 * });
 */
export function sendMaterialPronto(payload: MaterialProntoPayload): void {
    const { urlMaterialPronto } = getConfig();

    // Fire-and-forget
    dispararWebhook(urlMaterialPronto, {
        tipo: 'material-pronto',
        ...payload,
        timestamp: new Date().toISOString(),
    }).catch(() => { }); // segurança extra
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
