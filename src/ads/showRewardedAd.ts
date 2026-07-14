import { adRequestOptions } from '@/src/ads/adRequestOptions';
import { rewardedAdUnitId } from '@/src/ads/adUnits';
import { audio } from '@/src/audio/audioService';
import { usesNativeModules } from '@/src/config/runtime';
import { Alert } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

/** 読み込み待ち専用。表示開始後は使わない（視聴中に切ると報酬未付与になる） */
const LOAD_TIMEOUT_MS = 20_000;

/** リワード広告を表示し、視聴完了時のみ true を返す */
export function showRewardedAd(): Promise<boolean> {
  if (!usesNativeModules()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    // 毎回新規インスタンス。使い回しだと前回リスナー／状態が干渉しやすい
    const ad = RewardedAd.createForAdRequest(rewardedAdUnitId, adRequestOptions);
    let settled = false;
    let earned = false;
    let shown = false;
    let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearLoadTimeout = () => {
      if (loadTimeoutId == null) return;
      clearTimeout(loadTimeoutId);
      loadTimeoutId = null;
    };

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearLoadTimeout();
      unsubLoad();
      unsubOpened();
      unsubEarn();
      unsubClose();
      unsubError();
      audio.resumeAfterAd();
      resolve(ok);
    };

    const unsubLoad = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      clearLoadTimeout();
      // show 直前に止め、広告音声と BGM が重ならないようにする
      audio.pauseForAd();
      ad.show().catch(() => {
        Alert.alert('広告を表示できませんでした', 'しばらくしてから再度お試しください。');
        finish(false);
      });
    });

    const unsubOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
      shown = true;
      clearLoadTimeout();
      audio.pauseForAd();
    });

    const unsubEarn = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });

    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      finish(earned);
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      // 表示後のエラーは「読み込み失敗」扱いにしない（視聴完了済みなら報酬を返す）
      if (shown || earned) {
        finish(earned);
        return;
      }
      Alert.alert('広告の読み込みに失敗しました', 'しばらくしてから再度お試しください。');
      finish(false);
    });

    ad.load();

    loadTimeoutId = setTimeout(() => {
      // まだ表示に入っていなければ読み込みタイムアウト
      if (!settled && !shown) {
        Alert.alert('広告の読み込みに失敗しました', 'しばらくしてから再度お試しください。');
        finish(false);
      }
    }, LOAD_TIMEOUT_MS);
  });
}
