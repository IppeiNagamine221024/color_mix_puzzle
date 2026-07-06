import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { devClearAllStages, devResetClearedStages } from '@/src/dev/clearedStages';
import { DEV_TOOLS_ENABLED } from '@/src/dev/config';
import { useAppStore } from '@/src/stores/appStore';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  disabled?: boolean;
};

export function DevClearStagesButtons({ disabled }: Props) {
  const persist = useAppStore((s) => s.persist);

  if (!DEV_TOOLS_ENABLED) return null;

  const apply = (next: ReturnType<typeof devClearAllStages>) => {
    if (!next) return;
    useAppStore.setState({ save: next });
    void persist();
  };

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={() => apply(devClearAllStages(useAppStore.getState().save))}
        disabled={disabled}
      >
        <Text style={styles.text}>[DEV] 全クリア</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={() => apply(devResetClearedStages(useAppStore.getState().save))}
        disabled={disabled}
      >
        <Text style={styles.text}>[DEV] 全未クリア</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.warm,
    borderStyle: 'dashed',
    backgroundColor: Theme.warmSoft,
  },
  btnDisabled: { opacity: 0.4 },
  text: {
    ...woodText,
    fontSize: 11,
    color: Theme.warm,
    fontWeight: '600',
  },
});
