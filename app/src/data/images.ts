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


/** Barcelona: KI-generierte Beispielbilder (barcelona-fitspot.zip), mehrere Ansichten je Ort. 9002–9005 noch Platzhalter. */
SPOT_IMAGES[9002] = [require('../../assets/spots/barcelona/9002a.jpg')];
SPOT_IMAGES[9003] = [require('../../assets/spots/barcelona/9003a.jpg')];
SPOT_IMAGES[9004] = [require('../../assets/spots/barcelona/9004a.jpg')];
SPOT_IMAGES[9005] = [require('../../assets/spots/barcelona/9005a.jpg')];
SPOT_IMAGES[9001] = [require('../../assets/spots/barcelona/macba.jpg')];
SPOT_IMAGES[9006] = [require('../../assets/spots/barcelona/pont-del-bisbe.jpg')];
SPOT_IMAGES[9007] = [require('../../assets/spots/barcelona/placa-reial.jpg')];
SPOT_IMAGES[9008] = [require('../../assets/spots/barcelona/arc-de-triomf.jpg')];
SPOT_IMAGES[9009] = [require('../../assets/spots/barcelona/casa-batllo.jpg'), require('../../assets/spots/barcelona/casa-batllo-evening.jpg')];
SPOT_IMAGES[9010] = [require('../../assets/spots/barcelona/palau-musica.jpg')];
SPOT_IMAGES[9011] = [require('../../assets/spots/barcelona/barceloneta-day.jpg'), require('../../assets/spots/barcelona/barceloneta-sunset.jpg')];
SPOT_IMAGES[9012] = [require('../../assets/spots/barcelona/bunkers-del-carmel.jpg')];
SPOT_IMAGES[9013] = [require('../../assets/spots/barcelona/ciutadella.jpg')];
SPOT_IMAGES[9014] = [require('../../assets/spots/barcelona/park-guell.jpg'), require('../../assets/spots/barcelona/park-guell-morning.jpg')];
SPOT_IMAGES[9015] = [require('../../assets/spots/barcelona/montjuic-mnac.jpg')];
SPOT_IMAGES[9016] = [require('../../assets/spots/barcelona/sagrada-day.jpg'), require('../../assets/spots/barcelona/sagrada-sunset.jpg')];
SPOT_IMAGES[9017] = [require('../../assets/spots/barcelona/la-rambla.jpg')];
SPOT_IMAGES[9018] = [require('../../assets/spots/barcelona/casa-mila.jpg')];
SPOT_IMAGES[9019] = [require('../../assets/spots/barcelona/tibidabo.jpg')];
SPOT_IMAGES[9020] = [require('../../assets/spots/barcelona/port-vell.jpg')];

/** Spots mit KI-Bildern, die als solche gekennzeichnet werden. */
export const AI_SPOT_IDS = new Set([9001, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020]);
