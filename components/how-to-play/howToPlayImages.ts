import type { ImageSourcePropType } from 'react-native';

export type HowToPlaySlide = {
  id: string;
  source: ImageSourcePropType;
  accessibilityLabel: string;
};

export const HOW_TO_PLAY_SLIDES: HowToPlaySlide[] = [
  {
    id: 'purpose',
    source: require('@/assets/images/how-to-play/htp_purpose.png'),
    accessibilityLabel: 'ゲームの目的。課題パターンと同じ配色を盤面上に再現するとクリアです。',
  },
  {
    id: 'slide',
    source: require('@/assets/images/how-to-play/htp_slide.png'),
    accessibilityLabel:
      'スライド操作。盤面をスワイプしてブロックを動かし、反対側に新しい色が出現します。',
  },
  {
    id: 'mix',
    source: require('@/assets/images/how-to-play/htp_mix.png'),
    accessibilityLabel: '混合操作。隣り合うブロックを混ぜて新しい色を作ります。',
  },
  {
    id: 'replace',
    source: require('@/assets/images/how-to-play/htp_replace.png'),
    accessibilityLabel: '入替操作。隣り合うブロックの位置を入れ替えます。',
  },
  {
    id: 'hint',
    source: require('@/assets/images/how-to-play/hint.png'),
    accessibilityLabel: 'ヒント機能。課題パターンの色の作り方を確認できます。',
  },
];
