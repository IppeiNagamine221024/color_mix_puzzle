import type { Purchase } from 'expo-iap';
import { INFINITE_PASS_PRODUCT_ID } from './productIds';

export function ownsInfinitePassInPurchases(purchases: Purchase[]): boolean {
  return purchases.some((purchase) => purchase.productId === INFINITE_PASS_PRODUCT_ID);
}
