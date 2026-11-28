import type { SpotColor } from '../lib/colors';
import { catColors, swatch } from '../ui/tokens';
import { SPOT_IMAGES } from './images';

export type Cat =
  | 'urban'
  | 'tuer'
  | 'natur'
  | 'cafe'
  | 'industrial'
  | 'treppe'
  | 'nacht'
  | 'architektur'
  | 'strand'
  | 'aussicht'
  | 'altstadt';

/** Symbol je Kategorie (MaterialCommunityIcons, hat Tür, Burg, Treppe …). */
export type CatIcon = 'spray' | 'door' | 'tree' | 'coffee' | 'factory' | 'stairs' | 'weather-night' | 'domain' | 'beach' | 'binoculars' | 'castle';

export const CATS: { key: Cat; label: string; color: string; icon: CatIcon }[] = [
  { key: 'urban', label: 'Urban & Street', color: catColors.urban, icon: 'spray' },
  { key: 'tuer', label: 'Türen', color: catColors.tuer, icon: 'door' },
  { key: 'natur', label: 'Natur', color: catColors.natur, icon: 'tree' },
  { key: 'cafe', label: 'Café', color: catColors.cafe, icon: 'coffee' },
  { key: 'industrial', label: 'Industrial', color: catColors.industrial, icon: 'factory' },
  { key: 'treppe', label: 'Treppen', color: catColors.treppe, icon: 'stairs' },
  { key: 'nacht', label: 'Nacht & Neon', color: catColors.nacht, icon: 'weather-night' },
  { key: 'architektur', label: 'Architektur', color: catColors.architektur, icon: 'domain' },
  { key: 'strand', label: 'Strand', color: catColors.strand, icon: 'beach' },
  { key: 'aussicht', label: 'Aussicht', color: catColors.aussicht, icon: 'binoculars' },
  { key: 'altstadt', label: 'Altstadt & Burgen', color: catColors.altstadt, icon: 'castle' },
];
/** Kurze Namen für enge Stellen (Story-Kreise). */
export const SHORT: Partial<Record<Cat, string>> = { urban: 'Urban', nacht: 'Nacht', architektur: 'Architektur', altstadt: 'Altstadt' };

export const catInfo = (c: Cat) => CATS.find((x) => x.key === c)!;

export const TIPS: Record<Cat, { best: string; tip: string }> = {
  tuer: { best: 'Vormittag, weiches Seitenlicht', tip: '50 mm · f/2.8 · frontal, Tür mittig' },
  urban: { best: 'Später Nachmittag, harte Schatten', tip: '28 mm · f/4 · tief ansetzen' },
  natur: { best: 'Golden Hour, ca. 1 h vor Sonnenuntergang', tip: '85 mm · f/1.8 · gegen die Sonne' },
  cafe: { best: 'Vormittag, Licht durchs Fenster', tip: '35 mm · f/2 · Fensterlicht von der Seite' },
  industrial: { best: 'Bewölkt, gleichmäßiges Licht', tip: '35 mm · f/4 · Backstein als ganze Fläche' },
  treppe: { best: 'Früh morgens, wenig Leute', tip: '24 mm · f/5.6 · von unten nach oben' },
  nacht: { best: 'Blaue Stunde bis 23 Uhr', tip: '35 mm · f/1.4 · ISO 1600, Neon als Licht' },
  architektur: { best: 'Mittags, klare Kanten', tip: '24 mm · f/8 · Linien gerade halten' },
  strand: { best: 'Sonnenaufgang, leerer Strand', tip: '35 mm · f/4 · Horizont gerade' },
  aussicht: { best: 'Später Nachmittag bis Sonnenuntergang', tip: '24 mm · f/8 · Person klein vor der Stadt' },
  altstadt: { best: 'Früh morgens, bevor es voll wird', tip: '35 mm · f/2.8 · Gassen als Rahmen' },
};

/** Gebündeltes Bild (require) oder Datei-URI vom Upload. */
export type SpotImage = number | { uri: string };

export type Spot = {
  id: number;
  name: string;
  cats: Cat[];
  lat: number;
  lon: number;
  area: string;
  desc: string;
  likes: number;
  images: SpotImage[];
  user?: boolean;
  /** Benutzername, wer den Spot entdeckt hat (leer = Start-Spot vom fitspot-Team) */
  creator?: string | null;
  creatorAvatar?: string | null;
  instagramUrl?: string | null;
  city?: City;
  colors?: SpotColor[];
};

