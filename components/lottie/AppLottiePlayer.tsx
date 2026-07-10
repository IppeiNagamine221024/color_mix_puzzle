/**
 * 入場・退場・クリア演出 — _layout にマウントする単一 LottieView。
 * @see docs/lottie-ios-clear-fix.md
 */
import { ContinueHint } from '@/components/lottie/ContinueHint';
import { EnterLottieView } from '@/components/lottie/EnterLottieView';
import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import {
  getLottieCompleteOn,
  getLottieDurationMs,
  getLottieOverlayMode,
  getLottieSource,
  LOTTIE_CONFIG,
} from '@/src/lottie/catalog';
import { animationToFileUri } from '@/src/lottie/animationToFileUri';
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
import type { LottieTransitionId } from '@/src/lottie/types';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LottieSourceProp = LottieViewProps['source'];

const ENTER_EXIT_SOURCE = getLottieSource('enter') as { op?: number };
const ENTER_EXIT_TOTAL_FRAMES =
  typeof ENTER_EXIT_SOURCE.op === 'number' ? Math.max(1, ENTER_EXIT_SOURCE.op) : 60;

export function AppLottiePlayer() {
  const request = useLottiePlayerStore((s) => s.request);
  const coverActive = useLottiePlayerStore((s) => s.coverActive);
  const hide = useLottiePlayerStore((s) => s.hide);

  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const [clearUri, setClearUri] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [compositionLoaded, setCompositionLoaded] = useState(false);

  const kind: LottieTransitionId = request?.kind ?? 'enter';
  const instanceId = request?.instanceId ?? 0;
  const tapAfterAnimation = request ? getLottieCompleteOn(kind) === 'tapAfterAnimation' : false;
  const overlayMode = request ? getLottieOverlayMode(kind) : 'fullscreen';

  onCompleteRef.current = request?.onComplete ?? null;

  useEffect(() => {
    if (!request || request.kind !== 'clear') {
      setClearUri(null);
      return;
    }

    const uri = animationToFileUri(
      getLottieSource('clear'),
      `lottie-clear-${request.instanceId}.json`,
      request.instanceId,
    );
    setClearUri(uri);
    return () => setClearUri(null);
  }, [request, instanceId]);

  const source = useMemo((): LottieSourceProp | null => {
    if (!request) return null;
    if (request.kind === 'enter' || request.kind === 'exit') {
      return getLottieSource('enter');
    }
    return clearUri ? { uri: clearUri } : null;
  }, [request, clearUri]);

  const invokeComplete = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const cb = onCompleteRef.current;
    const currentKind = request?.kind;

    if (currentKind === 'enter' || currentKind === 'exit') {
      // 遷移を先に実行し、単色カバーは先画面の描画まで残す
      hide();
      cb?.();
      return;
    }

    if (currentKind === 'clear') {
      // cb 内で showExit が新しい request をセットする
      cb?.();
      return;
    }

    hide();
    setTimeout(() => cb?.(), LOTTIE_CONFIG.postDelayMs);
  }, [hide, request?.kind]);

  const markAnimationDone = useCallback(() => {
    if (animationDoneRef.current) return;
    animationDoneRef.current = true;
    setAnimationDone(true);
    if (!tapAfterAnimation) {
      invokeComplete();
    }
  }, [invokeComplete, tapAfterAnimation]);

  useEffect(() => {
    if (!request) {
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
  }, [request, instanceId]);

  useEffect(() => {
    if (!request || request.kind === 'exit' || !compositionLoaded) return;

    const durationMs = getLottieDurationMs(request.kind);
    const id = setTimeout(markAnimationDone, durationMs + 250);
    return () => clearTimeout(id);
  }, [request, instanceId, compositionLoaded, markAnimationDone]);

  useEffect(() => {
    if (!request || request.kind !== 'exit') return;

    const durationMs = getLottieDurationMs('exit');
    const playId = setTimeout(() => {
      lottieRef.current?.reset();
      lottieRef.current?.play(ENTER_EXIT_TOTAL_FRAMES, 0);
    }, 16);
    const doneId = setTimeout(markAnimationDone, durationMs + 250);

    return () => {
      clearTimeout(playId);
      clearTimeout(doneId);
      lottieRef.current?.pause();
    };
  }, [request, instanceId, markAnimationDone]);

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
    if (tapAfterAnimation) {
      if (animationDone) invokeComplete();
      return;
    }
    invokeComplete();
  }, [animationDone, invokeComplete, tapAfterAnimation]);

  useEffect(() => {
    if (!request) {
      lottieRef.current?.pause();
    }
  }, [request]);

  if (!request && !coverActive) return null;

  const overlayBackground =
    !request || overlayMode === 'fullscreen' ? Theme.bg : 'rgba(0,0,0,0.45)';

  return (
    <View style={[styles.overlay, { backgroundColor: overlayBackground }]} pointerEvents="box-none">
      {source != null &&
        (kind === 'enter' || kind === 'exit' ? (
          <EnterLottieView
            key={`${kind}-${instanceId}`}
            ref={lottieRef}
            style={styles.lottie}
            resizeMode="cover"
            autoPlay={kind === 'enter'}
            loop={false}
            onAnimationLoaded={onAnimationLoaded}
            onAnimationFinish={onAnimationFinish}
          />
        ) : (
          <LottieView
            key={`${kind}-${instanceId}`}
            ref={lottieRef}
            source={source}
            style={styles.lottie}
            resizeMode="cover"
            autoPlay
            loop={false}
            cacheComposition={false}
            onAnimationLoaded={onAnimationLoaded}
            onAnimationFinish={onAnimationFinish}
          />
        ))}

      {request != null && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={
              tapAfterAnimation && animationDone ? 'タップで続ける' : 'タップでスキップ'
            }
          />

          {tapAfterAnimation && animationDone ? (
            <ContinueHint text="タップで続ける" />
          ) : !tapAfterAnimation ? (
            <Text style={styles.skipHint} pointerEvents="none">
              タップでスキップ
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
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
