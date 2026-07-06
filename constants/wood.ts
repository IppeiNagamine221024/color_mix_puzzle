import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { Theme } from './Theme';

/** 見出し用セリフ（手作り感） */
export const WoodFont = {
  title: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })!,
};

export const woodShadow: ViewStyle = {
  shadowColor: Theme.shadow,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.22,
  shadowRadius: 5,
  elevation: 4,
};

export const woodText: TextStyle = {
  color: Theme.text,
};

export const woodTitle: TextStyle = {
  fontFamily: WoodFont.title,
  color: Theme.text,
};

/** 木製トレイ・パネル（少し浮き上がった板） */
export const woodPanel: ViewStyle = {
  backgroundColor: Theme.surfaceRaised,
  borderRadius: 14,
  borderWidth: 2,
  borderColor: Theme.border,
  ...woodShadow,
};

/** パレットのくぼみ（絵の具を置く溝） */
export function woodWell(): ViewStyle {
  return {
    backgroundColor: Theme.boardEmpty,
    borderRadius: 10,
    borderWidth: 2,
    borderTopColor: Theme.borderStrong,
    borderLeftColor: Theme.borderStrong,
    borderRightColor: Theme.borderLight,
    borderBottomColor: Theme.borderLight,
  };
}

/** 木製ボタン・絵の具ラベル風 */
export function woodButton(bg: string, pressed = false): ViewStyle {
  return {
    backgroundColor: bg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: pressed ? Theme.borderStrong : Theme.borderLight,
    ...(pressed ? { transform: [{ scale: 0.97 }] } : woodShadow),
  };
}

/** ステージ選択の木製タイル */
export function woodTile(bg: string, highlight = false): ViewStyle {
  return {
    backgroundColor: bg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: highlight ? Theme.accent : Theme.border,
    ...woodShadow,
  };
}

/** 盤面外枠（パレット本体） */
export const woodFrame: ViewStyle = {
  padding: 10,
  backgroundColor: Theme.boardFrame,
  borderRadius: 16,
  borderWidth: 3,
  borderColor: Theme.border,
  borderTopColor: Theme.borderLight,
  borderLeftColor: Theme.borderLight,
  ...woodShadow,
};
