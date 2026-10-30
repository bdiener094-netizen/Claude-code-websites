import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../brand';
import type {TimedSegment, TimedWord} from '../timing';

const MAX_WORDS = 3;

// Crisp dark outline built from shadows (cleaner than text-stroke at this weight).
const OUTLINE = [
  ...Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * 5).toFixed(1)}px ${(Math.sin(a) * 5).toFixed(1)}px 0 #0b0705`;
  }),
  '0 8px 22px rgba(0,0,0,0.7)',
].join(', ');

// Split a line into short caption pages, breaking early on punctuation.
const paginate = (words: TimedWord[]) => {
  const pages: TimedWord[][] = [];
  let page: TimedWord[] = [];
  for (const w of words) {
    page.push(w);
    if (page.length >= MAX_WORDS || /[.,:;—!?]$/.test(w.text)) {
      pages.push(page);
      page = [];
    }
  }
  if (page.length) pages.push(page);
  return pages;
};

export const Captions: React.FC<{segments: TimedSegment[]}> = ({segments}) => {
  const frame = useCurrentFrame();
  const seg = segments.find((s) => frame >= s.from && frame < s.from + s.duration);
  if (!seg || seg.hideCaptions) return null;

  const local = frame - seg.from;
  const pages = paginate(seg.words);
  const page = [...pages].reverse().find((p) => local >= p[0].start);
  if (!page) return null;
  const pageEnd = pages.indexOf(page) === pages.length - 1 ? seg.duration : pages[pages.indexOf(page) + 1][0].start;
  if (local >= pageEnd) return null;

  const pop = interpolate(local - page[0].start, [0, 4], [0.86, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', top: 1290, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          maxWidth: 880,
          textAlign: 'center',
          transform: `scale(${pop})`,
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 70,
          lineHeight: 1.12,
          textTransform: 'uppercase',
          letterSpacing: 1,
          textShadow: OUTLINE,
        }}
      >
        {page.map((w, i) => {
          const active = local >= w.start;
          return (
            <span key={i} style={{color: active ? C.goldBright : C.cream, opacity: active ? 1 : 0.85}}>
              {w.text.replace(/[,:;]$/, '')}
              {i < page.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