/** Simulierter Standort (Jahnplatz). Echter Standort kommt mit expo-location. */
export const ME = { lat: 52.0225, lon: 8.533 };
export const BIELEFELD = { latitude: 52.0215, longitude: 8.531, latitudeDelta: 0.035, longitudeDelta: 0.035 };

/** Städte mit Spots. Mitte = Stadtzentrum, Ausschnitt für die Karte. */
export type City = 'Bielefeld' | 'Barcelona';
export const CITIES: Record<City, { country: string; lat: number; lon: number; region: typeof BIELEFELD }> = {
  Bielefeld: { country: 'GER', lat: ME.lat, lon: ME.lon, region: BIELEFELD },
  Barcelona: { country: 'SP', lat: 41.3874, lon: 2.1686, region: { latitude: 41.3874, longitude: 2.1686, latitudeDelta: 0.09, longitudeDelta: 0.09 } },
};
export const CITY_NAMES = Object.keys(CITIES) as City[];

type Raw = [number, string, Cat[], number, number, string, string, number];
const RAW: Raw[] = [
  [1, 'Sparrenburg Burgtreppe', ['treppe', 'natur'], 52.0137, 8.5277, 'Gadderbaum', 'Steinstufen, alte Burgmauern und oben der Blick über die ganze Stadt.', 842],
  [2, 'Giebelhäuser am Alten Markt', ['architektur', 'tuer'], 52.0208, 8.5337, 'Altstadt', 'Bunte Giebelfassaden dicht nebeneinander, schön für Ganzkörper-Shots.', 611],
  [3, 'Crüwell-Haus Portal', ['tuer'], 52.0214, 8.5326, 'Altstadt', 'Verzierter Giebel und ein schweres, dunkles Holzportal.', 534],
  [4, 'Nicolaikirche Seitentür', ['tuer', 'architektur'], 52.0221, 8.5356, 'Altstadt', 'Ruhige Seitentür in Sandstein, wenig Durchgangsverkehr.', 288],
  [5, 'Marienkirche Portal', ['tuer'], 52.0196, 8.5392, 'Neustadt', 'Hoher Spitzbogen, Steinrahmen, oft im Schatten.', 301],
  [6, 'Kunsthalle Sandsteinfassade', ['architektur', 'urban'], 52.017, 8.532, 'Mitte', 'Roter Sandstein, große glatte Flächen, klare Kanten.', 693],
  [7, 'Ravensberger Spinnerei', ['industrial'], 52.0236, 8.5452, 'Mitte', 'Alte Backsteinfabrik mit großen Sprossenfenstern.', 915],
  [8, 'Ravensberger Park Allee', ['natur'], 52.0248, 8.5475, 'Mitte', 'Baumallee mit Bänken, im Herbst komplett orange.', 472],
  [9, 'Kesselbrink Skatepark', ['urban'], 52.023, 8.5385, 'Mitte', 'Beton, Rampen, Skater im Hintergrund.', 388],
  [10, 'Bahnhofs-Unterführung', ['urban', 'nacht'], 52.0287, 8.5338, 'Hauptbahnhof', 'Gekachelter Tunnel mit Graffiti, abends Neonröhren.', 357],
  [11, 'Boulevard bei Nacht', ['nacht'], 52.03, 8.5348, 'Hauptbahnhof', 'Leuchtreklame und Lichter, nachts fast wie Großstadt.', 524],
  [12, 'Lokschuppen Ziegelwand', ['industrial'], 52.0318, 8.5378, 'Mitte', 'Lange Ziegelwand mit Stahltoren.', 266],
  [13, 'Siegfriedplatz Café-Ecke', ['cafe', 'urban'], 52.0303, 8.5183, 'Westen', 'Altbau-Ecke mit Cafétischen draußen.', 703],
  [14, 'Altbautüren im Westen', ['tuer'], 52.0272, 8.5245, 'Westen', 'Eine Straße voller bunter Gründerzeit-Türen.', 1180],
  [15, 'Hinterhof-Café', ['cafe'], 52.0285, 8.5205, 'Westen', 'Kleiner Innenhof, Pflanzen, warmes Licht am Fenster.', 446],
  [16, 'Rudolf-Oetker-Halle', ['architektur'], 52.0257, 8.5188, 'Westen', 'Klinker, Säulen und symmetrische Fassade.', 319],
  [17, 'Bürgerpark Wiese', ['natur'], 52.0276, 8.5215, 'Westen', 'Offene Wiese mit großen alten Bäumen.', 259],
  [18, 'Botanischer Garten', ['natur'], 52.0068, 8.5142, 'Gadderbaum', 'Rhododendren, Steingarten, im Frühling voller Farbe.', 788],
  [19, 'Olderdissen Fachwerk', ['natur', 'tuer'], 52.0078, 8.5045, 'Dornberg', 'Fachwerkhäuser mitten im Wald, alte Holztüren.', 402],
  [20, 'Hünenburg Aussicht', ['natur'], 52.0032, 8.4985, 'Teutoburger Wald', 'Lichtung oben auf dem Kamm, Weitblick nach Norden.', 551],
  [21, 'Uni-Halle Beton', ['architektur', 'urban'], 52.0378, 8.4935, 'Universität', 'Riesige Betonhalle, Brutalismus pur, lange Fluchten.', 377],
  [22, 'Schildescher Viadukt', ['architektur', 'natur'], 52.0653, 8.5443, 'Schildesche', 'Steinbögen der Eisenbahnbrücke über dem Grün.', 967],
  [23, 'Obersee Steg', ['natur'], 52.0695, 8.5345, 'Schildesche', 'Holzsteg, Schilf und Wasser, morgens oft Nebel.', 634],
  [24, 'Gasse zum Sparrenberg', ['treppe'], 52.0186, 8.5306, 'Altstadt', 'Schmale Stufen zwischen Altbauten Richtung Burg.', 345],
  [25, 'Bar-Fenster Altstadt', ['nacht', 'cafe'], 52.0212, 8.5348, 'Altstadt', 'Warmes Licht hinter großen Fenstern, Neon-Schriftzug.', 298],
  [26, 'Graffiti am Bahndamm', ['urban'], 52.0362, 8.5355, 'Mitte', 'Lange bemalte Wand, wird oft neu gestaltet.', 512],
  [27, 'Johannisberg Waldweg', ['natur', 'treppe'], 52.015, 8.5175, 'Gadderbaum', 'Waldweg mit Holzstufen, Licht fällt durch die Bäume.', 287],
  [28, 'Café-Fenster Obernstraße', ['cafe'], 52.0218, 8.5318, 'Altstadt', 'Großes Schaufenster, drinnen Holz und Messing.', 233],
  [29, 'Rote Tür in Sieker', ['tuer'], 52.0148, 8.5605, 'Sieker', 'Knallrote Haustür an weißer Wand, sehr clean.', 198],
  [30, 'Parkdeck Mitte', ['urban', 'nacht'], 52.0245, 8.5352, 'Mitte', 'Oberstes Deck, Beton und Lichter der Stadt dahinter.', 421],
];

