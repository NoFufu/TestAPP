import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ME, SAMPLE_SPOTS, distanceKm, type Cat, type Spot } from './data/spots';

type UserSpot = Omit<Spot, 'images'> & { uri: string };

type Store = {
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
    return [...SAMPLE_SPOTS, ...own].map((s) => ({ ...s, dist: distanceKm(ME, s) }));
  }, [userSpots]);

  const visible = useMemo(
    () => (filters.size ? spots.filter((s) => s.cats.some((c) => filters.has(c))) : spots),
    [spots, filters],
  );

  const value: Store = {
    spots, visible, filters, toggleFilter, clearFilters: () => setFilters(new Set()),
    saved, toggleSave, addSpot, mapCenter, setMapCenter,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
