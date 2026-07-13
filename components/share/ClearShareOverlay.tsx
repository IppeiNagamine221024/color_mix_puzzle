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
  onClose: () => void;
};

const SHARE_TARGETS: { id: ShareTarget; label: string }[] = [
  { id: 'x', label: 'X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'line', label: 'LINE' },
];

export function ClearShareOverlay({ visible, stageId, imageUri, onClose }: Props) {
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

  const handleClose = useCallback(() => {
    if (sharing) return;
    playSe('uiTap');
    onClose();
  }, [onClose, sharing]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>SNSでシェア</Text>
          <Pressable
            style={styles.closeBtn}
            onPress={handleClose}
            disabled={sharing != null}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={8}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>
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
          style={styles.closeLink}
          onPress={handleClose}
          disabled={sharing != null}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
        >
          <Text style={styles.closeLinkText}>閉じる</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...woodTitle,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: Theme.text,
    paddingLeft: 28,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...woodText,
    fontSize: 22,
    fontWeight: '700',
    color: Theme.textDim,
    lineHeight: 24,
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
  closeLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeLinkText: {
    ...woodText,
    fontSize: 14,
    color: Theme.textDim,
    fontWeight: '600',
  },
});
