import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SAVE, SAVE_VERSION, type SaveData } from '@/src/types/save';
import { applyStaminaRecovery, resetRewardedAdIfNewDay } from './stamina';

const STORAGE_KEY = 'iroawase_save_v1';

export async function loadSaveData(): Promise<SaveData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== SAVE_VERSION) return DEFAULT_SAVE;
    let data = resetRewardedAdIfNewDay(parsed);
    data = applyStaminaRecovery(data);
    return data;
  } catch {
    return DEFAULT_SAVE;
  }
}

export async function persistSaveData(data: SaveData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
