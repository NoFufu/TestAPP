-- Etappe F, Teil 2: Admin-Rolle, Prüf-Warteschlange, Freigeben/Ablehnen, Duplikat-Hash.
-- Keine neuen Tabellenrechte: alles läuft über security-definer-Funktionen mit is_admin()-Prüfung.

create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Duplikat-Check: SHA-256 der hochgeladenen Datei.
alter table public.spot_photos add column if not exists sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$');
create index if not exists spot_photos_sha256_idx on public.spot_photos (sha256) where sha256 is not null;

-- Warteschlange: neue/ausgeblendete Inhalte, Gemeldetes, GPS weit weg, doppelte Fotos.
create or replace function public.admin_queue()
returns table (kind text, id bigint, spot_id bigint, name text, status text, storage_path text,
               open_reports int, reasons text[], notes text[], gps_distance_m int, duplicate boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins' using errcode = '42501'; end if;
  return query
  select 'spot'::text, s.id, s.id, s.name, s.status::text,
         (select p.storage_path from public.spot_photos p where p.spot_id = s.id and p.storage_path is not null order by p.id limit 1),
         count(r.id)::int, coalesce(array_agg(distinct r.reason) filter (where r.id is not null), '{}'),
         coalesce(array_agg(r.note) filter (where r.note is not null), '{}'), null::int, false, s.created_at
    from public.spots s
    left join public.reports r on r.spot_id = s.id and r.status = 'open'
   group by s.id
  having s.status = 'pending' or count(r.id) > 0
  union all
  select 'photo'::text, p.id, p.spot_id, sp.name, p.status::text, p.storage_path,
         count(r.id)::int, coalesce(array_agg(distinct r.reason) filter (where r.id is not null), '{}'),
         coalesce(array_agg(r.note) filter (where r.note is not null), '{}'), p.gps_distance_m,
         (p.sha256 is not null and exists (select 1 from public.spot_photos d where d.sha256 = p.sha256 and d.id <> p.id)),
         p.created_at
    from public.spot_photos p
    join public.spots sp on sp.id = p.spot_id
    left join public.reports r on r.photo_id = p.id and r.status = 'open'
   group by p.id, sp.name
  having p.status = 'pending' or count(r.id) > 0 or coalesce(p.gps_distance_m, 0) > 300
      or (p.sha256 is not null and exists (select 1 from public.spot_photos d where d.sha256 = p.sha256 and d.id <> p.id))
   order by 12 desc;
end $$;

-- Freigeben (live, Meldungen erledigt) oder Ablehnen (rejected, Meldungen bestätigt).
create or replace function public.moderate(target_kind text, target_id bigint, action text)
returns void language plpgsql security definer set search_path = public as $$
declare new_status public.spot_status; rep_status text;
begin
  if not public.is_admin() then raise exception 'nur für Admins' using errcode = '42501'; end if;
  if action = 'approve' then new_status := 'live'; rep_status := 'dismissed';
  elsif action = 'reject' then new_status := 'rejected'; rep_status := 'accepted';
  else raise exception 'unbekannte Aktion'; end if;
  if target_kind = 'spot' then
    update public.spots set status = new_status where id = target_id;
    update public.reports set status = rep_status where spot_id = target_id and status = 'open';
  elsif target_kind = 'photo' then
    update public.spot_photos set status = new_status where id = target_id;
    update public.reports set status = rep_status where photo_id = target_id and status = 'open';
  else raise exception 'unbekannter Typ'; end if;
end $$;

revoke execute on function public.is_admin(), public.admin_queue(), public.moderate(text, bigint, text) from public, anon;
grant execute on function public.is_admin(), public.admin_queue(), public.moderate(text, bigint, text) to authenticated;
