import { usesNativeModules } from '@/src/config/runtime';

let initialized = false;

export async function initAds(): Promise<void> {
  if (!usesNativeModules() || initialized) return;
  initialized = true;

  const mobileAds = (await import('react-native-google-mobile-ads')).default;
  await mobileAds().initialize();
}
