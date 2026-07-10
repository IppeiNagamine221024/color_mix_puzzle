import { STAMINA_CONSUME_MS, StaminaBar } from '@/components/StaminaBar';
import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText, woodTile, woodTitle } from '@/constants/wood';
import { BannerAdSlot, RewardAdButton } from '@/src/ads';
import { hasInfinitePass, isWeeklyPassActive, skipsStaminaConsumption } from '@/src/iap';
import { playSe } from '@/src/audio/playSe';
import { useBgm } from '@/src/audio/useBgm';
import { getAllStages, isTutorialStage } from '@/src/game/stages';
import { REWARDED_AD_DAILY_LIMIT, remainingRewardedAdViews } from '@/src/storage/stamina';
import {
  canShowRewardButton,
  canStartNewStage,
  useAppStore,
} from '@/src/stores/appStore';
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLS = 5;
const STAGE_CELL = Math.floor((Dimensions.get('window').width - 24) / COLS) - 2;

export default function MainScreen() {
  const router = useRouter();
  const { ready, save, recoveryMs, weeklyPlayMs, hydrate, watchRewardedAd, tickRecovery, startStage } =
    useAppStore();
  const showEnter = useLottiePlayerStore((s) => s.showEnter);
  const dismissCover = useLottiePlayerStore((s) => s.dismissCover);
  const lottieRequest = useLottiePlayerStore((s) => s.request);
  const coverActive = useLottiePlayerStore((s) => s.coverActive);
  const [enteringStageId, setEnteringStageId] = useState<number | null>(null);
  const [consumingHeartIndex, setConsumingHeartIndex] = useState<number | null>(null);
  const enteringRef = useRef(false);
  const pendingEntryRef = useRef<{ href: string } | null>(null);
  const entryPreparedRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const resetEntryTransition = useCallback(() => {
    enteringRef.current = false;
    pendingEntryRef.current = null;
    entryPreparedRef.current = null;
    setEnteringStageId(null);
    setConsumingHeartIndex(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      tickRecovery();
      const id = setInterval(tickRecovery, 1000);

      // 退場ホールドカバーのみ外す
      const { coverActive, request } = useLottiePlayerStore.getState();
      if (coverActive && request == null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            dismissCover();
          });
        });
      }

      resetEntryTransition();
      return () => {
        clearInterval(id);
      };
    }, [dismissCover, resetEntryTransition, tickRecovery]),
  );

  useBgm('home');

  const onEnterComplete = useCallback(async () => {
    const entry = pendingEntryRef.current;
    const prepared = entryPreparedRef.current;
    if (!entry || !prepared) {
      resetEntryTransition();
      dismissCover();
      return;
    }

    try {
      const ok = await prepared;
      if (!ok) {
        resetEntryTransition();
        dismissCover();
        return;
      }
      pendingEntryRef.current = null;
      enteringRef.current = false;
      entryPreparedRef.current = null;
      router.push(entry.href as Href);
    } catch {
      resetEntryTransition();
      dismissCover();
    }
  }, [dismissCover, resetEntryTransition, router]);

  const beginEnterTransition = useCallback(
    (href: string, prepare: () => Promise<boolean>) => {
      pendingEntryRef.current = { href };
      enteringRef.current = true;
      entryPreparedRef.current = prepare();
      showEnter(() => {
        void onEnterComplete();
      });
    },
    [onEnterComplete, showEnter],
  );

  const onStagePress = useCallback(
    (stageId: number) => {
      if (enteringRef.current || !canStartNewStage(save, stageId)) return;

      playSe('start');

      const skipStamina = isTutorialStage(stageId) || skipsStaminaConsumption(save);
      const href = isTutorialStage(stageId)
        ? `/game/${stageId}`
        : `/game/${stageId}?started=1`;

      const prepare = async (): Promise<boolean> => {
        if (skipStamina) {
          if (isTutorialStage(stageId)) return true;
          return startStage(stageId, null, true);
        }

        setEnteringStageId(stageId);
        setConsumingHeartIndex(save.stamina.current - 1);
        await new Promise((r) => setTimeout(r, STAMINA_CONSUME_MS));
        const ok = await startStage(stageId, null, true);
        setConsumingHeartIndex(null);
        setEnteringStageId(null);
        return ok;
      };

      beginEnterTransition(href, prepare);
    },
    [beginEnterTransition, save, startStage],
  );

  const onContinue = useCallback(() => {
    if (enteringRef.current) return;
    const p = save.stageProgress;
    if (!p) return;
    playSe('start');
    beginEnterTransition(`/game/${p.stageId}?continue=1`, async () => true);
  }, [beginEnterTransition, save.stageProgress]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.accent} />
      </View>
    );
  }

  const stages = getAllStages();
  const rewardOk = canShowRewardButton(save);
  const infinitePass = hasInfinitePass(save);
  const weeklyActive = isWeeklyPassActive(save);
  const passMode = infinitePass ? 'infinite' : weeklyActive ? 'weekly' : 'none';
  const isEntering =
    enteringStageId != null || lottieRequest != null || coverActive;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroSide} />
          <View style={styles.heroPlate}>
            <Text style={styles.title}>Color Order</Text>
          </View>
          <View style={styles.heroSideRight}>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => {
                playSe('uiTap');
                router.push('/settings' as Href);
              }}
              disabled={isEntering}
              accessibilityLabel="設定"
            >
              <Image
                source={require('@/assets/images/settings-icon.png')}
                style={styles.settingsIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>

      <StaminaBar
        current={save.stamina.current}
        recoveryMs={recoveryMs}
        consumingIndex={consumingHeartIndex}
        passMode={passMode}
        weeklyPlayMs={weeklyPlayMs}
      />

      {rewardOk ? (
        <RewardAdButton
          onReward={() => watchRewardedAd()}
          label={`▶ 広告でスタミナ回復 (今日 残り${remainingRewardedAdViews(save)}回)`}
          disabled={isEntering}
        />
      ) : save.rewardedAd.dailyCount >= REWARDED_AD_DAILY_LIMIT ? (
        <Text style={styles.limitText}>
          本日の回復上限に達しました ({REWARDED_AD_DAILY_LIMIT}/{REWARDED_AD_DAILY_LIMIT})
        </Text>
      ) : null}

      {save.stageProgress && (
        <Pressable style={styles.continueBtn} onPress={onContinue} disabled={isEntering}>
          <Text style={styles.continueText}>
            ▶ ステージ {save.stageProgress.stageId} から続ける
          </Text>
        </Pressable>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>ステージ選択</Text>
        <Text style={styles.clearedCount}>
          {save.clearedStages.length} / {stages.length} クリア
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        scrollEnabled={!isEntering}
      >
        {stages.map((stage) => {
          const locked = stage.id > save.unlockedStageId;
          const cleared = save.clearedStages.includes(stage.id);
          const canStart = canStartNewStage(save, stage.id);
          const freePlay = isTutorialStage(stage.id);
          return (
            <Pressable
              key={stage.id}
              style={[
                styles.stageBtn,
                woodTile(cleared ? Theme.accentSoft : Theme.surface, cleared),
                locked && styles.stageLocked,
                !canStart && !locked && styles.stageDisabled,
                freePlay && styles.stageBtnFreePlay,
              ]}
              disabled={locked || !canStart || isEntering}
              onPress={() => onStagePress(stage.id)}
            >
              {cleared && (
                <Text style={styles.clearLabel} numberOfLines={1}>
                  CLEAR
                </Text>
              )}
              {freePlay && (
                <View style={[styles.freePlayBadge, locked && styles.freePlayBadgeLocked]}>
                  <Text style={styles.freePlayText}>FREE</Text>
                  <Text style={styles.freePlayText}>PLAY</Text>
                </View>
              )}
              <Text
                style={[
                  styles.stageNum,
                  freePlay && styles.stageNumFreePlay,
                  cleared && styles.stageNumCleared,
                  locked && styles.stageNumLocked,
                ]}
              >
                {stage.id}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <BannerAdSlot />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  safe: { flex: 1, backgroundColor: Theme.bg },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.bg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  heroSide: {
    flex: 1,
  },
  heroSideRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  heroPlate: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...woodPanel,
    borderColor: Theme.border,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...woodButton(Theme.surfaceRaised),
  },
  settingsIcon: {
    width: 32,
    height: 32,
  },
  title: {
    ...woodTitle,
    fontSize: 26,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: 1,
  },
  limitText: {
    ...woodText,
    textAlign: 'center',
    color: Theme.textDim,
    marginBottom: 8,
    fontSize: 12,
  },
  continueBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    ...woodButton(Theme.surfaceRaised),
  },
  continueText: { ...woodText, color: Theme.accent, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  section: {
    ...woodTitle,
    fontWeight: '700',
    fontSize: 15,
  },
  clearedCount: {
    ...woodText,
    fontSize: 12,
    color: Theme.textDim,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 4,
    justifyContent: 'center',
  },
  stageBtn: {
    width: STAGE_CELL,
    height: STAGE_CELL,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    overflow: 'hidden',
  },
  stageBtnFreePlay: {
    borderColor: Theme.success,
  },
  stageLocked: {
    opacity: 0.45,
  },
  stageDisabled: {
    opacity: 0.5,
    borderColor: Theme.danger,
  },
  clearLabel: {
    position: 'absolute',
    top: 3,
    right: 3,
    zIndex: 1,
    ...woodText,
    fontSize: 8,
    fontWeight: '800',
    color: Theme.success,
    letterSpacing: -0.2,
  },
  freePlayBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.success,
    paddingVertical: 2,
    alignItems: 'center',
  },
  freePlayBadgeLocked: {
    backgroundColor: Theme.teal,
    opacity: 0.85,
  },
  freePlayText: {
    ...woodText,
    fontSize: 7,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
    lineHeight: 8,
  },
  stageNum: { ...woodText, fontSize: 18, fontWeight: '700' },
  stageNumFreePlay: {
    marginBottom: 10,
  },
  stageNumCleared: { color: Theme.accent },
  stageNumLocked: { color: Theme.textDim },
});
