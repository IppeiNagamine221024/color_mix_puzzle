import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText, woodTitle } from '@/constants/wood';

type Props = {
  reason?: 'turns' | 'full';
  onDismiss: () => void;
};

export function GameOverOverlay({ reason, onDismiss }: Props) {
  const message =
    reason === 'full' ? '盤面がいっぱいです' : '手数が尽きました';

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>ゲームオーバー</Text>
        <Text style={styles.sub}>{message}</Text>
        <Pressable style={styles.btn} onPress={onDismiss}>
          <Text style={styles.btnText}>メインへ</Text>
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
    borderColor: Theme.danger,
  },
  title: {
    ...woodTitle,
    fontSize: 22,
    fontWeight: '700',
    color: Theme.danger,
    marginBottom: 8,
  },
  sub: { ...woodText, fontSize: 14, color: Theme.textDim, marginBottom: 22 },
  btn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    ...woodButton(Theme.surface),
  },
  btnText: { ...woodText, fontWeight: '700', fontSize: 14 },
});
