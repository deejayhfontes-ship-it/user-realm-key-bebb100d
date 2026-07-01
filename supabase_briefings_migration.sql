-- Para garantir que os dados antigos não se misturem e que a nova estrutura seja usada
-- Rode os comandos abaixo no SQL Editor do seu projeto Supabase

-- 1. Habilita a extensão
create extension if not exists pgcrypto;

-- 2. Cria a nova tabela de briefings (se ela já existir com a estrutura antiga, 
--    talvez seja necessário dropar a antiga ou alterá-la. Aqui garantimos a estrutura)
create table if not exists public.briefings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  nome text not null,
  cidade text,
  cargo text,
  respostas jsonb not null
);

-- 3. Habilita a RLS
alter table public.briefings enable row level security;

-- 4. Remove políticas antigas (se houver)
drop policy if exists "briefings_insert_anon" on public.briefings;
drop policy if exists "briefings_select_authenticated" on public.briefings;
drop policy if exists "briefings_delete_authenticated" on public.briefings;

-- 5. Revoga acessos padrão e ajusta permissões
revoke all on public.briefings from anon;
revoke all on public.briefings from authenticated;

grant insert on public.briefings to anon;
grant select, delete on public.briefings to authenticated;

-- 6. Recria as políticas rigorosas
create policy "briefings_insert_anon"
on public.briefings
for insert
to anon
with check (true);

create policy "briefings_select_authenticated"
on public.briefings
for select
to authenticated
using (true);

create policy "briefings_delete_authenticated"
on public.briefings
for delete
to authenticated
using (true);
