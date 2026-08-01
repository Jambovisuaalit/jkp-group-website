begin;

alter table public.jkp_rental_properties
  add column if not exists hidden boolean not null default false;

alter table public.jkp_references
  add column if not exists hidden boolean not null default false,
  add column if not exists year text not null default '',
  add column if not exists role text not null default '',
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists permission_confirmed boolean not null default false;

create table if not exists public.jkp_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Jari Koskela',
  role text not null default 'owner' check (role in ('owner', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_jkp_admin_users_updated_at on public.jkp_admin_users;
create trigger set_jkp_admin_users_updated_at
before update on public.jkp_admin_users
for each row execute function public.set_updated_at();

alter table public.jkp_admin_users enable row level security;

drop policy if exists no_direct_client_access on public.jkp_admin_users;
create policy no_direct_client_access on public.jkp_admin_users
for all to anon, authenticated using (false) with check (false);

create index if not exists jkp_rentals_admin_state_idx
  on public.jkp_rental_properties (hidden, published, updated_at desc);
create index if not exists jkp_references_admin_state_idx
  on public.jkp_references (hidden, published, updated_at desc);
create index if not exists jkp_form_submissions_status_idx
  on public.jkp_form_submissions (status, created_at desc);

commit;
