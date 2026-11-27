-- Eigene Inhalte verwalten: eigene Spots ändern/löschen, eigene Fotos löschen.

-- Hat der Spot Fotos von anderen (auch noch nicht freigegebene)? Läuft ohne RLS.
create or replace function public.spot_has_foreign_photos(sid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.spot_photos p
                 where p.spot_id = sid and p.uploaded_by is distinct from auth.uid());
$$;
revoke execute on function public.spot_has_foreign_photos(bigint) from public, anon;
grant execute on function public.spot_has_foreign_photos(bigint) to authenticated;

drop policy if exists "Eigene Spots ändern" on public.spots;
create policy "Eigene Spots ändern" on public.spots for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "Eigene Spots löschen" on public.spots;
create policy "Eigene Spots löschen" on public.spots for delete to authenticated
  using (created_by = auth.uid() and not public.spot_has_foreign_photos(id));

drop policy if exists "Eigene Fotos löschen" on public.spot_photos;
create policy "Eigene Fotos löschen" on public.spot_photos for delete to authenticated
  using (uploaded_by = auth.uid());

-- Nur diese Spalten sind änderbar (nicht Status, Ort, Likes).
grant update (name, description, categories) on public.spots to authenticated;
grant delete on public.spots, public.spot_photos to authenticated;

drop policy if exists "Eigene Dateien löschen" on storage.objects;
create policy "Eigene Dateien löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = auth.uid()::text);
