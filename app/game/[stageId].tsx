import { ClearShareOverlay } from '@/components/share';
import { BoardView } from '@/components/BoardView';
import { ColorRecipeHintOverlay } from '@/components/ColorRecipeHintOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { PatternView } from '@/components/PatternView';
import { SwipeZone } from '@/components/SwipeZone';
import { actionColors, Theme } from '@/constants/Theme';
import { GAME_TOP_STATUS_WIDTH } from '@/constants/gameLayout';
import { woodButton, woodPanel, woodText, woodTitle, woodWell } from '@/constants/wood';
import { playSe } from '@/src/audio/playSe';
import { useBgm } from '@/src/audio/useBgm';
import {
    applyMix,
    applySlide,
    applySwap,
    canUseAction,
    createSession,
    sessionFromProgress,
    type GameSession,
} from '@/src/game/engine';
import { findPatternMatchPositions } from '@/src/game/pattern';
import { getStageById, isTutorialStage } from '@/src/game/stages';
import { useAppStore } from '@/src/stores/appStore';
import { isClearLottieActive, isExitLottieActive, useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
import type { BoardAnimation } from '@/src/types/animation';
import type { Direction } from '@/src/types/board';
import { COLOR_HEX, COLOR_LABELS } from '@/src/types/colors';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

type UiMode = 'idle' | 'A' | 'C';

export default function GameScreen() {
  const router = useRouter();
  const { stageId: stageIdParam, continue: continueParam, started: startedParam } = useLocalSearchParams<{
    stageId: string;
    continue?: string;
    started?: string;
  }>();
  const stageId = Number(stageIdParam);
  const stage = getStageById(stageId);
  const { save, setStageProgress, clearStage, gameOver, startStage } = useAppStore();
  const [session, setSession] = useState<GameSession | null>(null);
  const showClear = useLottiePlayerStore((s) => s.showClear);
  const showExit = useLottiePlayerStore((s) => s.showExit);
  const dismissCover = useLottiePlayerStore((s) => s.dismissCover);
  const lottieRequest = useLottiePlayerStore((s) => s.request);
  const coverActive = useLottiePlayerStore((s) => s.coverActive);
  const leavingRef = useRef(false);
  const captureRef = useRef<ViewShot>(null);
  const pendingAfterExitRef = useRef<(() => void | Promise<void>) | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareImageUri, setShareImageUri] = useState<string | null>(null);
  const [uiMode, setUiMode] = useState<UiMode>('idle');
  const [selection, setSelection] = useState<{ x: number; y: number }[]>([]);
  const [patternGlow, setPatternGlow] = useState(false);
  const [recipeHintVisible, setRecipeHintVisible] = useState(false);
  const [boardAnimation, setBoardAnimation] = useState<BoardAnimation | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pendingAfterAnim = useRef<(() => void | Promise<void>) | null>(null);

  const clearOverlayActive = isClearLottieActive(lottieRequest);
  const shareOverlayActive = shareVisible;
  const exitOverlayActive =
    isExitLottieActive(lottieRequest) || (coverActive && leavingRef.current);
  const isContinue = continueParam === '1';
  const staminaAlreadyPaid = startedParam === '1';
  const initialized = useRef(false);

  useBgm('game');

  // 入場ホールドカバーのみ外す（クリア・退場オーバーレイは触らない）
  useFocusEffect(
    useCallback(() => {
      const { coverActive, request } = useLottiePlayerStore.getState();
      if (!coverActive || request != null) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dismissCover();
        });
      });
    }, [dismissCover]),
  );

  useEffect(() => {
    if (!stage || initialized.current) return;
    initialized.current = true;

    const init = async () => {
      if (isContinue && save.stageProgress?.stageId === stageId) {
        const p = save.stageProgress;
        setSession(
          sessionFromProgress(
            stage,
            p.board,
            p.nextColor,
            p.nextBag ?? [],
            p.lastAction,
            p.remainingTurns,
          ),
        );
        return;
      }

      if (!isContinue) {
        const needsStamina = !isTutorialStage(stageId) && !staminaAlreadyPaid;
        const ok = await startStage(stageId, null, needsStamina);
        if (!ok) {
          Alert.alert('スタミナ不足', 'スタミナが足りません');
          router.back();
          return;
        }
      }

      setSession(createSession(stage));
    };

    init();
  }, [stage, stageId, isContinue, save.stageProgress, startStage, router]);

  const persist = useCallback(
    async (s: GameSession) => {
      if (s.status !== 'playing') return;
      await setStageProgress({
        stageId: s.stageId,
        board: s.board,
        nextColor: s.nextColor,
        nextBag: s.nextBag,
        lastAction: s.lastAction,
        remainingTurns: s.remainingTurns,
      });
    },
    [setStageProgress],
  );

  const beginLeaveStage = useCallback((after?: () => void | Promise<void>) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    pendingAfterExitRef.current = after ?? null;
    showExit(() => {
      void (async () => {
        try {
          await pendingAfterExitRef.current?.();
        } finally {
          pendingAfterExitRef.current = null;
          router.back();
        }
      })();
    });
  }, [router, showExit]);

  const openShareAfterClear = useCallback(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    try {
      const uri = await captureRef.current?.capture?.();
      setShareImageUri(uri ?? null);
    } catch {
      setShareImageUri(null);
    }
    setShareVisible(true);
  }, []);

  const onShareDismiss = useCallback(() => {
    setShareVisible(false);
    setShareImageUri(null);
    beginLeaveStage();
  }, [beginLeaveStage]);

  const handleResult = useCallback(
    async (next: GameSession, animation?: BoardAnimation) => {
      const finish = async () => {
        if (next.status === 'cleared') {
          playSe('clear');
          setPatternGlow(true);
          showClear(() => {
            void (async () => {
              await clearStage(stageId);
              await openShareAfterClear();
            })();
          });
          return;
        }
        if (next.status === 'gameover') {
          playSe('gameover');
          await gameOver();
          return;
        }
        await persist(next);
      };

      if (animation) {
        setAnimationKey((k) => k + 1);
        setBoardAnimation(animation);
        setAnimating(true);
        pendingAfterAnim.current = finish;
      }

      setSession(next);

      if (!animation) {
        await finish();
      }
    },
    [beginLeaveStage, clearStage, gameOver, openShareAfterClear, persist, showClear, stageId],
  );

  const onAnimationComplete = useCallback(() => {
    setBoardAnimation(null);
    setAnimating(false);
    const next = pendingAfterAnim.current;
    pendingAfterAnim.current = null;
    void next?.();
  }, []);

  const onActionPress = (action: 'A' | 'C') => {
    if (!session || !canUseAction(session) || animating) return;
    playSe('uiTap');
    if (uiMode === action) {
      setSelection([]);
      setUiMode('idle');
      return;
    }
    setSelection([]);
    setUiMode(action);
  };

  const onCellPress = (x: number, y: number) => {
    if (!session || session.status !== 'playing' || animating) return;
    if (uiMode !== 'A' && uiMode !== 'C') return;

    if (selection.length === 0) {
      setSelection([{ x, y }]);
      return;
    }

    const [first] = selection;
    if (first.x === x && first.y === y) {
      setSelection([]);
      return;
    }

    const result =
      uiMode === 'A'
        ? applyMix(session, first.x, first.y, x, y)
        : applySwap(session, first.x, first.y, x, y);

    setSelection([]);
    setUiMode('idle');

    if (result.error) {
      playSe('invalid');
      Alert.alert('できません', result.error);
      return;
    }
    playSe(uiMode === 'A' ? 'mix' : 'swap');
    handleResult(result.session, result.animation);
  };

  const onSwipe = (dir: Direction) => {
    if (!session || session.status !== 'playing' || uiMode !== 'idle' || animating) return;
    const result = applySlide(session, dir);
    if (result.error) {
      playSe('invalid');
      Alert.alert('できません', result.error);
      return;
    }
    playSe('slide');
    handleResult(result.session, result.animation);
  };

  const onBack = () => {
    if (leavingRef.current || exitOverlayActive || clearOverlayActive || shareOverlayActive || animating) return;
    const shouldPersist = session?.status === 'playing';
    beginLeaveStage(async () => {
      if (shouldPersist && session) await persist(session);
    });
  };

  const onGameOverDismiss = () => {
    if (leavingRef.current || exitOverlayActive) return;
    beginLeaveStage();
  };

  if (!stage || !session) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const playing = canUseAction(session);
  const matchHighlight = patternGlow
    ? findPatternMatchPositions(session.board, stage.pattern.cells) ?? []
    : [];

  return (
    <ViewShot ref={captureRef} style={styles.captureRoot} options={{ format: 'png', quality: 1 }}>
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          disabled={exitOverlayActive || clearOverlayActive || shareOverlayActive || animating}
        >
          <Text style={styles.back}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.stageTitle}>{stage.name}</Text>
          <Text style={styles.stageId}>STAGE {stage.id}</Text>
        </View>
        <View style={styles.turnsBadge}>
          <Text style={styles.turnsNum}>{session.remainingTurns}</Text>
          <Text style={styles.turnsLabel}>手</Text>
        </View>
      </View>

      <View style={styles.topRow}>
        <View style={styles.patternCol}>
          <Text style={styles.sectionLabel}>課題</Text>
          <PatternView cells={stage.pattern.cells} glow={patternGlow} compact />
        </View>
        <View style={styles.statusCard}>
          <View style={styles.nextRow}>
            <Text style={styles.nextLabel}>NEXT</Text>
            <View style={[styles.nextSwatch, { backgroundColor: COLOR_HEX[session.nextColor] }]} />
            <Text style={styles.nextName} numberOfLines={1}>
              {COLOR_LABELS[session.nextColor]}
            </Text>
          </View>
          <Pressable
            style={styles.recipeBtn}
            onPress={() => {
              playSe('uiTap');
              setRecipeHintVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="カラーレシピヒント"
          >
            <Text style={styles.recipeBtnText}>ヒント</Text>
          </Pressable>
        </View>
      </View>

      <SwipeZone
        style={styles.boardArea}
        enabled={playing && uiMode === 'idle' && !animating && !exitOverlayActive && !clearOverlayActive && !shareOverlayActive}
        onSwipe={onSwipe}
      >
        <BoardView
          board={session.board}
          animation={boardAnimation}
          animationKey={animationKey}
          onAnimationComplete={onAnimationComplete}
          onCellPress={onCellPress}
          highlight={selection}
          matchHighlight={matchHighlight}
        />
      </SwipeZone>

      <View style={styles.actions}>
        <ActionButton
          action="A"
          label="混合"
          disabled={!playing}
          active={uiMode === 'A'}
          onPress={() => onActionPress('A')}
        />
        <ActionButton
          action="C"
          label="入替"
          disabled={!playing}
          active={uiMode === 'C'}
          onPress={() => onActionPress('C')}
        />
      </View>

      {session.status === 'gameover' && (
        <GameOverOverlay reason={session.gameOverReason} onDismiss={onGameOverDismiss} />
      )}
      </SafeAreaView>

      <ColorRecipeHintOverlay
        visible={recipeHintVisible}
        patternCells={stage.pattern.cells}
        onClose={() => setRecipeHintVisible(false)}
      />

      <ClearShareOverlay
        visible={shareVisible}
        stageId={stageId}
        imageUri={shareImageUri}
        onDismiss={onShareDismiss}
      />
    </View>
    </ViewShot>
  );
}

