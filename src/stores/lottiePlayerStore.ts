import type { LottieTransitionId } from '@/src/lottie/types';
import { create } from 'zustand';

type LottiePlayerRequest = {
  kind: LottieTransitionId;
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

function nextRequest(kind: LottieTransitionId, onComplete: () => void): LottiePlayerRequest {
  return { kind, onComplete, instanceId: nextInstanceId++ };
}

/** 入場・クリア演出をアプリ内の LottieView 1 つで再生 */
export const useLottiePlayerStore = create<LottiePlayerState>((set) => ({
  request: null,
  showEnter: (onComplete) => set({ request: nextRequest('enter', onComplete) }),
  showClear: (onComplete) => set({ request: nextRequest('clear', onComplete) }),
  hide: () => set({ request: null }),
}));

export function isClearLottieActive(request: LottiePlayerRequest | null): boolean {
  return request?.kind === 'clear';
}
