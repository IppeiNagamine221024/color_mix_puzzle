import {
  getBlockColorId,
  isBlackMergeRatio,
  mixBlockRatios,
  ratioFromColor,
} from '@/src/game/blockStack';
import type { CmyRatio } from '@/src/game/colorRatio';
import type { ColorId } from '@/src/game/colorCatalog';

export function getMixResult(a: ColorId, b: ColorId): ColorId | null {
  const mixed = mixBlockRatios(ratioFromColor(a), ratioFromColor(b));
  if (!mixed) return null;
  return getBlockColorId(mixed);
}

export function mixRatios(a: CmyRatio, b: CmyRatio): CmyRatio | null {
  return mixBlockRatios(a, b);
}

export function isBlackMerge(a: ColorId, b: ColorId): boolean {
  return isBlackMergeRatio(ratioFromColor(a), ratioFromColor(b));
}

export { isBlackMergeRatio, mixBlockRatios };
