import { usesNativeModules } from '@/src/config/runtime';
import { MockBannerAd, MockRewardButton } from './mockAds';

export { initAds } from './initAds';

type RewardButtonProps = {
  onReward: () => void;
  disabled?: boolean;
  label?: string;
};

export function BannerAdSlot() {
  if (!usesNativeModules()) return <MockBannerAd />;
  const { AdMobBannerAd } = require('./adMobAds') as typeof import('./adMobAds');
  return <AdMobBannerAd />;
}

export function RewardAdButton(props: RewardButtonProps) {
  if (!usesNativeModules()) return <MockRewardButton {...props} />;
  const { AdMobRewardButton } = require('./adMobAds') as typeof import('./adMobAds');
  return <AdMobRewardButton {...props} />;
}
