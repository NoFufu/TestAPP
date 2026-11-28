/** Rechtliche Links. Kommen aus EXPO_PUBLIC_* (app/.env bzw. EAS-Umgebungsvariablen), sobald die Seiten online sind. */
export const LEGAL = {
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  imprint: process.env.EXPO_PUBLIC_IMPRINT_URL ?? '',
};
