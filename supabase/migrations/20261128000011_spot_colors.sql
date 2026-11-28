-- Etappe G, Teil 2: Hauptfarben je Spot (bis zu 2) für den Farbfilter.
alter table public.spots add column if not exists colors text[] not null default '{}';
alter table public.spots drop constraint if exists spots_colors_check;
alter table public.spots add constraint spots_colors_check check (cardinality(colors) <= 3 and colors <@ array['rot','orange','gelb','gruen','blau','lila','pink','braun','beige','schwarz','weiss','grau']);

-- spots_nearby liefert jetzt auch die Farben.
drop function if exists public.spots_nearby(double precision, double precision, double precision, text[]);
create function public.spots_nearby(
  lat double precision, lon double precision,
  radius_m double precision default 15000,
  cats text[] default null
) returns table (
  id bigint, name text, description text, area text, categories text[],
  lat double precision, lon double precision, likes_count integer,
  dist_m double precision, cover_path text, person_path text, instagram_url text,
  creator text, creator_avatar text, colors text[], created_at timestamptz
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
         pr.username, pr.avatar_url, s.colors, s.created_at
  from public.spots s
  left join public.profiles pr on pr.id = s.created_by
  where s.status = 'live'
    and st_dwithin(s.location, st_makepoint(lon, lat)::geography, radius_m)
    and (cats is null or s.categories && cats)
  order by dist_m;
$$;
grant execute on function public.spots_nearby(double precision, double precision, double precision, text[]) to anon, authenticated;

-- Farben der mitgelieferten Bilder (offline aus den Bildern berechnet).
update public.spots set colors = array['braun'] where id = 1;
update public.spots set colors = array['gelb','grau'] where id = 2;
update public.spots set colors = array['grau'] where id = 3;
update public.spots set colors = array['grau'] where id = 4;
update public.spots set colors = array['orange','braun'] where id = 5;
update public.spots set colors = array['grau'] where id = 6;
update public.spots set colors = array['grau'] where id = 7;
update public.spots set colors = array['gruen','gelb'] where id = 8;
update public.spots set colors = array['pink','rot'] where id = 9;
update public.spots set colors = array['grau'] where id = 10;
update public.spots set colors = array['blau','pink'] where id = 11;
update public.spots set colors = array['orange','gelb'] where id = 12;
update public.spots set colors = array['braun'] where id = 13;
update public.spots set colors = array['grau'] where id = 14;
update public.spots set colors = array['gruen','grau'] where id = 15;
update public.spots set colors = array['grau'] where id = 16;
update public.spots set colors = array['orange'] where id = 17;
update public.spots set colors = array['gelb'] where id = 18;
update public.spots set colors = array['rot','blau'] where id = 19;
update public.spots set colors = array['orange','braun'] where id = 20;
update public.spots set colors = array['grau'] where id = 21;
update public.spots set colors = array['gelb','grau'] where id = 22;
update public.spots set colors = array['braun'] where id = 23;
update public.spots set colors = array['gelb','grau'] where id = 24;
update public.spots set colors = array['grau'] where id = 25;
update public.spots set colors = array['orange','braun'] where id = 26;
update public.spots set colors = array['orange','gelb'] where id = 27;
update public.spots set colors = array['orange','gruen'] where id = 28;
update public.spots set colors = array['rot','grau'] where id = 29;
update public.spots set colors = array['orange','rot'] where id = 30;
update public.spots set colors = array['grau'] where id = 9001;
update public.spots set colors = array['braun'] where id = 9006;
update public.spots set colors = array['grau'] where id = 9007;
update public.spots set colors = array['orange','blau'] where id = 9008;
update public.spots set colors = array['grau'] where id = 9009;
update public.spots set colors = array['orange','braun'] where id = 9010;
update public.spots set colors = array['blau'] where id = 9011;
update public.spots set colors = array['orange','rot'] where id = 9012;
update public.spots set colors = array['gelb'] where id = 9013;
update public.spots set colors = array['orange','braun'] where id = 9014;
update public.spots set colors = array['orange','gelb'] where id = 9015;
update public.spots set colors = array['blau','braun'] where id = 9016;
update public.spots set colors = array['braun'] where id = 9017;
update public.spots set colors = array['orange','braun'] where id = 9018;
update public.spots set colors = array['grau'] where id = 9019;
update public.spots set colors = array['blau'] where id = 9020;
