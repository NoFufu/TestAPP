-- Etappe F, Teil 1: Melden von Spots und Fotos, automatisch ausblenden ab 3 Meldungen, GPS-Abstand beim Foto.

alter table public.reports alter column photo_id drop not null;
alter table public.reports add column if not exists spot_id bigint references public.spots on delete cascade;
alter table public.reports add column if not exists note text check (note is null or char_length(note) <= 300);
alter table public.reports drop constraint if exists reports_one_target;
alter table public.reports add constraint reports_one_target check (num_nonnulls(photo_id, spot_id) = 1);
alter table public.reports drop constraint if exists reports_reason_check;
alter table public.reports add constraint reports_reason_check
  check (reason in ('falscher_ort', 'unangemessen', 'person', 'spam', 'sonstiges'));

-- Ein Nutzer meldet dasselbe nur einmal (sonst könnte einer allein ausblenden).
create unique index if not exists reports_once_spot on public.reports (reporter_id, spot_id) where spot_id is not null;
create unique index if not exists reports_once_photo on public.reports (reporter_id, photo_id) where photo_id is not null;

-- Ab 3 verschiedenen offenen Meldungen wird der Inhalt ausgeblendet (status pending), bis jemand prüft.
create or replace function public.reports_autohide()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.spot_id is not null then
    select count(distinct reporter_id) into n from public.reports where spot_id = new.spot_id and status = 'open';
    if n >= 3 then update public.spots set status = 'pending' where id = new.spot_id and status = 'live'; end if;
  else
    select count(distinct reporter_id) into n from public.reports where photo_id = new.photo_id and status = 'open';
    if n >= 3 then update public.spot_photos set status = 'pending' where id = new.photo_id and status = 'live'; end if;
  end if;
  return null;
end $$;
revoke execute on function public.reports_autohide() from public, anon, authenticated;
drop trigger if exists reports_autohide on public.reports;
create trigger reports_autohide after insert on public.reports for each row execute function public.reports_autohide();

-- GPS-Abstand Foto ↔ Spot in Metern (vom Handy berechnet, nur ein Hinweis für die Prüfung).
alter table public.spot_photos add column if not exists gps_distance_m integer;
