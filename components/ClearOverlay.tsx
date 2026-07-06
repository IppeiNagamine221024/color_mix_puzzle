import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText, woodTitle } from '@/constants/wood';

type Props = {
  onDismiss: () => void;
};

export function ClearOverlay({ onDismiss }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>クリア！</Text>
        <Text style={styles.sub}>おめでとうございます</Text>
        <Pressable style={styles.ok} onPress={onDismiss}>
          <Text style={styles.okText}>続ける</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    padding: 28,
    alignItems: 'center',
    minWidth: 260,
    ...woodPanel,
    borderColor: Theme.warm,
  },
  title: {
    ...woodTitle,
    fontSize: 28,
    fontWeight: '700',
    color: Theme.warm,
    marginBottom: 8,
  },
  sub: {
    ...woodText,
    fontSize: 14,
    color: Theme.textDim,
    marginBottom: 22,
  },
  ok: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    ...woodButton(Theme.accent),
  },
  okText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
