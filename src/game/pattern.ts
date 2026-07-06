import type { Board } from '@/src/types/board';
import type { PatternCell } from '@/src/types/stage';
import { getBlockAt, inBounds } from './board';

export function matchesPattern(board: Board, cells: PatternCell[]): boolean {
  return findPatternMatchPositions(board, cells) != null;
}

/** パターンが一致しているとき、盤面上の該当セル座標を返す */
export function findPatternMatchPositions(
  board: Board,
  cells: PatternCell[],
): { x: number; y: number }[] | null {
  const height = board.length;
  const width = board[0]?.length ?? 0;

  for (let oy = 0; oy < height; oy++) {
    for (let ox = 0; ox < width; ox++) {
      if (patternAtOrigin(board, cells, ox, oy)) {
        return cells.map((cell) => ({
          x: ox + cell.dx,
          y: oy + cell.dy,
        }));
      }
    }
  }
  return null;
}

function patternAtOrigin(
  board: Board,
  cells: PatternCell[],
  originX: number,
  originY: number,
): boolean {
  for (const cell of cells) {
    const x = originX + cell.dx;
    const y = originY + cell.dy;
    if (!inBounds(board, x, y)) return false;
    if (getBlockAt(board, x, y) !== cell.color) return false;
  }
  return true;
}
