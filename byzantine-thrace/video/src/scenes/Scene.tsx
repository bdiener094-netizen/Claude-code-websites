import React from 'react';
import type {TimedSegment} from '../timing';
import {MapScene} from './MapScene';
import {SectionScene} from './SectionScene';
import {CounterScene, EndScene, HookScene, StatementScene, YearSlamScene} from './TextScenes';

export const Scene: React.FC<{seg: TimedSegment}> = ({seg}) => {
  const {scene, duration, words} = seg;
  switch (scene.type) {
    case 'hook':
      return <HookScene lines={scene.lines} duration={duration} words={words} />;
    case 'map':
      return <MapScene spec={scene} duration={duration} words={words} />;
    case 'section':
      return <SectionScene level={scene.level} duration={duration} />;
    case 'statement':
      return <StatementScene lines={scene.lines} seal={scene.seal} duration={duration} words={words} />;
    case 'counter':
      return <CounterScene from={scene.from} to={scene.to} caption={scene.caption} duration={duration} />;
    case 'yearSlam':
      return <YearSlamScene year={scene.year} caption={scene.caption} duration={duration} />;
    case 'end':
      return <EndScene line={scene.line} series={scene.series} next={scene.next} duration={duration} words={words} />;
  }
};
