import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText } from '@/constants/wood';
import {
  InfinitePassCard,
  WeeklyPassCard,
  formatPassRemaining,
  hasInfinitePass,
  isWeeklyPassActive,
  useIap,
} from '@/src/iap';
import {
  INFINITE_PASS_PRODUCT_ID,
  WEEKLY_PASS_PRODUCT_ID,
} from '@/src/iap/productIds';
import { useAppStore } from '@/src/stores/appStore';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PassesScreen() {
  const { save, weeklyPlayMs, tickRecovery } = useAppStore();
  const { connected, productsReady, restoring, restorePurchases } = useIap();
  const weeklyActive = isWeeklyPassActive(save);
  const infiniteOwned = hasInfinitePass(save);

  useFocusEffect(
    useCallback(() => {
      tickRecovery();
      const id = setInterval(tickRecovery, 1000);
      return () => clearInterval(id);
    }, [tickRecovery]),
  );

  return (
    <View style={styles.root}>
      <SettingsSubHeader title="遊び放題パス" />
      <ScrollView style={settingsSubContent.scroll} contentContainerStyle={settingsSubContent.content}>
        <View style={settingsSubContent.card}>
          <Text style={settingsSubContent.body}>
            パスを購入すると、チュートリアル以外のステージでスタミナを消費せずにプレイできます。
            バナー広告は引き続き表示されます。
          </Text>
          {!productsReady && connected && (
            <Text style={styles.storeHint}>
              {Platform.OS === 'android'
                ? '商品情報を取得できません。Google Play Console でアプリ内商品が有効か、ライセンステスター設定を確認してください。'
                : '商品情報を取得できません。App Store Connect で商品 ID が「送信準備完了」か確認してください。'}
            </Text>
          )}
        </View>

        {infiniteOwned && (
          <View style={[settingsSubContent.card, styles.statusCard]}>
            <Text style={styles.statusLabel}>無限パス</Text>
            <Text style={styles.statusValue}>有効（買い切り）</Text>
          </View>
        )}

        {weeklyActive && !infiniteOwned && (
          <View style={[settingsSubContent.card, styles.statusCard]}>
            <Text style={styles.statusLabel}>1週間パス</Text>
            <Text style={styles.statusValue}>有効中</Text>
            <Text style={settingsSubContent.body}>
              残り {formatPassRemaining(weeklyPlayMs)}
            </Text>
          </View>
        )}

        <WeeklyPassCard active={weeklyActive} infinitePassOwned={infiniteOwned} embedded />
        <InfinitePassCard owned={infiniteOwned} embedded />

        <Pressable
          style={[styles.restoreBtn, restoring && styles.restoreBtnDisabled]}
          onPress={() => void restorePurchases()}
          disabled={restoring || !connected}
        >
          <Text style={styles.restoreText}>
            {restoring ? '復元中…' : '購入を復元'}
          </Text>
        </Pressable>

        <Text style={styles.productIds}>
          週間: {WEEKLY_PASS_PRODUCT_ID}{'\n'}
          無限: {INFINITE_PASS_PRODUCT_ID}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  storeHint: {
    ...woodText,
    marginTop: 10,
    fontSize: 11,
    color: Theme.danger,
  },
  statusCard: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentSoft,
    marginBottom: 12,
  },
  statusLabel: {
    ...woodText,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.textDim,
    marginBottom: 4,
  },
  statusValue: {
    ...woodText,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.accent,
    marginBottom: 6,
  },
  restoreBtn: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
    ...woodButton(Theme.surfaceRaised),
  },
  restoreBtnDisabled: {
    opacity: 0.5,
  },
  restoreText: {
    ...woodText,
    fontSize: 13,
    fontWeight: '700',
    color: Theme.text,
  },
  productIds: {
    ...woodText,
    marginTop: 16,
    fontSize: 9,
    color: Theme.textDim,
    lineHeight: 14,
  },
});
