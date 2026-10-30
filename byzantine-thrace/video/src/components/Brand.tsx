import React from 'react';
import {C, F} from '../brand';

// Imperial seal: double gold ring, legend around the edge, ΒΘ monogram in the centre.
export const Seal: React.FC<{size: number; color?: string}> = ({size, color = C.gold}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <path id="ring" d="M 100,100 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
    </defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="100" cy="100" r="86" fill="none" stroke={color} strokeWidth="1.5" />
    <circle cx="100" cy="100" r="56" fill="none" stroke={color} strokeWidth="1.5" />
    <text fontFamily={F.display} fontWeight={700} fontSize="17" letterSpacing="4" fill={color}>
      <textPath href="#ring" startOffset="0">
        BYZANTINE ✦ THRACE ✦ MCDLIII ✦
      </textPath>
    </text>
    <text x="100" y="118" textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize="54" fill={color}>
      ΒΘ
    </text>
  </svg>
);

// Channel mark, top of frame (clear of the Shorts UI).
export const Watermark: React.FC = () => (
  <div style={{position: 'absolute', top: 92, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: 0.9}}>
    <Seal size={58} />
    <div
      style={{
        fontFamily: F.display,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: 9,
        color: C.goldBright,
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
      }}
    >
      BYZANTINE THRACE
    </div>
  </div>
);
