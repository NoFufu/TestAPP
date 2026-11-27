import type { Cat, Spot } from './spots';

/**
 * Beispiel-Outfit-Beiträge, bis echte Uploads mit Login kommen (Etappe A).
 * Personen und Texte sind erfunden. Bild = Outfit-Variante des Spot-Platzhalters.
 */
export type Post = {
  id: string;
  author: string;
  spotId: number;
  hoursAgo: number;
  caption: string;
  likes: number;
};

const AUTHORS = ['lena.fits', 'jonas.wear', 'mira.mood', 'tim.streetstyle', 'ayla.lookbook', 'noah.layers'];

const CAPTIONS: Record<Cat, string[]> = {
  tuer: ['Tür zuerst, Outfit danach. Farben passen zu gut.', 'Altbau-Tür plus Trenchcoat, mehr braucht es nicht.'],
  urban: ['Beton, Sneaker, fertig.', 'Graffiti als Hintergrund, Oversize als Outfit.'],
  natur: ['Golden Hour im Grünen, Strick passt perfekt.', 'Waldlicht ist der beste Filter.'],
  cafe: ['Fensterlicht ab 10 Uhr, perfekt für Beige.', 'Kaffee in der Hand, Look im Kasten.'],
  industrial: ['Backstein und Leder, immer eine gute Idee.', 'Sprossenfenster im Rücken, Denim-on-Denim.'],
  treppe: ['Stufen geben automatisch Pose.', 'Von unten fotografiert wirkt jedes Outfit länger.'],
  nacht: ['Neonlicht statt Blitz.', 'Blaue Stunde, glänzende Jacke.'],
  architektur: ['Klare Linien, klares Outfit.', 'Symmetrie zum Mitnehmen.'],
};

export function buildPosts(spots: Spot[]): Post[] {
  return spots
    .filter((s) => !s.user && s.images.length > 1)
    .map((s) => ({
      id: `p${s.id}`,
      author: AUTHORS[s.id % AUTHORS.length],
      spotId: s.id,
      hoursAgo: (s.id * 7) % 70 + 1,
      caption: CAPTIONS[s.cats[0]][s.id % 2],
      likes: Math.round(s.likes * 0.4),
    }))
    .sort((a, b) => a.hoursAgo - b.hoursAgo);
}

export const fmtAgo = (h: number) => (h < 24 ? `vor ${h} Std.` : `vor ${Math.floor(h / 24)} T.`);
