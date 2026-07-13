import { HowToPlayContent } from '@/components/how-to-play';
import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { StyleSheet, View } from 'react-native';

export default function HowToPlayScreen() {
  return (
    <View style={styles.root}>
      <SettingsSubHeader title="遊び方" />
      <HowToPlayContent contentContainerStyle={settingsSubContent.content} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
});
