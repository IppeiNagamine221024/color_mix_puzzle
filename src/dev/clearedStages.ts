import { getAllStages } from '@/src/game/stages';
import type { SaveData } from '@/src/types/save';
import { DEV_TOOLS_ENABLED } from './config';

/** 開発用: 全ステージをクリア済み・全解放にする */
export function devClearAllStages(save: SaveData): SaveData | null {
  if (!DEV_TOOLS_ENABLED) return null;

  const stages = getAllStages();
  const clearedStages = stages.map((s) => s.id);
  const maxUnlocked = Math.max(...stages.map((s) => s.id));

  const alreadyAllCleared =
    clearedStages.every((id) => save.clearedStages.includes(id)) &&
    save.unlockedStageId >= maxUnlocked;
  if (alreadyAllCleared) return null;

  return {
    ...save,
    clearedStages,
    unlockedStageId: maxUnlocked,
    stageProgress: null,
  };
}

/** 開発用: クリア状態を初期化（未クリア・ステージ1のみ解放） */
export function devResetClearedStages(save: SaveData): SaveData | null {
  if (!DEV_TOOLS_ENABLED) return null;

  const alreadyReset =
    save.clearedStages.length === 0 &&
    save.unlockedStageId === 1 &&
    save.stageProgress == null;
  if (alreadyReset) return null;

  return {
    ...save,
    clearedStages: [],
    unlockedStageId: 1,
    stageProgress: null,
  };
}
