import type { Direction } from '@/src/types/board';

const SWIPE_THRESHOLD = 28;

export function directionFromSwipe(dx: number, dy: number): Direction | null {
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return null;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export const SWIPE_ACTIVATE_PX = 12;
