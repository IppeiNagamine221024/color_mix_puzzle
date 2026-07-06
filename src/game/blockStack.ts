import {
  getColorByRatio,
  getColorRatio,
  type ColorId,
} from '@/src/game/colorCatalog';
import {
  addRawRatios,
  isWithinBlockLimit,
  ratioGcd,
  type CmyRatio,
} from '@/src/game/colorRatio';

export type BlockSnapshot = {
  ratio: CmyRatio;
  color: ColorId;
  stack: number;
};

export function getBlockColorId(ratio: CmyRatio): ColorId | null {
  return getColorByRatio(ratio);
}

export function getBlockStack(ratio: CmyRatio): number {
  return ratioGcd(ratio);
}

export function ratioFromColor(color: ColorId): CmyRatio {
  return [...getColorRatio(color)] as CmyRatio;
}

export function snapshotBlock(ratio: CmyRatio): BlockSnapshot | null {
  const color = getBlockColorId(ratio);
  if (!color) return null;
  return { ratio, color, stack: getBlockStack(ratio) };
}

export function isValidBlockRatio(ratio: CmyRatio): boolean {
  const [c, m, y] = ratio;
  if (c === 0 && m === 0 && y === 0) return false;
  if (!isWithinBlockLimit(ratio)) return false;
  return getBlockColorId(ratio) !== null;
}

export function isBlackMergeRatio(a: CmyRatio, b: CmyRatio): boolean {
  return getBlockColorId(a) === 'black' && getBlockColorId(b) === 'black';
}

export function mixBlockRatios(a: CmyRatio, b: CmyRatio): CmyRatio | null {
  const idA = getBlockColorId(a);
  const idB = getBlockColorId(b);
  if (!idA || !idB) return null;
  if (isBlackMergeRatio(a, b)) return null;
  if (idA === 'black' || idB === 'black') return null;

  const sum = addRawRatios(a, b);
  if (!isWithinBlockLimit(sum)) return null;
  if (!getBlockColorId(sum)) return null;
  return sum;
}
