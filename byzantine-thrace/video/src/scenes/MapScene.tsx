import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../brand';
import {ParchmentOverlay} from '../components/Texture';
import {CHAIN, HAGIA_SOPHIA, LABELS, LAND, LAND_WALLS, SEA_WALLS} from '../map/constantinople';
import type {TimedWord} from '../timing';
import type {Arrow, Pt, SceneSpec} from './types';

type MapSpec = Extract<SceneSpec, {type: 'map'}>;

const ease = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const polyLength = (pts: Pt[]) => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// Towers every ~28 units along the land walls
const TOWERS: {p: Pt; at: number}[] = (() => {
  const total = polyLength(LAND_WALLS);
  const out: {p: Pt; at: number}[] = [];
  let walked = 0;
  for (let i = 1; i < LAND_WALLS.length; i++) {
    const [a, b] = [LAND_WALLS[i - 1], LAND_WALLS[i]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let d = 14; d < len; d += 28) {
      const t = d / len;
      out.push({p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], at: (walked + d) / total});
    }
    walked += len;
  }
  return out;
})();

const MapArrow: React.FC<{arrow: Arrow; start: number; k: number}> = ({arrow, start, k}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0) return null;
  const draw = interpolate(local, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const [x1, y1] = arrow.from;
  const [x2, y2] = arrow.to;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const bend = arrow.bend ?? 0.15;
  const cx = (x1 + x2) / 2 - ((y2 - y1) / len) * len * bend;
  const cy = (y1 + y2) / 2 + ((x2 - x1) / len) * len * bend;
  const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  const hit = local - 16;
  const burst = interpolate(hit, [0, 10], [0, 1], clamp);
  const settle = arrow.result === 'repelled' ? interpolate(hit, [6, 22], [1, 0.45], clamp) : 1;
  const head = 26 * k;

  return (
    <g opacity={settle}>
      <path
        d={`M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`}
        fill="none"
        stroke={C.blood}
        strokeWidth={11 * k}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
      />
      {draw >= 1 && (
        <path
          d={`M 0,0 L ${-head},${-head * 0.6} L ${-head * 0.7},0 L ${-head},${head * 0.6} Z`}
          fill={C.blood}
          transform={`translate(${x2},${y2}) rotate(${angle})`}
        />
      )}
      {hit >= 0 &&
        Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r0 = 14 * k + burst * 18 * k;
          const r1 = r0 + 22 * k * (1 - burst * 0.6);
          return (
            <line
              key={i}
              x1={x2 + Math.cos(a) * r0}
              y1={y2 + Math.sin(a) * r0}
              x2={x2 + Math.cos(a) * r1}
              y2={y2 + Math.sin(a) * r1}
              stroke={arrow.result === 'breach' ? C.blood : C.ink}
              strokeWidth={5 * k}
              opacity={1 - burst * 0.8}
            />
          );
        })}
      {arrow.result === 'breach' && hit >= 0 && (
        <circle cx={x2} cy={y2} r={(30 + 10 * Math.sin(hit / 3)) * k} fill={C.blood} opacity={0.35} />
      )}
      {arrow.label && (
        <text
          x={x1}
          y={y1 - 22 * k}
          textAnchor="middle"
          fontFamily={F.display}
          fontWeight={900}
          fontSize={40 * k}
          fill={C.blood}
          stroke={C.parchment}
          strokeWidth={8 * k}
          paintOrder="stroke"
          opacity={interpolate(local, [0, 6], [0, 1], clamp)}
        >
          {arrow.label}
        </text>
      )}
    </g>
  );
};

const Stamp: React.FC<{year: string; caption: string}> = ({year, caption}) => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [4, 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <div
      style={{
        position: 'absolute',
        top: 210,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: drop > 0 ? 1 : 0,
        transform: `translateY(${(1 - drop) * -60}px) scale(${1.3 - drop * 0.3})`,
      }}
    >
      <div
        style={{
          background: C.parchment,
          border: `4px solid ${C.gold}`,
          outline: `2px solid ${C.ink}`,
          outlineOffset: 6,
          padding: '14px 46px 18px',
          textAlign: 'center',
          boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 104, lineHeight: 1, color: C.ink}}>{year}</div>
        <div style={{fontFamily: F.map, fontStyle: 'italic', fontSize: 40, color: C.inkSoft, marginTop: 4}}>{caption}</div>
      </div>
    </div>
  );
};

