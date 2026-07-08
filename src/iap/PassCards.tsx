import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText } from '@/constants/wood';
import { useIap } from './IapProvider';
import { INFINITE_PASS_PRICE_LABEL, WEEKLY_PASS_PRICE_LABEL } from './pricing';

type WeeklyPassCardProps = {
  active: boolean;
  infinitePassOwned: boolean;
  disabled?: boolean;
  embedded?: boolean;
};

export function WeeklyPassCard({
  active,
  infinitePassOwned,
  disabled,
  embedded = false,
}: WeeklyPassCardProps) {
  const { connected, productsReady, purchasing, purchaseWeeklyPass } = useIap();
  const busy = purchasing === 'weekly';
  const storeBlocked = !connected || !productsReady;

  if (infinitePassOwned) {
    return (
      <View style={[styles.card, styles.blockedCard, embedded && styles.embedded]}>
        <Text style={styles.title}>1週間遊び放題パス</Text>
        <Text style={styles.blockedText}>無限パス購入済みのため購入・延長は不要です</Text>
      </View>
    );
  }

  if (active) {
    return (
      <Pressable
        style={[styles.extendOnly, embedded && styles.embedded, (disabled || busy) && styles.btnDisabled]}
        onPress={() => void purchaseWeeklyPass()}
        disabled={disabled || busy || storeBlocked}
      >
        <Text style={styles.extendText}>
          {busy ? '処理中…' : storeBlocked ? 'ストア接続中…' : `1週間パスを延長（${WEEKLY_PASS_PRICE_LABEL}）`}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.card, styles.cardPurchase, embedded && styles.embedded, (disabled || busy) && styles.btnDisabled]}
      onPress={() => void purchaseWeeklyPass()}
      disabled={disabled || busy || storeBlocked}
    >
      <Text style={styles.title}>1週間遊び放題パス</Text>
      <Text style={styles.subtitle}>1週間、スタミナ消費なしでプレイ</Text>
      <Text style={styles.priceFixed}>{WEEKLY_PASS_PRICE_LABEL}（税込）</Text>
      <Text style={styles.cta}>
        {busy ? '処理中…' : storeBlocked ? 'ストア接続中…' : `購入する ${WEEKLY_PASS_PRICE_LABEL}`}
      </Text>
    </Pressable>
  );
}

type InfinitePassCardProps = {
  owned: boolean;
  disabled?: boolean;
  embedded?: boolean;
};

export function InfinitePassCard({ owned, disabled, embedded = false }: InfinitePassCardProps) {
  const { connected, productsReady, purchasing, purchaseInfinitePass } = useIap();
  const busy = purchasing === 'infinite';
  const storeBlocked = !connected || !productsReady;

  if (owned) {
    return (
      <View style={[styles.card, styles.ownedCard, embedded && styles.embedded]}>
        <Text style={styles.title}>無限パス</Text>
        <Text style={styles.ownedLabel}>購入済み</Text>
        <Text style={styles.subtitle}>スタミナが減らなくなります（買い切り）</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.card, styles.infiniteCard, embedded && styles.embedded, (disabled || busy) && styles.btnDisabled]}
      onPress={() => void purchaseInfinitePass()}
      disabled={disabled || busy || storeBlocked}
    >
      <Text style={styles.title}>無限パス</Text>
      <Text style={styles.subtitle}>一生涯スタミナ消費なし（買い切り）</Text>
      <Text style={styles.priceFixed}>{INFINITE_PASS_PRICE_LABEL}（税込）</Text>
      <Text style={styles.cta}>
        {busy ? '処理中…' : storeBlocked ? 'ストア接続中…' : `購入する ${INFINITE_PASS_PRICE_LABEL}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...woodPanel,
  },
  cardPurchase: {
    ...woodButton(Theme.surfaceRaised),
    alignItems: 'center',
  },
  infiniteCard: {
    ...woodButton(Theme.accentSoft),
    alignItems: 'center',
    borderColor: Theme.accent,
  },
  ownedCard: {
    alignItems: 'center',
    borderColor: Theme.success,
    backgroundColor: Theme.accentSoft,
  },
  blockedCard: {
    alignItems: 'center',
    borderColor: Theme.border,
    backgroundColor: Theme.bgElevated,
    opacity: 0.85,
  },
  blockedText: {
    ...woodText,
    marginTop: 8,
    fontSize: 12,
    color: Theme.textDim,
    textAlign: 'center',
  },
  extendOnly: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Theme.accent,
    alignItems: 'center',
  },
  extendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    ...woodText,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    ...woodText,
    marginTop: 4,
    fontSize: 12,
    color: Theme.textDim,
    textAlign: 'center',
  },
  priceFixed: {
    ...woodText,
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    color: Theme.text,
  },
  cta: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.accent,
  },
  ownedLabel: {
    ...woodText,
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: Theme.success,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  embedded: {
    marginBottom: 0,
  },
});