export const SAMPLE_SPOTS: Spot[] = RAW.map(([id, name, cats, lat, lon, area, desc, likes]) => ({
  id, name, cats, lat, lon, area, desc, likes, images: SPOT_IMAGES[id],
}));

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, t = Math.PI / 180;
  const dl = (b.lat - a.lat) * t, dn = (b.lon - a.lon) * t;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const fmtDist = (km: number) =>
  km < 1 ? `${Math.round((km * 1000) / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;

/** Farbfilter-Liste (Reihenfolge wie im Farbkreis). */
export const COLORS: { key: SpotColor; label: string; hex: string }[] = [
  { key: 'rot', label: 'Rot', hex: swatch.rot }, { key: 'orange', label: 'Orange', hex: swatch.orange },
  { key: 'gelb', label: 'Gelb', hex: swatch.gelb }, { key: 'gruen', label: 'Grün', hex: swatch.gruen },
  { key: 'blau', label: 'Blau', hex: swatch.blau }, { key: 'lila', label: 'Lila', hex: swatch.lila },
  { key: 'pink', label: 'Pink', hex: swatch.pink }, { key: 'braun', label: 'Braun', hex: swatch.braun },
  { key: 'beige', label: 'Beige', hex: swatch.beige }, { key: 'schwarz', label: 'Schwarz', hex: swatch.schwarz },
  { key: 'weiss', label: 'Weiß', hex: swatch.weiss }, { key: 'grau', label: 'Grau', hex: swatch.grau },
];
