-- Amigo Secreto Virtual — autenticación del organizador
-- Correr este archivo en el SQL editor de tu proyecto Supabase después de 0001_init.sql.

-- =========================
-- events.owner_id
-- =========================
-- Nullable para no romper eventos creados antes de esta migración (sin dueño).
alter table public.events
  add column if not exists owner_id uuid references auth.users (id) on delete cascade;

create index if not exists idx_events_owner_id on public.events (owner_id);

-- =========================
-- RLS: permitir que un usuario autenticado vea sus propios eventos.
-- Esto es defensa en profundidad: el acceso real de escritura sigue pasando
-- por las Server Actions con la service role key. Esta policy solo habilita
-- lectura del lado del cliente (con sesión) para el dashboard `/admin`.
-- =========================
drop policy if exists "owners can select their own events" on public.events;
create policy "owners can select their own events"
  on public.events
  for select
  to authenticated
  using (owner_id = auth.uid());
