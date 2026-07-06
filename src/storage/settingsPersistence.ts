import { DEFAULT_SETTINGS, type AppSettings } from '@/src/types/settings';
import { storageGetItem, storageSetItem } from './storageBackend';

const SETTINGS_KEY = 'color_order_settings_v1';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await storageGetItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      bgmVolume: clamp01(parsed.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume),
      seVolume: clamp01(parsed.seVolume ?? DEFAULT_SETTINGS.seVolume),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function persistSettings(settings: AppSettings): Promise<void> {
  await storageSetItem(SETTINGS_KEY, JSON.stringify(settings));
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
