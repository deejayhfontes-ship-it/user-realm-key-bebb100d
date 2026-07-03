-- Tabela separada para o Briefing de Vídeo de Evento.
-- Espelha a estrutura/RLS de public.briefings, sem tocar nele.
-- Rode no SQL Editor do Supabase (ou aplicado via Management API).

create extension if not exists pgcrypto;

create table if not exists public.video_briefings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  nome text not null,
  contato text,
  email text,
  evento text,
  tipo_video text,
  valor integer,
  respostas jsonb not null
);

alter table public.video_briefings enable row level security;

drop policy if exists "video_briefings_insert_anon" on public.video_briefings;
drop policy if exists "video_briefings_select_authenticated" on public.video_briefings;
drop policy if exists "video_briefings_delete_authenticated" on public.video_briefings;

revoke all on public.video_briefings from anon;
revoke all on public.video_briefings from authenticated;

grant insert on public.video_briefings to anon;
grant select, delete on public.video_briefings to authenticated;

create policy "video_briefings_insert_anon"
on public.video_briefings
for insert
to anon
with check (true);

create policy "video_briefings_select_authenticated"
on public.video_briefings
for select
to authenticated
using (true);

create policy "video_briefings_delete_authenticated"
on public.video_briefings
for delete
to authenticated
using (true);
