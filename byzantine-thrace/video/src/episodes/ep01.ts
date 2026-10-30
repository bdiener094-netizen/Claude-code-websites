import type {Segment} from '../timing';

// Ep 01 · The Walls That Never Fell
// Facts: Theodosian Walls begun 413 under Theodosius II; moat ~20 m wide; inner wall ~12 m
// high with 96 towers. Sieges repelled: Avars & Persians 626, Arabs 717–18, Bulgars 813.
// 1204: Fourth Crusade entered via the Golden Horn sea walls, not the land walls.
// Mehmed II was 18 at his accession in Feb 1451 (born March 1432), hence "a teenager".

const CITY = {x: 560, y: 520, zoom: 1.0};
const WALLS = {x: 230, y: 530, zoom: 2.0};

export const ep01: Segment[] = [
  {
    text: 'For a thousand years, no army ever stormed these walls.',
    scene: {type: 'hook', lines: ['For a thousand years,', 'no army ever stormed', 'these walls.']},
    hideCaptions: true,
  },
  {
    text: 'Constantinople. Capital of the Roman Empire in the East.',
    scene: {
      type: 'map',
      camera: {from: {x: 600, y: 480, zoom: 1.7}, to: CITY},
      walls: 'show',
      labels: ['city', 'hagia', 'horn', 'galata', 'bosphorus', 'marmara', 'thrace', 'anatolia'],
    },
    flash: true,
  },
  {
    text: 'In 413, Emperor Theodosius the Second began a barrier across the only land approach to the city.',
    scene: {
      type: 'map',
      camera: {from: CITY, to: WALLS},
      walls: 'draw',
      wallsAt: 0.35,
      labels: ['city', 'thrace', 'walls'],
      stamp: {year: '413', caption: 'Theodosius II'},
    },
  },
  {text: 'Not one wall. Three lines of defence.', scene: {type: 'section', level: 0}, flash: true},
  {text: 'First, a moat, about twenty metres wide.', scene: {type: 'section', level: 1}},
  {text: 'Then an outer wall.', scene: {type: 'section', level: 2}},
  {text: 'Then the inner wall: twelve metres high, with ninety-six towers.', scene: {type: 'section', level: 3}},
  {
    text: 'Avars. Persians. Arabs. Bulgars.',
    scene: {
      type: 'map',
      camera: {from: {x: 160, y: 530, zoom: 1.8}, to: {x: 180, y: 530, zoom: 2.0}},
      walls: 'show',
      labels: ['thrace'],
      arrows: [
        {from: [40, 340], to: [228, 380], label: 'AVARS', word: 0, result: 'repelled', bend: 0.12},
        {from: [50, 470], to: [222, 470], label: 'PERSIANS', word: 1, result: 'repelled', bend: -0.08},
        {from: [40, 600], to: [204, 600], label: 'ARABS', word: 2, result: 'repelled', bend: 0.1},
        {from: [40, 720], to: [196, 690], label: 'BULGARS', word: 3, result: 'repelled', bend: -0.12},
      ],
    },
    hold: 0.4,
  },
  {
    text: 'They all came. They all failed.',
    scene: {type: 'statement', lines: ['They all came.', 'They all failed.'], seal: 'REPELLED'},
    hideCaptions: true,
    flash: true,
  },
  {
    text: 'In 1204, Crusaders did take the city — but from the sea, not through these walls.',
    scene: {
      type: 'map',
      camera: {from: {x: 600, y: 420, zoom: 1.5}, to: {x: 470, y: 400, zoom: 1.9}},
      walls: 'show',
      labels: ['horn', 'galata', 'city'],
      arrows: [{from: [860, 430], to: [330, 322], label: 'CRUSADER FLEET', at: 0.3, result: 'breach', bend: -0.06}],
      stamp: {year: '1204', caption: 'The Fourth Crusade'},
    },
  },
  {
    text: 'By 1453, these walls had stood for over a thousand years.',
    scene: {type: 'counter', from: 413, to: 1453, caption: '1,040 YEARS'},
  },
  {
    text: 'And the people behind them believed they always would.',
    scene: {
      type: 'map',
      camera: {from: {x: 420, y: 520, zoom: 1.5}, to: {x: 520, y: 520, zoom: 1.05}},
      walls: 'glow',
      labels: ['city', 'walls', 'hagia'],
      dusk: true,
    },
  },
  {
    text: 'But in 1451, a teenager became sultan.',
    scene: {type: 'yearSlam', year: '1451', caption: 'A TEENAGER BECOMES SULTAN'},
    hideCaptions: true,
    flash: true,
  },
  {
    text: 'And he wanted these walls.',
    scene: {
      type: 'end',
      line: 'And he wanted these walls.',
      series: 'The Fall of Constantinople · I',
      next: 'The Empire That Was Just a City',
    },
    hideCaptions: true,
    hold: 3.2,
  },
];
