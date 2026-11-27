import type { Cat } from '../data/spots';
import { photoUrl, supabase } from './supabase';

export type Status = 'pending' | 'live' | 'rejected';
export type MySpot = { id: number; name: string; description: string; cats: Cat[]; status: Status; cover: string | null; foreign: boolean };
export type MyPhoto = { id: number; spotId: number; spotName: string; url: string | null; instagram: string | null; status: Status; path: string | null };

/** Eigene Spots und Fotos, auch noch nicht freigegebene. */
export async function loadMine(uid: string): Promise<{ spots: MySpot[]; photos: MyPhoto[] }> {
  const [sp, ph] = await Promise.all([
    supabase.from('spots').select('id, name, description, categories, status, spot_photos (storage_path, uploaded_by)')
      .eq('created_by', uid).order('id', { ascending: false }),
    supabase.from('spot_photos').select('id, spot_id, storage_path, instagram_url, status, spots (name)')
      .eq('uploaded_by', uid).order('id', { ascending: false }),
  ]);
  const spots: MySpot[] = (sp.data ?? []).map((r) => {
    const photos = (r.spot_photos ?? []) as { storage_path: string | null; uploaded_by: string | null }[];
    const cover = photos.find((p) => p.storage_path)?.storage_path;
    return {
      id: r.id, name: r.name, description: r.description, cats: r.categories as Cat[], status: r.status as Status,
      cover: cover ? photoUrl(cover) : null,
      foreign: photos.some((p) => p.uploaded_by !== uid), // nur sichtbare; die Datenbank prüft zusätzlich
    };
  });
  const photos: MyPhoto[] = (ph.data ?? []).map((r) => ({
    id: r.id, spotId: r.spot_id, spotName: (r.spots as unknown as { name: string } | null)?.name ?? 'Spot',
    url: r.storage_path ? photoUrl(r.storage_path) : null, instagram: r.instagram_url, status: r.status as Status, path: r.storage_path,
  }));
  return { spots, photos };
}

export async function updateSpot(id: number, v: { name: string; description: string; cats: Cat[] }) {
  const { data, error } = await supabase.from('spots')
    .update({ name: v.name.trim(), description: v.description.trim(), categories: v.cats }).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Nicht gespeichert.');
}

export async function deletePhoto(p: { id: number; path: string | null }) {
  const { data, error } = await supabase.from('spot_photos').delete().eq('id', p.id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Nicht gelöscht.');
  if (p.path) await supabase.storage.from('spot-photos').remove([p.path]);
}

export async function deleteSpot(id: number) {
  const { data: ph } = await supabase.from('spot_photos').select('storage_path').eq('spot_id', id);
  const paths = (ph ?? []).map((r) => r.storage_path).filter((x): x is string => !!x);
  const { data, error } = await supabase.from('spots').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('An diesem Spot hängen Fotos von anderen. Lösche nur deine eigenen Fotos.');
  if (paths.length) await supabase.storage.from('spot-photos').remove(paths);
}
