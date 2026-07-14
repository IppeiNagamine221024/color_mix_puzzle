import { buildShareMessage } from '@/constants/share';
import { File } from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Platform, Share as RNShare } from 'react-native';
import Share, { Social } from 'react-native-share';

export type ShareTarget = 'x' | 'instagram' | 'line';

function normalizeFileUrl(uri: string): string {
  if (uri.startsWith('file://')) return uri;
  return Platform.OS === 'ios' ? uri : `file://${uri}`;
}

/** Instagram の shareSingleImage は data:image のみ正しく処理する */
async function toPngDataUri(fileUri: string): Promise<string> {
  const file = new File(normalizeFileUrl(fileUri));
  const base64 = await file.base64();
  return `data:image/png;base64,${base64}`;
}

async function openSystemShare(message: string, imageUri: string | null): Promise<void> {
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

/**
 * X アプリへテキスト投稿を開く（画像は URL スキームでは渡せない）。
 * shareSingle(Social.Twitter) は iOS で廃止済み Social.framework 経由のため無反応。
 */
async function openXCompose(message: string): Promise<boolean> {
  const encoded = encodeURIComponent(message);
  const appUrl = `twitter://post?message=${encoded}`;
  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return true;
    }
  } catch {
    // fall through
  }
  return false;
}

export async function shareClearScreenshot(
  target: ShareTarget,
  stageId: number,
  imageUri: string | null,
): Promise<void> {
  const message = buildShareMessage(stageId);

  if (!imageUri) {
    if (target === 'x') {
      const opened = await openXCompose(message);
      if (!opened) {
        await Linking.openURL(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
        );
      }
      return;
    }
    await openSystemShare(message, null);
    return;
  }

  const fileUrl = normalizeFileUrl(imageUri);

  try {
    switch (target) {
      case 'x': {
        // 画像付きは OS 共有シート経由が確実（ユーザーが X を選択）。
        // shareSingle(Twitter) は iOS で死んでおり、twitter:// はテキストのみ。
        await openSystemShare(message, fileUrl);
        return;
      }
      case 'instagram': {
        // file:// だと Instagram 側が LocalIdentifier として扱えず、カメラロール最新に置き換わる。
        // data:image だとライブラリ側が写真へ保存→正しい写真を開けられる。
        const dataUri = await toPngDataUri(fileUrl);
        await Share.shareSingle({
          social: Social.Instagram,
          url: dataUri,
          type: 'image/*',
        });
        return;
      }
      case 'line': {
        await openSystemShare(message, fileUrl);
        return;
      }
    }
  } catch {
    if (target === 'x') {
      const opened = await openXCompose(message);
      if (opened) return;
      try {
        await Linking.openURL(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
        );
        return;
      } catch {
        // fall through to system share
      }
    }
    await openSystemShare(message, imageUri);
  }
}
