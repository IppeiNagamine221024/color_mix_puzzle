import {
  getBlockColorId,
  getBlockStack,
  mixBlockRatios,
  ratioFromColor,
} from '../blockStack';

describe('blockStack', () => {
  it('derives display color from normalized ratio', () => {
    expect(getBlockColorId([2, 0, 0])).toBe('cyan');
    expect(getBlockColorId([2, 0, 1])).toBe('teal');
    expect(getBlockStack([2, 0, 0])).toBe(2);
    expect(getBlockStack([2, 0, 1])).toBe(1);
  });

  it('stacks same color without normalizing', () => {
    expect(mixBlockRatios([1, 0, 0], [1, 0, 0])).toEqual([2, 0, 0]);
    expect(mixBlockRatios([2, 0, 0], [1, 0, 0])).toEqual([3, 0, 0]);
  });

  it('mixes stacked cyan with yellow into teal', () => {
    expect(mixBlockRatios([2, 0, 0], [0, 0, 1])).toEqual([2, 0, 1]);
    expect(getBlockColorId([2, 0, 1])).toBe('teal');
    expect(getBlockStack([2, 0, 1])).toBe(1);
  });

  it('rejects mixes that exceed component limit', () => {
    expect(mixBlockRatios([3, 0, 0], [1, 0, 0])).toBeNull();
    expect(mixBlockRatios([2, 0, 0], [2, 0, 0])).toBeNull();
  });

  it('rejects mixes with unknown normalized color', () => {
    expect(mixBlockRatios(ratioFromColor('orange'), ratioFromColor('purple'))).toBeNull();
  });
});
