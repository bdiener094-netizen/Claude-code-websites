import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C} from '../brand';

const noise = (freq: number, octaves: number, seed: number, size = 420) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

const BLOTCHES = noise(0.006, 4, 7, 1100);
const FIBRES = noise(0.55, 3, 3);
const GRAIN = noise(0.85, 2, 11, 300);

// Aged-paper look: stains, fibres and burnt edges. Lay it over any light scene.
export const ParchmentOverlay: React.FC<{strength?: number}> = ({strength = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{backgroundImage: BLOTCHES, backgroundSize: '1100px 1100px', mixBlendMode: 'multiply', opacity: 0.42 * strength}} />
    <AbsoluteFill style={{backgroundImage: FIBRES, mixBlendMode: 'multiply', opacity: 0.22 * strength}} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 60% at 50% 48%, transparent 55%, rgba(80,45,15,0.45) 85%, rgba(30,15,5,0.85) 100%)`,
        opacity: strength,
      }}
    />
  </AbsoluteFill>
);

export const Parchment: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.parchment}}>
    {children}
    <ParchmentOverlay />
  </AbsoluteFill>
);

// Moving film grain + gentle exposure flicker, applied over the whole video.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 300);
  const y = Math.floor(random(`gy${frame}`) * 300);
  const flicker = 0.035 * random(`f${frame}`);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundImage: GRAIN, backgroundPosition: `${x}px ${y}px`, mixBlendMode: 'overlay', opacity: 0.28}} />
      <AbsoluteFill style={{background: '#000', opacity: flicker}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{amount?: number}> = ({amount = 0.55}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 80% 65% at 50% 45%, transparent 50%, rgba(0,0,0,${amount}) 100%)`,
    }}
  />
);
