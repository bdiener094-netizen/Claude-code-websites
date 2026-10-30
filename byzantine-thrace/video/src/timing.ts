import type {SceneSpec} from './scenes/types';

export type Segment = {
  text: string; // narration, exactly as the voice reads it
  scene: SceneSpec;
  hideCaptions?: boolean; // scene already shows the words as typography
  flash?: boolean; // gold flash on the cut into this segment
  hold?: number; // extra seconds after the line (end cards, dramatic pauses)
};

export type TimedWord = {text: string; start: number; end: number}; // frames, relative to segment

export type TimedSegment = Segment & {from: number; duration: number; words: TimedWord[]};

// Placeholder narration pace until real voice-over exists. When the AI voice is
// generated, replace estimateWords() with the voice's word-level timestamps.
const WORDS_PER_SEC = 2.5;
const PAUSE = {'.': 0.38, ':': 0.3, ',': 0.16, '—': 0.22} as Record<string, number>;
const TAIL = 0.3;

const estimateWords = (text: string, fps: number): {words: TimedWord[]; length: number} => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const words: TimedWord[] = [];
  let t = 0;
  for (const token of tokens) {
    const letters = token.replace(/[^\p{L}\p{N}]/gu, '').length;
    const dur = Math.max(0.2, (letters / 5.2) / WORDS_PER_SEC);
    words.push({text: token, start: Math.round(t * fps), end: Math.round((t + dur) * fps)});
    t += dur + (PAUSE[token.slice(-1)] ?? 0.03);
  }
  return {words, length: t};
};

export const buildTimeline = (segments: Segment[], fps: number) => {
  let cursor = 0;
  const timed: TimedSegment[] = segments.map((seg) => {
    const {words, length} = estimateWords(seg.text, fps);
    const duration = Math.round((Math.max(1.3, length) + TAIL + (seg.hold ?? 0)) * fps);
    const out = {...seg, from: cursor, duration, words};
    cursor += duration;
    return out;
  });
  return {segments: timed, total: cursor};
};
