import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodPanel, woodText } from '@/constants/wood';
import { formatPassRemaining } from '@/src/iap/passes';
import { STAMINA_MAX } from '@/src/storage/stamina';

type Props = {
  current: number;
  recoveryMs: number;
  consumingIndex?: number | null;
  passMode?: 'none' | 'weekly' | 'infinite';
  weeklyPlayMs?: number;
};

const CONSUME_MS = 480;

function formatMs(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PaintDot({
  filled,
  consuming,
}: {
  filled: boolean;
  consuming: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!consuming) return;

    scale.setValue(1);
    opacity.setValue(1);

    const anim = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.25,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: CONSUME_MS - 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: CONSUME_MS - 120,
          useNativeDriver: true,
        }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [consuming, scale, opacity]);

  if (!consuming) {
    return (
      <View style={[styles.dot, filled ? styles.dotFull : styles.dotEmpty]} />
    );
  }

  return (
    <Animated.View
      style={[
        styles.dot,
        styles.dotFull,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

export function StaminaBar({
  current,
  recoveryMs,
  consumingIndex = null,
  passMode = 'none',
  weeklyPlayMs = 0,
}: Props) {
  if (passMode === 'infinite') {
    return (
      <View style={[styles.wrap, styles.wrapPass]}>
        <Text style={styles.passBadge}>無限パス</Text>
        <Text style={styles.passTimer}>スタミナ消費なし</Text>
      </View>
    );
  }

  if (passMode === 'weekly') {
    return (
      <View style={[styles.wrap, styles.wrapPass]}>
        <Text style={styles.passBadge}>1週間パス</Text>
        <Text style={styles.passTimer}>残り {formatPassRemaining(weeklyPlayMs)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, consumingIndex != null && styles.wrapActive]}>
      <View style={styles.dotsRow}>
        {Array.from({ length: STAMINA_MAX }, (_, i) => (
          <PaintDot
            key={i}
            filled={i < current}
            consuming={consumingIndex === i}
          />
        ))}
      </View>
      {current < STAMINA_MAX && recoveryMs > 0 && consumingIndex == null && (
        <Text style={styles.timer}>あと {formatMs(recoveryMs)} で回復</Text>
      )}
      {consumingIndex != null && (
        <Text style={styles.consumeLabel}>-1</Text>
      )}
    </View>
  );
}

export const STAMINA_CONSUME_MS = CONSUME_MS;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...woodPanel,
  },
  wrapActive: {
    borderColor: Theme.heart,
    backgroundColor: Theme.warmSoft,
  },
  wrapPass: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentSoft,
    justifyContent: 'space-between',
  },
  passBadge: {
    ...woodText,
    fontSize: 13,
    fontWeight: '800',
    color: Theme.accent,
  },
  passTimer: {
    ...woodText,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.text,
  },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.border,
  },
  dotFull: {
    backgroundColor: Theme.heart,
    borderColor: Theme.borderStrong,
  },
  dotEmpty: {
    backgroundColor: Theme.boardEmpty,
  },
  timer: { ...woodText, fontSize: 11, color: Theme.textDim },
  consumeLabel: {
    ...woodText,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.heart,
  },
});
