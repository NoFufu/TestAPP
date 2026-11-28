import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'jpeg-js';

/** Farbfilter: feste Farbgruppen. Gleiche Regeln wie das Offline-Skript für die mitgelieferten Bilder. */
export type SpotColor = 'rot' | 'orange' | 'gelb' | 'gruen' | 'blau' | 'lila' | 'pink' | 'braun' | 'beige' | 'schwarz' | 'weiss' | 'grau';
const NEUTRAL = new Set<SpotColor>(['schwarz', 'weiss', 'grau', 'beige', 'braun']);

function hsv(r: number, g: number, b: number) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  let h = 0;
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: ((h * 60) + 360) % 360, s: max ? d / max : 0, v: max };
}

function bucket(r: number, g: number, b: number): SpotColor {
  const { h, s, v } = hsv(r, g, b);
  if (v < 0.2) return 'schwarz';
  if (s < 0.15) return v > 0.85 ? 'weiss' : 'grau';
  if (h >= 20 && h < 50 && s < 0.35 && v > 0.6) return 'beige';
  if (h >= 15 && h < 45 && v < 0.55) return 'braun';
  if (h < 15 || h >= 345) return s < 0.55 && v > 0.65 ? 'pink' : 'rot';
  if (h < 40) return 'orange';
  if (h < 65) return 'gelb';
  if (h < 165) return 'gruen';
  if (h < 255) return 'blau';
  if (h < 290) return 'lila';
  return 'pink';
}

/** Bis zu 2 Hauptfarben eines Fotos. Kräftige Farben zählen vor Grau/Braun. Fehler → []. */
export async function photoColors(uri: string): Promise<SpotColor[]> {
  try {
    const img = await ImageManipulator.manipulate(uri).resize({ width: 16, height: 16 }).renderAsync();
    const res = await img.saveAsync({ format: SaveFormat.JPEG, compress: 1, base64: true });
    if (!res.base64) return [];
    const bin = atob(res.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const { data, width, height } = decode(bytes, { useTArray: true });
    const chrom = new Map<SpotColor, number>(), neut = new Map<SpotColor, number>();
    let n = 0;
    for (let y = 3; y < height; y++) for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4, r = data[i], g = data[i + 1], b = data[i + 2];
      const k = bucket(r, g, b), { s, v } = hsv(r, g, b);
      const m = NEUTRAL.has(k) || s < 0.3 || v < 0.3 ? neut : chrom;
      m.set(k, (m.get(k) ?? 0) + 1); n++;
    }
    const top = [...chrom].sort((a, b) => b[1] - a[1]).filter(([, c]) => c / n >= 0.08).slice(0, 2).map(([k]) => k);
    if (top.length < 2) {
      const [first] = [...neut].sort((a, b) => b[1] - a[1]);
      if (first && first[1] / n >= 0.25 && !top.includes(first[0])) top.push(first[0]);
    }
    return top.slice(0, 2);
  } catch {
    return [];
  }
}