export const MapScene: React.FC<{spec: MapSpec; duration: number; words: TimedWord[]}> = ({spec, duration, words}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const p = ease(Math.min(1, frame / duration));
  const {from, to} = spec.camera;
  const cam = {x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p, zoom: from.zoom + (to.zoom - from.zoom) * p};
  const vw = 1000 / cam.zoom;
  const vh = (vw * H) / W;
  const k = vw / W; // map units per screen pixel

  const wallsStart = Math.round((spec.wallsAt ?? 0.15) * duration);
  const wallDraw =
    spec.walls === 'draw' ? interpolate(frame, [wallsStart, wallsStart + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)}) : spec.walls ? 1 : 0;
  const glow = spec.walls === 'glow' ? 0.55 + 0.25 * Math.sin(frame / 8) : 0;
  const wallPts = LAND_WALLS.map((pt) => pt.join(',')).join(' ');

  const labels = spec.labels ?? [];
  const dusk = spec.dusk ? interpolate(frame, [0, duration], [0, 0.6], clamp) : 0;

  return (
    <AbsoluteFill style={{background: C.sea}}>
      <svg width={W} height={H} viewBox={`${cam.x - vw / 2} ${cam.y - vh / 2} ${vw} ${vh}`}>
        <defs>
          <pattern id="waves" width="34" height="18" patternUnits="userSpaceOnUse">
            <path d="M 2,10 q 7,-6 14,0 t 14,0" fill="none" stroke={C.inkSoft} strokeWidth="0.9" opacity="0.35" />
          </pattern>
          <filter id="wallglow" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation={10 * k} />
          </filter>
        </defs>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.sea} />
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="url(#waves)" />

        {Object.values(LAND).map((d, i) => (
          <g key={i}>
            <path d={d} fill={C.parchment} stroke={C.ink} strokeWidth={3.2 * k} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={C.inkSoft} strokeWidth={1.2 * k} opacity={0.6} transform={`translate(${5 * k},${4 * k})`} />
          </g>
        ))}

        <path d={SEA_WALLS} fill="none" stroke={C.ink} strokeWidth={3 * k} strokeDasharray={`${10 * k} ${6 * k}`} opacity={0.7} />

        {wallDraw > 0 && (
          <g>
            {glow > 0 && (
              <polyline points={wallPts} fill="none" stroke={C.goldBright} strokeWidth={34 * k} filter="url(#wallglow)" opacity={glow} />
            )}
            <polyline
              points={wallPts}
              fill="none"
              stroke={C.ink}
              strokeWidth={10 * k}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - wallDraw}
            />
            {TOWERS.filter((t) => t.at <= wallDraw).map((t, i) => (
              <rect key={i} x={t.p[0] - 7 * k} y={t.p[1] - 7 * k} width={14 * k} height={14 * k} fill={C.ink} />
            ))}
          </g>
        )}

        {spec.chain && (
          <g>
            <line
              x1={CHAIN[0][0]}
              y1={CHAIN[0][1]}
              x2={CHAIN[0][0] + (CHAIN[1][0] - CHAIN[0][0]) * interpolate(frame, [2, 14], [0, 1], clamp)}
              y2={CHAIN[0][1] + (CHAIN[1][1] - CHAIN[0][1]) * interpolate(frame, [2, 14], [0, 1], clamp)}
              stroke={C.goldBright}
              strokeWidth={16 * k}
              strokeDasharray={`${12 * k} ${6 * k}`}
              filter="url(#wallglow)"
            />
            <line
              x1={CHAIN[0][0]}
              y1={CHAIN[0][1]}
              x2={CHAIN[0][0] + (CHAIN[1][0] - CHAIN[0][0]) * interpolate(frame, [2, 14], [0, 1], clamp)}
              y2={CHAIN[0][1] + (CHAIN[1][1] - CHAIN[0][1]) * interpolate(frame, [2, 14], [0, 1], clamp)}
              stroke={C.ink}
              strokeWidth={10 * k}
              strokeDasharray={`${12 * k} ${6 * k}`}
            />
            {CHAIN.map((pt, i) => (
              <circle key={i} cx={pt[0]} cy={pt[1]} r={8 * k} fill={C.gold} stroke={C.ink} strokeWidth={2 * k} />
            ))}
          </g>
        )}

        {labels.includes('hagia') && (
          <g opacity={interpolate(frame, [6, 14], [0, 1], clamp)}>
            <circle cx={HAGIA_SOPHIA[0]} cy={HAGIA_SOPHIA[1]} r={6} fill={C.gold} stroke={C.ink} strokeWidth={1.5} />
          </g>
        )}

        {labels.map((key, i) => {
          const l = LABELS[key];
          const appear = key === 'walls' && spec.walls === 'draw' ? wallsStart + 40 : 4 + i * 3;
          return (
            <text
              key={key}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              fontFamily={F.map}
              fontStyle={l.size < 20 ? 'italic' : 'normal'}
              fontSize={l.size}
              letterSpacing={l.size > 30 ? 4 : 1}
              fill={C.ink}
              stroke={C.parchment}
              strokeWidth={l.size * 0.18}
              paintOrder="stroke"
              transform={`rotate(${l.rotate} ${l.x} ${l.y})`}
              opacity={interpolate(frame, [appear, appear + 8], [0, 1], clamp)}
            >
              {l.text}
            </text>
          );
        })}

        {(spec.arrows ?? []).map((a, i) => {
          const start = a.word !== undefined ? words[a.word]?.start ?? 0 : Math.round((a.at ?? 0) * duration);
          return <MapArrow key={i} arrow={a} start={start} k={k} />;
        })}
      </svg>

      <ParchmentOverlay strength={0.9} />
      {dusk > 0 && <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.porphyry}, #120808)`, mixBlendMode: 'multiply', opacity: dusk}} />}
      {spec.stamp && <Stamp {...spec.stamp} />}
    </AbsoluteFill>
  );
};
