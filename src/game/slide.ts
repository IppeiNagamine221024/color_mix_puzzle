import type { Board, Direction } from '@/src/types/board';
import type { ColorId } from '@/src/types/colors';
import type { SlideMove } from '@/src/types/animation';
import { ratioFromColor, snapshotBlock } from '@/src/game/blockStack';
import { cloneBoard, inBounds } from './board';

export function slideBoard(
  board: Board,
  direction: Direction,
): { board: Board; moved: boolean; moves: SlideMove[] } {
  const next = cloneBoard(board);
  const height = next.length;
  const width = next[0].length;
  let moved = false;
  const moves: SlideMove[] = [];

  const vectors: Record<Direction, { dx: number; dy: number }> = {
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
  };

  const order = getTraversalOrder(direction, width, height);

  for (const { x: startX, y: startY } of order) {
    const cell = next[startY][startX];
    if (cell.kind !== 'block') continue;

    const { dx, dy } = vectors[direction];
    let x = startX;
    let y = startY;

    while (true) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(next, nx, ny)) break;
      const target = next[ny][nx];
      if (target.kind === 'obstacle' || target.kind === 'block') break;
      x = nx;
      y = ny;
    }

    if (x !== startX || y !== startY) {
      next[y][x] = cell;
      next[startY][startX] = { kind: 'empty' };
      const snap = snapshotBlock(cell.ratio)!;
      moves.push({
        from: { x: startX, y: startY },
        to: { x, y },
        ...snap,
      });
      moved = true;
    }
  }

  return { board: next, moved, moves };
}

function getTraversalOrder(
  direction: Direction,
  width: number,
  height: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const xRange = direction === 'left'
    ? Array.from({ length: width }, (_, i) => i)
    : direction === 'right'
      ? Array.from({ length: width }, (_, i) => width - 1 - i)
      : Array.from({ length: width }, (_, i) => i);
  const yRange = direction === 'up'
    ? Array.from({ length: height }, (_, i) => i)
    : direction === 'down'
      ? Array.from({ length: height }, (_, i) => height - 1 - i)
      : Array.from({ length: height }, (_, i) => i);

  for (const y of yRange) {
    for (const x of xRange) {
      cells.push({ x, y });
    }
  }
  return cells;
}

export function getOppositeEdgeCells(
  board: Board,
  direction: Direction,
): { x: number; y: number }[] {
  const height = board.length;
  const width = board[0].length;
  const cells: { x: number; y: number }[] = [];

  if (direction === 'left') {
    for (let y = 0; y < height; y++) {
      if (board[y][width - 1].kind === 'empty') cells.push({ x: width - 1, y });
    }
  } else if (direction === 'right') {
    for (let y = 0; y < height; y++) {
      if (board[y][0].kind === 'empty') cells.push({ x: 0, y });
    }
  } else if (direction === 'up') {
    for (let x = 0; x < width; x++) {
      if (board[height - 1][x].kind === 'empty') cells.push({ x, y: height - 1 });
    }
  } else {
    for (let x = 0; x < width; x++) {
      if (board[0][x].kind === 'empty') cells.push({ x, y: 0 });
    }
  }

  return cells;
}

export function placeBlock(board: Board, x: number, y: number, color: ColorId): Board {
  const next = cloneBoard(board);
  if (inBounds(next, x, y) && next[y][x].kind === 'empty') {
    next[y][x] = { kind: 'block', ratio: ratioFromColor(color) };
  }
  return next;
}
