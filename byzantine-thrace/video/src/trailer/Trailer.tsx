import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import score from '../../public/music/trailer-hits.json';
import {C, F, FONT_CHECKS} from '../brand';
import {Seal} from '../components/Brand';
import {Grain, Parchment, Vignette} from '../components/Texture';
import {Embers, WallSilhouette} from '../components/Walls';
import {MapScene} from '../scenes/MapScene';
import type {SceneSpec} from '../scenes/types';

// 16:9 series trailer. Every cut sits on the beat grid of the coded score
// (scripts/trailer_music.py, 140 BPM); flashes and shakes come from its hit list.

type MapSpec = Extract<SceneSpec, {type: 'map'}>;
type Bg = 'night' | 'blood' | 'parchment' | 'walls' | 'fire' | 'cannon' | 'eclipse' | 'black';
type Shot = {
  beat: number;
  beats: number;
  bg?: Bg;
  map?: MapSpec;
  lines?: string[];
  accent?: number; // index of the line drawn in red
  size?: number;
  glow?: boolean;
  counter?: [number, number];
  zoom?: number; // push-in over the shot
};

const BEAT_SEC = 60 / score.bpm;
export const TRAILER_FPS = 30;
const fb = (beat: number) => Math.round(beat * BEAT_SEC * TRAILER_FPS);
export const TRAILER_FRAMES = fb(score.beats) + 20;

const WALLS = {x: 230, y: 530, zoom: 1.6};

