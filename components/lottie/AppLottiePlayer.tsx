/**
 * 入場・退場・クリア演出 — _layout にマウントする単一 LottieView。
 * @see docs/lottie-ios-clear-fix.md
 *
 * Android 注意:
 * - New Architecture 環境でマウント直後に onAnimationFinish(false) が誤発火することがある
 * - onAnimationLoaded が来ない端末があるため、尺ベースの保険タイマーはリクエスト開始時点で仕掛ける
 * - clear は iOS のみ file URI（Fabric ゴースト回避）。Android は require 直読みが安定
 */
import { ContinueHint } from '@/components/lottie/ContinueHint';
import { EnterLottieView } from '@/components/lottie/EnterLottieView';
import { ClearShareOverlay } from '@/components/share';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText } from '@/constants/wood';
import { playSe } from '@/src/audio/playSe';
import {
  getLottieCompleteOn,
  getLottieDurationMs,
  getLottieOverlayMode,
  getLottieSource,
  LOTTIE_CONFIG,
} from '@/src/lottie/catalog';
import { animationToFileUri } from '@/src/lottie/animationToFileUri';
import type { LottieTransitionId } from '@/src/lottie/types';
import { useClearShareStore } from '@/src/stores/clearShareStore';
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LottieSourceProp = LottieViewProps['source'];

const ENTER_EXIT_SOURCE = getLottieSource('enter') as { op?: number };
const ENTER_EXIT_TOTAL_FRAMES =
  typeof ENTER_EXIT_SOURCE.op === 'number' ? Math.max(1, ENTER_EXIT_SOURCE.op) : 60;

/** マウント直後の誤発火 onAnimationFinish を無視する最短再生時間 */
const MIN_PLAY_MS_BEFORE_FINISH = 400;

/** Android はネイティブ View 初期化待ちを少し長くする */
const PLAY_DELAY_MS = Platform.OS === 'android' ? 80 : 16;

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
  const playStartedAtRef = useRef(0);
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

    // iOS のみ file URI 経由（Fabric で enter が残る問題の回避）
    if (Platform.OS !== 'ios') {
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
    if (Platform.OS === 'ios') {
      return clearUri ? { uri: clearUri } : null;
    }
    return getLottieSource('clear');
  }, [request, clearUri]);

  const invokeComplete = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const cb = onCompleteRef.current;
    const currentKind = request?.kind;

    if (currentKind === 'enter' || currentKind === 'exit') {
      // iOS: 既存どおり reset。Android: reset で先頭フレームに戻るとチラつくため
      // hide 後の単色カバーに任せる（カバーは coverActive で残る）
      if (Platform.OS === 'ios') {
        resetPlayerProgress();
      }
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
      playStartedAtRef.current = 0;
      setAnimationDone(false);
      setCompositionLoaded(false);
      setShareSheetOpen(false);
      resetPlayerProgress();
      return;
    }
    finishedRef.current = false;
    animationDoneRef.current = false;
    playStartedAtRef.current = 0;
    setAnimationDone(false);
    setCompositionLoaded(false);
    setShareSheetOpen(false);
  }, [request, instanceId, resetPlayerProgress]);

  // onAnimationLoaded / onAnimationFinish に依存しない保険（クリア詰まり対策）
  useEffect(() => {
    if (!request) return;
    const durationMs = getLottieDurationMs(request.kind);
    const id = setTimeout(markAnimationDone, durationMs + 500);
    return () => clearTimeout(id);
  }, [request, instanceId, markAnimationDone]);

  // 入場・退場: composition 読み込み後に play（来ない場合は保険タイムアウトで開始）
  useEffect(() => {
    if (!request || (request.kind !== 'enter' && request.kind !== 'exit')) return;

    const startPlay = () => {
      try {
        // Android では reset→即 play がキャンセル扱いになりやすいので reset を避ける
        if (Platform.OS === 'ios') {
          lottieRef.current?.reset();
        }
        playStartedAtRef.current = Date.now();
        if (request.kind === 'exit') {
          lottieRef.current?.play(ENTER_EXIT_TOTAL_FRAMES, 0);
        } else {
          lottieRef.current?.play(0, ENTER_EXIT_TOTAL_FRAMES);
        }
      } catch {
        // ignore
      }
    };

    const delayMs = compositionLoaded
      ? PLAY_DELAY_MS
      : Platform.OS === 'android'
        ? 300
        : 120;
    const playId = setTimeout(startPlay, delayMs);
    return () => clearTimeout(playId);
  }, [request, instanceId, compositionLoaded]);

  // クリア: Android は autoPlay が不安定なことがあるため明示 play
  useEffect(() => {
    if (!request || request.kind !== 'clear') return;
    if (Platform.OS !== 'android') return;

    const startPlay = () => {
      try {
        playStartedAtRef.current = Date.now();
        lottieRef.current?.play();
      } catch {
        // ignore
      }
    };

    const delayMs = compositionLoaded ? PLAY_DELAY_MS : 300;
    const playId = setTimeout(startPlay, delayMs);
    return () => clearTimeout(playId);
  }, [request, instanceId, compositionLoaded]);

  const onAnimationLoaded = useCallback(() => {
    setCompositionLoaded(true);
    // iOS clear の autoPlay 向けに再生開始時刻を記録
    if (playStartedAtRef.current === 0) {
      playStartedAtRef.current = Date.now();
    }
  }, []);

  const onAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled) return;
      // Android New Arch でマウント直後に false が飛んでくる誤発火を無視
      if (
        playStartedAtRef.current === 0 ||
        Date.now() - playStartedAtRef.current < MIN_PLAY_MS_BEFORE_FINISH
      ) {
        return;
      }
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
    <View
      style={[styles.overlay, { backgroundColor: overlayBackground }]}
      // カバーのみの間は auto で確実に前面レイヤーとして残す（box-none だと Android で一瞬下が見えることがある）
      pointerEvents={request ? 'box-none' : 'auto'}
    >
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
            // iOS は autoPlay、Android は load 後に手動 play
            autoPlay={Platform.OS === 'ios'}
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
