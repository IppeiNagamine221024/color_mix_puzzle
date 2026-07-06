import { Theme } from '@/constants/Theme';
import { audio } from '@/src/audio/audioService';
import { initStaminaNotifications } from '@/src/notifications/staminaNotification';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    void audio.init();
    void initStaminaNotifications();
    void useSettingsStore.getState().hydrate();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: Theme.bg },
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: 'Color Order', headerShown: false }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen
            name="game/[stageId]"
            options={{ title: 'プレイ', headerShown: false, animation: 'none' }}
          />
        </Stack>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
