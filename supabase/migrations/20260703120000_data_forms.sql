-- Dynamic data collection forms (private admin-only or public with auth-required submission).

create table if not exists public.data_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  access_type text not null default 'private' check (access_type in ('private', 'public')),
  requires_auth boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.data_forms (id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'string' check (
    field_type in ('string', 'number', 'boolean', 'date', 'textarea', 'select')
  ),
  required boolean not null default false,
  options jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (form_id, field_key)
);

create index if not exists data_form_fields_form_id_idx on public.data_form_fields (form_id, sort_order);

create table if not exists public.data_form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.data_forms (id) on delete cascade,
  submitted_by uuid references auth.users (id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists data_form_submissions_form_id_idx
  on public.data_form_submissions (form_id, created_at desc);

alter table public.data_forms enable row level security;
alter table public.data_form_fields enable row level security;
alter table public.data_form_submissions enable row level security;

-- Public forms: readable when active and access_type = public.
create policy "public_read_active_forms"
  on public.data_forms for select
  using (access_type = 'public' and is_active = true);

create policy "public_read_fields_for_public_forms"
  on public.data_form_fields for select
  using (
    exists (
      select 1
      from public.data_forms f
      where f.id = form_id
        and f.access_type = 'public'
        and f.is_active = true
    )
  );

-- Authenticated users may insert submissions for public auth-required forms.
create policy "authenticated_insert_public_form_submissions"
  on public.data_form_submissions for insert
  to authenticated
  with check (
    auth.uid() is not null
    and exists (
      select 1
      from public.data_forms f
      where f.id = form_id
        and f.access_type = 'public'
        and f.is_active = true
        and f.requires_auth = true
    )
  );

create policy "users_read_own_submissions"
  on public.data_form_submissions for select
  to authenticated
  using (submitted_by = auth.uid());
