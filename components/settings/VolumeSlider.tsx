import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

export function VolumeSlider({ label, value, onValueChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value * 100)}%</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.05}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={Theme.accent}
        maximumTrackTintColor={Theme.boardEmpty}
        thumbTintColor={Theme.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    ...woodText,
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    ...woodText,
    fontSize: 13,
    color: Theme.textDim,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
