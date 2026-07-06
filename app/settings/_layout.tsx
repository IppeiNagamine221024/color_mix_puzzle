import { Theme } from '@/constants/Theme';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
