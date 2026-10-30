import type {SceneSpec} from './scenes/types';

export type Segment = {
  text: string; // narration as captioned on screen
  speak?: string; // how the voice should say it, when it differs (years, names)
  scene: SceneSpec;
  hideCaptions?: boolean; // scene already shows the words as typography
  flash?: boolean; // gold flash on the cut into this segment
  hold?: number; // extra seconds after the line (end cards, dramatic pauses)
};

export type TimedWord = {text: string; start: number; end: number}; // frames, relative to segment

export type TimedSegment = Segment & {from: number; duration: number; words: TimedWord[]; audio?: string};

// Output of scripts/voiceover.py: one audio file and real word timings (seconds) per line.
export type VoiceTrack = {voice: string; lines: {file: string; duration: number; words: {text: string; start: number; end: number}[]}[]};

// Fallback pace for episodes that have no voice-over generated yet.
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

const VOICED_TAIL = 0.1; // voice clips already carry a little silence at each end

export const buildTimeline = (segments: Segment[], fps: number, voice?: VoiceTrack) => {
  let cursor = 0;
  const timed: TimedSegment[] = segments.map((seg, i) => {
    const line = voice?.lines[i];
    const {words, length} = line
      ? {
          words: line.words.map((w) => ({text: w.text, start: Math.round(w.start * fps), end: Math.round(w.end * fps)})),
          length: line.duration - TAIL + VOICED_TAIL,
        }
      : estimateWords(seg.text, fps);
    const duration = Math.round((Math.max(1.3, length) + TAIL + (seg.hold ?? 0)) * fps);
    const out = {...seg, from: cursor, duration, words, audio: line?.file};
    cursor += duration;
    return out;
  });
  return {segments: timed, total: cursor};
};
