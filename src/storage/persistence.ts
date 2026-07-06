import { DEFAULT_SAVE, SAVE_VERSION, type SaveData } from '@/src/types/save';
import { applyStaminaRecovery, resetRewardedAdIfNewDay } from './stamina';
import { storageGetItem, storageSetItem } from './storageBackend';

const STORAGE_KEY = 'iroawase_save_v1';

function migrateSave(parsed: SaveData): SaveData | null {
  if (parsed.version === SAVE_VERSION) return parsed;
  if (parsed.version === 2) {
    return {
      ...parsed,
      version: SAVE_VERSION,
      unlimitedPlayUntil: 0,
    };
  }
  return null;
}

export async function loadSaveData(): Promise<SaveData> {
  try {
    const raw = await storageGetItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as SaveData;
    const migrated = migrateSave(parsed);
    if (!migrated) return DEFAULT_SAVE;
    let data = resetRewardedAdIfNewDay(migrated);
    data = applyStaminaRecovery(data);
    return data;
  } catch {
    return DEFAULT_SAVE;
  }
}

export async function persistSaveData(data: SaveData): Promise<void> {
  await storageSetItem(STORAGE_KEY, JSON.stringify(data));
}
