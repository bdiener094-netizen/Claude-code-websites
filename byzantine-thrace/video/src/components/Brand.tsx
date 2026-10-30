import React from 'react';
import {BRAND, C, F} from '../brand';

// Imperial seal: double gold ring, legend around the edge, ΒΘ monogram in the centre.
export const Seal: React.FC<{size: number; color?: string}> = ({size, color = C.gold}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <path id="ring" d="M 100,100 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
    </defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="100" cy="100" r="86" fill="none" stroke={color} strokeWidth="1.5" />
    <circle cx="100" cy="100" r="56" fill="none" stroke={color} strokeWidth="1.5" />
    <text fontFamily={F.display} fontWeight={700} fontSize="21" letterSpacing="3.2" fill={color}>
      <textPath href="#ring" startOffset="0" textLength="448" lengthAdjust="spacing">
        {BRAND.sealText}
      </textPath>
    </text>
    <text x="100" y="118" textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize="54" fill={color}>
      ΒΘ
    </text>
  </svg>
);

// The name as a wordmark: Cinzel, one word, tall B and T.
export const Wordmark: React.FC<{size: number; color?: string; spacing?: number; style?: React.CSSProperties}> = ({size, color = C.goldBright, spacing = 0.06, style}) => (
  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: size * spacing, color, lineHeight: 1, ...style}}>{BRAND.name}</div>
);

export const Handle: React.FC<{size: number; color?: string}> = ({size, color = C.cream}) => (
  <div style={{fontFamily: F.body, fontWeight: 600, fontSize: size, color, letterSpacing: size * 0.04}}>{BRAND.handle}</div>
);

// Channel mark, top of frame (clear of the Shorts UI).
export const Watermark: React.FC = () => (
  <div style={{position: 'absolute', top: 88, width: '100%', display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '8px 26px 8px 10px', borderRadius: 40, background: 'rgba(12,8,7,0.62)', border: `1.5px solid rgba(212,168,75,0.55)`}}>
      <Seal size={56} color={C.goldBright} />
      <Wordmark size={34} spacing={0.08} />
    </div>
  </div>
);
