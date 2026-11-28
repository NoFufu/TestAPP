import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SPOT_IMAGES } from './data/images';
import { COLORS, CATS, CITIES, CITY_NAMES, ME, SAMPLE_SPOTS, distanceKm, type Cat, type City, type Spot } from './data/spots';
import { useAuth } from './lib/auth';
import { MOODS, type MoodKey } from './data/moods';
import type { SpotColor } from './lib/colors';
import { track } from './lib/events';
import { photoUrl, supabase, type NearbyRow } from './lib/supabase';

type UserSpot = Omit<Spot, 'images'> & { uri: string };

type Store = {
  /** 'cloud' = aus Supabase geladen, 'local' = Beispieldaten in der App. */
  source: 'loading' | 'cloud' | 'local';
  reload: () => void;
  /** Dein Standort (echt, wenn erlaubt; sonst Jahnplatz). */
  me: { lat: number; lon: number };
  realLocation: boolean;
  /** Fragt nach Standort-Erlaubnis und aktualisiert `me`. Gibt den Standort zurück oder null. */
  locate: () => Promise<{ lat: number; lon: number } | null>;
  spots: (Spot & { dist: number })[];
  visible: (Spot & { dist: number })[];
  /** Stadt, die Karte und Feed gerade zeigen. */
  city: City;
  setCity: (c: City) => void;
  /** Mood-Filter (null = alle Moods). Farben filtert die Suche. */
  moodFilter: MoodKey | null;
  setMoodFilter: (m: MoodKey | null) => void;
  filters: Set<Cat>;
  toggleFilter: (c: Cat) => void;
  clearFilters: () => void;
  saved: Set<number>;
  toggleSave: (id: number) => void;
  addSpot: (s: UserSpot) => void;
  likedPosts: Set<string>;
  toggleLikePost: (id: string) => void;
  /** Mitte der Karte, dort landen neue Uploads (bis GPS aus dem Foto kommt). */
  mapCenter: { lat: number; lon: number };
  setMapCenter: (c: { lat: number; lon: number }) => void;
};

