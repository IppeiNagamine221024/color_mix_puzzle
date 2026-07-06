import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ErrorCode, useIAP, type Purchase } from 'expo-iap';
import { useAppStore } from '@/src/stores/appStore';
import { IAP_PRODUCT_IDS, UNLIMITED_PLAY_24H_PRODUCT_ID } from './productIds';
import { IapContext, type IapContextValue, showPurchaseError } from './IapProvider';

type ProviderProps = {
  children: ReactNode;
};

function transactionKey(purchase: Purchase): string {
  return purchase.transactionId ?? purchase.purchaseToken ?? purchase.id;
}

export function NativeIapProvider({ children }: ProviderProps) {
  const grantUnlimitedPlayPass = useAppStore((s) => s.grantUnlimitedPlayPass);
  const [purchasing, setPurchasing] = useState(false);
  const processedTransactions = useRef(new Set<string>());

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      if (purchase.productId !== UNLIMITED_PLAY_24H_PRODUCT_ID) return;

      const key = transactionKey(purchase);
      if (processedTransactions.current.has(key)) return;
      processedTransactions.current.add(key);

      try {
        await grantUnlimitedPlayPass();
        await finishTransaction({ purchase, isConsumable: true });
      } catch {
        processedTransactions.current.delete(key);
        showPurchaseError('購入の処理中にエラーが発生しました。');
      } finally {
        setPurchasing(false);
      }
    },
    onPurchaseError: (error) => {
      setPurchasing(false);
      if (error.code === ErrorCode.UserCancelled) return;
      showPurchaseError(error.message || 'もう一度お試しください。');
    },
  });

  useEffect(() => {
    if (!connected) return;
    void fetchProducts({ skus: [...IAP_PRODUCT_IDS], type: 'in-app' });
  }, [connected, fetchProducts]);

  const product = products.find((item) => item.id === UNLIMITED_PLAY_24H_PRODUCT_ID);
  const priceLabel = product?.displayPrice ?? null;

  const purchaseUnlimitedPlay = useCallback(async () => {
    if (!connected) {
      showPurchaseError('ストアに接続できません。しばらくしてからお試しください。');
      return false;
    }
    if (purchasing) return false;

    setPurchasing(true);
    try {
      await requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: UNLIMITED_PLAY_24H_PRODUCT_ID },
          google: { skus: [UNLIMITED_PLAY_24H_PRODUCT_ID] },
        },
      });
      return true;
    } catch {
      setPurchasing(false);
      showPurchaseError('購入を開始できませんでした。');
      return false;
    }
  }, [connected, purchasing, requestPurchase]);

  const value = useMemo<IapContextValue>(
    () => ({
      connected,
      purchasing,
      priceLabel,
      purchaseUnlimitedPlay,
    }),
    [connected, priceLabel, purchaseUnlimitedPlay, purchasing],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}
