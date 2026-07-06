import type { SaveData } from '@/src/types/save';

export const UNLIMITED_PLAY_DURATION_MS = 24 * 60 * 60 * 1000;

export function isUnlimitedPlayActive(data: SaveData, now = Date.now()): boolean {
  return data.unlimitedPlayUntil > now;
}

export function msUntilUnlimitedPlayExpires(data: SaveData, now = Date.now()): number {
  if (!isUnlimitedPlayActive(data, now)) return 0;
  return data.unlimitedPlayUntil - now;
}

/** 購入成功時: 有効中なら期限を延長、未購入・期限切れなら現在時刻から24時間 */
export function grantUnlimitedPlay(data: SaveData, now = Date.now()): SaveData {
  const base = Math.max(now, data.unlimitedPlayUntil);
  return {
    ...data,
    unlimitedPlayUntil: base + UNLIMITED_PLAY_DURATION_MS,
  };
}

export function formatUnlimitedPlayRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}時間${m.toString().padStart(2, '0')}分`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
