-- Tabla de pacientes para el sistema WOLFF Medicina del Deporte.
-- Ejecutá este script en el SQL Editor de tu proyecto de Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  nombre text not null,
  dni text not null,
  edad integer,
  fecha_nacimiento date,
  archived boolean not null default false,
  personal jsonb not null,
  activity jsonb not null,
  medical jsonb not null,
  habits jsonb not null
);

-- Índices para ordenar por hora de envío y filtrar archivados rápido.
create index if not exists patients_submitted_at_idx on public.patients (submitted_at desc);
create index if not exists patients_archived_idx on public.patients (archived);

-- Habilitamos RLS. El acceso se hace exclusivamente desde el servidor con la
-- service role key (que omite RLS), por lo que NO definimos políticas públicas:
-- ningún cliente anónimo puede leer ni escribir directamente.
alter table public.patients enable row level security;
