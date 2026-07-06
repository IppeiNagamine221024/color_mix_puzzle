import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go 上で動作しているか */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** MMKV・AdMob などネイティブモジュールを使うビルドか（Dev Client / 本番） */
export function usesNativeModules(): boolean {
  return Platform.OS !== 'web' && !isExpoGo();
}
