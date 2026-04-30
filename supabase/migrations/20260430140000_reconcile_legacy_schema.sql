-- Reconcile legacy schema (from db.sql) with the Admin-BFF expectations.
-- This migration is intentionally additive + backfill-only (no destructive drops),
-- so it can be safely applied to an existing Supabase project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.aa_slugify(input text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(lower(btrim(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'),
    ''
  )
$$;

-- ---------------------------------------------------------------------------
-- Teams (legacy has: season_id, short_code, logo_url, created_at)
-- Code expects: slug, logo, category_id, cover_photo, description, is_deleted, updated_at
-- ---------------------------------------------------------------------------
alter table if exists public.teams
  add column if not exists slug text,
  add column if not exists category_id uuid,
  add column if not exists description text,
  add column if not exists cover_photo text,
  add column if not exists logo text,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Keep updated_at sane for existing rows
update public.teams
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

-- Backfill logo from legacy logo_url when present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'teams'
      and column_name = 'logo_url'
  ) then
    update public.teams
    set logo = coalesce(logo, nullif(logo_url, ''))
    where logo is null or btrim(coalesce(logo, '')) = '';
  end if;
end $$;

-- Backfill slug from name (best-effort; keep unique by suffixing when needed)
update public.teams
set slug = coalesce(slug, public.aa_slugify(name))
where slug is null or btrim(slug) = '';

-- Make slugs unique (id suffix on collisions)
with d as (
  select id, slug,
         row_number() over (partition by slug order by created_at nulls last, id) as rn
  from public.teams
  where slug is not null and btrim(slug) <> ''
)
update public.teams t
set slug = t.slug || '-' || left(t.id::text, 8)
from d
where t.id = d.id and d.rn > 1;

create unique index if not exists teams_slug_key on public.teams (slug);

-- Add FK if categories table exists (it does in repo migrations and db.sql)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='categories') then
    begin
      alter table public.teams
        add constraint teams_category_id_fkey
        foreign key (category_id) references public.categories(id)
        on delete set null;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Competitions (legacy has no slug / ticket_url in db.sql)
-- Client code reads competitions by slug.
-- ---------------------------------------------------------------------------
alter table if exists public.competitions
  add column if not exists slug text,
  add column if not exists ticket_url text;

update public.competitions
set slug = coalesce(slug, public.aa_slugify(title))
where slug is null or btrim(slug) = '';

with d as (
  select id, slug,
         row_number() over (partition by slug order by start_date nulls last, id) as rn
  from public.competitions
  where slug is not null and btrim(slug) <> ''
)
update public.competitions c
set slug = c.slug || '-' || left(c.id::text, 8)
from d
where c.id = d.id and d.rn > 1;

create unique index if not exists competitions_slug_key on public.competitions (slug);

-- ---------------------------------------------------------------------------
-- Competition types (repo migration already adds slug/description/updated_at).
-- Ensure slug populated for any preexisting rows.
-- ---------------------------------------------------------------------------
alter table if exists public.competition_types
  add column if not exists description text not null default '',
  add column if not exists slug text,
  add column if not exists updated_at timestamptz not null default now();

update public.competition_types
set slug = coalesce(slug, public.aa_slugify(name))
where slug is null or btrim(slug) = '';

with d as (
  select id, slug,
         row_number() over (partition by slug order by created_at nulls last, id) as rn
  from public.competition_types
  where slug is not null and btrim(slug) <> ''
)
update public.competition_types ct
set slug = ct.slug || '-' || left(ct.id::text, 8)
from d
where ct.id = d.id and d.rn > 1;

create unique index if not exists competition_types_slug_key on public.competition_types (slug);

-- ---------------------------------------------------------------------------
-- Players/Bio data bridge (DB-only part; UI wiring is handled in code changes)
-- ---------------------------------------------------------------------------
create table if not exists public.player_legacy_map (
  player_id uuid not null references public.players(id) on delete cascade,
  bio_data_id uuid not null references public.bio_data(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (player_id, bio_data_id)
);

create unique index if not exists player_legacy_map_bio_data_id_key
  on public.player_legacy_map (bio_data_id);

create unique index if not exists player_legacy_map_player_id_key
  on public.player_legacy_map (player_id);

create or replace view public.v_players_hybrid as
  select
    p.id as player_id,
    m.bio_data_id,
    p.team_id,
    p.name,
    p.profile_picture,
    p.position,
    p.nationality,
    p.dob,
    p.weight,
    p.height,
    p.preferred_foot,
    p.previous_experience,
    p.reason_for_joining,
    p.sections,
    p.created_at,
    p.updated_at,
    (case when m.bio_data_id is null then 'players' else 'hybrid' end) as source
  from public.players p
  left join public.player_legacy_map m on m.player_id = p.id;

-- Ensure RLS/privileges are evaluated as the querying user (not the view owner).
alter view public.v_players_hybrid
  set (security_invoker = true);

