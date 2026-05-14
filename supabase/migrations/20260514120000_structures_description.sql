-- Optional description for competition structures (UI + create flow)
alter table public.structures
  add column if not exists description text not null default '';
