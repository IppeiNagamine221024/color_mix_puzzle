import { usesNativeModules } from '@/src/config/runtime';
import { asyncGetItem, asyncRemoveItem, asyncSetItem } from './asyncKeyValueStore';

export async function storageGetItem(key: string): Promise<string | null> {
  if (usesNativeModules()) {
    const { mmkvKeyValueStore } = await import('./mmkvKeyValueStore');
    const value = mmkvKeyValueStore.getItem(key);
    if (value != null) return value;

    const legacy = await asyncGetItem(key);
    if (legacy != null) {
      mmkvKeyValueStore.setItem(key, legacy);
      await asyncRemoveItem(key);
    }
    return legacy;
  }
  return asyncGetItem(key);
}

export async function storageSetItem(key: string, value: string): Promise<void> {
  if (usesNativeModules()) {
    const { mmkvKeyValueStore } = await import('./mmkvKeyValueStore');
    mmkvKeyValueStore.setItem(key, value);
    return;
  }
  await asyncSetItem(key, value);
}
