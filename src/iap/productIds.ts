import { APP_BUNDLE_ID } from '@/constants/appIdentity';

/** App Store / Google Play で登録する商品 ID（両プラットフォーム共通） */
export const UNLIMITED_PLAY_24H_PRODUCT_ID = `${APP_BUNDLE_ID}.unlimited_play_24h`;

export const IAP_PRODUCT_IDS = [UNLIMITED_PLAY_24H_PRODUCT_ID] as const;
