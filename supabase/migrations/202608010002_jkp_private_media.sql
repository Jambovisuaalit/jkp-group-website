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

-- Supabase Storage käyttää storage.objects-taulussa RLS:ää oletuksena.
-- JKP ei luo selaimelle suoria Storage-policyja; kaikki mediaoperaatiot
-- kulkevat palvelinpuolen service role -asiakkaan ja /api/media-välityksen kautta.

commit;
