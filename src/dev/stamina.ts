import { STAMINA_MAX } from '@/src/storage/stamina';
import type { SaveData } from '@/src/types/save';
import { DEV_TOOLS_ENABLED } from './config';

/** 開発用: スタミナを上限まで回復 */
export function devRefillStamina(save: SaveData): SaveData | null {
  if (!DEV_TOOLS_ENABLED) return null;
  if (save.stamina.current >= STAMINA_MAX) return null;

  return {
    ...save,
    stamina: {
      ...save.stamina,
      current: STAMINA_MAX,
    },
  };
}
