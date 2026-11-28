/**
 * fitspot Design-Tokens. Quelle: docs/design/richtung.html, Doku: docs/design/SYSTEM.md
 * Regel: In Screens keine Hex-Werte, Abstände oder Schriftgrößen direkt eintragen, immer Tokens nutzen.
 */

export const palette = {
  light: {
    paper: '#F3F1F8',     // Hintergrund: leichtes Lila-Weiß
    surface: '#FBFAFE',   // Karten, Sheets, Eingabefelder
    ink: '#1B1A22',       // Text, Knöpfe, Story-Ringe
    asphalt: '#625E70',   // Nebentext (5.6:1 auf Papier)
    line: '#E1DEEA',      // Trennlinien, Rahmen
    fill: '#ECE9F3',      // Platzhalter, Skeleton, gedrückte Fläche
    cherry: '#C4153A',    // Like, Merken (einzige Signalfarbe)
    onInk: '#F3F1F8',     // Text auf Tinte
    sign: '#1B1A22',      // Spot-Schild Hintergrund
    onSign: '#FBFAFE',
    danger: '#B3261E',
    scrim: 'rgba(0,0,0,0.45)',
    onPhoto: '#FFFFFF',      // Icons/Text direkt auf Fotos
    photoScrim: 'rgba(0,0,0,0.45)', // Fläche hinter Icons auf Fotos
    shadow: '#000000',
    sun: '#E39A2D',       // Sonnenbogen, Golden Hour
    sunTrack: '#E1DEEA',
    glow: '#FFFFFF',      // heller Leuchtrand um Kacheln (beim Antippen)
    glowSoft: 'rgba(255,255,255,0.85)', // ganz feiner Rand im Ruhezustand
    dock: 'rgba(251,250,254,0.94)', // schwebende Tab-Leiste
    onDock: '#1B1A22',
    accent: '#6A55B8',    // Story-Ringe, aktiver Tab
    dockActive: '#E2DCF5', // aktiver Knopf in der Tab-Leiste
  },
  dark: {
    paper: '#161B22',     // Hintergrund: Blaugrau
    surface: '#1F2630',
    ink: '#E8ECF2',
    asphalt: '#A1ABB8',   // 7.4:1 auf Papier
    line: '#2E3743',
    fill: '#252D38',
    cherry: '#FF4D6D',
    onInk: '#161B22',
    sign: '#E8ECF2',
    onSign: '#161B22',
    danger: '#FF8A80',
    scrim: 'rgba(0,0,0,0.6)',
    onPhoto: '#FFFFFF',
    photoScrim: 'rgba(0,0,0,0.45)',
    shadow: '#000000',
    sun: '#F2B04A',
    sunTrack: '#333D49',
    glow: '#FFFFFF',
    glowSoft: 'rgba(255,255,255,0.14)',
    dock: 'rgba(50,60,74,0.94)',
    onDock: '#E8ECF2',
    accent: '#8F7FE0',
    dockActive: '#4A4468',
  },
} as const;

export type Colors = { [K in keyof typeof palette.light]: string };

/** Kategorie-Farben: gedämpft, nur als kleine Punkte. Funktionieren auf hell und dunkel. */
export const catColors = {
  urban: '#D9773F',
  tuer: '#C25B86',
  natur: '#5E9A6A',
  cafe: '#B08A55',
  industrial: '#A8604A',
  treppe: '#7B74C9',
  nacht: '#3E9DB3',
  architektur: '#7E8896',
  strand: '#C9A23A',
  aussicht: '#4F86C6',
  altstadt: '#8C6B4F',
} as const;

/** 4er-Raster */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Pinterest-artiges Raster: schmaler Rand, enge Spalten, runde Kacheln */
export const grid = { edge: 2, gap: 4, radius: 16, footer: 34 } as const;

/** Schwebende Tab-Leiste: einzelne runde Quadrate */
export const dock = { size: 52, gap: 10, radius: 18, bottom: -14, clearance: 96, fade: 120 } as const;

/** Kartenausschnitt (Grad): ein einzelner Spot / mehrere Spots einer Stadt */
export const mapZoom = { single: 0.012, city: 0.05 } as const;

