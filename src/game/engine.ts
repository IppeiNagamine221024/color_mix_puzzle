import type { ActionType, Board, Direction } from '@/src/types/board';
import type { BoardAnimation, MixAnimation, SlideAnimation, SwapAnimation } from '@/src/types/animation';
import type { ColorId } from '@/src/types/colors';
import type { PatternCell, StageDefinition } from '@/src/types/stage';
import { snapshotBlock } from '@/src/game/blockStack';
import {
  areAdjacent,
  cloneBoard,
  createBoardFromStage,
  getBlockRatioAt,
  inBounds,
  isBoardFull,
} from './board';
import { createNextBag, drawNextFromBag } from './next';
import { matchesPattern } from './pattern';
import { isBlackMergeRatio, mixBlockRatios } from './recipes';
import { getOppositeEdgeCells, placeBlock, slideBoard } from './slide';

export type GameStatus = 'playing' | 'cleared' | 'gameover';

export type GameSession = {
  stageId: number;
  board: Board;
  pattern: PatternCell[];
  nextColor: ColorId;
  nextBag: ColorId[];
  lastAction: ActionType | null;
  remainingTurns: number;
  spawn: StageDefinition['spawn'];
  status: GameStatus;
  gameOverReason?: 'turns' | 'full';
};

export function createSession(stage: StageDefinition): GameSession {
  return {
    stageId: stage.id,
    board: createBoardFromStage(stage),
    pattern: stage.pattern.cells,
    nextColor: stage.next.initial,
    nextBag: createNextBag(),
    lastAction: null,
    remainingTurns: stage.maxTurns,
    spawn: stage.spawn,
    status: 'playing',
  };
}

export function sessionFromProgress(
  stage: StageDefinition,
  board: Board,
  nextColor: ColorId,
  nextBag: ColorId[],
  lastAction: ActionType | null,
  remainingTurns: number,
): GameSession {
  return {
    stageId: stage.id,
    board,
    pattern: stage.pattern.cells,
    nextColor,
    nextBag: nextBag.length > 0 ? nextBag : createNextBag(),
    lastAction,
    remainingTurns,
    spawn: stage.spawn,
    status: 'playing',
  };
}

export function canUseAction(session: GameSession, _action?: ActionType): boolean {
  return session.status === 'playing';
}

export function applyMix(
  session: GameSession,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { session: GameSession; error?: string; animation?: MixAnimation } {
  if (!canUseAction(session)) {
    return { session, error: 'プレイ中ではありません' };
  }
  if (!areAdjacent(x1, y1, x2, y2)) {
    return { session, error: '隣接するマスを選んでください' };
  }

  const r1 = getBlockRatioAt(session.board, x1, y1);
  const r2 = getBlockRatioAt(session.board, x2, y2);
  if (!r1 || !r2) {
    return { session, error: 'ブロックを選んでください' };
  }

  const snapA = snapshotBlock(r1)!;
  const snapB = snapshotBlock(r2)!;
  const board = cloneBoard(session.board);

  if (isBlackMergeRatio(r1, r2)) {
    board[y1][x1] = { kind: 'empty' };
    board[y2][x2] = { kind: 'empty' };
    const animation: MixAnimation = {
      type: 'mix',
      a: { x: x1, y: y1, ...snapA },
      b: { x: x2, y: y2, ...snapB },
      target: { x: x2, y: y2 },
      vanish: true,
    };
    const result = finalizeAction(session, board, 'A');
    return { ...result, animation };
  }

  const mixed = mixBlockRatios(r1, r2);
  if (!mixed) {
    return { session, error: 'この組み合わせは混合できません' };
  }

  board[y1][x1] = { kind: 'empty' };
  board[y2][x2] = { kind: 'block', ratio: mixed };

  const animation: MixAnimation = {
    type: 'mix',
    a: { x: x1, y: y1, ...snapA },
    b: { x: x2, y: y2, ...snapB },
    target: { x: x2, y: y2 },
    result: snapshotBlock(mixed)!,
  };
  const finalized = finalizeAction(session, board, 'A');
  return { ...finalized, animation };
}

export function applySwap(
  session: GameSession,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { session: GameSession; error?: string; animation?: SwapAnimation } {
  if (!canUseAction(session)) {
    return { session, error: 'プレイ中ではありません' };
  }
  if (!areAdjacent(x1, y1, x2, y2)) {
    return { session, error: '隣接するマスを選んでください' };
  }

  const r1 = getBlockRatioAt(session.board, x1, y1);
  const r2 = getBlockRatioAt(session.board, x2, y2);
  if (!r1 || !r2) {
    return { session, error: 'ブロックを2つ選んでください' };
  }

  const snapA = snapshotBlock(r1)!;
  const snapB = snapshotBlock(r2)!;
  const board = cloneBoard(session.board);
  board[y1][x1] = { kind: 'block', ratio: r2 };
  board[y2][x2] = { kind: 'block', ratio: r1 };

  const animation: SwapAnimation = {
    type: 'swap',
    a: { x: x1, y: y1, ...snapA },
    b: { x: x2, y: y2, ...snapB },
  };
  const result = finalizeAction(session, board, 'C');
  return { ...result, animation };
}

export function applySlide(
  session: GameSession,
  direction: Direction,
): { session: GameSession; error?: string; animation?: SlideAnimation } {
  if (!canUseAction(session)) {
    return { session, error: 'プレイ中ではありません' };
  }

  const spawnColor = session.nextColor;
  const { board: slid, moves } = slideBoard(session.board, direction);
  let board = slid;

  const animation: SlideAnimation = { type: 'slide', direction, moves };

  const spawnCells = getOppositeEdgeCells(board, direction);
  if (spawnCells.length === 0) {
    const result = finalizeAction(session, board, 'B');
    return { ...result, animation };
  }

  const spawnPos =
    session.spawn.mode === 'fixed' && session.spawn.fixedPosition
      ? session.spawn.fixedPosition
      : spawnCells[Math.floor(Math.random() * spawnCells.length)];

  if (inBounds(board, spawnPos.x, spawnPos.y) && board[spawnPos.y][spawnPos.x].kind === 'empty') {
    board = placeBlock(board, spawnPos.x, spawnPos.y, spawnColor);
    const placed = board[spawnPos.y][spawnPos.x];
    if (placed.kind === 'block') {
      animation.spawn = { x: spawnPos.x, y: spawnPos.y, ...snapshotBlock(placed.ratio)! };
    }
  }

  const { color: nextColor, bag: nextBag } = drawNextFromBag(session.nextBag);
  const result = finalizeAction({ ...session, board, nextColor, nextBag }, board, 'B', nextColor);
  return { ...result, animation };
}

function finalizeAction(
  session: GameSession,
  board: Board,
  action: ActionType,
  nextColorOverride?: ColorId,
): { session: GameSession; error?: string } {
  let next: GameSession = {
    ...session,
    board,
    lastAction: action,
    remainingTurns: session.remainingTurns - 1,
    nextColor: nextColorOverride ?? session.nextColor,
  };

  if (matchesPattern(board, session.pattern)) {
    return {
      session: { ...next, status: 'cleared' },
    };
  }

  if (next.remainingTurns <= 0) {
    return {
      session: { ...next, status: 'gameover', gameOverReason: 'turns' },
    };
  }

  if (isBoardFull(board)) {
    return {
      session: { ...next, status: 'gameover', gameOverReason: 'full' },
    };
  }

  return { session: next };
}
