import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText } from '@/constants/wood';

export function MockBannerAd() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>広告枠</Text>
    </View>
  );
}

type MockRewardButtonProps = {
  onReward: () => void | boolean | Promise<void | boolean>;
  disabled?: boolean;
  label?: string;
};

export function MockRewardButton({ onReward, disabled, label }: MockRewardButtonProps) {
  const onPress = () => {
    Alert.alert('スタミナ回復', '広告を見てスタミナを回復しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '見る',
        onPress: () => {
          void (async () => {
            const rewarded = await Promise.resolve(onReward());
            if (rewarded === false) return;
            Alert.alert('スタミナ回復', 'スタミナが1つ回復しました');
          })();
        },
      },
    ]);
  };

  return (
    <Pressable
      style={[styles.rewardBtn, disabled && styles.rewardBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.rewardText}>{label ?? '▶ 広告でスタミナ回復'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 48,
    backgroundColor: Theme.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  bannerText: { ...woodText, color: Theme.textDim, fontSize: 11 },
  rewardBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 6,
    ...woodButton(Theme.accent),
  },
  rewardBtnDisabled: { opacity: 0.45 },
  rewardText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
