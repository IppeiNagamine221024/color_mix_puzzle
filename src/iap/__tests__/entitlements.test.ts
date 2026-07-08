import { ownsInfinitePassInPurchases } from '../entitlements';

describe('ownsInfinitePassInPurchases', () => {
  it('returns true when infinite pass product is present', () => {
    expect(
      ownsInfinitePassInPurchases([
        { productId: 'com.wippeipy221024.colororder.infinite_pass' } as never,
      ]),
    ).toBe(true);
  });

  it('returns false when only weekly pass is present', () => {
    expect(
      ownsInfinitePassInPurchases([
        { productId: 'com.wippeipy221024.colororder.weekly_play_pass' } as never,
      ]),
    ).toBe(false);
  });
});
