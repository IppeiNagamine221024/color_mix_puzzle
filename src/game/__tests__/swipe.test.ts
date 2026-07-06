import { directionFromSwipe } from '../swipe';

describe('directionFromSwipe', () => {
  it('detects horizontal swipes', () => {
    expect(directionFromSwipe(40, 5)).toBe('right');
    expect(directionFromSwipe(-40, 5)).toBe('left');
  });

  it('detects vertical swipes', () => {
    expect(directionFromSwipe(5, 40)).toBe('down');
    expect(directionFromSwipe(5, -40)).toBe('up');
  });

  it('ignores short gestures', () => {
    expect(directionFromSwipe(10, 10)).toBeNull();
  });

  it('prefers dominant axis', () => {
    expect(directionFromSwipe(50, 20)).toBe('right');
    expect(directionFromSwipe(20, 50)).toBe('down');
  });
});
