import { DEFAULT_SAVE } from '@/src/types/save';
import {
  UNLIMITED_PLAY_DURATION_MS,
  formatUnlimitedPlayRemaining,
  grantUnlimitedPlay,
  isUnlimitedPlayActive,
  msUntilUnlimitedPlayExpires,
} from '../unlimitedPlay';

describe('unlimitedPlay', () => {
  const now = 1_700_000_000_000;

  it('grants 24 hours from purchase time', () => {
    const next = grantUnlimitedPlay(DEFAULT_SAVE, now);
    expect(next.unlimitedPlayUntil).toBe(now + UNLIMITED_PLAY_DURATION_MS);
    expect(isUnlimitedPlayActive(next, now)).toBe(true);
  });

  it('extends from current expiry when already active', () => {
    const active = {
      ...DEFAULT_SAVE,
      unlimitedPlayUntil: now + 60 * 60 * 1000,
    };
    const next = grantUnlimitedPlay(active, now);
    expect(next.unlimitedPlayUntil).toBe(active.unlimitedPlayUntil + UNLIMITED_PLAY_DURATION_MS);
  });

  it('expires after the deadline', () => {
    const expired = {
      ...DEFAULT_SAVE,
      unlimitedPlayUntil: now - 1,
    };
    expect(isUnlimitedPlayActive(expired, now)).toBe(false);
    expect(msUntilUnlimitedPlayExpires(expired, now)).toBe(0);
  });

  it('formats remaining time', () => {
    expect(formatUnlimitedPlayRemaining(90_000)).toBe('1:30');
    expect(formatUnlimitedPlayRemaining(3_661_000)).toBe('1時間01分');
  });
});
