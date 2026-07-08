import { DEFAULT_SAVE } from '@/src/types/save';
import {
  WEEKLY_PASS_DURATION_MS,
  formatPassRemaining,
  grantInfinitePass,
  grantWeeklyPass,
  hasInfinitePass,
  isWeeklyPassActive,
  canPurchaseWeeklyPass,
  skipsStaminaConsumption,
} from '../passes';

describe('passes', () => {
  const now = 1_700_000_000_000;

  it('grants weekly pass for one week', () => {
    const next = grantWeeklyPass(DEFAULT_SAVE, now);
    expect(next.weeklyPlayUntil).toBe(now + WEEKLY_PASS_DURATION_MS);
    expect(isWeeklyPassActive(next, now)).toBe(true);
  });

  it('extends weekly pass when already active', () => {
    const active = {
      ...DEFAULT_SAVE,
      weeklyPlayUntil: now + 60 * 60 * 1000,
    };
    const next = grantWeeklyPass(active, now);
    expect(next.weeklyPlayUntil).toBe(active.weeklyPlayUntil + WEEKLY_PASS_DURATION_MS);
  });

  it('grants infinite pass permanently', () => {
    const next = grantInfinitePass(DEFAULT_SAVE);
    expect(next.infinitePassOwned).toBe(true);
    expect(hasInfinitePass(next)).toBe(true);
    expect(skipsStaminaConsumption(next, now)).toBe(true);
  });

  it('formats multi-day remaining time', () => {
    expect(formatPassRemaining(3 * 24 * 60 * 60 * 1000)).toBe('3日0時間');
  });

  it('expires weekly pass after duration', () => {
    const expired = {
      ...DEFAULT_SAVE,
      weeklyPlayUntil: now - 1,
    };
    expect(isWeeklyPassActive(expired, now)).toBe(false);
  });

  it('blocks weekly pass when infinite pass is owned', () => {
    const withInfinite = grantInfinitePass({
      ...DEFAULT_SAVE,
      weeklyPlayUntil: now + 60 * 60 * 1000,
    });
    expect(canPurchaseWeeklyPass(withInfinite)).toBe(false);
    expect(grantWeeklyPass(withInfinite, now)).toBe(withInfinite);
  });
});
