begin;

alter table public.jkp_admin_users
  alter column display_name set default 'JKP Hallinnan pääkäyttäjä';

commit;
