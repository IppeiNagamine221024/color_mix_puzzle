import { usesNativeModules } from '@/src/config/runtime';
import { Platform } from 'react-native';

let initialized = false;

export async function initAds(): Promise<void> {
  if (!usesNativeModules() || initialized) return;
  initialized = true;

  if (Platform.OS === 'ios') {
    const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
    await requestTrackingPermissionsAsync();
  }

  const mobileAds = (await import('react-native-google-mobile-ads')).default;
  await mobileAds().initialize();
}
