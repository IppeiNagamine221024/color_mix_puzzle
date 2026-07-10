import type { LottieTransitionId } from '@/src/lottie/types';
import { create } from 'zustand';

type LottiePlayerRequest = {
  kind: LottieTransitionId;
  instanceId: number;
  onComplete: () => void;
};

type LottiePlayerState = {
  request: LottiePlayerRequest | null;
  /** 遷移中の単色カバー（先画面の描画まで残す） */
  coverActive: boolean;
  showEnter: (onComplete: () => void) => void;
  showExit: (onComplete: () => void) => void;
  showClear: (onComplete: () => void) => void;
  /** アニメーション要求のみ解除（カバーは残す） */
  hide: () => void;
  /** カバーとアニメーションを両方解除（先画面の描画後に呼ぶ） */
  dismissCover: () => void;
};

let nextInstanceId = 1;

function nextRequest(kind: LottieTransitionId, onComplete: () => void): LottiePlayerRequest {
  return { kind, onComplete, instanceId: nextInstanceId++ };
}

/** 入場・退場・クリア演出をアプリ内の LottieView 1 つで再生 */
export const useLottiePlayerStore = create<LottiePlayerState>((set) => ({
  request: null,
  coverActive: false,
  showEnter: (onComplete) =>
    set({ coverActive: true, request: nextRequest('enter', onComplete) }),
  showExit: (onComplete) =>
    set({ coverActive: true, request: nextRequest('exit', onComplete) }),
  showClear: (onComplete) => set({ request: nextRequest('clear', onComplete) }),
  hide: () => set({ request: null }),
  dismissCover: () => set({ request: null, coverActive: false }),
}));

export function isClearLottieActive(request: LottiePlayerRequest | null): boolean {
  return request?.kind === 'clear';
}

export function isExitLottieActive(request: LottiePlayerRequest | null): boolean {
  return request?.kind === 'exit';
}
