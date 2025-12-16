-- SysGet - Gestão de Despesas Pessoais (MVP)
-- Execute este script no Supabase SQL Editor.

-- Responsáveis pela despesa
create table if not exists public.responsibles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Despesas
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  responsible_id uuid null references public.responsibles(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'open' check (status in ('open','paid')),
  spent_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_spent_at on public.expenses(spent_at desc);
create index if not exists idx_expenses_responsible_id on public.expenses(responsible_id);
create index if not exists idx_expenses_status on public.expenses(status);

-- Migração (se você já criou as tabelas com categoria):
-- alter table public.expenses drop column if exists category;
-- drop index if exists public.idx_expenses_category;

-- Migração (se você já criou as tabelas com email no responsável):
-- alter table public.responsibles drop column if exists email;

-- Migração (se você já criou as tabelas sem status):
-- alter table public.expenses add column if not exists status text not null default 'open' check (status in ('open','paid'));
-- update public.expenses set status = 'open' where status is null;
-- create index if not exists idx_expenses_status on public.expenses(status);

-- Opcional: habilite RLS se você for autenticar usuários e quiser políticas.
-- alter table public.responsibles enable row level security;
-- alter table public.expenses enable row level security;


