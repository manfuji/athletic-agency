create table if not exists public.competition_import_jobs (
  competition_id uuid primary key references public.competitions (id) on delete cascade,
  status text not null default 'pending',
  progress int not null default 0,
  message text,
  error_file_path text,
  updated_at timestamptz not null default now()
);

alter table public.competition_import_jobs enable row level security;

create policy "authenticated_read_competition_import_jobs"
  on public.competition_import_jobs for select to authenticated using (true);
