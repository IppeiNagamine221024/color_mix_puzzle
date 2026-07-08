import { STAMINA_MAX } from '@/src/storage/stamina';
import type { ActionType, Board } from './board';
import type { ColorId } from './colors';

export const SAVE_VERSION = 4;

export type StageProgress = {
  stageId: number;
  board: Board;
  nextColor: ColorId;
  nextBag: ColorId[];
  lastAction: ActionType | null;
  remainingTurns: number;
};

export type SaveData = {
  version: number;
  unlockedStageId: number;
  clearedStages: number[];
  stageProgress: StageProgress | null;
  stamina: {
    current: number;
    lastRecoveryAt: number;
  };
  rewardedAd: {
    dailyCount: number;
    lastResetDate: string;
  };
  /** 1週間遊び放題パスの有効期限（Unix ms）。0 は未購入 */
  weeklyPlayUntil: number;
  /** 無限パス（買い切り）を購入済みか */
  infinitePassOwned: boolean;
};

export const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  unlockedStageId: 1,
  clearedStages: [],
  stageProgress: null,
  stamina: {
    current: STAMINA_MAX,
    lastRecoveryAt: Date.now(),
  },
  rewardedAd: {
    dailyCount: 0,
    lastResetDate: new Date().toISOString().slice(0, 10),
  },
  weeklyPlayUntil: 0,
  infinitePassOwned: false,
};
