import { rewardedAdUnitId } from '@/src/ads/adUnits';
import { usesNativeModules } from '@/src/config/runtime';
import { Alert } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

let rewardedAd: RewardedAd | null = null;

function getRewardedAd(): RewardedAd {
  if (!rewardedAd) {
    rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId);
  }
  return rewardedAd;
}

/** リワード広告を表示し、視聴完了時のみ true を返す */
export function showRewardedAd(): Promise<boolean> {
  if (!usesNativeModules()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const ad = getRewardedAd();
    let settled = false;
    let earned = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      unsubLoad();
      unsubEarn();
      unsubClose();
      unsubError();
      resolve(ok);
    };

    const unsubLoad = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      ad.show().catch(() => finish(false));
    });

    const unsubEarn = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });

    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      finish(earned);
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      Alert.alert('広告の読み込みに失敗しました', 'しばらくしてから再度お試しください。');
      finish(false);
    });

    ad.load();

    setTimeout(() => {
      if (!settled) {
        Alert.alert('広告の読み込みに失敗しました', 'しばらくしてから再度お試しください。');
        finish(false);
      }
    }, 15000);
  });
}
