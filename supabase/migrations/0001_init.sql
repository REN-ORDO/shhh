-- Amigo Secreto Virtual — esquema inicial
-- Correr este archivo en el SQL editor de tu proyecto Supabase (o vía `supabase db push`).

create extension if not exists "pgcrypto";

-- =========================
-- events
-- =========================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_name text not null,
  admin_email text not null,
  admin_token uuid not null unique default gen_random_uuid(),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_events_admin_token on public.events (admin_token);

-- =========================
-- participants
-- =========================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  email text not null,
  access_token uuid not null unique default gen_random_uuid(),
  joined_at timestamptz not null default now(),
  last_accessed_at timestamptz
);

create index if not exists idx_participants_event_id on public.participants (event_id);
create index if not exists idx_participants_access_token on public.participants (access_token);

-- =========================
-- assignments (resultado del sorteo)
-- =========================
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  giver_id uuid not null references public.participants (id) on delete cascade,
  receiver_id uuid not null references public.participants (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, giver_id),
  unique (event_id, receiver_id)
);

create index if not exists idx_assignments_event_id on public.assignments (event_id);

-- =========================
-- exclusions (opcional, antes del sorteo)
-- =========================
create table if not exists public.exclusions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  excluded_participant_id uuid not null references public.participants (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, participant_id, excluded_participant_id)
);

create index if not exists idx_exclusions_event_id on public.exclusions (event_id);

-- =========================
-- clues (pistas) — JAMÁS agregar columna de remitente acá
-- =========================
create table if not exists public.clues (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  receiver_id uuid not null references public.participants (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_clues_event_id on public.clues (event_id);
create index if not exists idx_clues_receiver_id on public.clues (receiver_id);

-- =========================
-- RLS: habilitado en todas las tablas, deny-all por defecto.
-- El acceso real de la app pasa por Server Actions con la service role key,
-- que bypassa RLS. Estas policies son defensa en profundidad para el caso
-- de que alguna clave anon/authenticated se use directamente.
-- =========================
alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.assignments enable row level security;
alter table public.exclusions enable row level security;
alter table public.clues enable row level security;

-- No se crean policies para anon/authenticated: sin policies, RLS deniega
-- todo acceso a esos roles. service_role bypassa RLS automáticamente.
