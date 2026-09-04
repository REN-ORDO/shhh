-- Amigo Secreto Virtual — adjuntos de imagen de las pistas.
-- Las pistas siguen siendo anónimas: esta tabla nunca lleva columna de
-- remitente ni metadatos que permitan rastrear al emisor. La ruta de
-- storage tampoco: solo UUIDs de evento/pista/attachment.

-- =========================
-- clue_attachments
-- =========================
create table if not exists public.clue_attachments (
  id uuid primary key default gen_random_uuid(),
  clue_id uuid not null references public.clues (id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_clue_attachments_clue_id
  on public.clue_attachments (clue_id);

-- =========================
-- RLS: deny-all explícito.
-- El acceso real pasa por Server Actions con la service role key (que
-- bypassa RLS). No se crean policies para anon/authenticated: con esta
-- policy la tabla queda cerrada para cualquier rol no privilegiado.
-- =========================
alter table public.clue_attachments enable row level security;

drop policy if exists "deny_all" on public.clue_attachments;
create policy "deny_all"
  on public.clue_attachments
  for all
  using (false)
  with check (false);

-- =========================
-- Bucket privado clue-images
-- public=false: los objetos solo se sirven vía signed URLs generadas con
-- la service role key en el server. No se crean policies de storage para
-- anon/authenticated, así que el acceso directo queda denegado.
-- =========================
insert into storage.buckets (id, name, public)
values ('clue-images', 'clue-images', false)
on conflict (id) do nothing;
