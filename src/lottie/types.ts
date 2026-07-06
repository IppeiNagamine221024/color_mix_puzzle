import type { LOTTIE_SOURCES } from '@/src/lottie/catalog';

/** 画面遷移用 Lottie の種別（入場 / クリア / 退場） */
export type LottieTransitionId = keyof typeof LOTTIE_SOURCES;

/** オーバーレイ表示モード */
export type LottieOverlayMode = 'fullscreen' | 'transparent';

/** アニメ終了後の進行方法 */
export type LottieCompleteOn = 'animationEnd' | 'tapAfterAnimation';

export type LottieTransitionMeta = {
  id: LottieTransitionId;
};
