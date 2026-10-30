import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../brand';

// Silhouette of the Theodosian land walls: tall inner towers behind, low outer wall in front.
const skyline = (baseY: number, towerH: number, wallH: number, step: number, offset: number) => {
  const crenel = 18;
  let d = `M -20,1920 L -20,${baseY - wallH}`;
  for (let x = -20 + offset; x < 1120; x += step) {
    const towerL = x + step * 0.35;
    const towerR = towerL + step * 0.42;
    // wall run with crenellations
    for (let c = x; c < towerL; c += crenel * 2) {
      d += ` L ${c},${baseY - wallH} L ${c},${baseY - wallH - crenel} L ${Math.min(c + crenel, towerL)},${baseY - wallH - crenel} L ${Math.min(c + crenel, towerL)},${baseY - wallH}`;
    }
    // tower
    d += ` L ${towerL},${baseY - wallH} L ${towerL},${baseY - towerH}`;
    for (let c = towerL; c < towerR; c += crenel * 2) {
      d += ` L ${c},${baseY - towerH - crenel} L ${Math.min(c + crenel, towerR)},${baseY - towerH - crenel} L ${Math.min(c + crenel, towerR)},${baseY - towerH}`;
    }
    d += ` L ${towerR},${baseY - towerH} L ${towerR},${baseY - wallH}`;
  }
  d += ` L 1120,${baseY - wallH} L 1120,1920 Z`;
  return d;
};

const INNER = skyline(1500, 560, 420, 300, 0);
const OUTER = skyline(1620, 300, 220, 300, 150);

export const WallSilhouette: React.FC<{rim?: string; sky: [string, string]; push?: number}> = ({rim = C.gold, sky, push = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${1 + push})`, transformOrigin: '50% 85%'}}>
      <defs>
        <filter id="rimglow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d={INNER} fill="none" stroke={rim} strokeWidth="6" filter="url(#rimglow)" opacity="0.8" />
      <path d={INNER} fill="#140d0a" stroke={rim} strokeWidth="2" strokeOpacity="0.7" />
      <path d={OUTER} fill="#070403" stroke={rim} strokeWidth="1.5" strokeOpacity="0.45" />
    </svg>
  </AbsoluteFill>
);

// Drifting embers for the dark scenes.
export const Embers: React.FC<{count?: number; color?: string}> = ({count = 40, color = C.goldBright}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const speed = 1.2 + random(`s${i}`) * 2.8;
        const x0 = random(`x${i}`) * 1080;
        const y = 1950 - ((frame * speed + random(`y${i}`) * 1950) % 1950);
        const x = x0 + Math.sin((frame + i * 37) / 30) * 25;
        const size = 2 + random(`z${i}`) * 5;
        const life = interpolate(y, [0, 600, 1950], [0, 0.9, 0.5]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              opacity: life,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
