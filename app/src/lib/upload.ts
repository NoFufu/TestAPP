import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { Cat } from '../data/spots';
import { photoUrl, supabase } from './supabase';

/** Verkleinert ein Foto (lange Seite max. `max` px) und speichert es als JPEG. Gibt die neue Datei-URI zurück. */
export async function prepareImage(uri: string, max = 1350): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri, { maxWidth: max, maxHeight: max });
  const img = await ctx.renderAsync();
  const res = await img.saveAsync({ compress: 0.82, format: SaveFormat.JPEG });
  return res.uri;
}

/** Lädt eine lokale Datei in den Supabase-Speicher und gibt die öffentliche URL zurück. */
export async function uploadFile(bucket: 'avatars' | 'spot-photos', path: string, uri: string): Promise<string> {
  const body = await (await fetch(uri)).arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return bucket === 'spot-photos' ? photoUrl(path) : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Instagram-Beitrag oder -Reel, z. B. https://www.instagram.com/p/ABC123/ */
export const INSTAGRAM_RE = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?/;
export function cleanInstagramUrl(raw: string): string | null {
  const m = raw.trim().match(INSTAGRAM_RE);
  return m ? m[0].replace(/\/?$/, '/') : null;
}

/** Liest GPS aus den Foto-Metadaten (iOS legt sie unter {GPS} ab, Android direkt). */
export function gpsFromExif(exif: Record<string, unknown> | null | undefined): { lat: number; lon: number } | null {
  if (!exif) return null;
  const g = (exif['{GPS}'] as Record<string, unknown> | undefined) ?? exif;
  const lat = Number(g.GPSLatitude ?? g.Latitude);
  const lon = Number(g.GPSLongitude ?? g.Longitude);
  if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)) return null;
  const latRef = String(g.GPSLatitudeRef ?? 'N');
  const lonRef = String(g.GPSLongitudeRef ?? 'E');
  return { lat: latRef === 'S' ? -Math.abs(lat) : Math.abs(lat), lon: lonRef === 'W' ? -Math.abs(lon) : Math.abs(lon) };
}

export type NewSpot = {
  name: string;
  description: string;
  cats: Cat[];
  lat: number;
  lon: number;
  emptyUri: string;
  personUri?: string | null;
  instagramUrl?: string | null;
};

/** Legt einen Spot mit Fotos an. Meldet Fortschritt über `step`. Gibt die neue Spot-ID zurück. */
export async function createSpot(uid: string, s: NewSpot, step: (i: number) => void): Promise<number> {
  step(0);
  const empty = await prepareImage(s.emptyUri);
  const person = s.personUri ? await prepareImage(s.personUri) : null;

  step(1);
  const stamp = Date.now();
  const emptyPath = `${uid}/${stamp}-spot.jpg`;
  await uploadFile('spot-photos', emptyPath, empty);
  const personPath = person ? `${uid}/${stamp}-person.jpg` : null;
  if (person && personPath) await uploadFile('spot-photos', personPath, person);

  step(2);
  const { data, error } = await supabase
    .from('spots')
    .insert({
      name: s.name.trim(),
      description: s.description.trim(),
      categories: s.cats,
      location: `SRID=4326;POINT(${s.lon} ${s.lat})`,
      area: '',
      created_by: uid,
    })
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('Spot nicht gespeichert');

  const rows = [
    { spot_id: data.id, storage_path: emptyPath, kind: 'spot', uploaded_by: uid, instagram_url: null as string | null },
    ...(personPath ? [{ spot_id: data.id, storage_path: personPath, kind: 'outfit', uploaded_by: uid, instagram_url: null }] : []),
    ...(s.instagramUrl ? [{ spot_id: data.id, storage_path: null, kind: 'outfit', uploaded_by: uid, instagram_url: s.instagramUrl }] : []),
  ];
  const { error: e2 } = await supabase.from('spot_photos').insert(rows);
  if (e2) throw e2;
  step(3);
  return data.id as number;
}
