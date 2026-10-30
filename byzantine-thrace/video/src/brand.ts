import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/eb-garamond/600.css';
import '@fontsource/eb-garamond/700.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';

// ByzantineThrace brand system. Every scene pulls its name, colours and type from here.

export const BRAND = {
  name: 'ByzantineThrace', // one word; Cinzel renders the lower case as small caps, so B and T stand tall
  handle: '@ByzantineThrace',
  sealText: 'ByzantineThrace ✦ MCDLIII ✦ ', // MCDLIII = 1453
};

export const C = {
  night: '#0c0807', // backgrounds
  ink: '#24170f', // map lines, manuscript text
  inkSoft: '#5a4530',
  parchment: '#ead9b2',
  parchmentDeep: '#d2ba8a',
  sea: '#c7b083',
  stone: '#b9a47c',
  brick: '#8a4a32', // Theodosian brick courses
  gold: '#d4a84b', // imperial accent
  goldBright: '#f3d27e',
  porphyry: '#4a1b3d', // imperial purple
  blood: '#9e231f', // enemies, danger
  cream: '#f6ecd6', // caption text
};

export const F = {
  display: '"Cinzel", serif', // titles, captions, labels
  body: '"EB Garamond", serif', // Greek monogram, secondary text
  map: '"IM Fell English", serif', // hand-lettered map labels
};

export const FONT_CHECKS = [
  '700 40px Cinzel',
  '900 40px Cinzel',
  '700 40px "EB Garamond"',
  '400 40px "IM Fell English"',
  'italic 400 40px "IM Fell English"',
];

export const W = 1080;
export const H = 1920;
export const FPS = 30;
