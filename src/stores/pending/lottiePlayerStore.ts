import { create } from 'zustand';

export type LottiePlayerKind = 'enter' | 'clear';

type LottiePlayerRequest = {
  kind: LottiePlayerKind;
  instanceId: number;
  onComplete: () => void;
};

type LottiePlayerState = {
  request: LottiePlayerRequest | null;
  showEnter: (onComplete: () => void) => void;
  showClear: (onComplete: () => void) => void;
  hide: () => void;
};

let nextInstanceId = 1;

/** アプリ全体で LottieView を 1 つだけ使う（iOS Fabric ビューリサイクル対策） */
export const useLottiePlayerStore = create<LottiePlayerState>((set) => ({
  request: null,
  showEnter: (onComplete) =>
    set({
      request: { kind: 'enter', onComplete, instanceId: nextInstanceId++ },
    }),
  showClear: (onComplete) =>
    set({
      request: { kind: 'clear', onComplete, instanceId: nextInstanceId++ },
    }),
  hide: () => set({ request: null }),
}));
