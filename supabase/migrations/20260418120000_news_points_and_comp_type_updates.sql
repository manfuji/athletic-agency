-- Competition types: align with frontend contract
alter table if exists public.competition_types
  add column if not exists description text not null default '',
  add column if not exists slug text,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill slug for existing rows and keep unique constraint safe
update public.competition_types
set slug = coalesce(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null;

create unique index if not exists competition_types_slug_key on public.competition_types (slug);

-- News posts
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text not null,
  cover_image text,
  youtube_url text,
  is_featured boolean not null default false,
  competition_id uuid references public.competitions (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_news_posts_competition_id on public.news_posts (competition_id);
create index if not exists idx_news_posts_published_at on public.news_posts (published_at desc);

-- Competition points configuration
create table if not exists public.competition_points_config (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  win_points integer not null default 3,
  draw_points integer not null default 1,
  loss_points integer not null default 0,
  tie_break_order jsonb not null default '["points","goal_difference","goals_for"]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id)
);

-- RLS
alter table if exists public.news_posts enable row level security;
alter table if exists public.competition_points_config enable row level security;

drop policy if exists "authenticated_read_news_posts" on public.news_posts;
create policy "authenticated_read_news_posts"
  on public.news_posts for select to authenticated using (true);

drop policy if exists "authenticated_read_competition_points_config" on public.competition_points_config;
create policy "authenticated_read_competition_points_config"
  on public.competition_points_config for select to authenticated using (true);
