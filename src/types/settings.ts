import { AUDIO_CONFIG } from '@/src/audio/catalog';

export type AppSettings = {
  bgmVolume: number;
  seVolume: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  bgmVolume: AUDIO_CONFIG.defaultBgmVolume,
  seVolume: AUDIO_CONFIG.defaultSeVolume,
};
