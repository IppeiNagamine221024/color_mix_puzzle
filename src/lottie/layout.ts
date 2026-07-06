import { Dimensions, type ViewStyle } from 'react-native';

/** Lottie コンポジションの基準サイズ（enter.json 等と一致） */
export const LOTTIE_COMP_SIZE = {
  width: 1080,
  height: 1920,
} as const;

/**
 * iOS で resizeMode=cover が効かない場合の余白対策。
 * screen 寸法 + わずかなオーバースキャンで四隅の隙間を防ぐ。
 */
const OVERSCAN = 6;

export function lottieFullScreenStyle(): ViewStyle {
  const { width, height } = Dimensions.get('screen');
  return {
    position: 'absolute',
    top: -OVERSCAN,
    left: -OVERSCAN,
    width: width + OVERSCAN * 2,
    height: height + OVERSCAN * 2,
  };
}
