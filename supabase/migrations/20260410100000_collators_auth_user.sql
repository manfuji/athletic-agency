-- Link collators to Supabase Auth users; prevent duplicate emails; helper for invite fallback.

alter table public.collators
  add column if not exists user_id uuid unique references auth.users (id) on delete set null;

create unique index if not exists collators_lower_email_uidx
  on public.collators (lower(btrim(email)));

-- Server-only: lookup auth user by email when inviteUserByEmail fails (e.g. user already exists).
create or replace function public.find_auth_user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = auth
as $$
  select id
  from auth.users
  where lower(btrim(email)) = lower(btrim(p_email))
  limit 1;
$$;

revoke all on function public.find_auth_user_id_by_email(text) from public;
grant execute on function public.find_auth_user_id_by_email(text) to service_role;
