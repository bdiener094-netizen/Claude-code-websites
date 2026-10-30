import type {Pt} from '../scenes/types';

// Stylised map of Constantinople, c. 1453. Map units: the land walls run ~455 units
// (~5.7 km), so 1 unit ≈ 12.5 m. North is up. Shapes extend past 0–1000 so the
// camera can pan freely.

export const LAND = {
  // Thrace south of the Golden Horn, including the city peninsula
  thraceSouth:
    'M -600,300 L 0,268 C 90,274 170,290 236,306 C 330,326 440,352 560,378 C 650,398 720,414 772,438 C 800,452 806,476 790,494 C 740,534 650,572 560,612 C 470,652 380,690 290,724 C 230,744 120,775 0,792 L -600,830 Z',
  // Galata / Pera and Thrace north of the Golden Horn
  thraceNorth:
    'M -600,-600 L 862,-600 L 862,120 C 852,220 830,320 790,404 C 760,390 700,372 640,358 C 560,340 470,318 380,296 C 300,276 240,262 170,250 C 110,240 50,236 0,232 L -600,226 Z',
  // Anatolia, across the Bosphorus
  asia: 'M 905,-600 L 1600,-600 L 1600,1600 L 960,1600 C 930,1100 900,900 905,760 C 910,640 925,560 915,470 C 905,380 900,250 905,-600 Z',
};

// Theodosian land walls, north (Golden Horn end) to south (Golden Gate, on the Marmara)
export const LAND_WALLS: Pt[] = [
  [236, 306],
  [240, 380],
  [233, 460],
  [223, 540],
  [213, 620],
  [205, 690],
  [199, 750],
];

// Sea walls follow the peninsula shore
export const SEA_WALLS =
  'M 236,306 C 330,326 440,352 560,378 C 650,398 720,414 772,438 C 800,452 806,476 790,494 C 740,534 650,572 560,612 C 470,652 380,690 290,724 L 199,750';

export const LABELS = {
  city: {text: 'Constantinople', x: 515, y: 505, size: 34, rotate: -6},
  thrace: {text: 'THRACE', x: 40, y: 540, size: 40, rotate: 0},
  horn: {text: 'Golden Horn', x: 470, y: 333, size: 13, rotate: 13},
  galata: {text: 'Galata', x: 690, y: 320, size: 18, rotate: 0},
  bosphorus: {text: 'Bosphorus', x: 884, y: 200, size: 15, rotate: 90},
  marmara: {text: 'Sea of Marmara', x: 560, y: 790, size: 30, rotate: -8},
  anatolia: {text: 'ANATOLIA', x: 1080, y: 640, size: 36, rotate: 0},
  walls: {text: 'Theodosian Walls', x: 190, y: 530, size: 15, rotate: -84},
  hagia: {text: 'Hagia Sophia', x: 736, y: 488, size: 12, rotate: 0},
};

export type LabelKey = keyof typeof LABELS;

export const HAGIA_SOPHIA: Pt = [736, 466];

// The great chain (boom) across the mouth of the Golden Horn, city to Galata
export const CHAIN: Pt[] = [
  [768, 436],
  [737, 385],
];
