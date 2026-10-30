import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_CHECKS} from './brand';
import {Watermark} from './components/Brand';
import {Captions} from './components/Captions';
import {Grain, Vignette} from './components/Texture';
import {Scene} from './scenes/Scene';
import {buildTimeline, type Segment, type TimedSegment, type VoiceTrack} from './timing';

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 7], [0.85, 0.6, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: C.goldBright, mixBlendMode: 'screen', opacity: o}} />;
};

export type EpisodeProps = {segments: Segment[]; voice?: VoiceTrack};

// Frames (absolute) where an attack arrow is launched, for whoosh effects.
const arrowFrames = (seg: TimedSegment) =>
  seg.scene.type === 'map'
    ? (seg.scene.arrows ?? []).map((a) => seg.from + (a.word !== undefined ? seg.words[a.word]?.start ?? 0 : Math.round((a.at ?? 0) * seg.duration)))
    : [];

const Soundtrack: React.FC<{timed: TimedSegment[]; total: number}> = ({timed, total}) => (
  <>
    <Audio src={staticFile('sfx/drone.wav')} volume={(f) => interpolate(f, [0, 20, total - 60, total], [0, 0.32, 0.32, 0], {extrapolateRight: 'clamp'})} />
    {timed.map((seg, i) => (
      <React.Fragment key={i}>
        {seg.audio && (
          <Sequence from={seg.from}>
            <Audio src={staticFile(seg.audio)} volume={1} />
          </Sequence>
        )}
        {(seg.flash || seg.scene.type === 'yearSlam') && (
          <Sequence from={Math.max(0, seg.from - 2)}>
            <Audio src={staticFile('sfx/boom.wav')} volume={0.55} />
          </Sequence>
        )}
        {arrowFrames(seg).map((f) => (
          <Sequence key={f} from={f}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
          </Sequence>
        ))}
      </React.Fragment>
    ))}
  </>
);

export const Episode: React.FC<EpisodeProps> = ({segments, voice}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading brand fonts'));
  useEffect(() => {
    Promise.all(FONT_CHECKS.map((f) => document.fonts.load(f))).then(() => continueRender(handle));
  }, [handle]);

  const {segments: timed, total} = buildTimeline(segments, fps, voice);
  const last = timed[timed.length - 1];
  const onEndCard = frame >= last.from;

  return (
    <AbsoluteFill style={{background: C.night}}>
      {timed.map((seg, i) => (
        <Sequence key={i} from={seg.from} durationInFrames={seg.duration} name={`${i + 1}. ${seg.scene.type}`}>
          <Scene seg={seg} />
          {seg.flash && <Flash />}
        </Sequence>
      ))}
      <Vignette />
      {!onEndCard && <Watermark />}
      <Captions segments={timed} />
      <Grain />
      <Soundtrack timed={timed} total={total} />
    </AbsoluteFill>
  );
};
