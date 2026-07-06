import colorsData from '@/assets/data/colors.json';
import {
  isPrimaryRatio,
  ratioKey,
  simplifyRatio,
  type CmyRatio,
} from '@/src/game/colorRatio';

export type ColorDefinition = {
  id: string;
  label: string;
  ratio: CmyRatio;
  hex: string;
};

const entries = colorsData as ColorDefinition[];

const MAX_RATIO_COMPONENT = 3;

function buildCatalog(definitions: ColorDefinition[]) {
  const ratioByColor = new Map<string, CmyRatio>();
  const colorByRatio = new Map<string, string>();
  const labels: Record<string, string> = {};
  const hexes: Record<string, string> = {};
  const seenRatio = new Map<string, string>();

  for (const def of definitions) {
    const normalized = simplifyRatio(def.ratio);
    const key = ratioKey(normalized);
    const maxComponent = Math.max(...normalized);

    if (maxComponent > MAX_RATIO_COMPONENT) {
      throw new Error(
        `Color "${def.id}" ratio ${key} exceeds max component ${MAX_RATIO_COMPONENT}`,
      );
    }

    if (JSON.stringify(normalized) !== JSON.stringify(def.ratio)) {
      throw new Error(
        `Color "${def.id}" ratio must be normalized; got [${def.ratio.join(', ')}], expected [${normalized.join(', ')}]`,
      );
    }

    if (seenRatio.has(key)) {
      throw new Error(
        `Duplicate CMY ratio ${key} for colors "${seenRatio.get(key)}" and "${def.id}"`,
      );
    }
    seenRatio.set(key, def.id);

    ratioByColor.set(def.id, normalized);
    colorByRatio.set(key, def.id);
    labels[def.id] = def.label;
    hexes[def.id] = def.hex;
  }

  const primaryColors = definitions
    .filter((def) => isPrimaryRatio(ratioByColor.get(def.id)!))
    .map((def) => def.id);

  if (primaryColors.length !== 3) {
    throw new Error(`Expected exactly 3 primary colors, found ${primaryColors.length}`);
  }

  return {
    definitions,
    ratioByColor,
    colorByRatio,
    labels,
    hexes,
    primaryColors,
  };
}

const catalog = buildCatalog(entries);

export const COLOR_DEFINITIONS = catalog.definitions;
export const PRIMARY_COLORS = catalog.primaryColors as readonly string[];
export const COLOR_LABELS = catalog.labels;
export const COLOR_HEX = catalog.hexes;

export type ColorId = (typeof entries)[number]['id'];

export function getColorRatio(color: ColorId): CmyRatio {
  const ratio = catalog.ratioByColor.get(color);
  if (!ratio) throw new Error(`Unknown color: ${color}`);
  return ratio;
}

export function getColorByRatio(ratio: CmyRatio): ColorId | null {
  return (catalog.colorByRatio.get(ratioKey(ratio)) as ColorId | undefined) ?? null;
}

export function isBlackMerge(a: ColorId, b: ColorId): boolean {
  return a === 'black' && b === 'black';
}
