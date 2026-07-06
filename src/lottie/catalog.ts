/**
 * Lottie 遷移アニメーションのカタログ。
 * 差し替えは assets/lottie/ の JSON を上書きするだけ（パス変更不要）。
 *
 * 形式: .json（Bodymovin / LottieFiles エクスポート）
 * 推奨: 1080×1920 縦、30fps、ループなし
 * 透過重ね（clear 等）: JSON に背景レイヤーを入れない
 * 全画面マスク（入場・退場）: オーバーレイ側が Theme.bg を敷く
 */
import type { LottieCompleteOn, LottieOverlayMode } from '@/src/lottie/types';

export const LOTTIE_CONFIG = {
  /** タップでスキップ可能（入場・退場・クリア共通） */
  allowSkip: true,
  /** アニメ終了後、遷移までの余白（ms） */
  postDelayMs: 80,
  /** 入場・退場 Lottie の想定尺（秒）— stage_enter_exit.json と一致させる */
  enterDurationSec: 2,
} as const;

export const LOTTIE_SOURCES = {
  /** ステージ入場・退場 — 絵の具が混ざる演出 */
  enter: require('@/assets/lottie/stage_enter_exit.json'),
  /** ステージクリア — グロー演出 */
  clear: require('@/assets/lottie/clear.json'),
  /** ステージ退場（enter と同一アセット） */
  exit: require('@/assets/lottie/stage_enter_exit.json'),
} as const;

/** transition ID から Lottie ソースを取得（動的キー参照を避ける） */
export function getLottieSource(id: keyof typeof LOTTIE_SOURCES) {
  switch (id) {
    case 'enter':
      return LOTTIE_SOURCES.enter;
    case 'clear':
      return LOTTIE_SOURCES.clear;
    case 'exit':
      return LOTTIE_SOURCES.exit;
  }
}

/** 演出ごとの既定オーバーレイモード */
export const LOTTIE_OVERLAY_MODES: Record<keyof typeof LOTTIE_SOURCES, LottieOverlayMode> = {
  enter: 'fullscreen',
  clear: 'transparent',
  exit: 'fullscreen',
};

export function getLottieOverlayMode(id: keyof typeof LOTTIE_SOURCES): LottieOverlayMode {
  return LOTTIE_OVERLAY_MODES[id];
}

/** 演出ごとの完了トリガー（clear はアニメ後にタップで進行） */
export const LOTTIE_COMPLETE_ON: Record<keyof typeof LOTTIE_SOURCES, LottieCompleteOn> = {
  enter: 'animationEnd',
  clear: 'tapAfterAnimation',
  exit: 'animationEnd',
};

export function getLottieCompleteOn(id: keyof typeof LOTTIE_SOURCES): LottieCompleteOn {
  return LOTTIE_COMPLETE_ON[id];
}

/**
 * Lottie JSON の op / fr から再生時間（ms）を算出する。
 * onAnimationFinish が発火しない環境向けの自動進行タイマーに使う。
 */
export function getLottieDurationMs(id: keyof typeof LOTTIE_SOURCES): number {
  return getLottieDurationFromSource(getLottieSource(id));
}

/** 任意の Lottie JSON から再生時間（ms）を算出 */
export function getLottieDurationFromSource(src: { op?: number; fr?: number }): number {
  const op = typeof src.op === 'number' ? src.op : 30;
  const fr = typeof src.fr === 'number' && src.fr > 0 ? src.fr : 30;
  return (op / fr) * 1000;
}

/** デバッグ・検証用 — JSON のコンポジション名 */
export function getLottieCompositionName(src: { nm?: string }): string {
  return typeof src.nm === 'string' ? src.nm : '(unknown)';
}