const SHOTS: Shot[] = [
  // Intro: slow, ominous
  {beat: 0, beats: 8, bg: 'night', lines: ['BYZANTINE THRACE', 'PRESENTS'], size: 70, zoom: 0.08},
  {beat: 8, beats: 4, bg: 'walls', lines: ['FOR A THOUSAND YEARS'], size: 92},
  {
    beat: 12,
    beats: 4,
    map: {type: 'map', camera: {from: {x: 600, y: 470, zoom: 1.5}, to: {x: 560, y: 500, zoom: 1.05}}, walls: 'show', labels: ['city', 'horn', 'galata', 'bosphorus', 'marmara']},
    lines: ['ONE CITY STOOD'],
  },
  // Strings enter: a cut every bar
  {
    beat: 16,
    beats: 4,
    map: {type: 'map', camera: {from: {x: 520, y: 520, zoom: 1.1}, to: WALLS}, walls: 'draw', wallsAt: 0.05, labels: ['thrace', 'walls'], stamp: {year: '413', caption: 'Theodosius II'}},
  },
  {beat: 20, beats: 4, bg: 'parchment', lines: ['THREE LINES', 'OF WALLS'], size: 120},
  {
    beat: 24,
    beats: 4,
    map: {
      type: 'map',
      camera: {from: {x: 170, y: 530, zoom: 1.5}, to: {x: 190, y: 530, zoom: 1.7}},
      walls: 'show',
      arrows: [
        {from: [-60, 340], to: [228, 380], label: 'AVARS', at: 0, result: 'repelled'},
        {from: [-80, 470], to: [222, 470], label: 'PERSIANS', at: 0.15, result: 'repelled', bend: -0.08},
        {from: [-60, 600], to: [204, 600], label: 'ARABS', at: 0.3, result: 'repelled'},
        {from: [-40, 720], to: [196, 690], label: 'BULGARS', at: 0.45, result: 'repelled', bend: -0.12},
      ],
    },
  },
  {beat: 28, beats: 4, bg: 'night', lines: ['NONE', 'GOT THROUGH'], accent: 1, size: 130},
  {beat: 32, beats: 4, bg: 'parchment', counter: [413, 1453]},
  {beat: 36, beats: 4, bg: 'black', lines: ['1453'], size: 300},
  {beat: 40, beats: 4, bg: 'fire', lines: ['THEN CAME', 'A SULTAN OF 21'], accent: 1, size: 110},
  {beat: 44, beats: 4, bg: 'night', lines: ['AND HE WANTED', 'THE WALLS'], size: 110},
  // Climax: a cut every two beats
  {
    beat: 48,
    beats: 2,
    map: {
      type: 'map',
      camera: {from: {x: 120, y: 530, zoom: 1.4}, to: {x: 160, y: 530, zoom: 1.6}},
      walls: 'show',
      arrows: [300, 380, 460, 540, 620, 700].map((y, i) => ({from: [-260, y + 40 - i * 10] as [number, number], to: [236 - (y - 300) / 9, y] as [number, number], at: i * 0.06, result: 'breach' as const, bend: 0.04})),
    },
    lines: ['AN EMPIRE AT THE GATES'],
  },
  {beat: 50, beats: 2, bg: 'night', lines: ['ABOUT 7,000', 'DEFENDERS'], size: 130},
  {beat: 52, beats: 2, bg: 'cannon', lines: ['THE GREAT BOMBARD'], size: 110},
  {
    beat: 54,
    beats: 2,
    map: {type: 'map', camera: {from: {x: 770, y: 405, zoom: 4.2}, to: {x: 755, y: 410, zoom: 4.6}}, chain: true, labels: ['galata']},
    lines: ['ONE CHAIN', 'ACROSS THE HARBOUR'],
  },
  {
    beat: 56,
    beats: 2,
    map: {
      type: 'map',
      camera: {from: {x: 720, y: 320, zoom: 2.0}, to: {x: 690, y: 330, zoom: 2.3}},
      labels: ['galata', 'horn'],
      arrows: [{from: [890, 240], to: [560, 352], at: 0, result: 'breach', bend: 0.35}],
    },
    lines: ['SHIPS OVER A HILL'],
  },
  {beat: 58, beats: 2, bg: 'blood', lines: ['53 DAYS'], size: 230},
  {beat: 60, beats: 2, bg: 'eclipse', lines: ['THE MOON', 'WENT DARK'], size: 110},
  {
    beat: 62,
    beats: 2,
    map: {type: 'map', camera: {from: {x: 736, y: 466, zoom: 3.2}, to: {x: 736, y: 466, zoom: 4.0}}, labels: ['hagia'], dusk: true},
    glow: true,
    lines: ['THE LAST PRAYER'],
  },
  {beat: 64, beats: 2, bg: 'fire', lines: ['THE LAST', 'EMPEROR'], accent: 1, size: 140},
  {beat: 66, beats: 2, bg: 'night', lines: ['29 MAY 1453'], size: 150},
  {
    beat: 68,
    beats: 2,
    map: {type: 'map', camera: {from: {x: 520, y: 520, zoom: 1.4}, to: {x: 540, y: 510, zoom: 1.1}}, walls: 'glow', labels: ['city'], dusk: true},
    lines: ['THE QUEEN OF CITIES'],
  },
  {beat: 70, beats: 2, bg: 'blood', lines: ['ONE LAST NIGHT'], size: 150},
  // Word-per-beat slam
  {beat: 72, beats: 1, bg: 'black', lines: ['THE'], size: 260},
  {beat: 73, beats: 1, bg: 'blood', lines: ['END'], size: 300},
  {beat: 74, beats: 1, bg: 'black', lines: ['OF'], size: 260},
  {beat: 75, beats: 1, bg: 'blood', lines: ['ROME'], size: 320},
  // Riser, then a beat of black silence
  {beat: 76, beats: 7, bg: 'fire', zoom: 0.35},
  {beat: 83, beats: 1, bg: 'black'},
  // Drop
  {beat: 84, beats: 12, bg: 'fire', lines: ['THE FALL OF', 'CONSTANTINOPLE'], size: 150, zoom: 0.06},
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Background: React.FC<{bg: Bg; dur: number; zoom: number}> = ({bg, dur, zoom}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const push = interpolate(frame, [0, dur], [0, zoom], {...clamp, easing: Easing.in(Easing.quad)});
  switch (bg) {
    case 'night':
      return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${C.porphyry} 0%, ${C.night} 70%)`}} />;
    case 'blood':
      return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #5c1210 0%, #120404 75%)`}} />;
    case 'black':
      return <AbsoluteFill style={{background: '#000'}} />;
    case 'parchment':
      return <Parchment />;
    case 'walls':
      return <WallSilhouette sky={[C.porphyry, '#120808']} push={push} />;
    case 'fire':
      return (
        <AbsoluteFill>
          <WallSilhouette sky={['#4a0f0a', '#0a0404']} rim={C.blood} push={push} />
          <Embers count={70} color="#e8643c" />
        </AbsoluteFill>
      );
    case 'cannon': {
      const burst = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
      return (
        <AbsoluteFill style={{background: '#050202'}}>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 18% 60%, rgba(255,250,220,${1 - burst * 0.7}) 0%, rgba(255,140,40,${0.9 - burst * 0.5}) ${8 + burst * 22}%, rgba(120,20,10,0.5) ${20 + burst * 35}%, transparent ${35 + burst * 40}%)`,
            }}
          />
          {Array.from({length: 40}).map((_, i) => {
            const a = (random(`a${i}`) - 0.5) * 1.6;
            const v = 25 + random(`v${i}`) * 40;
            const x = width * 0.18 + Math.cos(a) * v * frame;
            const y = height * 0.6 + Math.sin(a) * v * frame * 0.6 + 0.8 * frame * frame;
            return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 3, background: C.goldBright, boxShadow: `0 0 12px ${C.goldBright}`, transform: `rotate(${a}rad)`}} />;
          })}
        </AbsoluteFill>
      );
    }
    case 'eclipse': {
      const cover = interpolate(frame, [0, dur], [0.15, 0.85], clamp);
      const r = height * 0.16;
      return (
        <AbsoluteFill style={{background: `linear-gradient(180deg, #08060c, #150a10)`}}>
          <div style={{position: 'absolute', left: width / 2 - r, top: height * 0.2, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 40% 40%, #fff6e0, #d9b98a)`, boxShadow: `0 0 120px rgba(255,230,190,${0.6 - cover * 0.4})`}} />
          <div style={{position: 'absolute', left: width / 2 - r + (1 - cover) * r * 2.2, top: height * 0.2 - 6, width: r * 2 + 12, height: r * 2 + 12, borderRadius: '50%', background: 'radial-gradient(circle, #1a0606 60%, rgba(60,10,10,0.9))'}} />
        </AbsoluteFill>
      );
    }
  }
};

