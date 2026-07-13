/**
 * 入場・退場・クリア演出 — _layout にマウントする単一 LottieView。
 * @see docs/lottie-ios-clear-fix.md
 */
import { ContinueHint } from '@/components/lottie/ContinueHint';
import { EnterLottieView } from '@/components/lottie/EnterLottieView';
import { ClearShareOverlay } from '@/components/share';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText } from '@/constants/wood';
import {
  getLottieCompleteOn,
  getLottieDurationMs,
  getLottieOverlayMode,
  getLottieSource,
  LOTTIE_CONFIG,
} from '@/src/lottie/catalog';
import { animationToFileUri } from '@/src/lottie/animationToFileUri';
import { playSe } from '@/src/audio/playSe';
import { useClearShareStore } from '@/src/stores/clearShareStore';
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
import type { LottieTransitionId } from '@/src/lottie/types';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LottieSourceProp = LottieViewProps['source'];

const ENTER_EXIT_SOURCE = getLottieSource('enter') as { op?: number };
const ENTER_EXIT_TOTAL_FRAMES =
  typeof ENTER_EXIT_SOURCE.op === 'number' ? Math.max(1, ENTER_EXIT_SOURCE.op) : 60;

export function AppLottiePlayer() {
  const request = useLottiePlayerStore((s) => s.request);
  const coverActive = useLottiePlayerStore((s) => s.coverActive);
  const hide = useLottiePlayerStore((s) => s.hide);
  const shareStageId = useClearShareStore((s) => s.stageId);
  const shareImageUri = useClearShareStore((s) => s.imageUri);
  const clearSharePayload = useClearShareStore((s) => s.clear);
  const insets = useSafeAreaInsets();

  const lottieRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const [clearUri, setClearUri] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [compositionLoaded, setCompositionLoaded] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const kind: LottieTransitionId = request?.kind ?? 'enter';
  const instanceId = request?.instanceId ?? 0;
  const tapAfterAnimation = request ? getLottieCompleteOn(kind) === 'tapAfterAnimation' : false;
  const overlayMode = request ? getLottieOverlayMode(kind) : 'fullscreen';
  const showClearShareEntry =
    request?.kind === 'clear' && animationDone && !shareSheetOpen && shareStageId != null;

  onCompleteRef.current = request?.onComplete ?? null;

  const resetPlayerProgress = useCallback(() => {
    try {
      lottieRef.current?.reset();
      lottieRef.current?.pause();
    } catch {
      // native view が既に解放されている場合は無視
    }
  }, []);

  useEffect(() => {
    if (!request || request.kind !== 'clear') {
      setClearUri(null);
      setShareSheetOpen(false);
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
      resetPlayerProgress();
      hide();
      cb?.();
      return;
    }

    if (currentKind === 'clear') {
      setShareSheetOpen(false);
      clearSharePayload();
      hide();
      cb?.();
      return;
    }

    hide();
    setTimeout(() => cb?.(), LOTTIE_CONFIG.postDelayMs);
  }, [clearSharePayload, hide, request?.kind, resetPlayerProgress]);

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
      setShareSheetOpen(false);
      resetPlayerProgress();
      return;
    }
    finishedRef.current = false;
    animationDoneRef.current = false;
    setAnimationDone(false);
    setCompositionLoaded(false);
    setShareSheetOpen(false);
  }, [request, instanceId, resetPlayerProgress]);

  useEffect(() => {
    if (!request || request.kind === 'exit' || !compositionLoaded) return;

    const durationMs = getLottieDurationMs(request.kind);
    const id = setTimeout(markAnimationDone, durationMs + 250);
    return () => clearTimeout(id);
  }, [request, instanceId, compositionLoaded, markAnimationDone]);

  useEffect(() => {
    if (!request || (request.kind !== 'enter' && request.kind !== 'exit')) return;

    const durationMs = getLottieDurationMs(request.kind);
    const playId = setTimeout(() => {
      lottieRef.current?.reset();
      if (request.kind === 'exit') {
        lottieRef.current?.play(ENTER_EXIT_TOTAL_FRAMES, 0);
      } else {
        lottieRef.current?.play(0, ENTER_EXIT_TOTAL_FRAMES);
      }
    }, 16);
    const doneId = setTimeout(markAnimationDone, durationMs + 250);

    return () => {
      clearTimeout(playId);
      clearTimeout(doneId);
      resetPlayerProgress();
    };
  }, [request, instanceId, markAnimationDone, resetPlayerProgress]);

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
    if (shareSheetOpen) return;
    if (tapAfterAnimation) {
      if (animationDone) invokeComplete();
      return;
    }
    invokeComplete();
  }, [animationDone, invokeComplete, shareSheetOpen, tapAfterAnimation]);

  const openShareSheet = useCallback(() => {
    playSe('uiTap');
    setShareSheetOpen(true);
  }, []);

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
            autoPlay={false}
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

          {showClearShareEntry ? (
            <Pressable
              style={[styles.shareEntryBtn, { top: insets.top + 12 }]}
              onPress={openShareSheet}
              accessibilityRole="button"
              accessibilityLabel="SNSでシェア"
            >
              <Text style={styles.shareEntryText}>SNSでシェア</Text>
            </Pressable>
          ) : null}

          {shareSheetOpen && shareStageId != null ? (
            <ClearShareOverlay
              visible
              stageId={shareStageId}
              imageUri={shareImageUri}
              onClose={() => setShareSheetOpen(false)}
            />
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
  shareEntryBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    elevation: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...woodButton(Theme.surfaceRaised),
  },
  shareEntryText: {
    ...woodText,
    fontSize: 13,
    fontWeight: '700',
    color: Theme.accent,
  },
});
