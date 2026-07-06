import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { COLOR_HEX, type ColorId } from '@/src/types/colors';

type Props = {
  color: ColorId;
  stack: number;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function BlockFace({ color, stack, size, style }: Props) {
  const fontSize = Math.max(8, Math.floor(size * 0.3));
  const radius = Math.max(4, size * 0.22);

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: COLOR_HEX[color], borderRadius: radius },
        ]}
      />
      {stack > 1 && (
        <Text style={[styles.stack, { fontSize }]}>{stack}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'visible',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.35)',
    borderRightColor: 'rgba(0,0,0,0.25)',
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  stack: {
    position: 'absolute',
    top: 1,
    left: 3,
    ...woodText,
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(61, 40, 24, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
