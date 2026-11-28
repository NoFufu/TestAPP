import { useEffect, type RefObject } from 'react';

/** Tipp auf den schon offenen Tab: Seite springt nach oben. Dock sendet, Screens hören zu. */
const listeners = new Map<string, Set<() => void>>();
export function emitScrollTop(tab: string) { listeners.get(tab)?.forEach((f) => f()); }

export function useScrollTopOnTab(tab: string, ref: RefObject<{ scrollTo: (o: { y: number; animated?: boolean }) => void } | null>) {
  useEffect(() => {
    const f = () => ref.current?.scrollTo({ y: 0, animated: true });
    if (!listeners.has(tab)) listeners.set(tab, new Set());
    listeners.get(tab)!.add(f);
    return () => { listeners.get(tab)?.delete(f); };
  }, [tab, ref]);
}
