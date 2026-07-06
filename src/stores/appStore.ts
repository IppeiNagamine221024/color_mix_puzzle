import { create } from 'zustand';
import { syncStaminaFullNotification } from '@/src/notifications/staminaNotification';
import { grantUnlimitedPlay, isUnlimitedPlayActive, msUntilUnlimitedPlayExpires } from '@/src/iap/unlimitedPlay';
import { applyRewardedAd, applyStaminaRecovery, canWatchRewardedAd, consumeStamina, msUntilNextRecovery } from '@/src/storage/stamina';
import { loadSaveData, persistSaveData } from '@/src/storage/persistence';
import { DEFAULT_SAVE, type SaveData, type StageProgress } from '@/src/types/save';
import { isTutorialStage } from '@/src/game/stages';

type AppState = {
  ready: boolean;
  save: SaveData;
  recoveryMs: number;
  unlimitedPlayMs: number;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  startStage: (stageId: number, progress: StageProgress | null, useStamina: boolean) => Promise<boolean>;
  clearStage: (stageId: number) => Promise<void>;
  gameOver: () => Promise<void>;
  setStageProgress: (progress: StageProgress | null) => Promise<void>;
  watchRewardedAd: () => Promise<boolean>;
  grantUnlimitedPlayPass: () => Promise<void>;
  tickRecovery: () => void;
};

function commitStaminaSave(
  set: (partial: Pick<AppState, 'save' | 'recoveryMs' | 'unlimitedPlayMs'>) => void,
  save: SaveData,
) {
  set({
    save,
    recoveryMs: msUntilNextRecovery(save),
    unlimitedPlayMs: msUntilUnlimitedPlayExpires(save),
  });
  void syncStaminaFullNotification(save);
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  save: DEFAULT_SAVE,
  recoveryMs: 0,
  unlimitedPlayMs: 0,

  hydrate: async () => {
    const loaded = await loadSaveData();
    const save = applyStaminaRecovery(loaded);
    commitStaminaSave(set, save);
    set({ ready: true });
    if (save.stamina.current !== loaded.stamina.current) {
      await persistSaveData(save);
    }
  },

  persist: async () => {
    await persistSaveData(get().save);
  },

  startStage: async (stageId, progress, useStamina) => {
    const { save } = get();
    const skipStamina = isUnlimitedPlayActive(save);
    if (useStamina && !isTutorialStage(stageId) && !skipStamina) {
      const next = consumeStamina(save);
      if (!next) return false;
      commitStaminaSave(set, next);
      await get().persist();
    }
    if (progress) {
      const updated = { ...get().save, stageProgress: progress };
      set({ save: updated });
      await get().persist();
    }
    return true;
  },

  clearStage: async (stageId) => {
    const { save } = get();
    const cleared = save.clearedStages.includes(stageId)
      ? save.clearedStages
      : [...save.clearedStages, stageId];
    const unlocked = Math.max(save.unlockedStageId, stageId + 1);
    const updated: SaveData = {
      ...save,
      clearedStages: cleared,
      unlockedStageId: Math.min(unlocked, 100),
      stageProgress: null,
    };
    set({ save: updated });
    await get().persist();
  },

  gameOver: async () => {
    const updated = { ...get().save, stageProgress: null };
    set({ save: updated });
    await get().persist();
  },

  setStageProgress: async (progress) => {
    const updated = { ...get().save, stageProgress: progress };
    set({ save: updated });
    await get().persist();
  },

  watchRewardedAd: async () => {
    const next = applyRewardedAd(get().save);
    if (!next) return false;
    commitStaminaSave(set, next);
    await get().persist();
    return true;
  },

  grantUnlimitedPlayPass: async () => {
    const next = grantUnlimitedPlay(get().save);
    commitStaminaSave(set, next);
    await get().persist();
  },

  tickRecovery: () => {
    const save = get().save;
    const next = applyStaminaRecovery(save);
    const changed =
      next.stamina.current !== save.stamina.current ||
      next.stamina.lastRecoveryAt !== save.stamina.lastRecoveryAt;

    if (changed) {
      commitStaminaSave(set, next);
      void get().persist();
    } else {
      set({
        recoveryMs: msUntilNextRecovery(save),
        unlimitedPlayMs: msUntilUnlimitedPlayExpires(save),
      });
    }
  },
}));

export function canStartNewStage(save: SaveData, stageId: number): boolean {
  if (stageId > save.unlockedStageId) return false;
  if (isTutorialStage(stageId)) return true;
  if (isUnlimitedPlayActive(save)) return true;
  return save.stamina.current > 0;
}

export function canShowRewardButton(save: SaveData): boolean {
  if (isUnlimitedPlayActive(save)) return false;
  return canWatchRewardedAd(save);
}
