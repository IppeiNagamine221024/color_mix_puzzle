import type { Board, Cell } from '@/src/types/board';
import type { ColorId } from '@/src/types/colors';
import type { StageDefinition } from '@/src/types/stage';
import { getBlockColorId, ratioFromColor } from '@/src/game/blockStack';
import type { CmyRatio } from '@/src/game/colorRatio';

export function createBoardFromStage(stage: StageDefinition): Board {
  const { width, height } = stage.board;
  const board: Board = Array.from({ length: height }, () =>
    Array.from({ length: width }, (): Cell => ({ kind: 'empty' })),
  );

  for (const o of stage.obstacles) {
    if (inBounds(board, o.x, o.y)) {
      board[o.y][o.x] = { kind: 'obstacle' };
    }
  }

  for (const b of stage.initialBlocks) {
    if (inBounds(board, b.x, b.y) && board[b.y][b.x].kind === 'empty') {
      board[b.y][b.x] = { kind: 'block', ratio: ratioFromColor(b.color) };
    }
  }

  return board;
}

export function inBounds(board: Board, x: number, y: number): boolean {
  return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
}

export function isPlayableCell(cell: Cell): boolean {
  return cell.kind === 'empty' || cell.kind === 'block';
}

export function getBlockRatioAt(board: Board, x: number, y: number): CmyRatio | null {
  const cell = board[y]?.[x];
  if (!cell || cell.kind !== 'block') return null;
  return cell.ratio;
}

export function getBlockAt(board: Board, x: number, y: number): ColorId | null {
  const ratio = getBlockRatioAt(board, x, y);
  if (!ratio) return null;
  return getBlockColorId(ratio);
}

export function isBoardFull(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.kind === 'empty') return false;
    }
  }
  return true;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((c) => ({ ...c }) as Cell));
}

export function areAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
}
