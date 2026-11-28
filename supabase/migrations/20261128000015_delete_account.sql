-- Konto löschen (Apple + DSGVO): eigene Fotos, eigene Spots ohne fremde Fotos, Profil, Freunde, Nachrichten, Merkliste.
-- Spots mit Fotos anderer bleiben anonym (created_by = null). Nur für das eigene Konto (auth.uid()).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'nicht angemeldet' using errcode = '42501'; end if;
  delete from public.spot_photos where uploaded_by = uid;
  delete from public.spots s where s.created_by = uid and not exists (select 1 from public.spot_photos p where p.spot_id = s.id);
  update public.spots set created_by = null where created_by = uid;
  delete from auth.users where id = uid; -- Profil, Merkliste, Likes, Listen, Freunde, Nachrichten gehen per Kaskade mit
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Eigenes Profilbild darf (wie schon eigene Spot-Fotos) aus dem eigenen Ordner gelöscht werden.
drop policy if exists "Eigene Avatare löschen" on storage.objects;
create policy "Eigene Avatare löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
