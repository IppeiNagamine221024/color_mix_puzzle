import type { Direction } from './board';
import type { ColorId } from './colors';
import type { CmyRatio } from '@/src/game/colorRatio';

export type Pos = { x: number; y: number };

export type BlockSnapshot = {
  ratio: CmyRatio;
  color: ColorId;
  stack: number;
};

export type SlideMove = {
  from: Pos;
  to: Pos;
} & BlockSnapshot;

export type SlideAnimation = {
  type: 'slide';
  direction: Direction;
  moves: SlideMove[];
  spawn?: Pos & BlockSnapshot;
};

export type MixAnimation = {
  type: 'mix';
  a: Pos & BlockSnapshot;
  b: Pos & BlockSnapshot;
  target: Pos;
  result?: BlockSnapshot;
  vanish?: boolean;
};

export type SwapAnimation = {
  type: 'swap';
  a: Pos & BlockSnapshot;
  b: Pos & BlockSnapshot;
};

export type BoardAnimation = SlideAnimation | MixAnimation | SwapAnimation;

export const BOARD_ANIM_MS = 320;
