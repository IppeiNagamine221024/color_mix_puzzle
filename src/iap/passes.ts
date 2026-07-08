import type { SaveData } from '@/src/types/save';

export const WEEKLY_PASS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function isWeeklyPassActive(data: SaveData, now = Date.now()): boolean {
  return data.weeklyPlayUntil > now;
}

export function hasInfinitePass(data: SaveData): boolean {
  return data.infinitePassOwned;
}

/** スタミナ消費をスキップするか（1週間パス or 無限パス） */
export function skipsStaminaConsumption(data: SaveData, now = Date.now()): boolean {
  return hasInfinitePass(data) || isWeeklyPassActive(data, now);
}

export function msUntilWeeklyPassExpires(data: SaveData, now = Date.now()): number {
  if (!isWeeklyPassActive(data, now)) return 0;
  return data.weeklyPlayUntil - now;
}

/** 1週間パスを購入・延長できるか（無限パス所持時は不可） */
export function canPurchaseWeeklyPass(data: SaveData): boolean {
  return !hasInfinitePass(data);
}

/** 1週間パス購入: 有効中なら期限を延長、そうでなければ現在から1週間 */
export function grantWeeklyPass(data: SaveData, now = Date.now()): SaveData {
  if (!canPurchaseWeeklyPass(data)) return data;
  const base = Math.max(now, data.weeklyPlayUntil);
  return {
    ...data,
    weeklyPlayUntil: base + WEEKLY_PASS_DURATION_MS,
  };
}

/** 無限パス購入（買い切り） */
export function grantInfinitePass(data: SaveData): SaveData {
  return {
    ...data,
    infinitePassOwned: true,
  };
}

export function formatPassRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) {
    return `${d}日${h}時間`;
  }
  if (h > 0) {
    return `${h}時間${m.toString().padStart(2, '0')}分`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** @deprecated use isWeeklyPassActive / skipsStaminaConsumption */
export function isUnlimitedPlayActive(data: SaveData, now = Date.now()): boolean {
  return skipsStaminaConsumption(data, now);
}

/** @deprecated use msUntilWeeklyPassExpires */
export function msUntilUnlimitedPlayExpires(data: SaveData, now = Date.now()): number {
  return msUntilWeeklyPassExpires(data, now);
}

/** @deprecated use grantWeeklyPass */
export function grantUnlimitedPlay(data: SaveData, now = Date.now()): SaveData {
  return grantWeeklyPass(data, now);
}

/** @deprecated use formatPassRemaining */
export const formatUnlimitedPlayRemaining = formatPassRemaining;

/** @deprecated use WEEKLY_PASS_DURATION_MS */
export const UNLIMITED_PLAY_DURATION_MS = WEEKLY_PASS_DURATION_MS;
