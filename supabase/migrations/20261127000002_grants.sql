-- Rechte für die API-Rollen. RLS-Regeln aus 0001 entscheiden, welche Zeilen sichtbar sind.
grant usage on schema public to anon, authenticated;
grant select on public.spots, public.spot_photos, public.profiles to anon, authenticated;
grant insert on public.spots, public.spot_photos, public.reports to authenticated;
grant update on public.profiles to authenticated;
grant select, insert, delete on public.saves, public.likes to authenticated;
grant select on public.credit_events to authenticated;
grant execute on function public.spots_nearby(double precision, double precision, double precision, text[]) to anon, authenticated;
