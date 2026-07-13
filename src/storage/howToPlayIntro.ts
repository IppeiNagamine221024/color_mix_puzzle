import type { SaveData } from '@/src/types/save';
import { storageGetItem, storageSetItem } from './storageBackend';

const INTRO_SEEN_KEY = 'has_seen_how_to_play_intro';

export function hasExistingGameplay(save: SaveData): boolean {
  return (
    save.clearedStages.length > 0 ||
    save.stageProgress != null ||
    save.unlockedStageId > 1
  );
}

export async function hasSeenHowToPlayIntro(): Promise<boolean> {
  const value = await storageGetItem(INTRO_SEEN_KEY);
  return value === '1';
}

export async function shouldShowHowToPlayIntro(save: SaveData): Promise<boolean> {
  if (await hasSeenHowToPlayIntro()) return false;
  return !hasExistingGameplay(save);
}

export async function markHowToPlayIntroSeen(): Promise<void> {
  await storageSetItem(INTRO_SEEN_KEY, '1');
}
