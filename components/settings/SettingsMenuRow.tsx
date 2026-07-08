import { Theme } from '@/constants/Theme';
import { woodPanel, woodText } from '@/constants/wood';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  accent?: boolean;
  hint?: string;
};

export function SettingsMenuRow({ label, onPress, showChevron = true, accent, hint }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <Text style={[styles.label, accent && styles.accent]}>{label}</Text>
      <View style={styles.trailing}>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        {showChevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...woodText,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.textDim,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionBody: {
    ...woodPanel,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  pressed: {
    backgroundColor: Theme.accentSoft,
  },
  label: {
    ...woodText,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  accent: {
    color: Theme.accent,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hint: {
    ...woodText,
    fontSize: 13,
    fontWeight: '700',
    color: Theme.accent,
  },
  chevron: {
    ...woodText,
    fontSize: 22,
    color: Theme.textDim,
    marginLeft: 8,
  },
});
