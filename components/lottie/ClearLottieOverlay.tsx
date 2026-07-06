import { ClearLottieView, getClearAnimationMeta } from '@/components/lottie/ClearLottieView';
import { ContinueHint } from '@/components/lottie/ContinueHint';
import { getLottieDurationFromSource, LOTTIE_CONFIG } from '@/src/lottie/catalog';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  visible: boolean;
  playId: number;
  onComplete: () => void;
};

/**
 * クリア演出 — ゲーム画面内の View オーバーレイ（Expo Go 向け現行構成）。
 * iOS では enter がゴースト表示される既知バグあり → docs/lottie-ios-clear-fix.md
 */
export function ClearLottieOverlay({ visible, playId, onComplete }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [animationDone, setAnimationDone] = useState(false);

  const invokeComplete = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setTimeout(() => onCompleteRef.current(), LOTTIE_CONFIG.postDelayMs);
  }, []);

  const markAnimationDone = useCallback(() => {
    if (animationDoneRef.current) return;
    animationDoneRef.current = true;
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (!visible) {
      finishedRef.current = false;
      animationDoneRef.current = false;
      setAnimationDone(false);
      return;
    }
    finishedRef.current = false;
    animationDoneRef.current = false;
    setAnimationDone(false);

    const meta = getClearAnimationMeta();
    const durationMs = getLottieDurationFromSource(meta);
    const id = setTimeout(markAnimationDone, durationMs + 250);
    return () => clearTimeout(id);
  }, [visible, playId, markAnimationDone]);

  const onAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled) return;
      markAnimationDone();
    },
    [markAnimationDone],
  );

  const onPress = useCallback(() => {
    if (animationDone) invokeComplete();
  }, [animationDone, invokeComplete]);

  useEffect(() => {
    if (!visible) return;
    return () => {
      lottieRef.current?.pause();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {!animationDone && (
        <ClearLottieView
          key={playId}
          playId={playId}
          ref={lottieRef}
          style={styles.lottie}
          resizeMode="cover"
          autoPlay={false}
          loop={false}
          onAnimationFinish={onAnimationFinish}
        />
      )}

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={animationDone ? 'タップで続ける' : '演出'}
      />

      {animationDone && <ContinueHint text="タップで続ける" />}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
