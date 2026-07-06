import { DEFAULT_SETTINGS, type AppSettings } from '@/src/types/settings';

let volumes: AppSettings = { ...DEFAULT_SETTINGS };

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getAudioVolumes(): Readonly<AppSettings> {
  return volumes;
}

export function setAudioVolumes(next: AppSettings): void {
  volumes = {
    bgmVolume: clamp01(next.bgmVolume),
    seVolume: clamp01(next.seVolume),
  };
}
