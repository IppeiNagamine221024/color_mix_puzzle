import type { CmyRatio } from '@/src/game/colorRatio';

export type Cell =
  | { kind: 'empty' }
  | { kind: 'obstacle' }
  | { kind: 'block'; ratio: CmyRatio };

export type Board = Cell[][];

export type Direction = 'up' | 'down' | 'left' | 'right';

export type ActionType = 'A' | 'B' | 'C';
