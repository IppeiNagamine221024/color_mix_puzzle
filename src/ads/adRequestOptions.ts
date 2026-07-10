import type { RequestOptions } from 'react-native-google-mobile-ads';

/** 他社アプリ横断の追跡を行わない非パーソナライズ広告のみリクエストする */
export const adRequestOptions: RequestOptions = {
  requestNonPersonalizedAdsOnly: true,
};
