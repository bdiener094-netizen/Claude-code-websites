import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../brand';
import {Seal} from '../components/Brand';
import {Grain, Vignette} from '../components/Texture';
import {Embers, WallSilhouette} from '../components/Walls';
import {MapScene} from '../scenes/MapScene';

// 1280×720 YouTube thumbnails. Few words, huge type: they must read at phone-feed size.

const Big: React.FC<{children: React.ReactNode; size: number; color: string; glow: string}> = ({children, size, color, glow}) => (
  <div
    style={{
      fontFamily: F.display,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.9,
      color,
      textShadow: `0 0 50px ${glow}, 0 0 3px #1a0705, 0 8px 0 #000, 0 14px 30px rgba(0,0,0,0.9)`,
    }}
  >
    {children}
  </div>
);

// A: burning walls, "1453 / THE END OF ROME"
export const ThumbFire: React.FC = () => (
  <AbsoluteFill>
    <WallSilhouette sky={['#7a1a0c', '#140505']} rim="#ff7a3c" push={0.05} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 72% 30%, rgba(255,150,60,0.55), transparent 55%)', mixBlendMode: 'screen'}} />
    <Embers count={90} color="#ffb070" />
    <AbsoluteFill style={{padding: '46px 60px', justifyContent: 'flex-start'}}>
      <Big size={300} color={C.goldBright} glow="rgba(255,190,90,0.6)">
        1453
      </Big>
      <div style={{marginTop: 18, display: 'inline-flex'}}>
        <div style={{background: '#b3201b', padding: '10px 26px 14px', fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.cream, letterSpacing: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.7)'}}>
          THE END OF ROME
        </div>
      </div>
    </AbsoluteFill>
    <div style={{position: 'absolute', right: 40, top: 34}}>
      <Seal size={120} color={C.goldBright} />
    </div>
    <Vignette amount={0.5} />
    <Grain />
  </AbsoluteFill>
);

// B: the map, the army at the walls, "1453 / 53 DAYS"
export const ThumbMap: React.FC = () => (
  <AbsoluteFill>
    <MapScene
      spec={{
        type: 'map',
        camera: {from: {x: 330, y: 520, zoom: 1.25}, to: {x: 330, y: 520, zoom: 1.25}},
        walls: 'glow',
        arrows: [330, 420, 510, 600, 690].map((y, i) => ({from: [-140, y + 20] as [number, number], to: [238 - (y - 300) / 9, y] as [number, number], at: 0, result: 'breach' as const, bend: i % 2 ? 0.06 : -0.06})),
      }}
      duration={60}
      words={[]}
    />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0) 40%, rgba(15,5,5,0.88) 70%)'}} />
    <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'center', paddingRight: 60, gap: 10}}>
      <Big size={250} color={C.goldBright} glow="rgba(255,190,90,0.5)">
        1453
      </Big>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, color: '#e0332b', textShadow: '0 6px 0 #000, 0 12px 26px #000'}}>53 DAYS</div>
    </AbsoluteFill>
    <Vignette amount={0.45} />
  </AbsoluteFill>
);
