import {
  COLOR_DEFINITIONS,
  COLOR_LABELS,
  PRIMARY_COLORS,
  type ColorId,
} from '@/src/game/colorCatalog';
import { getMixResult } from '@/src/game/recipes';
import type { PatternCell } from '@/src/types/stage';

export type RecipeEntry = {
  a: ColorId;
  b: ColorId;
  result: ColorId;
};

export type PatternRecipeHint =
  | { color: ColorId; kind: 'primary' }
  | { color: ColorId; kind: 'black'; recipe: RecipeEntry }
  | { color: ColorId; kind: 'mix'; recipe: RecipeEntry };

const PRIMARY_SET = new Set<string>(PRIMARY_COLORS);

/** 色のレシピ一覧（設定画面用） */
export function getColorRecipes(): RecipeEntry[] {
  const ids = COLOR_DEFINITIONS.map((c) => c.id as ColorId);
  const seen = new Set<string>();
  const entries: RecipeEntry[] = [];

  for (const a of ids) {
    for (const b of ids) {
      const result = getMixResult(a, b);
      if (!result) continue;
      const key = [a, b].sort().join('+');
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ a, b, result });
    }
  }

  return entries.sort((x, y) =>
    COLOR_LABELS[x.result].localeCompare(COLOR_LABELS[y.result], 'ja'),
  );
}

export function formatRecipe(entry: RecipeEntry): string {
  const la = COLOR_LABELS[entry.a];
  const lb = COLOR_LABELS[entry.b];
  const lr = COLOR_LABELS[entry.result];
  return `${la} + ${lb} → ${lr}`;
}

/** 混合の材料のみ（ヒント用） */
export function formatRecipeIngredients(entry: RecipeEntry): string {
  return `${COLOR_LABELS[entry.a]} + ${COLOR_LABELS[entry.b]}`;
}

/** 1色を作る混合レシピ（原色同士を優先） */
export function findRecipeForColor(target: ColorId): RecipeEntry | null {
  const candidates = getColorRecipes().filter((e) => e.result === target);
  if (candidates.length === 0) return null;

  const primaryPair = candidates.find(
    (e) => PRIMARY_SET.has(e.a) && PRIMARY_SET.has(e.b),
  );
  if (primaryPair) return primaryPair;

  return candidates[0];
}

/** 課題パターンに含まれる色ごとのレシピヒント */
export function getPatternRecipeHints(cells: PatternCell[]): PatternRecipeHint[] {
  const unique = [...new Set(cells.map((c) => c.color))];

  return unique
    .map((color): PatternRecipeHint | null => {
      if (PRIMARY_SET.has(color)) {
        return { color, kind: 'primary' };
      }
      if (color === 'black') {
        const recipe = findRecipeForColor('black');
        if (!recipe) return null;
        return { color, kind: 'black', recipe };
      }
      const recipe = findRecipeForColor(color);
      if (!recipe) return null;
      return { color, kind: 'mix', recipe };
    })
    .filter((h): h is PatternRecipeHint => h != null)
    .sort((a, b) => COLOR_LABELS[a.color].localeCompare(COLOR_LABELS[b.color], 'ja'));
}

export function formatPatternRecipeHint(hint: PatternRecipeHint): string {
  if (hint.kind === 'primary') {
    return `${COLOR_LABELS[hint.color]} ： 原色（スライドで出現）`;
  }
  if (hint.kind === 'black') {
    return `${COLOR_LABELS.black} ： ${formatRecipeIngredients(hint.recipe)}`;
  }
  return `${COLOR_LABELS[hint.color]} ： ${formatRecipeIngredients(hint.recipe)}`;
}