type Place = 'center' | 'top' | 'bottom';

const Title: React.FC<{lines: string[]; accent?: number; size: number; onMap: boolean; place: Place; dur: number}> = ({lines, accent, size, onMap, place, dur}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const drift = interpolate(frame, [0, dur], [1, 1.04]);
  return (
    <AbsoluteFill
      style={{
        justifyContent: place === 'top' ? 'flex-start' : place === 'bottom' ? 'flex-end' : 'center',
        paddingTop: place === 'top' ? 200 : 0,
        paddingBottom: place === 'bottom' ? 180 : 0,
        alignItems: 'center',
        gap: size * 0.08,
        transform: `scale(${(1.18 - t * 0.18) * drift})`, opacity: t, filter: `blur(${(1 - t) * 10}px)`,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: size * 0.06 + (1 - t) * 24,
            textAlign: 'center',
            color: i === accent ? '#d8352d' : onMap ? C.ink : C.cream,
            textShadow: onMap ? `0 0 18px ${C.parchment}, 0 0 40px ${C.parchment}` : `0 0 40px rgba(0,0,0,0.9), 0 6px 24px #000`,
          }}
        >
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Counter: React.FC<{range: [number, number]; dur: number}> = ({range, dur}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur * 0.8], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: F.map, fontStyle: 'italic', fontSize: 50, color: C.inkSoft}}>Anno Domini</div>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 280, lineHeight: 1, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>
        {Math.round(range[0] + (range[1] - range[0]) * t)}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sub = interpolate(frame, [18, 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${C.porphyry} 0%, #050303 70%)`, justifyContent: 'center', alignItems: 'center', gap: 22}}>
      <Embers count={30} />
      <div style={{opacity: t, transform: `scale(${0.85 + t * 0.15}) rotate(${(1 - t) * -25}deg)`}}>
        <Seal size={220} />
      </div>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, letterSpacing: 16, color: C.goldBright, opacity: t}}>BYZANTINE THRACE</div>
      <div style={{fontFamily: F.map, fontStyle: 'italic', fontSize: 46, color: C.cream, opacity: sub}}>The Fall of Constantinople · a 40-part series</div>
      <div style={{marginTop: 26, padding: '14px 46px', border: `3px solid ${C.gold}`, fontFamily: F.display, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: C.gold, opacity: sub}}>
        SUBSCRIBE
      </div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{shot: Shot; dur: number}> = ({shot, dur}) => {
  const frame = useCurrentFrame();
  const onMap = Boolean(shot.map) || shot.bg === 'parchment';
  const place: Place = shot.map ? 'bottom' : shot.bg === 'walls' || shot.bg === 'fire' ? 'top' : 'center';
  return (
    <AbsoluteFill>
      {shot.map ? <MapScene spec={shot.map} duration={dur} words={[]} /> : <Background bg={shot.bg ?? 'black'} dur={dur} zoom={shot.zoom ?? 0.05} />}
      {shot.glow && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(243,210,126,${0.55 + 0.2 * Math.sin(frame / 3)}) 0%, transparent 30%)`, mixBlendMode: 'screen'}} />
      )}
      {shot.counter && <Counter range={shot.counter} dur={dur} />}
      {shot.lines && <Title lines={shot.lines} accent={shot.accent} size={shot.map ? Math.min(shot.size ?? 84, 84) : shot.size ?? 100} onMap={onMap} place={place} dur={dur} />}
    </AbsoluteFill>
  );
};

// Shake, zoom punch and flash driven by the score's hit list.
const useImpact = () => {
  const frame = useCurrentFrame();
  let env = 0;
  let flash = 0;
  for (const h of score.hits) {
    const d = frame - fb(h.beat);
    if (d >= 0 && d < 30) {
      env += h.strength * Math.exp(-d / 4.5);
      if (h.strength >= 0.95) flash = Math.max(flash, (h.strength - 0.5) * Math.exp(-d / 2.5));
    }
  }
  return {env: Math.min(env, 1.8), flash: Math.min(flash, 0.9), frame};
};

const BARS = 138; // 2.39:1 letterbox inside 16:9

export const Trailer: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading brand fonts'));
  useEffect(() => {
    Promise.all(FONT_CHECKS.map((f) => document.fonts.load(f))).then(() => continueRender(handle));
  }, [handle]);
  const {env, flash, frame} = useImpact();
  const shakeX = env * 16 * Math.sin(frame * 2.7);
  const shakeY = env * 11 * Math.cos(frame * 1.9);
  const endAt = fb(96);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${1.03 + env * 0.03})`}}>
        {SHOTS.map((s, i) => {
          const from = fb(s.beat);
          const dur = fb(s.beat + s.beats) - from;
          return (
            <Sequence key={i} from={from} durationInFrames={dur} name={`${s.beat} ${s.lines?.join(' ') ?? s.bg ?? 'map'}`}>
              <Shot shot={s} dur={dur} />
            </Sequence>
          );
        })}
        <Sequence from={endAt}>
          <EndCard />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.goldBright, opacity: flash, mixBlendMode: 'screen'}} />
      <Vignette amount={0.6} />
      <Grain />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: BARS, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: BARS, background: '#000'}} />
      <Audio src={staticFile('music/trailer.wav')} />
    </AbsoluteFill>
  );
};
