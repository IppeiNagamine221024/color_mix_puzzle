import { EnterLottieView } from '@/components/lottie/EnterLottieView';
import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { getLottieDurationMs, getLottieSource, LOTTIE_CONFIG } from '@/src/lottie/catalog';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  /** 退場時は逆再生 */
  reverse?: boolean;
  onDismiss: () => void;
};

const ENTER_EXIT_SOURCE = getLottieSource('enter') as { op?: number };
const TOTAL_FRAMES =
  typeof ENTER_EXIT_SOURCE.op === 'number' ? Math.max(1, ENTER_EXIT_SOURCE.op) : 60;

/** ステージ入場・退場の全画面 Lottie オーバーレイ */
export function StageEnterExitLottieOverlay({ visible, reverse = false, onDismiss }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const invokeDismiss = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setTimeout(() => onDismissRef.current(), LOTTIE_CONFIG.postDelayMs);
  }, []);

  useEffect(() => {
    if (!visible) {
      finishedRef.current = false;
      return;
    }
    finishedRef.current = false;
    const durationMs = getLottieDurationMs('enter');
    const id = setTimeout(invokeDismiss, durationMs + 250);
    return () => clearTimeout(id);
  }, [visible, invokeDismiss]);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      lottieRef.current?.reset();
      if (reverse) {
        lottieRef.current?.play(TOTAL_FRAMES, 0);
      } else {
        lottieRef.current?.play();
      }
    }, 16);
    return () => {
      clearTimeout(id);
      lottieRef.current?.pause();
    };
  }, [visible, reverse]);

  const onAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled) return;
      invokeDismiss();
    },
    [invokeDismiss],
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <EnterLottieView
        ref={lottieRef}
        style={styles.lottie}
        resizeMode="cover"
        autoPlay={false}
        loop={false}
        onAnimationFinish={onAnimationFinish}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={invokeDismiss}
        accessibilityRole="button"
        accessibilityLabel="タップでスキップ"
      />
      <Text style={styles.skipHint} pointerEvents="none">
        タップでスキップ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: Theme.bg,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  skipHint: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    zIndex: 2,
    ...woodText,
    fontSize: 12,
    color: Theme.textDim,
    opacity: 0.85,
  },
});
