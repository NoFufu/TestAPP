-- fitspot · Etappe A1/A2 · Login, Uploads, Instagram-Links, Profilbilder

-- 1) TESTPHASE: neue Spots und Fotos sind sofort sichtbar (Entscheidung 27.11.2026).
--    Vor dem öffentlichen Test: in dieser Funktion 'live' durch 'pending' ersetzen (neue Migration).
create or replace function public.testphase_autolive() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.status := 'live';
  return new;
end $$;

drop trigger if exists spots_autolive on public.spots;
create trigger spots_autolive before insert on public.spots
  for each row execute function public.testphase_autolive();
drop trigger if exists spot_photos_autolive on public.spot_photos;
create trigger spot_photos_autolive before insert on public.spot_photos
  for each row execute function public.testphase_autolive();

-- Status setzt jetzt der Trigger, die Regel prüft nur noch, wem der Eintrag gehört.
drop policy if exists "Spots einreichen" on public.spots;
create policy "Spots einreichen" on public.spots for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists "Fotos einreichen" on public.spot_photos;
create policy "Fotos einreichen" on public.spot_photos for insert to authenticated
  with check (uploaded_by = auth.uid());

-- 2) Fotos: eigenes Bild ODER Instagram-Link
alter table public.spot_photos alter column storage_path drop not null;
alter table public.spot_photos add column if not exists instagram_url text
  check (instagram_url is null or instagram_url ~ '^https://(www\.)?instagram\.com/(p|reel)/[A-Za-z0-9_-]+/?');
alter table public.spot_photos drop constraint if exists photo_or_link;
alter table public.spot_photos add constraint photo_or_link
  check (storage_path is not null or instagram_url is not null);

-- 3) Benutzernamen: klein, 3–24 Zeichen, Buchstaben/Zahlen/Punkt/Unterstrich
alter table public.profiles drop constraint if exists username_format;
alter table public.profiles add constraint username_format
  check (username is null or username ~ '^[a-z0-9._]{3,24}$');

-- 4) Profilbilder
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "Avatar hochladen" on storage.objects;
create policy "Avatar hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Eigene Dateien sehen" on storage.objects;
create policy "Eigene Dateien sehen" on storage.objects for select to authenticated
  using (bucket_id in ('avatars', 'spot-photos') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Eigene Dateien ersetzen" on storage.objects;
create policy "Eigene Dateien ersetzen" on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'spot-photos') and (storage.foldername(name))[1] = auth.uid()::text);

-- 5) Umkreissuche v2: zusätzlich Foto mit Person, Instagram-Link, Entdecker
drop function if exists public.spots_nearby(double precision, double precision, double precision, text[]);
create function public.spots_nearby(
  lat double precision, lon double precision,
  radius_m double precision default 15000,
  cats text[] default null
) returns table (
  id bigint, name text, description text, area text, categories text[],
  lat double precision, lon double precision, likes_count integer,
  dist_m double precision, cover_path text, person_path text, instagram_url text,
  creator text, creator_avatar text, created_at timestamptz
)
language sql stable security invoker set search_path = public, extensions as $$
  select s.id, s.name, s.description, s.area, s.categories,
         st_y(s.location::geometry), st_x(s.location::geometry), s.likes_count,
         st_distance(s.location, st_makepoint(lon, lat)::geography) as dist_m,
         (select p.storage_path from public.spot_photos p
           where p.spot_id = s.id and p.status = 'live' and p.kind = 'spot' and p.storage_path is not null
           order by p.id limit 1),
         (select p.storage_path from public.spot_photos p
           where p.spot_id = s.id and p.status = 'live' and p.kind = 'outfit' and p.storage_path is not null
           order by p.id desc limit 1),
         (select p.instagram_url from public.spot_photos p
           where p.spot_id = s.id and p.status = 'live' and p.instagram_url is not null
           order by p.id desc limit 1),
         pr.username, pr.avatar_url, s.created_at
  from public.spots s
  left join public.profiles pr on pr.id = s.created_by
  where s.status = 'live'
    and st_dwithin(s.location, st_makepoint(lon, lat)::geography, radius_m)
    and (cats is null or s.categories && cats)
  order by dist_m;
$$;
grant execute on function public.spots_nearby(double precision, double precision, double precision, text[]) to anon, authenticated;
