import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAppStore } from '@/src/stores/appStore';
import { hasInfinitePass } from './passes';
import {
  INFINITE_PASS_PRICE_LABEL,
  WEEKLY_PASS_PRICE_LABEL,
} from './pricing';
import type { IapProductKind } from './types';

export type IapContextValue = {
  connected: boolean;
  productsReady: boolean;
  purchasing: IapProductKind | null;
  restoring: boolean;
  weeklyPriceLabel: string;
  infinitePriceLabel: string;
  purchaseWeeklyPass: () => Promise<boolean>;
  purchaseInfinitePass: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
};

const IapContext = createContext<IapContextValue | null>(null);

export { IapContext };

export function useIap(): IapContextValue {
  const ctx = useContext(IapContext);
  if (!ctx) {
    throw new Error('useIap must be used within IapProvider');
  }
  return ctx;
}

type ProviderProps = {
  children: ReactNode;
};

function MockIapProvider({ children }: ProviderProps) {
  const grantWeeklyPass = useAppStore((s) => s.grantWeeklyPass);
  const grantInfinitePass = useAppStore((s) => s.grantInfinitePass);
  const infinitePassOwned = useAppStore((s) => s.save.infinitePassOwned);
  const [purchasing, setPurchasing] = useState<IapProductKind | null>(null);
  const [restoring, setRestoring] = useState(false);

  const purchaseWeeklyPass = useCallback(async () => {
    if (infinitePassOwned) {
      showPurchaseError('無限パス購入済みのため、1週間パスは購入できません。');
      return false;
    }
    setPurchasing('weekly');
    try {
      await new Promise((r) => setTimeout(r, 400));
      await grantWeeklyPass();
      showPurchaseSuccess('weekly');
      return true;
    } finally {
      setPurchasing(null);
    }
  }, [grantWeeklyPass, infinitePassOwned]);

  const purchaseInfinitePass = useCallback(async () => {
    setPurchasing('infinite');
    try {
      await new Promise((r) => setTimeout(r, 400));
      await grantInfinitePass();
      showPurchaseSuccess('infinite');
      return true;
    } finally {
      setPurchasing(null);
    }
  }, [grantInfinitePass]);

  const restorePurchases = useCallback(async () => {
    setRestoring(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      if (hasInfinitePass(useAppStore.getState().save)) {
        Alert.alert('復元完了', '無限パスはすでに有効です。');
        return;
      }
      Alert.alert('復元できませんでした', '復元できる購入は見つかりませんでした。');
    } finally {
      setRestoring(false);
    }
  }, []);

  const value = useMemo<IapContextValue>(
    () => ({
      connected: true,
      productsReady: true,
      purchasing,
      restoring,
      weeklyPriceLabel: WEEKLY_PASS_PRICE_LABEL,
      infinitePriceLabel: INFINITE_PASS_PRICE_LABEL,
      purchaseWeeklyPass,
      purchaseInfinitePass,
      restorePurchases,
    }),
    [purchaseInfinitePass, purchaseWeeklyPass, purchasing, restorePurchases, restoring],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}

export function IapProvider({ children }: ProviderProps) {
  const { usesNativeModules } = require('@/src/config/runtime') as typeof import('@/src/config/runtime');

  if (!usesNativeModules()) {
    return <MockIapProvider>{children}</MockIapProvider>;
  }

  const { NativeIapProvider } = require('./nativeIapProvider') as typeof import('./nativeIapProvider');
  return <NativeIapProvider>{children}</NativeIapProvider>;
}

export function showPurchaseError(message: string) {
  Alert.alert('購入できませんでした', message);
}

export function showPurchaseSuccess(kind: IapProductKind) {
  if (kind === 'weekly') {
    Alert.alert(
      '購入完了',
      '1週間遊び放題パスが有効になりました。1週間、スタミナを消費せずにプレイできます。',
    );
    return;
  }
  Alert.alert(
    '購入完了',
    '無限パスが有効になりました。今後、スタミナを消費せずにプレイできます。',
  );
}

export function showRestoreSuccess(restoredInfinite: boolean) {
  if (restoredInfinite) {
    Alert.alert('復元完了', '無限パスを復元しました。');
    return;
  }
  Alert.alert('復元完了', '復元できる購入は見つかりませんでした。');
}
