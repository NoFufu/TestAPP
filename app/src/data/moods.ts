import { moodColors } from '../ui/tokens';
import type { Cat, Spot } from './spots';

/**
 * Moods: Stimmung eines Spots. Werden automatisch aus Kategorie, Farben und Stichworten im Text gebildet
 * (keine eigene Datenbank-Spalte). Ein Spot kann mehrere Moods haben.
 */
export type MoodKey = 'urban' | 'ruhig' | 'natuerlich' | 'verspielt' | 'romantisch' | 'dunkel' | 'modern';
export type MoodIcon = 'business' | 'leaf' | 'cloudy-night' | 'sparkles' | 'heart' | 'moon' | 'square';
export type Mood = { key: MoodKey; label: string; icon: MoodIcon; match: (s: Spot) => boolean };

const cat = (...c: Cat[]) => (s: Spot) => s.cats.some((x) => c.includes(x));
const words = (re: RegExp) => (s: Spot) => re.test(`${s.name} ${s.desc}`);
const color = (...c: string[]) => (s: Spot) => !!s.colors?.some((x) => c.includes(x));
const any = (...f: ((s: Spot) => boolean)[]) => (s: Spot) => f.some((x) => x(s));
const CHROMA = ['rot', 'orange', 'gelb', 'gruen', 'blau', 'lila', 'pink'];

export const MOODS: Mood[] = [
  { key: 'urban', label: 'Urban Aesthetic', icon: 'business',
    match: any(cat('urban', 'industrial'), words(/graffiti|beton|skat|streetart|grunge|neon/i)) },
  { key: 'ruhig', label: 'Ruhig', icon: 'cloudy-night',
    match: any(cat('cafe', 'altstadt'), words(/ruhig|wenig|früh morgens|nebel|still|hinterhof|weich/i)) },
  { key: 'natuerlich', label: 'Natürlich', icon: 'leaf',
    match: any(cat('natur', 'strand'), color('gruen'), words(/park|garten|wald|wiese|baum|bäume|see\b|meer/i)) },
  { key: 'verspielt', label: 'Verspielt', icon: 'sparkles',
    match: any(color(...CHROMA), words(/bunt|knallrot|mosaik|organisch|farbe|farbig|palmen/i)) },
  { key: 'romantisch', label: 'Romantisch', icon: 'heart',
    match: any(cat('altstadt', 'aussicht'), words(/romantisch|sonnenuntergang|blick|fachwerk|rhododendren|warmes licht|bögen|arkaden/i)) },
  { key: 'dunkel', label: 'Dunkel & Moody', icon: 'moon',
    match: any(cat('nacht'), color('schwarz'), words(/nacht|neon|tunnel|dunkel|schatten|grunge/i)) },
  { key: 'modern', label: 'Modern & Clean', icon: 'square',
    match: any(cat('architektur'), words(/clean|glatt|klar|minimal|symmetrisch|geometrisch|brutalismus/i)) },
];

export const moodInfo = (k: MoodKey) => MOODS.find((m) => m.key === k)!;
export const moodsOf = (s: Spot) => MOODS.filter((m) => m.match(s)).map((m) => m.key);

/** Gedämpfte Mood-Farbe eines Spots (erster passender Mood), für feine Ränder. */
export const moodTint = (s: Spot): string | undefined => {
  const m = MOODS.find((x) => x.match(s));
  return m ? moodColors[m.key] : undefined;
};
