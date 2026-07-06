import type { SaveData } from '@/src/types/save';

export const STAMINA_MAX = 5;
export const STAMINA_RECOVERY_MS = 10 * 60 * 1000;
export const REWARDED_AD_DAILY_LIMIT = 5;

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function applyStaminaRecovery(data: SaveData, now = Date.now()): SaveData {
  const stamina = { ...data.stamina };

  if (stamina.current >= STAMINA_MAX) {
    const elapsed = now - stamina.lastRecoveryAt;
    if (elapsed < STAMINA_RECOVERY_MS) return data;
    const remainder = elapsed % STAMINA_RECOVERY_MS;
    return {
      ...data,
      stamina: { ...stamina, lastRecoveryAt: now - remainder },
    };
  }

  const elapsed = now - stamina.lastRecoveryAt;
  const gained = Math.floor(elapsed / STAMINA_RECOVERY_MS);
  if (gained <= 0) return data;

  const newCurrent = Math.min(STAMINA_MAX, stamina.current + gained);
  const remainder = elapsed % STAMINA_RECOVERY_MS;
  stamina.current = newCurrent;
  stamina.lastRecoveryAt = now - remainder;

  return { ...data, stamina };
}

export function msUntilNextRecovery(data: SaveData, now = Date.now()): number {
  if (data.stamina.current >= STAMINA_MAX) return 0;
  const elapsed = now - data.stamina.lastRecoveryAt;
  return STAMINA_RECOVERY_MS - (elapsed % STAMINA_RECOVERY_MS);
}

/** スタミナが満タンになるまでの残り時間（ms） */
export function msUntilFullRecovery(data: SaveData, now = Date.now()): number {
  const synced = applyStaminaRecovery(data, now);
  const current = synced.stamina.current;
  if (current >= STAMINA_MAX) return 0;
  const heartsNeeded = STAMINA_MAX - current;
  const untilNext = msUntilNextRecovery(synced, now);
  return untilNext + (heartsNeeded - 1) * STAMINA_RECOVERY_MS;
}

export function resetRewardedAdIfNewDay(data: SaveData): SaveData {
  const today = todayString();
  if (data.rewardedAd.lastResetDate === today) return data;
  return {
    ...data,
    rewardedAd: { dailyCount: 0, lastResetDate: today },
  };
}

export function canWatchRewardedAd(data: SaveData): boolean {
  return (
    data.stamina.current < STAMINA_MAX &&
    data.rewardedAd.dailyCount < REWARDED_AD_DAILY_LIMIT
  );
}

/** 本日あと何回リワード広告で回復できるか */
export function remainingRewardedAdViews(data: SaveData): number {
  return Math.max(0, REWARDED_AD_DAILY_LIMIT - data.rewardedAd.dailyCount);
}

export function applyRewardedAd(data: SaveData, now = Date.now()): SaveData | null {
  const synced = applyStaminaRecovery(data, now);
  if (!canWatchRewardedAd(synced)) return null;
  return {
    ...synced,
    stamina: {
      ...synced.stamina,
      current: Math.min(STAMINA_MAX, synced.stamina.current + 1),
    },
    rewardedAd: {
      ...synced.rewardedAd,
      dailyCount: synced.rewardedAd.dailyCount + 1,
    },
  };
}

export function consumeStamina(data: SaveData, now = Date.now()): SaveData | null {
  const synced = applyStaminaRecovery(data, now);
  if (synced.stamina.current <= 0) return null;
  return {
    ...synced,
    stamina: {
      ...synced.stamina,
      current: synced.stamina.current - 1,
    },
  };
}
