/**
 * 音源カタログ — 差し替えはこのファイルのパスだけ変更すれば OK。
 *
 * 対応形式: .wav / .mp3 / .m4a など expo-audio が再生できる形式
 * ファイル名を変えない限り、中身だけ上書きしても反映される（キャッシュクリア推奨: npx expo start -c）
 */
export const AUDIO_CONFIG = {
  /** 初回起動時の既定値。保存済み設定は settingsStore を参照 */
  defaultBgmVolume: 0.45,
  defaultSeVolume: 0.85,
} as const;

export const BGM_SOURCES = {
  home: require('@/assets/audio/bgm/greenpark.mp3'),
  game: require('@/assets/audio/bgm/game.mp3'),
} as const;

export const SE_SOURCES = {
  start: require('@/assets/audio/se/start.mp3'),
  slide: require('@/assets/audio/se/slide.mp3'),
  mix: require('@/assets/audio/se/mix.mp3'),
  swap: require('@/assets/audio/se/swap.mp3'),
  clear: require('@/assets/audio/se/clear.mp3'),
  gameover: require('@/assets/audio/se/gameover.mp3'),
  invalid: require('@/assets/audio/se/invalid.mp3'),
  uiTap: require('@/assets/audio/se/ui_tap.mp3'),
} as const;

export type BgmId = keyof typeof BGM_SOURCES;
export type SeId = keyof typeof SE_SOURCES;
