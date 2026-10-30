import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './brand';
import {Episode} from './Episode';
import {ep01} from './episodes/ep01';
import ep01Voice from './episodes/ep01.voice.json';
import {buildTimeline, type VoiceTrack} from './timing';
import {ThumbFire, ThumbMap} from './trailer/Thumbnail';
import {TRAILER_FPS, TRAILER_FRAMES, Trailer} from './trailer/Trailer';

const episodes = [{id: 'Ep01-TheWallsThatNeverFell', segments: ep01, voice: ep01Voice as VoiceTrack}];

export const RemotionRoot: React.FC = () => (
  <>
    {episodes.map((ep) => (
      <Composition
        key={ep.id}
        id={ep.id}
        component={Episode}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={buildTimeline(ep.segments, FPS, ep.voice).total}
        defaultProps={{segments: ep.segments, voice: ep.voice}}
      />
    ))}
    <Composition id="Thumb-Fire" component={ThumbFire} width={1280} height={720} fps={30} durationInFrames={60} />
    <Composition id="Thumb-Map" component={ThumbMap} width={1280} height={720} fps={30} durationInFrames={60} />
    <Composition id="Trailer-FallOfConstantinople" component={Trailer} width={1920} height={1080} fps={TRAILER_FPS} durationInFrames={TRAILER_FRAMES} />
  </>
);
