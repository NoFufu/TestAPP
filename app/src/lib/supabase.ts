import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Öffentliche Werte (publishable key). Schutz der Daten übernehmen die Row-Level-Security-Regeln.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export const supabase = createClient(url, key, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

export type NearbyRow = {
  id: number;
  name: string;
  description: string;
  area: string;
  categories: string[];
  lat: number;
  lon: number;
  likes_count: number;
  dist_m: number;
  cover_path: string | null;
  person_path: string | null;
  instagram_url: string | null;
  creator: string | null;
  creator_avatar: string | null;
  created_at: string;
};

export const photoUrl = (path: string) =>
  supabase.storage.from('spot-photos').getPublicUrl(path).data.publicUrl;
