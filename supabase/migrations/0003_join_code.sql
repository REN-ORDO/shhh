-- Agrega un código corto de evento como alternativa al link de invitación.
-- Nullable porque los eventos creados antes de esta migración no tienen código.
alter table events
  add column if not exists join_code text unique;
