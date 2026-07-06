import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const CONTINUE_HINT_FADE_MS = 1400;

export function ContinueHint({ text }: { text: string }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: CONTINUE_HINT_FADE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: CONTINUE_HINT_FADE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.Text style={[styles.continueHint, { opacity }]} pointerEvents="none">
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  continueHint: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    zIndex: 2,
    ...woodText,
    fontSize: 24,
    fontWeight: '700',
    color: Theme.text,
    textAlign: 'center',
  },
});
