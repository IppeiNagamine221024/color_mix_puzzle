import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ErrorCode, getAvailablePurchases, useIAP, type Purchase } from 'expo-iap';
import { useAppStore } from '@/src/stores/appStore';
import { ownsInfinitePassInPurchases } from './entitlements';
import {
  IAP_PRODUCT_IDS,
  INFINITE_PASS_PRODUCT_ID,
  WEEKLY_PASS_PRODUCT_ID,
} from './productIds';
import {
  IapContext,
  type IapContextValue,
  showPurchaseError,
  showPurchaseSuccess,
  showRestoreSuccess,
} from './IapProvider';
import {
  INFINITE_PASS_PRICE_LABEL,
  WEEKLY_PASS_PRICE_LABEL,
} from './pricing';
import type { IapProductKind } from './types';

type ProviderProps = {
  children: ReactNode;
};

function transactionKey(purchase: Purchase): string {
  return purchase.transactionId ?? purchase.purchaseToken ?? purchase.id;
}

function productKindFromId(productId: string): IapProductKind | null {
  if (productId === WEEKLY_PASS_PRODUCT_ID) return 'weekly';
  if (productId === INFINITE_PASS_PRODUCT_ID) return 'infinite';
  return null;
}

export function NativeIapProvider({ children }: ProviderProps) {
  const grantWeeklyPass = useAppStore((s) => s.grantWeeklyPass);
  const grantInfinitePass = useAppStore((s) => s.grantInfinitePass);
  const [purchasing, setPurchasing] = useState<IapProductKind | null>(null);
  const [restoring, setRestoring] = useState(false);
  const processedTransactions = useRef(new Set<string>());

  const syncInfinitePassFromStore = useCallback(async (): Promise<boolean> => {
    const purchases = await getAvailablePurchases();
    if (!ownsInfinitePassInPurchases(purchases)) return false;
    if (useAppStore.getState().save.infinitePassOwned) return false;
    await grantInfinitePass();
    return true;
  }, [grantInfinitePass]);

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases: restoreStorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      const kind = productKindFromId(purchase.productId);
      if (!kind) return;

      const key = transactionKey(purchase);
      if (processedTransactions.current.has(key)) return;
      processedTransactions.current.add(key);

      try {
        if (kind === 'weekly') {
          if (useAppStore.getState().save.infinitePassOwned) {
            await finishTransaction({ purchase, isConsumable: true });
            return;
          }
          await grantWeeklyPass();
          await finishTransaction({ purchase, isConsumable: true });
        } else {
          await grantInfinitePass();
          await finishTransaction({ purchase, isConsumable: false });
        }
        showPurchaseSuccess(kind);
      } catch {
        processedTransactions.current.delete(key);
        showPurchaseError('購入の処理中にエラーが発生しました。');
      } finally {
        setPurchasing(null);
      }
    },
    onPurchaseError: (error) => {
      setPurchasing(null);
      if (error.code === ErrorCode.UserCancelled) return;
      showPurchaseError(error.message || 'もう一度お試しください。');
    },
    onError: (error) => {
      console.warn('[IAP]', error.message);
    },
  });

  useEffect(() => {
    if (!connected) return;
    void (async () => {
      await fetchProducts({ skus: [...IAP_PRODUCT_IDS], type: 'in-app' });
      const restored = await syncInfinitePassFromStore();
      if (restored) {
        console.info('[IAP] Restored infinite pass from store on connect');
      }
    })();
  }, [connected, fetchProducts, syncInfinitePassFromStore]);

  const weeklyProduct = products.find((item) => item.id === WEEKLY_PASS_PRODUCT_ID);
  const infiniteProduct = products.find((item) => item.id === INFINITE_PASS_PRODUCT_ID);
  const productsReady =
    products.some((item) => item.id === WEEKLY_PASS_PRODUCT_ID) &&
    products.some((item) => item.id === INFINITE_PASS_PRODUCT_ID);

  const requestProduct = useCallback(
    async (kind: IapProductKind, productId: string) => {
      if (!connected) {
        showPurchaseError('ストアに接続できません。しばらくしてからお試しください。');
        return false;
      }
      if (purchasing) return false;

      const infinitePassOwned = useAppStore.getState().save.infinitePassOwned;
      if (kind === 'infinite' && infinitePassOwned) {
        showPurchaseError('無限パスはすでに購入済みです。');
        return false;
      }
      if (kind === 'weekly' && infinitePassOwned) {
        showPurchaseError('無限パス購入済みのため、1週間パスは購入できません。');
        return false;
      }

      setPurchasing(kind);
      try {
        await requestPurchase({
          type: 'in-app',
          request: {
            apple: { sku: productId },
            google: { skus: [productId] },
          },
        });
        return true;
      } catch {
        setPurchasing(null);
        showPurchaseError('購入を開始できませんでした。');
        return false;
      }
    },
    [connected, purchasing, requestPurchase],
  );

  const purchaseWeeklyPass = useCallback(
    () => requestProduct('weekly', WEEKLY_PASS_PRODUCT_ID),
    [requestProduct],
  );

  const purchaseInfinitePass = useCallback(
    () => requestProduct('infinite', INFINITE_PASS_PRODUCT_ID),
    [requestProduct],
  );

  const restorePurchases = useCallback(async () => {
    if (!connected) {
      showPurchaseError('ストアに接続できません。しばらくしてからお試しください。');
      return;
    }
    setRestoring(true);
    try {
      await restoreStorePurchases();
      const restored = await syncInfinitePassFromStore();
      showRestoreSuccess(restored);
    } catch {
      showPurchaseError('購入の復元に失敗しました。');
    } finally {
      setRestoring(false);
    }
  }, [connected, restoreStorePurchases, syncInfinitePassFromStore]);

  const value = useMemo<IapContextValue>(
    () => ({
      connected,
      productsReady,
      purchasing,
      restoring,
      weeklyPriceLabel: weeklyProduct?.displayPrice ?? WEEKLY_PASS_PRICE_LABEL,
      infinitePriceLabel: infiniteProduct?.displayPrice ?? INFINITE_PASS_PRICE_LABEL,
      purchaseWeeklyPass,
      purchaseInfinitePass,
      restorePurchases,
    }),
    [
      connected,
      infiniteProduct?.displayPrice,
      productsReady,
      purchaseInfinitePass,
      purchaseWeeklyPass,
      purchasing,
      restorePurchases,
      restoring,
      weeklyProduct?.displayPrice,
    ],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}
