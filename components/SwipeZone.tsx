import { useMemo, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Direction } from '@/src/types/board';
import { SWIPE_ACTIVATE_PX, directionFromSwipe } from '@/src/game/swipe';

type Props = {
  enabled: boolean;
  onSwipe: (dir: Direction) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SwipeZone({ enabled, onSwipe, children, style }: Props) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          enabled && (Math.abs(g.dx) > SWIPE_ACTIVATE_PX || Math.abs(g.dy) > SWIPE_ACTIVATE_PX),
        onPanResponderRelease: (_, g) => {
          if (!enabled) return;
          const dir = directionFromSwipe(g.dx, g.dy);
          if (dir) onSwipe(dir);
        },
      }),
    [enabled, onSwipe],
  );

  return (
    <View
      style={[styles.zone, style]}
      {...(enabled ? panResponder.panHandlers : undefined)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    flex: 1,
    width: '100%',
  },
});
