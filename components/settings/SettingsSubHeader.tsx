import { Theme } from '@/constants/Theme';
import { woodButton, woodText, woodTitle } from '@/constants/wood';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsSubHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>
    </SafeAreaView>
  );
}

export const settingsSubContent = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Theme.bg },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: Theme.surfaceRaised,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Theme.border,
  },
  body: {
    ...woodText,
    fontSize: 14,
    lineHeight: 22,
    color: Theme.text,
  },
  note: {
    ...woodText,
    fontSize: 12,
    lineHeight: 20,
    color: Theme.textDim,
    marginTop: 8,
  },
});

const styles = StyleSheet.create({
  safe: { backgroundColor: Theme.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...woodButton(Theme.surfaceRaised),
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  back: { ...woodText, fontSize: 20, fontWeight: '600' },
  title: {
    ...woodTitle,
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
});
