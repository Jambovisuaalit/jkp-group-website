create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create or replace function private.jkp_is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.jkp_admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

revoke all on function private.jkp_is_active_admin() from public;
revoke all on function private.jkp_is_active_admin() from anon;
grant execute on function private.jkp_is_active_admin() to authenticated;

drop policy if exists "admin_can_read_own_profile" on public.jkp_admin_users;
create policy "admin_can_read_own_profile"
on public.jkp_admin_users
for select
to authenticated
using (user_id = auth.uid() and active = true);

drop policy if exists "active_admin_manage_site_content" on public.jkp_site_content;
create policy "active_admin_manage_site_content"
on public.jkp_site_content
for all
to authenticated
using (private.jkp_is_active_admin())
with check (private.jkp_is_active_admin());

drop policy if exists "active_admin_manage_rentals" on public.jkp_rental_properties;
create policy "active_admin_manage_rentals"
on public.jkp_rental_properties
for all
to authenticated
using (private.jkp_is_active_admin())
with check (private.jkp_is_active_admin());

drop policy if exists "active_admin_manage_references" on public.jkp_references;
create policy "active_admin_manage_references"
on public.jkp_references
for all
to authenticated
using (private.jkp_is_active_admin())
with check (private.jkp_is_active_admin());

drop policy if exists "active_admin_manage_submissions" on public.jkp_form_submissions;
create policy "active_admin_manage_submissions"
on public.jkp_form_submissions
for all
to authenticated
using (private.jkp_is_active_admin())
with check (private.jkp_is_active_admin());

drop policy if exists "active_admin_read_media" on storage.objects;
create policy "active_admin_read_media"
on storage.objects
for select
to authenticated
using (bucket_id = 'jkp-media' and private.jkp_is_active_admin());

drop policy if exists "active_admin_insert_media" on storage.objects;
create policy "active_admin_insert_media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'jkp-media' and private.jkp_is_active_admin());

drop policy if exists "active_admin_update_media" on storage.objects;
create policy "active_admin_update_media"
on storage.objects
for update
to authenticated
using (bucket_id = 'jkp-media' and private.jkp_is_active_admin())
with check (bucket_id = 'jkp-media' and private.jkp_is_active_admin());

drop policy if exists "active_admin_delete_media" on storage.objects;
create policy "active_admin_delete_media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'jkp-media' and private.jkp_is_active_admin());

drop function if exists public.jkp_is_active_admin();
