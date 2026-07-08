import { DEFAULT_SAVE } from '@/src/types/save';
import {
  STAMINA_MAX,
  STAMINA_RECOVERY_MS,
  applyRewardedAd,
  applyStaminaRecovery,
  consumeStamina,
  msUntilFullRecovery,
  msUntilNextRecovery,
  remainingRewardedAdViews,
  REWARDED_AD_DAILY_LIMIT,
} from '../stamina';

describe('applyStaminaRecovery', () => {
  const base = {
    ...DEFAULT_SAVE,
    stamina: { current: 1, lastRecoveryAt: 0 },
  };

  it('adds stamina after recovery interval', () => {
    const now = STAMINA_RECOVERY_MS + 1;
    const next = applyStaminaRecovery(base, now);
    expect(next.stamina.current).toBe(2);
  });

  it('updates countdown after recovery', () => {
    const now = STAMINA_RECOVERY_MS + 1;
    const next = applyStaminaRecovery(base, now);
    expect(msUntilNextRecovery(next, now)).toBeLessThanOrEqual(STAMINA_RECOVERY_MS);
    expect(msUntilNextRecovery(next, now)).toBeGreaterThan(STAMINA_RECOVERY_MS - 2000);
  });

  it('does not exceed max', () => {
    const full = {
      ...base,
      stamina: { current: STAMINA_MAX - 1, lastRecoveryAt: 0 },
    };
    const now = STAMINA_RECOVERY_MS * 3;
    const next = applyStaminaRecovery(full, now);
    expect(next.stamina.current).toBe(STAMINA_MAX);
  });

  it('does not advance timer while at max', () => {
    const anchor = 1_000_000;
    const full = {
      ...DEFAULT_SAVE,
      stamina: { current: STAMINA_MAX, lastRecoveryAt: anchor },
    };
    const now = anchor + STAMINA_RECOVERY_MS / 2;
    const next = applyStaminaRecovery(full, now);
    expect(next.stamina.lastRecoveryAt).toBe(anchor);
    expect(next.stamina.current).toBe(STAMINA_MAX);
  });
});

describe('msUntilFullRecovery', () => {
  it('returns 0 when already full', () => {
    const full = {
      ...DEFAULT_SAVE,
      stamina: { current: STAMINA_MAX, lastRecoveryAt: 0 },
    };
    expect(msUntilFullRecovery(full)).toBe(0);
  });

  it('sums remaining hearts recovery time', () => {
    const base = {
      ...DEFAULT_SAVE,
      stamina: { current: 1, lastRecoveryAt: 0 },
    };
    expect(msUntilFullRecovery(base, 0)).toBe(STAMINA_RECOVERY_MS * 4);
  });

  it('accounts for partial progress toward next heart', () => {
    const base = {
      ...DEFAULT_SAVE,
      stamina: { current: 4, lastRecoveryAt: 0 },
    };
    const now = STAMINA_RECOVERY_MS / 2;
    expect(msUntilFullRecovery(base, now)).toBe(STAMINA_RECOVERY_MS / 2);
  });
});

describe('remainingRewardedAdViews', () => {
  it('starts at daily limit', () => {
    expect(remainingRewardedAdViews(DEFAULT_SAVE)).toBe(REWARDED_AD_DAILY_LIMIT);
  });

  it('decreases after each rewarded ad', () => {
    const anchor = 1_000_000;
    const afterOne = applyRewardedAd(
      {
        ...DEFAULT_SAVE,
        stamina: { current: 1, lastRecoveryAt: anchor },
      },
      anchor,
    );
    expect(afterOne).not.toBeNull();
    expect(remainingRewardedAdViews(afterOne!)).toBe(REWARDED_AD_DAILY_LIMIT - 1);
  });
});

describe('consumeStamina / applyRewardedAd', () => {
  const anchor = 1_000_000;
  const base = {
    ...DEFAULT_SAVE,
    stamina: { current: 3, lastRecoveryAt: anchor },
  };

  it('does not reset recovery timer on consume', () => {
    const now = anchor + STAMINA_RECOVERY_MS / 2;
    const next = consumeStamina(base, now);
    expect(next).not.toBeNull();
    expect(next!.stamina.lastRecoveryAt).toBe(anchor);
    expect(next!.stamina.current).toBe(2);
    expect(msUntilNextRecovery(next!, now)).toBe(STAMINA_RECOVERY_MS / 2);
  });

  it('does not reset recovery timer on rewarded ad', () => {
    const low = {
      ...base,
      stamina: { current: 1, lastRecoveryAt: anchor },
    };
    const now = anchor + STAMINA_RECOVERY_MS / 2;
    const next = applyRewardedAd(low, now);
    expect(next).not.toBeNull();
    expect(next!.stamina.lastRecoveryAt).toBe(anchor);
    expect(next!.stamina.current).toBe(2);
    expect(msUntilNextRecovery(next!, now)).toBe(STAMINA_RECOVERY_MS / 2);
  });

  it('starts full recovery timer when consuming from max', () => {
    const anchor = 1_000_000;
    const full = {
      ...DEFAULT_SAVE,
      stamina: { current: STAMINA_MAX, lastRecoveryAt: anchor - STAMINA_RECOVERY_MS / 2 },
    };
    const now = anchor;
    const next = consumeStamina(full, now);
    expect(next).not.toBeNull();
    expect(next!.stamina.current).toBe(STAMINA_MAX - 1);
    expect(next!.stamina.lastRecoveryAt).toBe(now);
    expect(msUntilNextRecovery(next!, now)).toBe(STAMINA_RECOVERY_MS);
  });
});
