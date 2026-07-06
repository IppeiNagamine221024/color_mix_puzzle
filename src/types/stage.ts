import type { ColorId } from './colors';

export type PatternCell = {
  dx: number;
  dy: number;
  color: ColorId;
};

export type StageBlock = {
  x: number;
  y: number;
  color: ColorId;
};

export type StageDefinition = {
  id: number;
  name: string;
  board: { width: number; height: number };
  obstacles: { x: number; y: number }[];
  initialBlocks: StageBlock[];
  pattern: { cells: PatternCell[] };
  maxTurns: number;
  next: { initial: ColorId };
  spawn: {
    mode: 'fixed' | 'random';
    fixedPosition?: { x: number; y: number };
  };
  metadata: {
    difficulty: number;
    par: number;
    isTutorial?: boolean;
  };
};
