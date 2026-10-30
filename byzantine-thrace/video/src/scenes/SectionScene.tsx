import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../brand';
import {Parchment} from '../components/Texture';

// Schematic cross-section of the triple defence: moat → outer wall → inner wall.
// Each narration line raises one more layer; earlier layers are already built.
const GROUND = 1060;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Label: React.FC<{x: number; y: number; title: string; sub?: string; show: number}> = ({x, y, title, sub, show}) => (
  <g opacity={show} transform={`translate(0 ${(1 - show) * 14})`}>
    <text x={x} y={y} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={44} fill={C.ink} letterSpacing={3}>
      {title}
    </text>
    {sub && (
      <text x={x} y={y + 42} textAnchor="middle" fontFamily={F.map} fontStyle="italic" fontSize={34} fill={C.inkSoft}>
        {sub}
      </text>
    )}
  </g>
);

export const SectionScene: React.FC<{level: 0 | 1 | 2 | 3; duration: number}> = ({level, duration}) => {
  const frame = useCurrentFrame();
  const rise = (n: number) =>
    level > n ? 1 : level === n ? interpolate(frame, [3, 20], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.2))}) : 0;
  const label = (n: number) => (level > n ? 1 : level === n ? interpolate(frame, [14, 24], [0, 1], clamp) : 0);
  const push = interpolate(frame, [0, duration], [1, 1.04]);
  const ghost = {fill: 'none', stroke: C.inkSoft, strokeWidth: 3, strokeDasharray: '12 10', opacity: 0.5};

  const moat = rise(1);
  const outer = rise(2);
  const inner = rise(3);

  return (
    <Parchment>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 55%'}}>
        <svg width={1080} height={1920}>
          <defs>
            <pattern id="stone" width="64" height="72" patternUnits="userSpaceOnUse">
              <rect width="64" height="72" fill={C.stone} />
              <path d="M0,14 H64 M0,28 H64 M0,42 H64 M32,0 V14 M0,14 V28 M32,28 V42 M0,42 V56" stroke={C.inkSoft} strokeWidth="1.5" opacity="0.5" />
              <rect y="56" width="64" height="16" fill={C.brick} />
              <path d="M0,64 H64" stroke="#5c2c1c" strokeWidth="1.2" />
            </pattern>
            <pattern id="earth" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="22" height="22" fill={C.parchmentDeep} />
              <line x1="0" y1="0" x2="0" y2="22" stroke={C.inkSoft} strokeWidth="1.4" opacity="0.45" />
            </pattern>
          </defs>

          <text x={540} y={250} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={66} fill={C.ink} letterSpacing={4}>
            THREE LINES
          </text>
          <text x={540} y={306} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={40} fill={C.blood} letterSpacing={10}>
            OF DEFENCE
          </text>

          <text x={60} y={GROUND - 170} fontFamily={F.map} fontStyle="italic" fontSize={32} fill={C.inkSoft}>
            ← outside
          </text>
          <text x={1020} y={GROUND - 170} textAnchor="end" fontFamily={F.map} fontStyle="italic" fontSize={32} fill={C.inkSoft}>
            the city →
          </text>

          {/* ground */}
          <path d={`M 0,${GROUND} H 60 L 92,1200 H 300 L 330,${GROUND} H 1080 V 1250 H 0 Z`} fill="url(#earth)" stroke={C.ink} strokeWidth={4} />

          {/* ghosts of what is still to come */}
          {level < 1 && <path d={`M 60,${GROUND} L 92,1200 H 300 L 330,${GROUND}`} {...ghost} />}
          {level < 2 && <rect x={468} y={GROUND - 300} width={56} height={300} {...ghost} />}
          {level < 3 && <rect x={722} y={GROUND - 440} width={84} height={440} {...ghost} />}

          {/* 1 · moat with breastwork */}
          <g opacity={Math.min(1, moat * 1.5)}>
            <path
              d={`M 70,${GROUND + 50 + (1 - moat) * 90} L 92,1200 H 300 L 320,${GROUND + 50 + (1 - moat) * 90} Z`}
              fill="#9c865e"
              stroke={C.ink}
              strokeWidth={3}
            />
            <path d={`M 90,${GROUND + 70} q 20,-10 40,0 t 40,0 t 40,0 t 40,0 t 40,0`} fill="none" stroke={C.parchment} strokeWidth={3} opacity={0.6 * moat} />
            <rect x={330} y={GROUND - 54 * moat} width={24} height={54 * moat} fill="url(#stone)" stroke={C.ink} strokeWidth={3} />
          </g>

          {/* 2 · outer wall, tower behind */}
          <g transform={`translate(0 ${GROUND}) scale(1 ${outer}) translate(0 ${-GROUND})`}>
            <rect x={440} y={GROUND - 370} width={112} height={370} fill={C.parchmentDeep} stroke={C.ink} strokeWidth={3} opacity={0.75} />
            <rect x={468} y={GROUND - 300} width={56} height={300} fill="url(#stone)" stroke={C.ink} strokeWidth={4} />
            <path d={`M 468,${GROUND - 300} v -22 h 14 v 22 h 14 v -22 h 14 v 22 h 14 v -22 h 0`} fill={C.stone} stroke={C.ink} strokeWidth={3} />
          </g>

          {/* 3 · inner wall, tall tower behind */}
          <g transform={`translate(0 ${GROUND}) scale(1 ${inner}) translate(0 ${-GROUND})`}>
            <rect x={690} y={GROUND - 600} width={148} height={600} fill={C.parchmentDeep} stroke={C.ink} strokeWidth={3} opacity={0.75} />
            <rect x={722} y={GROUND - 440} width={84} height={440} fill="url(#stone)" stroke={C.ink} strokeWidth={4} />
            <path
              d={`M 722,${GROUND - 440} v -26 h 17 v 26 h 17 v -26 h 17 v 26 h 17 v -26 h 16 v 26`}
              fill={C.stone}
              stroke={C.ink}
              strokeWidth={3}
            />
          </g>

          <Label x={196} y={GROUND - 66} title="MOAT" sub="≈ 20 m wide" show={label(1)} />
          <Label x={496} y={GROUND - 420} title="OUTER" sub="wall" show={label(2)} />
          <Label x={764} y={GROUND - 650} title="INNER WALL" sub="≈ 12 m · 96 towers" show={label(3)} />
        </svg>
      </AbsoluteFill>
    </Parchment>
  );
};
