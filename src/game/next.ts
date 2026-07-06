import { PRIMARY_COLORS, type ColorId } from '@/src/types/colors';

/** テトリス7-bag相当: 原色3色を1セットにし、シャッフルして順に配る */
export function createNextBag(pool: readonly ColorId[] = PRIMARY_COLORS): ColorId[] {
  return shuffle(pool);
}

export function drawNextFromBag(bag: ColorId[]): { color: ColorId; bag: ColorId[] } {
  let queue = bag;
  if (queue.length === 0) {
    queue = createNextBag();
  }
  const [color, ...rest] = queue;
  return { color, bag: rest };
}

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
