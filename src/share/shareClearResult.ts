import { buildShareMessage } from '@/constants/share';
import { Platform, Share as RNShare } from 'react-native';
import Share from 'react-native-share';

function normalizeFileUrl(uri: string): string {
  if (uri.startsWith('file://')) return uri;
  return Platform.OS === 'ios' ? uri : `file://${uri}`;
}

/** OS 共有シートを開き、ユーザーに共有先を選んでもらう */
export async function shareClearScreenshot(
  stageId: number,
  imageUri: string | null,
): Promise<void> {
  const message = buildShareMessage(stageId);

  if (!imageUri) {
    await RNShare.share({ message });
    return;
  }

  await Share.open({
    url: normalizeFileUrl(imageUri),
    message,
    type: 'image/png',
    failOnCancel: false,
  });
}
