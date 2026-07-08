import { SettingsMenuRow, SettingsSection, VolumeSlider } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText, woodTitle } from '@/constants/wood';
import { playSe } from '@/src/audio/playSe';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { bgmVolume, seVolume, setBgmVolume, setSeVolume } = useSettingsStore();

  const onBgmChange = useCallback(
    (value: number) => {
      void setBgmVolume(value);
    },
    [setBgmVolume],
  );

  const onSeChange = useCallback(
    (value: number) => {
      void setSeVolume(value);
      if (value > 0) playSe('uiTap');
    },
    [setSeVolume],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SettingsSection title="音量設定">
          <VolumeSlider label="BGM" value={bgmVolume} onValueChange={onBgmChange} />
          <VolumeSlider label="SE" value={seVolume} onValueChange={onSeChange} />
        </SettingsSection>

        <SettingsSection title="ヘルプ">
          <SettingsMenuRow
            label="色のレシピ"
            onPress={() => router.push('/settings/recipes' as Href)}
          />
          <SettingsMenuRow
            label="遊び方"
            onPress={() => router.push('/settings/how-to-play' as Href)}
          />
        </SettingsSection>

        <SettingsSection title="その他">
          <SettingsMenuRow
            label="遊び放題パス"
            hint="¥100〜"
            onPress={() => router.push('/settings/passes' as Href)}
          />
          <SettingsMenuRow
            label="プライバシーポリシー"
            onPress={() => router.push('/settings/privacy' as Href)}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.surface,
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
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
