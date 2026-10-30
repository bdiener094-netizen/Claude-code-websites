import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_CHECKS} from './brand';
import {Watermark} from './components/Brand';
import {Captions} from './components/Captions';
import {Grain, Vignette} from './components/Texture';
import {Scene} from './scenes/Scene';
import {buildTimeline, type Segment} from './timing';

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 7], [0.85, 0.6, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: C.goldBright, mixBlendMode: 'screen', opacity: o}} />;
};

export type EpisodeProps = {segments: Segment[]};

export const Episode: React.FC<EpisodeProps> = ({segments}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading brand fonts'));
  useEffect(() => {
    Promise.all(FONT_CHECKS.map((f) => document.fonts.load(f))).then(() => continueRender(handle));
  }, [handle]);

  const {segments: timed} = buildTimeline(segments, fps);
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
    </AbsoluteFill>
  );
};
