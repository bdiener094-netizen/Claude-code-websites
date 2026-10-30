import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../brand';
import {Handle, Seal, Wordmark} from '../components/Brand';
import {Parchment} from '../components/Texture';
import {Embers, WallSilhouette} from '../components/Walls';
import type {TimedWord} from '../timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Frame at which each typographic line starts, matched to the narration words.
const lineStarts = (lines: string[], words: TimedWord[]) => {
  let idx = 0;
  return lines.map((line) => {
    const start = words[idx]?.start ?? 0;
    idx += line.split(/\s+/).filter(Boolean).length;
    return start;
  });
};

const Reveal: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * 34}px)`, filter: `blur(${(1 - t) * 8}px)`, ...style}}>{children}</div>;
};

export const HookScene: React.FC<{lines: string[]; duration: number; words: TimedWord[]}> = ({lines, duration, words}) => {
  const frame = useCurrentFrame();
  const starts = lineStarts(lines, words);
  const push = interpolate(frame, [0, duration], [0, 0.08]);
  return (
    <AbsoluteFill>
      <WallSilhouette sky={[C.porphyry, '#120808']} push={push} />
      <Embers count={36} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 520, gap: 10, padding: '0 50px 520px'}}>
        {lines.map((line, i) => {
          const last = i === lines.length - 1;
          return (
            <Reveal key={i} at={starts[i]}>
              <div
                style={{
                  fontFamily: F.display,
                  fontWeight: 900,
                  fontSize: last ? 124 : 58,
                  letterSpacing: last ? 6 : 2,
                  color: last ? C.goldBright : C.cream,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  textShadow: last ? `0 0 40px rgba(243,210,126,0.45), 0 6px 20px #000` : '0 6px 20px #000',
                }}
              >
                {line}
              </div>
            </Reveal>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const StatementScene: React.FC<{lines: string[]; seal?: string; duration: number; words: TimedWord[]}> = ({lines, seal, duration, words}) => {
  const frame = useCurrentFrame();
  const starts = lineStarts(lines, words);
  const stampAt = starts[starts.length - 1] + 4;
  const stamp = interpolate(frame, [stampAt, stampAt + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const shake = frame >= stampAt && frame < stampAt + 6 ? Math.sin(frame * 9) * 8 : 0;
  const push = interpolate(frame, [0, duration], [1, 1.05]);
  return (
    <AbsoluteFill style={{background: C.night, transform: `translateX(${shake}px)`}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${C.porphyry} 0%, ${C.night} 70%)`, opacity: 0.8}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26, paddingBottom: 240, transform: `scale(${push})`}}>
        {lines.map((line, i) => (
          <Reveal key={i} at={starts[i]}>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 104,
                textAlign: 'center',
                color: i === lines.length - 1 ? C.blood : C.cream,
                textShadow: '0 8px 30px #000',
                textTransform: 'uppercase',
              }}
            >
              {line}
            </div>
          </Reveal>
        ))}
        {seal && (
          <div
            style={{
              marginTop: 40,
              opacity: stamp,
              transform: `rotate(-9deg) scale(${2.2 - stamp * 1.2})`,
              border: `8px solid ${C.blood}`,
              padding: '10px 36px',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: 10,
              color: C.blood,
              mixBlendMode: 'screen',
            }}
          >
            {seal}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CounterScene: React.FC<{from: number; to: number; caption: string; duration: number}> = ({from, to, caption, duration}) => {
  const frame = useCurrentFrame();
  const countEnd = Math.round(duration * 0.62);
  const t = interpolate(frame, [4, countEnd], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const year = Math.round(from + (to - from) * t);
  const done = interpolate(frame, [countEnd, countEnd + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const sieges = [
    {year: 626, label: 'Avars & Persians'},
    {year: 717, label: 'Arabs'},
    {year: 813, label: 'Bulgars'},
    {year: 1204, label: 'Crusaders · by sea'},
  ];
  const x = (y: number) => 120 + ((y - from) / (to - from)) * 840;
  return (
    <Parchment>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 470}}>
        <div style={{fontFamily: F.map, fontStyle: 'italic', fontSize: 44, color: C.inkSoft}}>Anno Domini</div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 250, lineHeight: 1, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>
          {year}
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 70,
            color: C.blood,
            letterSpacing: 4,
            opacity: done,
            transform: `scale(${1.6 - done * 0.6})`,
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <line x1={120} y1={1130} x2={120 + 840 * t} y2={1130} stroke={C.ink} strokeWidth={6} />
        {sieges.map((s) =>
          year >= s.year ? (
            <g key={s.year}>
              <circle cx={x(s.year)} cy={1130} r={12} fill={s.year === 1204 ? C.blood : C.ink} />
              <text x={x(s.year)} y={1186} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={26} fill={C.ink}>
                {s.year}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </Parchment>
  );
};

export const YearSlamScene: React.FC<{year: string; caption: string; duration: number}> = ({year, caption, duration}) => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sub = interpolate(frame, [12, 20], [0, 1], clamp);
  const drift = interpolate(frame, [0, duration], [1, 1.06]);
  return (
    <AbsoluteFill style={{background: '#050303'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, rgba(158,35,31,0.55), transparent 55%)`}} />
      <Embers count={30} color="#e0573a" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 300, transform: `scale(${drift})`}}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 330,
            lineHeight: 1,
            color: C.goldBright,
            transform: `scale(${1.5 - slam * 0.5})`,
            opacity: slam,
            filter: `blur(${(1 - slam) * 14}px)`,
            textShadow: '0 0 60px rgba(243,210,126,0.4)',
          }}
        >
          {year}
        </div>
        <div style={{marginTop: 30, fontFamily: F.display, fontWeight: 700, fontSize: 52, letterSpacing: 6, color: C.cream, opacity: sub, textAlign: 'center', padding: '0 60px'}}>
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EndScene: React.FC<{line: string; series: string; next: string; duration: number; words: TimedWord[]}> = ({line, series, next, duration, words}) => {
  const frame = useCurrentFrame();
  const cardAt = (words[words.length - 1]?.end ?? 30) + 22;
  const card = interpolate(frame, [cardAt, cardAt + 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const push = interpolate(frame, [0, duration], [0, 0.1]);
  return (
    <AbsoluteFill>
      <WallSilhouette sky={['#3d0c0a', '#0a0505']} rim={C.blood} push={push} />
      <Embers count={50} color="#e0573a" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 560, opacity: 1 - card}}>
        <Reveal at={0}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, textAlign: 'center', color: C.cream, padding: '0 70px', textShadow: '0 8px 30px #000'}}>
            {line}
          </div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(5,3,3,0.82)', opacity: card, justifyContent: 'center', alignItems: 'center', gap: 26, paddingBottom: 260}}>
        <div style={{transform: `scale(${0.8 + card * 0.2}) rotate(${(1 - card) * -20}deg)`}}>
          <Seal size={250} />
        </div>
        <Wordmark size={84} />
        <Handle size={38} />
        <div style={{fontFamily: F.map, fontStyle: 'italic', fontSize: 44, color: C.cream}}>{series}</div>
        <div style={{marginTop: 50, fontFamily: F.display, fontWeight: 700, fontSize: 32, letterSpacing: 8, color: C.gold}}>NEXT</div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.cream, textAlign: 'center', padding: '0 80px'}}>{next}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