function ActionButton({
  action,
  label,
  disabled,
  active = false,
  onPress,
}: {
  action: 'A' | 'C';
  label: string;
  disabled: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  const colors = actionColors[action];
  return (
    <Pressable
      style={[
        styles.actionBtn,
        woodButton(active ? colors.light : colors.bg, false),
        active && styles.actionActive,
        disabled && styles.actionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.actionText, active && styles.actionTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  captureRoot: { flex: 1 },
  root: { flex: 1, backgroundColor: Theme.bg },
  safe: { flex: 1, backgroundColor: Theme.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.bg },
  loadingText: { ...woodText, color: Theme.textDim },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...woodButton(Theme.surfaceRaised),
  },
  back: { ...woodText, fontSize: 20, color: Theme.accent, fontWeight: '600' },
  headerCenter: { flex: 1, marginLeft: 12 },
  stageTitle: { ...woodTitle, fontSize: 16, fontWeight: '700', color: Theme.text },
  stageId: { ...woodText, fontSize: 11, color: Theme.textDim, marginTop: 2 },
  turnsBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...woodWell(),
    backgroundColor: Theme.boardEmpty,
  },
  turnsNum: { ...woodText, fontSize: 18, fontWeight: '700', color: '#000' },
  turnsLabel: { ...woodText, fontSize: 10, color: Theme.textDim },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 6,
    marginTop: 8,
  },
  patternCol: {
    flexShrink: 0,
    alignItems: 'center',
  },
  sectionLabel: {
    ...woodText,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    color: Theme.textDim,
    alignSelf: 'flex-start',
  },
  recipeBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    ...woodButton(Theme.accentSoft),
  },
  recipeBtnText: {
    ...woodText,
    fontSize: 10,
    fontWeight: '700',
    color: Theme.accent,
  },
  boardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statusCard: {
    flexGrow: 0,
    flexShrink: 0,
    width: GAME_TOP_STATUS_WIDTH,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...woodPanel,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  nextLabel: { ...woodText, fontSize: 10, fontWeight: '700', color: Theme.textDim },
  nextSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.borderStrong,
  },
  nextName: { ...woodText, fontSize: 11, fontWeight: '600', color: Theme.text, flexShrink: 1 },
  modeHint: {
    ...woodText,
    textAlign: 'center',
    color: Theme.accent,
    marginBottom: 10,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionActive: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.04 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  actionDisabled: { opacity: 0.4 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  actionTextActive: {
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
