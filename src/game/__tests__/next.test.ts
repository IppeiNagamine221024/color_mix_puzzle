import { PRIMARY_COLORS, type ColorId } from '@/src/types/colors';
import { createNextBag, drawNextFromBag } from '../next';

describe('next bag', () => {
  it('draws each primary once before reshuffling', () => {
    let bag: ColorId[] = ['cyan', 'magenta', 'yellow'];
    const drawn: string[] = [];
    for (let i = 0; i < 3; i++) {
      const result = drawNextFromBag(bag);
      drawn.push(result.color);
      bag = result.bag;
    }
    expect(drawn.sort()).toEqual(['cyan', 'magenta', 'yellow']);
    expect(bag).toHaveLength(0);
  });

  it('refills bag when empty', () => {
    const first = drawNextFromBag([]);
    expect(PRIMARY_COLORS).toContain(first.color);
    expect(first.bag.length).toBe(2);
  });

  it('never allows four consecutive identical colors across two bags', () => {
    for (let trial = 0; trial < 50; trial++) {
      let bag: ColorId[] = [];
      let last = '';
      let streak = 0;
      for (let i = 0; i < 12; i++) {
        const { color, bag: nextBag } = drawNextFromBag(bag);
        bag = nextBag;
        if (color === last) streak++;
        else streak = 1;
        last = color;
        expect(streak).toBeLessThan(4);
      }
    }
  });
});
