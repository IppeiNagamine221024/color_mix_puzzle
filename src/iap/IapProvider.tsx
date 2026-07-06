import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAppStore } from '@/src/stores/appStore';

export type IapContextValue = {
  connected: boolean;
  purchasing: boolean;
  priceLabel: string | null;
  purchaseUnlimitedPlay: () => Promise<boolean>;
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
  const grantUnlimitedPlayPass = useAppStore((s) => s.grantUnlimitedPlayPass);
  const [purchasing, setPurchasing] = useState(false);

  const purchaseUnlimitedPlay = useCallback(async () => {
    setPurchasing(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      await grantUnlimitedPlayPass();
      return true;
    } finally {
      setPurchasing(false);
    }
  }, [grantUnlimitedPlayPass]);

  const value = useMemo<IapContextValue>(
    () => ({
      connected: true,
      purchasing,
      priceLabel: '¥120（モック）',
      purchaseUnlimitedPlay,
    }),
    [purchaseUnlimitedPlay, purchasing],
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
