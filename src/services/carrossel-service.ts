// MyPostFlow — Serviço Supabase (carousels, templates, training)
import { supabase } from '@/integrations/supabase/client';
import type { CarouselV2, SlideConfig, SlideFormat, PostStyle } from '@/types/carrossel-v2';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface SavedCarousel {
  id: string;
  title: string;
  format: SlideFormat;
  style: PostStyle;
  slides: SlideConfig[];
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  format: SlideFormat;
  style: PostStyle;
  slides: SlideConfig[];
  created_at: string;
}

export interface UserTraining {
  instagram_handle: string;
  niche: string;
  tone: string;
  font_title: string;
  font_subtitle: string;
  brand_bg: string;
  brand_title_color: string;
  brand_sub_color: string;
  accent_color: string;
  slide_count: number;
}

// ─── Carousels ────────────────────────────────────────────────────────────────

export async function listCarousels(): Promise<SavedCarousel[]> {
  const { data, error } = await supabase
    .from('carousels')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    ...row,
    slides: Array.isArray(row.slides) ? row.slides as SlideConfig[] : [],
    format: (row.format ?? 'carousel') as SlideFormat,
    style: (row.style ?? 'minimalista') as PostStyle,
  }));
}

export async function saveCarousel(carousel: CarouselV2): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const payload = {
    user_id: user.id,
    title: carousel.title || 'Sem título',
    format: carousel.slideFormat,
    style: carousel.postStyle,
    slides: carousel.slides as unknown as Record<string, unknown>[],
    thumbnail_url: null as string | null,
  };

  if (carousel.id) {
    const { error } = await supabase
      .from('carousels')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', carousel.id);
    if (error) throw new Error(error.message);
    return carousel.id;
  }

  const { data, error } = await supabase
    .from('carousels')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteCarousel(id: string): Promise<void> {
  const { error } = await supabase.from('carousels').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicateCarousel(id: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: src, error: fetchErr } = await supabase
    .from('carousels').select('*').eq('id', id).single();
  if (fetchErr || !src) throw new Error('Carrossel não encontrado');

  const { data, error } = await supabase
    .from('carousels')
    .insert({
      user_id: user.id,
      title: `${src.title} (cópia)`,
      format: src.format,
      style: src.style,
      slides: src.slides,
      thumbnail_url: src.thumbnail_url,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function listTemplates(): Promise<SavedTemplate[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    ...row,
    slides: Array.isArray(row.slides) ? row.slides as SlideConfig[] : [],
    format: (row.format ?? 'carousel') as SlideFormat,
    style: (row.style ?? 'minimalista') as PostStyle,
  }));
}

export async function saveTemplate(
  name: string,
  carousel: CarouselV2
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      name,
      format: carousel.slideFormat,
      style: carousel.postStyle,
      slides: carousel.slides as unknown as Record<string, unknown>[],
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── User Training ────────────────────────────────────────────────────────────

const TRAINING_DEFAULTS: UserTraining = {
  instagram_handle: '',
  niche: '',
  tone: 'direto',
  font_title: 'space-grotesk',
  font_subtitle: 'inter',
  brand_bg: '#0a0a0a',
  brand_title_color: '',
  brand_sub_color: '',
  accent_color: '',
  slide_count: 5,
};

export async function getTraining(): Promise<UserTraining> {
  const { data, error } = await supabase
    .from('user_training')
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return TRAINING_DEFAULTS;
  return {
    instagram_handle: data.instagram_handle ?? '',
    niche: data.niche ?? '',
    tone: data.tone ?? 'direto',
    font_title: data.font_title ?? 'space-grotesk',
    font_subtitle: data.font_subtitle ?? 'inter',
    brand_bg: data.brand_bg ?? '#0a0a0a',
    brand_title_color: data.brand_title_color ?? '',
    brand_sub_color: data.brand_sub_color ?? '',
    accent_color: data.accent_color ?? '',
    slide_count: data.slide_count ?? 5,
  };
}

export async function saveTraining(training: UserTraining): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('user_training')
    .upsert({ user_id: user.id, ...training }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
