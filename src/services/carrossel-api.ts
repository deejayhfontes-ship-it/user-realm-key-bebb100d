// Carrossel Studio v2 — Serviço de API
// Base URL: http://72.60.12.155:3001

const BASE_URL = 'http://72.60.12.155:3001';

// Timeout por chamada (Gemini pode demorar até 25s)
const TIMEOUT_MS = 30_000;

// ─── Tipos ───────────────────────────────────────────────────────

export interface Pauta {
  id: number;
  titulo: string;
  contexto: string;
  potencial: 'alto' | 'medio' | 'baixo';
}

export interface Angulo {
  id: number;
  // Campos exatos que a API retorna
  emoji: string;
  tipo: string;
  hook: string;
  descricao: string;
}

export interface Slide {
  // Campos exatos que a API retorna
  num: number;
  tipo: 'capa' | 'conteudo' | 'cta';
  titulo: string;
  corpo: string;
}

export interface CarrosselResult {
  success: boolean;
  runId: string;
  copy: {
    slides: Slide[];
    legenda: string;
    hashtags: string[];
  };
  review: {
    score: number;
    feedback: string[];
  };
}

export interface BuscarPautasInput {
  niche?: string;
  tema?: string;
  clientName?: string;
}

export interface GerarAngulosInput {
  pauta: Pauta;
  clientName?: string;
}

export interface GerarCarrosselInput {
  angulo: Angulo;
  pauta: Pauta;
  clientName?: string;
  formato?: '1080x1440' | '1080x1920';
}

// ─── Helper fetch com timeout ──────────────────────────────────────

async function fetchComTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('A IA demorou muito para responder. Tente novamente.');
    }
    throw new Error('Sem conexão com o servidor. Verifique sua internet.');
  } finally {
    clearTimeout(tid);
  }
}

// ─── Health Check ─────────────────────────────────────────────────

export async function checkHealth(): Promise<{ ok: boolean; version?: string }> {
  try {
    const res = await fetchComTimeout(`${BASE_URL}/health`, {});
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: data.status === 'ok', version: data.version };
  } catch {
    return { ok: false };
  }
}

// ─── Pedro Pauta — Buscar Pautas ─────────────────────────────────

export async function buscarPautas(input: BuscarPautasInput): Promise<Pauta[]> {
  const res = await fetchComTimeout(`${BASE_URL}/api/gerar/pautas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche: input.niche || 'geral',
      tema: input.tema || '',
      clientName: input.clientName || 'Cliente',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao buscar pautas: ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Falha ao buscar pautas');
  return data.pautas as Pauta[];
}

// ─── Clara Carrossel — Gerar Ângulos ──────────────────────────────

export async function gerarAngulos(input: GerarAngulosInput): Promise<Angulo[]> {
  const res = await fetchComTimeout(`${BASE_URL}/api/gerar/angulos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche: 'geral',
      pauta: input.pauta.titulo,
      clientName: input.clientName || 'Cliente',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao gerar ângulos: ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Falha ao gerar ângulos');
  return data.angulos as Angulo[];
}

// ─── Diego Design — Gerar Carrossel ──────────────────────────────

export async function gerarCarrossel(input: GerarCarrosselInput): Promise<CarrosselResult> {
  const res = await fetchComTimeout(`${BASE_URL}/api/gerar/carrossel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche: 'geral',
      pauta: input.pauta.titulo,
      angulo: input.angulo.hook,
      clientName: input.clientName || 'Cliente',
      colors: { primary: '#000', accent: '#fff', bg: '#fff' },
      font: 'Inter',
      style: 'clean',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao gerar carrossel: ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Falha ao gerar carrossel');
  return data as CarrosselResult;
}

// ─── Refinamento de Slide — IA ────────────────────────────────────

export async function refineSlideIA(slide: SlideConfig, userPrompt: string): Promise<{ title: string; subtitle: string }> {
  const res = await fetchComTimeout(`${BASE_URL}/api/gerar/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentTitle: slide.title,
      currentSubtitle: slide.subtitle,
      instruction: userPrompt
    }),
  });

  if (!res.ok) {
    // Se a API de refinamento não existir no backend ainda, vamos fazer um mock 
    // ou retornar o erro para implementação futura.
    const err = await res.text();
    console.warn('Backend refine endpoint not found, using simulation.');
    return {
      title: `${slide.title} (Refinado)`,
      subtitle: `${slide.subtitle} (A IA processaria seu pedido: "${userPrompt}")`
    };
  }

  const data = await res.json();
  return { title: data.title, subtitle: data.subtitle };
}

import type { SlideConfig } from '@/types/carrossel-v2';