/** Ecken nach Rolle, nicht eine für alles */
export const radius = {
  photo: 0,    // Feed-Fotos randlos
  sign: 6,     // Spot-Schild wie Blech
  thumb: 12,   // kleine Vorschaubilder
  card: 20,    // Karten, Sheets
  pill: 999,   // Knöpfe, Filter
} as const;

export const fonts = {
  // Systemschrift (SF Pro auf iOS, Roboto auf Android) für alles Bedienbare
  ui: undefined as string | undefined,
  sign500: 'BarlowCondensed_500Medium',
  sign600: 'BarlowCondensed_600SemiBold',
  sign700: 'BarlowCondensed_700Bold',
};

/** Schriftstufen. `sign`-Stufen nur für Spot-Namen, Schild und große Titel. */
export const type = {
  display: { fontFamily: fonts.sign700, fontSize: 34, lineHeight: 36 },
  title: { fontFamily: fonts.sign700, fontSize: 26, lineHeight: 28 },
  sign: { fontFamily: fonts.sign600, fontSize: 17, lineHeight: 20 },
  signMeta: { fontFamily: fonts.sign500, fontSize: 15, lineHeight: 20 },
  stat: { fontFamily: fonts.sign600, fontSize: 22, lineHeight: 24 },
  name: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  hero: { fontFamily: fonts.sign700, fontSize: 96, lineHeight: 92 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;
export type TypeVariant = keyof typeof type;

export const motion = {
  fast: 120,
  base: 220,
  /** Feder für das Doppeltipp-Herz */
  pop: { friction: 4, tension: 160 },
} as const;

/** Mindest-Tippfläche (Apple HIG) */
export const hit = 44;

/** Kleine Vorschaubilder in Listen */
export const thumbSize = 64;

/** Farbfilter: Kreis-Farben je Farbgruppe (Daten-Farben, nicht fürs Layout). */
export const swatch = {
  rot: '#C8352E', orange: '#E07B2E', gelb: '#E9C23A', gruen: '#4E9A55', blau: '#3B6FC4', lila: '#7D55B8',
  pink: '#E58AAE', braun: '#8A5A3B', beige: '#D9C6A5', schwarz: '#1B1B1B', weiss: '#F4F4F1', grau: '#9A9C9F',
} as const;
export const swatchSize = 28;

/** Mood-Kreise (wie Instagram-Stories) */
export const story = { size: 76, gap: 14, badge: 24 } as const;

/** Landesfarben (Daten-Farben fürs Länder-Zeichen): Streifen von oben nach unten, Höhenanteile. */
export const flags = {
  GER: { stripes: ['#000000', '#DD0000', '#FFCE00'], weights: [1, 1, 1] },
  SP: { stripes: ['#AA151B', '#F1BF00', '#AA151B'], weights: [1, 2, 1] },
} as const;
/** Maße des Ländercodes aus Titel-Schrift (Breite je Buchstabe, Oberkante der Großbuchstaben, Grundlinie) */
export const countryCode = { charW: 14, pad: 2, capTop: 5, baseline: 23 } as const;

/** Sammlungen: Flächenfarbe je Sammlung (Weiß darauf ≥ 5.5:1). Nur für Sammlungs-Karte und -Kopf. */
export const collectionTint = {
  urban: '#B4441A', skate: '#1F6F78', architektur: '#3F4A8A', bunt: '#A02D72',
  treppen: '#2F6B4F', altstadt: '#8A5A2B', natur: '#2E6B3A',
} as const;
export const collectionCard = { height: 200, photoW: 84, photoH: 112, tilt: 7 } as const;

/** Mood-Farben: bewusst gedämpft, nur als feiner Rand, Ring oder Hauch. Kommen zu den Moods in `data/moods.ts`. */
export const moodColors = {
  urban: '#C98A5E', ruhig: '#8FA9C4', natuerlich: '#8DB596', verspielt: '#E0B35C',
  romantisch: '#D69AB8', dunkel: '#8C84C4', modern: '#9AA5B1',
} as const;
/** Deckkraft von Mood-Farbe als Rand um Kacheln */
export const moodRim = 0.75;
