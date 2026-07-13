/** App Store（iOS 初版） */
export const APP_STORE_URL = 'https://apps.apple.com/us/app/color-order/id6788045840';

export const SHARE_HASHTAG = '#ColorOrder';

export function buildShareMessage(stageId: number): string {
  return `Color Order でステージ ${stageId} をクリアしました！\n${SHARE_HASHTAG}\n${APP_STORE_URL}`;
}
