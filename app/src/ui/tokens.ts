/**
 * fitspot Design-Tokens. Quelle: docs/design/richtung.html, Doku: docs/design/SYSTEM.md
 * Regel: In Screens keine Hex-Werte, Abstände oder Schriftgrößen direkt eintragen, immer Tokens nutzen.
 */

export const palette = {
  light: {
    paper: '#F6F6F3',     // Hintergrund
    surface: '#FFFFFF',   // Karten, Sheets, Eingabefelder
    ink: '#16181B',       // Text, Knöpfe, Story-Ringe
    asphalt: '#62676D',   // Nebentext (5.3:1 auf Papier)
    line: '#E2E3DF',      // Trennlinien, Rahmen
    fill: '#ECEDE9',      // Platzhalter, Skeleton, gedrückte Fläche
    cherry: '#C4153A',    // Like, Merken (einzige Signalfarbe)
    onInk: '#F6F6F3',     // Text auf Tinte
    sign: '#16181B',      // Spot-Schild Hintergrund
    onSign: '#FFFFFF',
    danger: '#B3261E',
    scrim: 'rgba(0,0,0,0.45)',
  },
  dark: {
    paper: '#000000',
    surface: '#141517',
    ink: '#F2F2EF',
    asphalt: '#9EA3A9',
    line: '#26282B',
    fill: '#1E2023',
    cherry: '#FF4D6D',
    onInk: '#000000',
    sign: '#F2F2EF',
    onSign: '#16181B',
    danger: '#FF8A80',
    scrim: 'rgba(0,0,0,0.6)',
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
} as const;

/** 4er-Raster */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

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
