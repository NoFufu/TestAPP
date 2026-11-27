import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SPOT_IMAGES } from './data/images';
import { CATS, ME, SAMPLE_SPOTS, distanceKm, type Cat, type Spot } from './data/spots';
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
  filters: Set<Cat>;
  toggleFilter: (c: Cat) => void;
  clearFilters: () => void;
  saved: Set<number>;
  toggleSave: (id: number) => void;
  addSpot: (s: UserSpot) => void;
  /** Mitte der Karte, dort landen neue Uploads (bis GPS aus dem Foto kommt). */
  mapCenter: { lat: number; lon: number };
  setMapCenter: (c: { lat: number; lon: number }) => void;
};

const Ctx = createContext<Store | null>(null);
const K_SAVED = 'fs_saved', K_USER = 'fs_user';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Set<Cat>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [userSpots, setUserSpots] = useState<UserSpot[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 52.0215, lon: 8.531 });
  const [remote, setRemote] = useState<Spot[] | null>(null);
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
    supabase
      .rpc('spots_nearby', { lat: ME.lat, lon: ME.lon, radius_m: 20000 })
      .then(({ data, error }) => {
        if (error || !data) throw error ?? new Error('keine Daten');
        const valid = new Set(CATS.map((c) => c.key));
        setRemote((data as NearbyRow[]).map((r) => ({
          id: r.id, name: r.name, desc: r.description, area: r.area, lat: r.lat, lon: r.lon, likes: r.likes_count,
          cats: r.categories.filter((c): c is Cat => valid.has(c as Cat)),
          // Titelbild aus dem Speicher; die 30 Start-Spots nutzen vorerst die mitgelieferten Platzhalter.
          images: r.cover_path ? [{ uri: photoUrl(r.cover_path) }] : SPOT_IMAGES[r.id] ?? [],
        })).filter((s) => s.cats.length && s.images.length));
        setSource('cloud');
      })
      .then(undefined, () => { setRemote(null); setSource('local'); });
  }, []);
  useEffect(reload, [reload]);

  useEffect(() => {
    AsyncStorage.multiGet([K_SAVED, K_USER]).then(([[, s], [, u]]) => {
      if (s) setSaved(new Set(JSON.parse(s)));
      if (u) setUserSpots(JSON.parse(u));
    }).catch(() => {});
  }, []);

  const toggleSave = useCallback((id: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(K_SAVED, JSON.stringify([...next])).catch(() => {});
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
    () => (filters.size ? spots.filter((s) => s.cats.some((c) => filters.has(c))) : spots),
    [spots, filters],
  );

  const value: Store = {
    source, reload, me, realLocation, locate, spots, visible, filters, toggleFilter, clearFilters: () => setFilters(new Set()),
    saved, toggleSave, addSpot, mapCenter, setMapCenter,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
