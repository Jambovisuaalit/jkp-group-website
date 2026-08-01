begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jkp-media',
  'jkp-media',
  false,
  6000000,
  array['image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Sovellus käyttää palvelinpuolen service role -asiakasta kuviin.
-- Selaimelle ei anneta suoria storage.objects-oikeuksia.
alter table storage.objects enable row level security;

drop policy if exists "jkp media public read" on storage.objects;
drop policy if exists "jkp media authenticated read" on storage.objects;
drop policy if exists "jkp media authenticated insert" on storage.objects;
drop policy if exists "jkp media authenticated update" on storage.objects;
drop policy if exists "jkp media authenticated delete" on storage.objects;

commit;
