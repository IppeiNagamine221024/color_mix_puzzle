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

/** クリア演出 — ゲーム画面内オーバーレイ（exit と同階層） */
export function ClearLottieOverlay({ visible, playId, onComplete }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [animationDone, setAnimationDone] = useState(false);
  const [compositionLoaded, setCompositionLoaded] = useState(false);

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
      setCompositionLoaded(false);
      return;
    }
    finishedRef.current = false;
    animationDoneRef.current = false;
    setAnimationDone(false);
    setCompositionLoaded(false);
  }, [visible, playId]);

  useEffect(() => {
    if (!visible || !compositionLoaded) return;

    const meta = getClearAnimationMeta();
    const durationMs = getLottieDurationFromSource(meta);
    const id = setTimeout(markAnimationDone, durationMs + 250);
    return () => clearTimeout(id);
  }, [visible, playId, compositionLoaded, markAnimationDone]);

  const onAnimationLoaded = useCallback(() => {
    setCompositionLoaded(true);
  }, []);

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
    if (!visible) {
      lottieRef.current?.pause();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <ClearLottieView
          key={playId}
          playId={playId}
          ref={lottieRef}
          style={styles.lottie}
          resizeMode="cover"
          autoPlay={false}
          loop={false}
          onAnimationLoaded={onAnimationLoaded}
          onAnimationFinish={onAnimationFinish}
        />

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
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
