import type { ConfigContext, ExpoConfig } from 'expo/config';

/** @see constants/appIdentity.ts と同期 */
const APP_BUNDLE_ID = 'com.wippeipy221024.colororder';

/** Google 公式テスト App ID（Development / Preview 用） */
const GOOGLE_TEST_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
} as const;

function resolveAdMob() {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID ?? GOOGLE_TEST_APP_IDS.android;
  const iosAppId = process.env.ADMOB_IOS_APP_ID ?? GOOGLE_TEST_APP_IDS.ios;

  const hasProductionUnits =
    Boolean(process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID) &&
    Boolean(process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS) &&
    Boolean(process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID) &&
    Boolean(process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS);

  const useTestAds =
    process.env.EXPO_PUBLIC_USE_TEST_ADS === 'true' ||
    (process.env.EXPO_PUBLIC_USE_TEST_ADS !== 'false' && !hasProductionUnits);

  return {
    useTestAds,
    androidAppId,
    iosAppId,
    bannerAndroid: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
    bannerIos: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
    rewardedAndroid: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
    rewardedIos: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
  };
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const adMob = resolveAdMob();

  return {
    ...config,
    name: 'Color Order',
    slug: 'color-order',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'colororder',
    userInterfaceStyle: 'automatic',
    owner: 'wippeipy221024',
    ios: {
      bundleIdentifier: APP_BUNDLE_ID,
      buildNumber: '2',
      supportsTablet: true,
      infoPlist: {
        // 標準的な HTTPS 等のみ → ASC の輸出コンプライアンス手動回答を省略
        ITSAppUsesNonExemptEncryption: false,
        LSApplicationQueriesSchemes: [
          'twitter',
          'twitterauth',
          'instagram',
          'instagram-stories',
          'line',
          'lineauth2',
        ],
      },
    },
    android: {
      package: APP_BUNDLE_ID,
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#F4F0E8',
        foregroundImage: './assets/images/android-icon-foreground.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'com.google.android.gms.permission.AD_ID',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#F4F0E8',
        },
      ],
      'expo-asset',
      'expo-audio',
      'expo-notifications',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: adMob.androidAppId,
          iosAppId: adMob.iosAppId,
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      'expo-iap',
      'react-native-share',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'db89a5bb-c8fa-402e-a7e8-60662303b465',
      },
      adMob,
    },
  };
};
