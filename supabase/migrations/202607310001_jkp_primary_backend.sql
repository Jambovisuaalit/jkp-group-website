begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.jkp_site_content (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.jkp_rental_properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null check (type in ('holiday', 'commercial', 'residential')),
  status text not null check (status in ('available', 'occupied', 'always_active')),
  city text not null default '',
  address text not null default '',
  summary text not null default '',
  description text not null default '',
  price text not null default '',
  area text not null default '',
  rooms text not null default '',
  "mainImage" text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  details jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  "contactName" text not null default 'JKP Group Oy',
  published boolean not null default false,
  "sortOrder" integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jkp_references (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default '',
  location text not null default '',
  summary text not null default '',
  description text not null default '',
  "imageUrl" text not null default '',
  published boolean not null default false,
  "sortOrder" integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jkp_form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('contact', 'commercial', 'residential')),
  status text not null default 'new' check (status in ('new', 'contacted', 'processed', 'archived', 'spam')),
  name text not null,
  email text not null,
  phone text not null default '',
  company text,
  business_id text,
  property text,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  consent boolean not null check (consent is true),
  source text not null default 'website'
);

insert into public.jkp_site_content (key, content)
values ('main', '{}'::jsonb)
on conflict (key) do nothing;

drop trigger if exists set_jkp_site_content_updated_at on public.jkp_site_content;
create trigger set_jkp_site_content_updated_at
before update on public.jkp_site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_jkp_rental_properties_updated_at on public.jkp_rental_properties;
create trigger set_jkp_rental_properties_updated_at
before update on public.jkp_rental_properties
for each row execute function public.set_updated_at();

drop trigger if exists set_jkp_references_updated_at on public.jkp_references;
create trigger set_jkp_references_updated_at
before update on public.jkp_references
for each row execute function public.set_updated_at();

alter table public.jkp_site_content enable row level security;
alter table public.jkp_rental_properties enable row level security;
alter table public.jkp_references enable row level security;
alter table public.jkp_form_submissions enable row level security;

drop policy if exists no_direct_client_access on public.jkp_site_content;
create policy no_direct_client_access on public.jkp_site_content
for all to anon, authenticated using (false) with check (false);

drop policy if exists no_direct_client_access on public.jkp_rental_properties;
create policy no_direct_client_access on public.jkp_rental_properties
for all to anon, authenticated using (false) with check (false);

drop policy if exists no_direct_client_access on public.jkp_references;
create policy no_direct_client_access on public.jkp_references
for all to anon, authenticated using (false) with check (false);

drop policy if exists no_direct_client_access on public.jkp_form_submissions;
create policy no_direct_client_access on public.jkp_form_submissions
for all to anon, authenticated using (false) with check (false);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jkp-media',
  'jkp-media',
  true,
  6000000,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
