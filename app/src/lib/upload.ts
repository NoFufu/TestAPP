import * as Crypto from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { Cat } from '../data/spots';
import { photoColors } from './colors';
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

/** SHA-256 der Originaldatei (für den Duplikat-Check). Findet nur exakt gleiche Fotos. Fehler → null. */
export async function fileSha256(uri: string): Promise<string | null> {
  try {
    const buf = await (await fetch(uri)).arrayBuffer();
    const d = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(buf));
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
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
  const [emptyHash, personHash, colors] = await Promise.all([
    fileSha256(s.emptyUri), s.personUri ? fileSha256(s.personUri) : null, photoColors(s.emptyUri),
  ]);
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
      colors,
      created_by: uid,
    })
    .select('id')
    .single();
  if (error || !data) throw error ?? new Error('Spot nicht gespeichert');

  const rows = [
    { spot_id: data.id, storage_path: emptyPath, kind: 'spot', uploaded_by: uid, instagram_url: null as string | null, sha256: emptyHash },
    ...(personPath ? [{ spot_id: data.id, storage_path: personPath, kind: 'outfit', uploaded_by: uid, instagram_url: null, sha256: personHash }] : []),
    ...(s.instagramUrl ? [{ spot_id: data.id, storage_path: null, kind: 'outfit', uploaded_by: uid, instagram_url: s.instagramUrl, sha256: null }] : []),
  ];
  const { error: e2 } = await supabase.from('spot_photos').insert(rows);
  if (e2) throw e2;
  step(3);
  return data.id as number;
}

/** Fügt einem bestehenden Spot ein Foto (mit Person) und/oder einen Instagram-Link hinzu. */
export async function addPhotoToSpot(uid: string, spotId: number, uri: string | null, instagramUrl: string | null, step: (i: number) => void, gpsDistanceM: number | null = null) {
  step(0);
  const hash = uri ? await fileSha256(uri) : null;
  const small = uri ? await prepareImage(uri) : null;
  step(1);
  const path = small ? `${uid}/${Date.now()}-person.jpg` : null;
  if (small && path) await uploadFile('spot-photos', path, small);
  step(2);
  const { error } = await supabase.from('spot_photos').insert({
    spot_id: spotId, storage_path: path, kind: 'outfit', uploaded_by: uid, instagram_url: instagramUrl, gps_distance_m: gpsDistanceM, sha256: hash,
  });
  if (error) throw error;
  step(3);
}

export type QueueItem = {
  kind: 'spot' | 'photo'; id: number; spot_id: number; name: string; status: 'pending' | 'live' | 'rejected'; storage_path: string | null;
  open_reports: number; reasons: string[]; notes: string[]; gps_distance_m: number | null; duplicate: boolean; created_at: string;
};
export async function loadQueue(): Promise<QueueItem[]> {
  const { data, error } = await supabase.rpc('admin_queue');
  if (error) throw error;
  return (data ?? []) as QueueItem[];
}
export async function moderate(kind: 'spot' | 'photo', id: number, action: 'approve' | 'reject') {
  const { error } = await supabase.rpc('moderate', { target_kind: kind, target_id: id, action });
  if (error) throw error;
}
export async function isAdmin(): Promise<boolean> {
  const { data } = await supabase.rpc('is_admin');
  return data === true;
}

export type SpotPhoto = { id: number; url: string | null; kind: 'spot' | 'outfit'; instagram_url: string | null; by: string | null };

/** Alle freigegebenen Fotos eines Spots, neueste zuerst. */
export async function loadSpotPhotos(spotId: number): Promise<SpotPhoto[]> {
  const { data, error } = await supabase
    .from('spot_photos')
    .select('id, storage_path, kind, instagram_url, profiles:uploaded_by (username)')
    .eq('spot_id', spotId)
    .eq('status', 'live')
    .order('id', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as number,
    url: r.storage_path ? photoUrl(r.storage_path as string) : null,
    kind: r.kind as 'spot' | 'outfit',
    instagram_url: r.instagram_url as string | null,
    by: ((r.profiles as unknown as { username: string | null } | null)?.username) ?? null,
  }));
}

export type ReportReason = 'falscher_ort' | 'unangemessen' | 'person' | 'spam' | 'sonstiges';
export const REPORT_REASONS: { key: ReportReason; label: string }[] = [
  { key: 'falscher_ort', label: 'Falscher Ort' },
  { key: 'unangemessen', label: 'Unangemessen' },
  { key: 'person', label: 'Person ohne Zustimmung' },
  { key: 'spam', label: 'Spam oder Werbung' },
  { key: 'sonstiges', label: 'Sonstiges' },
];

/** Meldet einen Spot oder ein Foto. Doppelte Meldung zählt als erledigt. */
export async function sendReport(uid: string, target: { spotId?: number; photoId?: number }, reason: ReportReason, note: string) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: uid, spot_id: target.spotId ?? null, photo_id: target.photoId ?? null, reason, note: note.trim() || null,
  });
  if (error && error.code !== '23505') throw error;
}

/** Admin: echtes Start-Foto für einen Spot (ersetzt den Platzhalter, weil es als Spot-Foto gilt). */
export async function addStartPhoto(uid: string, spotId: number, uri: string, gpsDistanceM: number | null) {
  const hash = await fileSha256(uri);
  const small = await prepareImage(uri);
  const path = `${uid}/${Date.now()}-start-${spotId}.jpg`;
  await uploadFile('spot-photos', path, small);
  const { error } = await supabase.from('spot_photos').insert({
    spot_id: spotId, storage_path: path, kind: 'spot', uploaded_by: uid, gps_distance_m: gpsDistanceM, sha256: hash,
  });
  if (error) throw error;
}

/** Admin: Spot an die Foto-Position verschieben. */
export async function adminSetLocation(spotId: number, lat: number, lon: number) {
  const { error } = await supabase.rpc('admin_set_location', { target_id: spotId, lat, lon });
  if (error) throw error;
}