const Ctx = createContext<Store | null>(null);
const K_SAVED = 'fs_saved', K_USER = 'fs_user', K_LIKES = 'fs_likes';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Set<Cat>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [userSpots, setUserSpots] = useState<UserSpot[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 52.0215, lon: 8.531 });
  const [remote, setRemote] = useState<Spot[] | null>(null);
  const [city, setCity] = useState<City>('Bielefeld');
  const [moodFilter, setMoodFilter] = useState<MoodKey | null>(null);
  const [source, setSource] = useState<Store['source']>('loading');
  const [me, setMe] = useState(ME);
  const [realLocation, setRealLocation] = useState(false);

  const locate = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return null;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setMe(here);
      setRealLocation(true);
      return here;
    } catch {
      return null;
    }
  }, []);
  useEffect(() => { locate(); }, [locate]);

  const reload = useCallback(() => {
    Promise.all(CITY_NAMES.map((name) => supabase
      .rpc('spots_nearby', { lat: CITIES[name].lat, lon: CITIES[name].lon, radius_m: 20000 })
      .then(({ data, error }) => {
        if (error || !data) throw error ?? new Error('keine Daten');
        return (data as NearbyRow[]).map((r) => ({ r, city: name }));
      })))
      .then((lists) => {
        const valid = new Set(CATS.map((c) => c.key));
        const validColors = new Set(COLORS.map((c) => c.key));
        setRemote(lists.flat().map(({ r, city }) => ({
          id: r.id, name: r.name, desc: r.description, area: r.area, lat: r.lat, lon: r.lon, likes: r.likes_count, city,
          cats: r.categories.filter((c): c is Cat => valid.has(c as Cat)),
          // Titelbild aus dem Speicher; Start-Spots nutzen die mitgelieferten Bilder.
          images: [
            r.cover_path ? { uri: photoUrl(r.cover_path) } : SPOT_IMAGES[r.id]?.[0],
            r.person_path ? { uri: photoUrl(r.person_path) } : SPOT_IMAGES[r.id]?.[1],
            ...(SPOT_IMAGES[r.id]?.slice(2) ?? []),
          ].filter((x): x is NonNullable<typeof x> => x != null),
          creator: r.creator, creatorAvatar: r.creator_avatar, instagramUrl: r.instagram_url,
          colors: (r.colors ?? []).filter((x): x is SpotColor => validColors.has(x as SpotColor)),
        })).filter((s) => s.cats.length && s.images.length));
        setSource('cloud');
      })
      .then(undefined, () => { setRemote(null); setSource('local'); });
  }, []);
  useEffect(reload, [reload]);

  useEffect(() => {
    AsyncStorage.multiGet([K_SAVED, K_USER, K_LIKES]).then(([[, s], [, u], [, l]]) => {
      if (l) setLikedPosts(new Set(JSON.parse(l)));
      if (s) setSaved(new Set(JSON.parse(s)));
      if (u) setUserSpots(JSON.parse(u));
    }).catch(() => {});
  }, []);

  // Merkliste: lokal gespeichert und, wenn angemeldet, im Konto (Tabelle saves).
  const { session } = useAuth();
  const uid = session?.user.id ?? null;
  const persistSaved = (next: Set<number>) => AsyncStorage.setItem(K_SAVED, JSON.stringify([...next])).catch(() => {});

  useEffect(() => { if (uid) track('app_open'); }, [uid]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      const local = JSON.parse((await AsyncStorage.getItem(K_SAVED).catch(() => null)) ?? '[]') as number[];
      // Lokal gemerkte Spots ins Konto übernehmen (doppelte ignoriert).
      if (local.length) {
        await supabase.from('saves').upsert(local.map((spot_id) => ({ user_id: uid, spot_id })),
          { onConflict: 'user_id,spot_id', ignoreDuplicates: true });
      }
      const { data, error } = await supabase.from('saves').select('spot_id').eq('user_id', uid);
      if (cancelled || error || !data) return;
      const next = new Set<number>([...local, ...data.map((r) => r.spot_id as number)]);
      setSaved(next);
      persistSaved(next);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const toggleSave = useCallback((id: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      const add = !next.has(id);
      add ? next.add(id) : next.delete(id);
      if (add) track('spot_saved');
      persistSaved(next);
      if (uid) {
        (add
          ? supabase.from('saves').upsert({ user_id: uid, spot_id: id }, { onConflict: 'user_id,spot_id', ignoreDuplicates: true })
          : supabase.from('saves').delete().eq('user_id', uid).eq('spot_id', id)
        ).then(({ error }) => { if (error) console.warn('Merkliste nicht synchronisiert', error.message); });
      }
      return next;
    });
  }, [uid]);

  const toggleLikePost = useCallback((id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(K_LIKES, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const addSpot = useCallback((s: UserSpot) => {
    setUserSpots((prev) => {
      const next = [...prev, s];
      AsyncStorage.setItem(K_USER, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleFilter = useCallback((c: Cat) => {
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }, []);

  const spots = useMemo(() => {
    const own: Spot[] = userSpots.map(({ uri, ...rest }) => ({ ...rest, images: [{ uri }], user: true }));
    return [...(remote ?? SAMPLE_SPOTS), ...own].map((s) => ({ ...s, dist: distanceKm(me, s) }));
  }, [userSpots, remote, me]);

  const visible = useMemo(
    () => spots.filter((s) => (s.city ?? 'Bielefeld') === city && (!filters.size || s.cats.some((c) => filters.has(c)))
      && (!moodFilter || MOODS.find((m) => m.key === moodFilter)!.match(s))),
    [spots, filters, city, moodFilter],
  );

  const value: Store = {
    source, reload, city, setCity, moodFilter, setMoodFilter, me, realLocation, locate, spots, visible, filters, toggleFilter, clearFilters: () => setFilters(new Set()),
    saved, toggleSave, addSpot, likedPosts, toggleLikePost, mapCenter, setMapCenter,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
