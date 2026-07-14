import { Theme } from '@/constants/Theme';
import { woodButton } from '@/constants/wood';
import { adRequestOptions } from '@/src/ads/adRequestOptions';
import { bannerAdUnitId } from '@/src/ads/adUnits';
import { showRewardedAd } from '@/src/ads/showRewardedAd';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export function AdMobBannerAd() {
  return (
    <View style={styles.banner}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={adRequestOptions}
      />
    </View>
  );
}

type AdMobRewardButtonProps = {
  onReward: () => void | boolean | Promise<void | boolean>;
  disabled?: boolean;
  label?: string;
};

export function AdMobRewardButton({ onReward, disabled, label }: AdMobRewardButtonProps) {
  const onPress = () => {
    Alert.alert('スタミナ回復', '広告を見てスタミナを回復しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '見る',
        onPress: () => {
          void (async () => {
            const completed = await showRewardedAd();
            if (!completed) return;
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    backgroundColor: Theme.bgElevated,
  },
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
