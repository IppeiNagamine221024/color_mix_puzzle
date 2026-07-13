import { buildShareMessage } from '@/constants/share';
import * as Linking from 'expo-linking';
import { Platform, Share as RNShare } from 'react-native';
import Share, { Social } from 'react-native-share';

export type ShareTarget = 'x' | 'instagram' | 'line';

function normalizeFileUrl(uri: string): string {
  if (uri.startsWith('file://')) return uri;
  return Platform.OS === 'ios' ? uri : `file://${uri}`;
}

async function openGenericShare(message: string, imageUri: string | null): Promise<void> {
  if (imageUri) {
    await Share.open({
      url: normalizeFileUrl(imageUri),
      message,
      type: 'image/png',
      failOnCancel: false,
    });
    return;
  }
  await RNShare.share({ message });
}

export async function shareClearScreenshot(
  target: ShareTarget,
  stageId: number,
  imageUri: string | null,
): Promise<void> {
  const message = buildShareMessage(stageId);

  if (!imageUri) {
    await openGenericShare(message, null);
    return;
  }

  const url = normalizeFileUrl(imageUri);

  try {
    switch (target) {
      case 'x':
        await Share.shareSingle({
          social: Social.Twitter,
          url,
          message,
          type: 'image/png',
        });
        return;
      case 'instagram':
        await Share.shareSingle({
          social: Social.Instagram,
          url,
          type: 'image/png',
        });
        return;
      case 'line':
        // react-native-share に LINE 専用 social がないため、画像付きは汎用シート経由
        await Share.open({
          url,
          message,
          type: 'image/png',
          failOnCancel: false,
        });
        return;
    }
  } catch {
    if (target === 'line' && !imageUri) {
      const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(lineUrl);
      if (canOpen) {
        await Linking.openURL(lineUrl);
        return;
      }
    }
    await openGenericShare(message, imageUri);
  }
}
