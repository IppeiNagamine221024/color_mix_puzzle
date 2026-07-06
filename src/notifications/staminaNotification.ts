import { applyStaminaRecovery, msUntilFullRecovery, STAMINA_MAX } from '@/src/storage/stamina';
import type { SaveData } from '@/src/types/save';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const STAMINA_FULL_NOTIFICATION_ID = 'stamina-full';
const ANDROID_CHANNEL_ID = 'stamina';

let initialized = false;

export async function initStaminaNotifications(): Promise<void> {
  if (initialized || Platform.OS === 'web') return;
  initialized = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'スタミナ回復',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

/** スタミナ全回復のローカル通知を、現在のセーブ状態に合わせて再予約する */
export async function syncStaminaFullNotification(save: SaveData): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(STAMINA_FULL_NOTIFICATION_ID);
  } catch {
    // 未登録のときは無視
  }

  const synced = applyStaminaRecovery(save);
  if (synced.stamina.current >= STAMINA_MAX) return;

  const ms = msUntilFullRecovery(synced);
  if (ms <= 0) return;

  const seconds = Math.max(1, Math.ceil(ms / 1000));

  await Notifications.scheduleNotificationAsync({
    identifier: STAMINA_FULL_NOTIFICATION_ID,
    content: {
      title: 'スタミナが全回復しました',
      body: 'ハートが満タンです。ステージに挑戦しましょう！',
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}
