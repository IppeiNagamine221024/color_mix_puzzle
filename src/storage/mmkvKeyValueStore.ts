import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { KeyValueStore } from './keyValueStore';

let mmkv: MMKV | null = null;

function getMmkv(): MMKV {
  if (!mmkv) {
    mmkv = createMMKV({ id: 'color-order' });
  }
  return mmkv;
}

export const mmkvKeyValueStore: KeyValueStore = {
  getItem(key) {
    return getMmkv().getString(key) ?? null;
  },
  setItem(key, value) {
    getMmkv().set(key, value);
  },
  removeItem(key) {
    getMmkv().remove(key);
  },
};
