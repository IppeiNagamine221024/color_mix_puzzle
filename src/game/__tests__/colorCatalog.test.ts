import {
  addRatios,
  ratioKey,
  simplifyRatio,
} from '../colorRatio';
import {
  getColorByRatio,
  getColorRatio,
  PRIMARY_COLORS,
} from '../colorCatalog';
import { getMixResult } from '../recipes';

describe('colorRatio', () => {
  it('simplifies ratios by gcd', () => {
    expect(simplifyRatio([2, 2, 0])).toEqual([1, 1, 0]);
    expect(simplifyRatio([0, 2, 4])).toEqual([0, 1, 2]);
    expect(simplifyRatio([0, 2, 3])).toEqual([0, 2, 3]);
  });

  it('adds ratios and simplifies', () => {
    expect(addRatios([1, 0, 0], [0, 1, 0])).toEqual([1, 1, 0]);
    expect(addRatios([0, 1, 1], [0, 1, 2])).toEqual([0, 2, 3]);
  });
});

describe('colorCatalog', () => {
  it('defines three primaries', () => {
    expect([...PRIMARY_COLORS].sort()).toEqual(['cyan', 'magenta', 'yellow']);
  });

  it('mixes unit primaries to secondaries', () => {
    expect(getMixResult('magenta', 'yellow')).toBe('red');
    expect(getMixResult('yellow', 'cyan')).toBe('green');
    expect(getMixResult('cyan', 'magenta')).toBe('blue');
  });

  it('mixes unit colors to tertiary catalog colors', () => {
    expect(getMixResult('yellow', 'red')).toBe('orange');
    expect(getMixResult('yellow', 'orange')).toBe('amber');
    expect(getMixResult('red', 'orange')).toBe('vermillion');
    expect(getMixResult('magenta', 'blue')).toBe('purple');
    expect(getMixResult('green', 'yellow')).toBe('chartreuse');
    expect(getMixResult('cyan', 'green')).toBe('teal');
    expect(getMixResult('red', 'green')).toBe('brown');
  });

  it('mixes to black when CMY balance is complete', () => {
    expect(getMixResult('red', 'cyan')).toBe('black');
    expect(getMixResult('green', 'magenta')).toBe('black');
    expect(getMixResult('blue', 'yellow')).toBe('black');
  });

  it('rejects invalid unit mixes', () => {
    expect(getMixResult('orange', 'purple')).toBeNull();
    expect(getMixResult('amber', 'purple')).toBeNull();
  });

  it('rejects black mixes except black+black handled separately', () => {
    expect(getMixResult('black', 'black')).toBeNull();
    expect(getMixResult('black', 'cyan')).toBeNull();
  });

  it('looks up colors by normalized ratio', () => {
    expect(getColorByRatio([1, 1, 0])).toBe('blue');
    expect(getColorByRatio([2, 2, 0])).toBe('blue');
    expect(getColorRatio('vermillion')).toEqual([0, 2, 3]);
    expect(ratioKey(getColorRatio('blue'))).toBe('1,1,0');
  });
});
