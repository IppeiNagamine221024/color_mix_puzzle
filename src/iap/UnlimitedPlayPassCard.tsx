import { Pressable, StyleSheet, Text } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText } from '@/constants/wood';
import { useIap } from './IapProvider';

type Props = {
  active: boolean;
  disabled?: boolean;
};

export function UnlimitedPlayPassCard({ active, disabled }: Props) {
  const { connected, purchasing, priceLabel, purchaseUnlimitedPlay } = useIap();

  const onPress = () => {
    void purchaseUnlimitedPlay();
  };

  if (active) {
    return (
      <Pressable
        style={[styles.extendOnly, (disabled || purchasing) && styles.btnDisabled]}
        onPress={onPress}
        disabled={disabled || purchasing || !connected}
      >
        <Text style={styles.extendText}>
          {purchasing ? '処理中…' : `24時間パスを延長${priceLabel ? `（${priceLabel}）` : ''}`}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.card, styles.cardPurchase, (disabled || purchasing) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || purchasing || !connected}
    >
      <Text style={styles.title}>24時間遊び放題パス</Text>
      <Text style={styles.subtitle}>スタミナ消費なしで好きなだけプレイ</Text>
      <Text style={styles.price}>
        {purchasing ? '処理中…' : priceLabel ? `購入 ${priceLabel}` : '購入する'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...woodPanel,
  },
  cardPurchase: {
    ...woodButton(Theme.surfaceRaised),
    alignItems: 'center',
  },
  extendOnly: {
    marginHorizontal: 16,
    marginBottom: 8,
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
  price: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.accent,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
