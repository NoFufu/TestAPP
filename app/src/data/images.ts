// Platzhalterfotos aus dem Prototyp (generiert). Werden durch echte Uploads ersetzt.
import type { SpotImage } from './spots';

/** Spots mit fotorealistischen Testbildern als Spot UND mit Person (KI-generiert, s. assets/spots/TESTBILDER.md). */
export const PHOTO_SPOT_IDS = new Set([1, 7, 11, 13, 14, 18, 21, 23, 26, 29]);

export const SPOT_IMAGES: Record<number, SpotImage[]> = {
  1: [require('../../assets/spots/1a.jpg'), require('../../assets/spots/1b.jpg')],
  2: [require('../../assets/spots/2a.jpg'), require('../../assets/spots/2b.jpg')],
  3: [require('../../assets/spots/3a.jpg'), require('../../assets/spots/3b.jpg')],
  4: [require('../../assets/spots/4a.jpg'), require('../../assets/spots/4b.jpg')],
  5: [require('../../assets/spots/5a.jpg'), require('../../assets/spots/5b.jpg')],
  6: [require('../../assets/spots/6a.jpg'), require('../../assets/spots/6b.jpg')],
  7: [require('../../assets/spots/7a.jpg'), require('../../assets/spots/7b.jpg')],
  8: [require('../../assets/spots/8a.jpg'), require('../../assets/spots/8b.jpg')],
  9: [require('../../assets/spots/9a.jpg'), require('../../assets/spots/9b.jpg')],
  10: [require('../../assets/spots/10a.jpg'), require('../../assets/spots/10b.jpg')],
  11: [require('../../assets/spots/11a.jpg'), require('../../assets/spots/11b.jpg')],
  12: [require('../../assets/spots/12a.jpg'), require('../../assets/spots/12b.jpg')],
  13: [require('../../assets/spots/13a.jpg'), require('../../assets/spots/13b.jpg')],
  14: [require('../../assets/spots/14a.jpg'), require('../../assets/spots/14b.jpg')],
  15: [require('../../assets/spots/15a.jpg'), require('../../assets/spots/15b.jpg')],
  16: [require('../../assets/spots/16a.jpg'), require('../../assets/spots/16b.jpg')],
  17: [require('../../assets/spots/17a.jpg'), require('../../assets/spots/17b.jpg')],
  18: [require('../../assets/spots/18a.jpg'), require('../../assets/spots/18b.jpg')],
  19: [require('../../assets/spots/19a.jpg'), require('../../assets/spots/19b.jpg')],
  20: [require('../../assets/spots/20a.jpg'), require('../../assets/spots/20b.jpg')],
  21: [require('../../assets/spots/21a.jpg'), require('../../assets/spots/21b.jpg')],
  22: [require('../../assets/spots/22a.jpg'), require('../../assets/spots/22b.jpg')],
  23: [require('../../assets/spots/23a.jpg'), require('../../assets/spots/23b.jpg')],
  24: [require('../../assets/spots/24a.jpg'), require('../../assets/spots/24b.jpg')],
  25: [require('../../assets/spots/25a.jpg'), require('../../assets/spots/25b.jpg')],
  26: [require('../../assets/spots/26a.jpg'), require('../../assets/spots/26b.jpg')],
  27: [require('../../assets/spots/27a.jpg'), require('../../assets/spots/27b.jpg')],
  28: [require('../../assets/spots/28a.jpg'), require('../../assets/spots/28b.jpg')],
  29: [require('../../assets/spots/29a.jpg'), require('../../assets/spots/29b.jpg')],
  30: [require('../../assets/spots/30a.jpg'), require('../../assets/spots/30b.jpg')],
};
