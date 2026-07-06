import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

type AdMobExtra = {
  useTestAds?: boolean;
  bannerAndroid?: string;
  bannerIos?: string;
  rewardedAndroid?: string;
  rewardedIos?: string;
};

const extra = (Constants.expoConfig?.extra?.adMob ?? {}) as AdMobExtra;

function pickUnit(android?: string, ios?: string): string | undefined {
  return Platform.OS === 'ios' ? ios : android;
}

const productionBanner = pickUnit(extra.bannerAndroid, extra.bannerIos);
const productionRewarded = pickUnit(extra.rewardedAndroid, extra.rewardedIos);

const USE_TEST_ADS =
  extra.useTestAds !== false || !productionBanner || !productionRewarded;

export const bannerAdUnitId = USE_TEST_ADS ? TestIds.BANNER : productionBanner!;
export const rewardedAdUnitId = USE_TEST_ADS ? TestIds.REWARDED : productionRewarded!;
