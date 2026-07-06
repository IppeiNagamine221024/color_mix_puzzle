/**
 * iOS Fabric 向けクリア演出の修正版（開発ビルド必須）。
 * 有効化手順: docs/lottie-ios-clear-fix.md
 */
import { ContinueHint } from '@/components/lottie/ContinueHint';
import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import {
  getLottieDurationMs,
  getLottieSource,
  LOTTIE_CONFIG,
} from '@/src/lottie/catalog';
import { useLottiePlayerStore } from '@/src/stores/pending/lottiePlayerStore';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/** アプリ内の唯一の LottieView — enter / clear を順番に再生 */
export function AppLottiePlayer() {
  const request = useLottiePlayerStore((s) => s.request);
  const hide = useLottiePlayerStore((s) => s.hide);

  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const [animationDone, setAnimationDone] = useState(false);

  const kind = request?.kind;
  const instanceId = request?.instanceId ?? 0;
  onCompleteRef.current = request?.onComplete ?? null;

  const source = useMemo(() => {
    if (kind == null) return null;
    const raw = getLottieSource(kind);
    if (kind === 'clear') {
      const clone = JSON.parse(JSON.stringify(raw)) as { nm?: string };
      clone.nm = `${clone.nm ?? 'clear'}-${instanceId}`;
      return clone;
    }
    return raw;
  }, [kind, instanceId]);

  const invokeComplete = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const cb = onCompleteRef.current;
    hide();
    setTimeout(() => cb?.(), LOTTIE_CONFIG.postDelayMs);
  }, [hide]);

  const markAnimationDone = useCallback(() => {
    if (animationDoneRef.current) return;
    animationDoneRef.current = true;
    setAnimationDone(true);
  }, []);

  const invokeEnterDone = useCallback(() => {
    invokeComplete();
  }, [invokeComplete]);

  useEffect(() => {
    if (!request) {
      finishedRef.current = false;
      animationDoneRef.current = false;
      setAnimationDone(false);
      return;
    }
    finishedRef.current = false;
    animationDoneRef.current = false;
    setAnimationDone(false);

    const durationMs = getLottieDurationMs(request.kind);
    const id = setTimeout(() => {
      if (request.kind === 'enter') {
        invokeEnterDone();
      } else {
        markAnimationDone();
      }
    }, durationMs + 250);
    return () => clearTimeout(id);
  }, [request, instanceId, invokeEnterDone, markAnimationDone]);

  const onAnimationLoaded = useCallback(() => {
    lottieRef.current?.reset();
    lottieRef.current?.play();
  }, []);

  const onAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled || !kind) return;
      if (kind === 'enter') {
        invokeEnterDone();
      } else {
        markAnimationDone();
      }
    },
    [kind, invokeEnterDone, markAnimationDone],
  );

  const onPress = useCallback(() => {
    if (kind === 'enter') {
      invokeEnterDone();
      return;
    }
    if (animationDone) invokeComplete();
  }, [kind, animationDone, invokeEnterDone, invokeComplete]);

  useEffect(() => {
    if (!request) {
      lottieRef.current?.pause();
    }
  }, [request]);

  if (!request || source == null) return null;

  const isEnter = kind === 'enter';
  const showLottie = isEnter || !animationDone;

  return (
    <View
      style={[styles.overlay, isEnter ? styles.enterBg : styles.clearBg]}
      pointerEvents="box-none"
    >
      {showLottie && (
        <LottieView
          key={`${kind}-${instanceId}`}
          ref={lottieRef}
          source={source}
          style={styles.lottie}
          resizeMode="cover"
          autoPlay={false}
          loop={false}
          cacheComposition={false}
          renderMode={Platform.OS === 'ios' ? 'SOFTWARE' : undefined}
          onAnimationLoaded={onAnimationLoaded}
          onAnimationFinish={onAnimationFinish}
        />
      )}

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={isEnter ? 'タップでスキップ' : animationDone ? 'タップで続ける' : '演出'}
      />

      {isEnter && (
        <Text style={styles.skipHint} pointerEvents="none">
          タップでスキップ
        </Text>
      )}
      {!isEnter && animationDone && <ContinueHint text="タップで続ける" />}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  enterBg: {
    backgroundColor: Theme.bg,
  },
  clearBg: {
    backgroundColor: 'rgba(0,0,0,0.45)',
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
