import type { Cat, City, Spot } from './spots';

/** Sammlungen für den Home-Feed: werden aus den Spots der Stadt gebildet (Regel statt fester Liste). */
export type Collection = { key: string; title: (city: City) => string; subtitle: string; match: (s: Spot) => boolean };

const cat = (c: Cat) => (s: Spot) => s.cats.includes(c);
const words = (re: RegExp) => (s: Spot) => re.test(`${s.name} ${s.desc}`);
const CHROMA = new Set(['rot', 'orange', 'gelb', 'gruen', 'blau', 'lila', 'pink']);

export const COLLECTIONS: Collection[] = [
  { key: 'urban', title: (c) => `Top 10 Urban Style in ${c}`, subtitle: 'Beton, Graffiti, Streetwear', match: (s) => cat('urban')(s) || cat('industrial')(s) },
  { key: 'skate', title: (c) => `Skater-Spots in ${c}`, subtitle: 'Rampen, Plätze, glatter Beton', match: words(/skat|rampe|beton/i) },
  { key: 'architektur', title: (c) => `Top 10 Architektur in ${c}`, subtitle: 'Fassaden und klare Linien', match: cat('architektur') },
  { key: 'bunt', title: (c) => `Bunte Wände in ${c}`, subtitle: 'Kräftige Farben als Hintergrund', match: (s) => !!s.colors?.some((x) => CHROMA.has(x)) },
  { key: 'treppen', title: (c) => `Treppen & Aussicht in ${c}`, subtitle: 'Stufen, Höhe, Blick über die Stadt', match: (s) => cat('treppe')(s) || cat('aussicht')(s) },
  { key: 'altstadt', title: (c) => `Altstadt & Gassen in ${c}`, subtitle: 'Alte Mauern, Bögen, Kopfsteinpflaster', match: (s) => cat('altstadt')(s) || cat('tuer')(s) },
  { key: 'natur', title: (c) => `Grün & Natur in ${c}`, subtitle: 'Parks, Bäume, weiches Licht', match: (s) => cat('natur')(s) || cat('strand')(s) },
];

/** Spots einer Sammlung: Stadt, Regel, beliebteste zuerst, höchstens 10. */
export function collectionSpots<T extends Spot>(key: string, spots: T[], city: City): T[] {
  const col = COLLECTIONS.find((c) => c.key === key);
  if (!col) return [];
  return spots.filter((s) => (s.city ?? 'Bielefeld') === city && col.match(s)).sort((a, b) => b.likes - a.likes).slice(0, 10);
}

/** Sammlungen mit mindestens 3 Spots in der Stadt. */
export function collectionsFor<T extends Spot>(spots: T[], city: City) {
  return COLLECTIONS.map((c) => ({ c, items: collectionSpots(c.key, spots, city) })).filter((x) => x.items.length >= 3);
}
