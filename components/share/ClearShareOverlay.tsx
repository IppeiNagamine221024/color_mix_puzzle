import { Theme } from '@/constants/Theme';
import { woodButton, woodText, woodTitle } from '@/constants/wood';
import { playSe } from '@/src/audio/playSe';
import { shareClearScreenshot, type ShareTarget } from '@/src/share/shareClearResult';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  stageId: number;
  imageUri: string | null;
  onDismiss: () => void;
};

const SHARE_TARGETS: { id: ShareTarget; label: string }[] = [
  { id: 'x', label: 'X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'line', label: 'LINE' },
];

export function ClearShareOverlay({ visible, stageId, imageUri, onDismiss }: Props) {
  const [sharing, setSharing] = useState<ShareTarget | null>(null);

  const onShare = useCallback(
    async (target: ShareTarget) => {
      if (sharing) return;
      playSe('uiTap');
      setSharing(target);
      try {
        await shareClearScreenshot(target, stageId, imageUri);
      } finally {
        setSharing(null);
      }
    },
    [imageUri, sharing, stageId],
  );

  const onSkip = useCallback(() => {
    if (sharing) return;
    playSe('uiTap');
    onDismiss();
  }, [onDismiss, sharing]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.title}>クリアおめでとう！</Text>
        <Text style={styles.subtitle}>ステージ {stageId} をシェアしよう</Text>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={`ステージ ${stageId} のクリア画面`}
          />
        ) : null}

        <View style={styles.buttons}>
          {SHARE_TARGETS.map((target) => (
            <Pressable
              key={target.id}
              style={[styles.shareBtn, sharing === target.id && styles.shareBtnBusy]}
              onPress={() => void onShare(target.id)}
              disabled={sharing != null}
              accessibilityRole="button"
              accessibilityLabel={`${target.label}でシェア`}
            >
              {sharing === target.id ? (
                <ActivityIndicator color={Theme.accent} />
              ) : (
                <Text style={styles.shareLabel}>{target.label}</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.skipBtn}
          onPress={onSkip}
          disabled={sharing != null}
          accessibilityRole="button"
          accessibilityLabel="スキップ"
        >
          <Text style={styles.skipText}>スキップ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
    padding: 16,
    gap: 12,
  },
  title: {
    ...woodTitle,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: Theme.text,
  },
  subtitle: {
    ...woodText,
    fontSize: 13,
    textAlign: 'center',
    color: Theme.textDim,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: Theme.bg,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    ...woodButton(Theme.surfaceRaised),
  },
  shareBtnBusy: {
    opacity: 0.7,
  },
  shareLabel: {
    ...woodText,
    fontSize: 13,
    fontWeight: '700',
    color: Theme.text,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    ...woodText,
    fontSize: 14,
    color: Theme.textDim,
    fontWeight: '600',
  },
});
