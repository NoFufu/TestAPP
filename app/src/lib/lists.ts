import * as Linking from 'expo-linking';
import { distanceKm, type Spot } from '../data/spots';
import { supabase } from './supabase';

export type ShootList = { id: number; name: string; share_token: string; spotIds: number[] };

export async function loadLists(): Promise<ShootList[]> {
  const { data, error } = await supabase.from('shoot_lists')
    .select('id, name, share_token, shoot_list_spots (spot_id, added_at)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((l) => ({
    id: l.id, name: l.name, share_token: l.share_token,
    spotIds: ((l.shoot_list_spots ?? []) as { spot_id: number; added_at: string }[])
      .sort((a, b) => a.added_at.localeCompare(b.added_at)).map((x) => x.spot_id),
  }));
}

export async function createList(uid: string, name: string, firstSpot?: number): Promise<number> {
  const { data, error } = await supabase.from('shoot_lists').insert({ owner_id: uid, name: name.trim() }).select('id').single();
  if (error || !data) throw error ?? new Error('Liste nicht angelegt');
  if (firstSpot != null) await addToList(data.id, firstSpot);
  return data.id;
}

export async function renameList(id: number, name: string) {
  const { error } = await supabase.from('shoot_lists').update({ name: name.trim() }).eq('id', id);
  if (error) throw error;
}

export async function deleteList(id: number) {
  const { error } = await supabase.from('shoot_lists').delete().eq('id', id);
  if (error) throw error;
}

export async function addToList(listId: number, spotId: number) {
  const { error } = await supabase.from('shoot_list_spots').insert({ list_id: listId, spot_id: spotId });
  if (error && error.code !== '23505') throw error;
}

export async function removeFromList(listId: number, spotId: number) {
  const { error } = await supabase.from('shoot_list_spots').delete().eq('list_id', listId).eq('spot_id', spotId);
  if (error) throw error;
}

export async function loadShared(token: string): Promise<{ name: string; owner: string | null; spotIds: number[] } | null> {
  const { data, error } = await supabase.rpc('shared_list', { token });
  if (error || !data?.length) return null;
  const rows = data as { list_name: string; owner_name: string | null; spot_id: number | null }[];
  return { name: rows[0].list_name, owner: rows[0].owner_name, spotIds: rows.map((r) => r.spot_id).filter((x): x is number => x != null) };
}

/** App-Link zur geteilten Liste (in der Testphase nur mit Expo Go). */
export const shareUrl = (token: string) => Linking.createURL(`shared/${token}`);

/** Google Maps erlaubt nur wenige Zwischenstopps in einem Link. */
export const MAX_ROUTE_STOPS = 10;

/** Reihenfolge: immer zum nächstgelegenen Spot (Start = erster Spot). */
export function orderRoute<T extends Pick<Spot, 'lat' | 'lon'>>(spots: T[]): T[] {
  if (spots.length < 3) return spots;
  const rest = [...spots];
  const out = [rest.shift()!];
  while (rest.length) {
    const last = out[out.length - 1];
    let bi = 0;
    rest.forEach((s, i) => { if (distanceKm(last, s) < distanceKm(last, rest[bi])) bi = i; });
    out.push(rest.splice(bi, 1)[0]);
  }
  return out;
}

/** Google-Maps-Route zu Fuß durch die Spots (höchstens MAX_ROUTE_STOPS). */
export function routeUrl(spots: Pick<Spot, 'lat' | 'lon'>[]): string | null {
  const s = orderRoute(spots).slice(0, MAX_ROUTE_STOPS);
  if (!s.length) return null;
  const p = (x: Pick<Spot, 'lat' | 'lon'>) => `${x.lat},${x.lon}`;
  const dest = s[s.length - 1];
  const mid = s.slice(0, -1);
  return `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${p(dest)}`
    + (mid.length ? `&waypoints=${mid.map(p).join('%7C')}` : '');
}
