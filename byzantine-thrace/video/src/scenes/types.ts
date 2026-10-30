import type {LabelKey} from '../map/constantinople';

export type Pt = [number, number];
export type Cam = {x: number; y: number; zoom: number}; // map units; zoom 1 = 1000 units wide

export type Arrow = {
  from: Pt;
  to: Pt;
  label?: string;
  word?: number; // starts when this narration word is spoken
  at?: number; // or at this fraction of the scene (0–1)
  result: 'repelled' | 'breach';
  bend?: number; // curve strength, + bends left of travel
};

export type SceneSpec =
  | {type: 'hook'; lines: string[]} // lines must split the narration's words in order
  | {
      type: 'map';
      camera: {from: Cam; to: Cam};
      walls?: 'draw' | 'show' | 'glow';
      wallsAt?: number; // fraction of scene when the wall drawing starts
      labels?: LabelKey[];
      arrows?: Arrow[];
      stamp?: {year: string; caption: string};
      dusk?: boolean;
      chain?: boolean; // the boom across the Golden Horn
    }
  | {type: 'section'; level: 0 | 1 | 2 | 3}
  | {type: 'statement'; lines: string[]; seal?: string}
  | {type: 'counter'; from: number; to: number; caption: string}
  | {type: 'yearSlam'; year: string; caption: string}
  | {type: 'end'; line: string; series: string; next: string};
