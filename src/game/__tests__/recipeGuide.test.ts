import {
  findRecipeForColor,
  formatPatternRecipeHint,
  getPatternRecipeHints,
} from '../recipeGuide';

describe('recipeGuide pattern hints', () => {
  it('marks primaries and mixes for pattern colors', () => {
    const hints = getPatternRecipeHints([
      { dx: 0, dy: 0, color: 'cyan' },
      { dx: 1, dy: 0, color: 'red' },
    ]);

    expect(hints).toHaveLength(2);
    expect(hints.find((h) => h.color === 'cyan')).toEqual({ color: 'cyan', kind: 'primary' });
    const red = hints.find((h) => h.color === 'red');
    expect(red?.kind).toBe('mix');
    if (red?.kind === 'mix') {
      expect(red.recipe.result).toBe('red');
    }
  });

  it('prefers primary pair recipes', () => {
    const recipe = findRecipeForColor('red');
    expect(recipe).toEqual({ a: 'magenta', b: 'yellow', result: 'red' });
  });

  it('formats hint text without result arrow', () => {
    const hints = getPatternRecipeHints([{ dx: 0, dy: 0, color: 'green' }]);
    expect(hints[0].kind).toBe('mix');
    expect(formatPatternRecipeHint(hints[0])).toBe('緑 ： シアン + イエロー');
    expect(formatPatternRecipeHint(hints[0])).not.toContain('→');
  });
});
