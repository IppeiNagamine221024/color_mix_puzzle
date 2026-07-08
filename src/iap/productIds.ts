import { APP_BUNDLE_ID } from '@/constants/appIdentity';

/** 1週間遊び放題パス（消耗型） */
export const WEEKLY_PASS_PRODUCT_ID = `${APP_BUNDLE_ID}.weekly_play_pass`;

/** 無限パス（非消耗型・買い切り） */
export const INFINITE_PASS_PRODUCT_ID = `${APP_BUNDLE_ID}.infinite_pass`;

export const IAP_PRODUCT_IDS = [WEEKLY_PASS_PRODUCT_ID, INFINITE_PASS_PRODUCT_ID] as const;
