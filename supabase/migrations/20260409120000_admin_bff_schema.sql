-- Admin BFF schema aligned with admin/src/server/repositories (Next.js API routes).
-- The BFF uses the Supabase service role and bypasses RLS; policies below are for
-- direct anon/authenticated Supabase clients (e.g. future realtime).

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (NextAuth / app role; id = auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Reference & taxonomy
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.structures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Teams & players
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id),
  name text not null,
  "shortCode" text,
  logo text,
  "coverPhoto" text,
  description text,
  slug text,
  "isDeleted" boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete set null,
  name text not null,
  profile_picture text,
  position text,
  nationality text,
  dob date,
  weight numeric,
  height numeric,
  bio text,
  preferred_foot text,
  previous_experience text,
  reason_for_joining text,
  sections jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------------
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories (id),
  competition_type_id uuid references public.competition_types (id),
  structure_id uuid references public.structures (id),
  start_date date not null,
  end_date date not null,
  location text not null,
  description text,
  banner text,
  status text not null default 'draft',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_teams (
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  primary key (competition_id, team_id)
);

create table if not exists public.competition_groups (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  stage_id uuid not null references public.stages (id),
  group_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_teams (
  group_id uuid not null references public.competition_groups (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  primary key (group_id, team_id)
);

-- ---------------------------------------------------------------------------
-- Fixtures & results
-- ---------------------------------------------------------------------------
create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  stage_id uuid references public.stages (id),
  match_date date not null,
  time text,
  location text,
  stream_url text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null unique references public.fixtures (id) on delete cascade,
  home_team_score int not null default 0,
  away_team_score int not null default 0,
  winner_team_id uuid references public.teams (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_goals (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures (id) on delete cascade,
  scorer_id uuid references public.players (id),
  assist_player_id uuid references public.players (id),
  goal_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.match_cards (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures (id) on delete cascade,
  player_id uuid references public.players (id),
  card_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.match_substitutions (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures (id) on delete cascade,
  player_out_id uuid references public.players (id),
  player_in_id uuid references public.players (id),
  team_id uuid references public.teams (id),
  created_at timestamptz not null default now()
);

create table if not exists public.match_logs (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures (id) on delete cascade,
  player_id uuid references public.players (id),
  type text not null,
  action text,
  details text,
  time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.player_statistics (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  competition_id uuid references public.competitions (id) on delete cascade,
  fixture_id uuid references public.fixtures (id) on delete cascade,
  total_shots int,
  shots_on_target int,
  shots_off_target int,
  dribbles_successful int,
  dribbles_attempted int,
  times_fouled int,
  dispossessed int,
  offsides int,
  tackles int,
  interceptions int,
  fouls_committed int,
  clearances int,
  dribbles_defended int,
  blocks int,
  own_goals int,
  minutes_played int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists player_statistics_player_fixture_key
  on public.player_statistics (player_id, fixture_id)
  where fixture_id is not null;

create unique index if not exists player_statistics_player_competition_key
  on public.player_statistics (player_id, competition_id)
  where fixture_id is null and competition_id is not null;

-- ---------------------------------------------------------------------------
-- Collators
-- ---------------------------------------------------------------------------
create table if not exists public.collators (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  contact text,
  status smallint not null default 1,
  email_verified_at timestamptz,
  role text default 'collator',
  deleted_at timestamptz,
  assigned_competitions_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_collators (
  competition_id uuid not null references public.competitions (id) on delete cascade,
  collator_id uuid not null references public.collators (id) on delete cascade,
  primary key (competition_id, collator_id)
);

-- ---------------------------------------------------------------------------
-- Storage bucket (public reads; tighten in dashboard if needed)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS (read-only-ish defaults for authenticated users; service role bypasses)
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.competition_types enable row level security;
alter table public.structures enable row level security;
alter table public.stages enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_teams enable row level security;
alter table public.competition_groups enable row level security;
alter table public.group_teams enable row level security;
alter table public.fixtures enable row level security;
alter table public.results enable row level security;
alter table public.match_goals enable row level security;
alter table public.match_cards enable row level security;
alter table public.match_substitutions enable row level security;
alter table public.match_logs enable row level security;
alter table public.player_statistics enable row level security;
alter table public.collators enable row level security;
alter table public.competition_collators enable row level security;

create policy "authenticated_read_categories"
  on public.categories for select to authenticated using (true);
create policy "authenticated_read_competition_types"
  on public.competition_types for select to authenticated using (true);
create policy "authenticated_read_structures"
  on public.structures for select to authenticated using (true);
create policy "authenticated_read_stages"
  on public.stages for select to authenticated using (true);
create policy "authenticated_read_teams"
  on public.teams for select to authenticated using (true);
create policy "authenticated_read_players"
  on public.players for select to authenticated using (true);
create policy "authenticated_read_competitions"
  on public.competitions for select to authenticated using (true);
create policy "authenticated_read_competition_teams"
  on public.competition_teams for select to authenticated using (true);
create policy "authenticated_read_competition_groups"
  on public.competition_groups for select to authenticated using (true);
create policy "authenticated_read_group_teams"
  on public.group_teams for select to authenticated using (true);
create policy "authenticated_read_fixtures"
  on public.fixtures for select to authenticated using (true);
create policy "authenticated_read_results"
  on public.results for select to authenticated using (true);
create policy "authenticated_read_match_goals"
  on public.match_goals for select to authenticated using (true);
create policy "authenticated_read_match_cards"
  on public.match_cards for select to authenticated using (true);
create policy "authenticated_read_match_subs"
  on public.match_substitutions for select to authenticated using (true);
create policy "authenticated_read_match_logs"
  on public.match_logs for select to authenticated using (true);
create policy "authenticated_read_player_statistics"
  on public.player_statistics for select to authenticated using (true);
create policy "authenticated_read_collators"
  on public.collators for select to authenticated using (true);
create policy "authenticated_read_competition_collators"
  on public.competition_collators for select to authenticated using (true);

-- Collators: restrict writes to admins (JWT custom claim `role` = admin) — optional;
-- Uncomment if you expose these tables to the browser with the user JWT.
-- create policy "admin_all_collators" on public.collators for all to authenticated
--   using ((auth.jwt() ->> 'role') = 'admin') with check ((auth.jwt() ->> 'role') = 'admin');
