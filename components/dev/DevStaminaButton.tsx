import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { DEV_TOOLS_ENABLED } from '@/src/dev/config';
import { devRefillStamina } from '@/src/dev/stamina';
import { syncStaminaFullNotification } from '@/src/notifications/staminaNotification';
import { msUntilNextRecovery } from '@/src/storage/stamina';
import { useAppStore } from '@/src/stores/appStore';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  disabled?: boolean;
};

export function DevStaminaButton({ disabled }: Props) {
  const persist = useAppStore((s) => s.persist);

  if (!DEV_TOOLS_ENABLED) return null;

  const onPress = () => {
    const { save } = useAppStore.getState();
    const next = devRefillStamina(save);
    if (!next) return;
    useAppStore.setState({ save: next, recoveryMs: msUntilNextRecovery(next) });
    void syncStaminaFullNotification(next);
    void persist();
  };

  return (
    <Pressable
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>[DEV] スタミナ全回復</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'center',
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
