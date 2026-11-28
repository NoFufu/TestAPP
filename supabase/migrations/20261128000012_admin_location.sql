-- Etappe E: Admin darf den Standort eines Spots korrigieren (z. B. aus dem GPS eines Start-Fotos).
create or replace function public.admin_set_location(target_id bigint, lat double precision, lon double precision)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins' using errcode = '42501'; end if;
  if lat not between -90 and 90 or lon not between -180 and 180 then raise exception 'ungültige Koordinaten'; end if;
  update public.spots set location = st_setsrid(st_makepoint(lon, lat), 4326)::geography where id = target_id;
end $$;
revoke execute on function public.admin_set_location(bigint, double precision, double precision) from public, anon;
grant execute on function public.admin_set_location(bigint, double precision, double precision) to authenticated;
