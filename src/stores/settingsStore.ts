import { audio } from '@/src/audio/audioService';
import { setAudioVolumes } from '@/src/audio/volumes';
import { loadSettings, persistSettings } from '@/src/storage/settingsPersistence';
import { DEFAULT_SETTINGS } from '@/src/types/settings';
import { create } from 'zustand';

type SettingsState = {
  ready: boolean;
  bgmVolume: number;
  seVolume: number;
  hydrate: () => Promise<void>;
  setBgmVolume: (volume: number) => Promise<void>;
  setSeVolume: (volume: number) => Promise<void>;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ready: false,
  bgmVolume: DEFAULT_SETTINGS.bgmVolume,
  seVolume: DEFAULT_SETTINGS.seVolume,

  hydrate: async () => {
    const loaded = await loadSettings();
    set({ ...loaded, ready: true });
    setAudioVolumes(loaded);
    audio.applyVolumes();
  },

  setBgmVolume: async (volume) => {
    const bgmVolume = clamp01(volume);
    const seVolume = get().seVolume;
    set({ bgmVolume });
    setAudioVolumes({ bgmVolume, seVolume });
    audio.applyVolumes();
    await persistSettings({ bgmVolume, seVolume });
  },

  setSeVolume: async (volume) => {
    const seVolume = clamp01(volume);
    const bgmVolume = get().bgmVolume;
    set({ seVolume });
    setAudioVolumes({ bgmVolume, seVolume });
    audio.applyVolumes();
    await persistSettings({ bgmVolume, seVolume });
  },
}));
