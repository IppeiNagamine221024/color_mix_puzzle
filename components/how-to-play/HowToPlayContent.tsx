import { HOW_TO_PLAY_SLIDES } from '@/components/how-to-play/howToPlayImages';
import { Theme } from '@/constants/Theme';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

const CONTENT_WIDTH = Dimensions.get('window').width - 48;

function slideImageSize(source: (typeof HOW_TO_PLAY_SLIDES)[number]['source']) {
  const resolved = Image.resolveAssetSource(source);
  const width = CONTENT_WIDTH;
  const height =
    resolved.width > 0 && resolved.height > 0
      ? (resolved.height / resolved.width) * width
      : width;
  return { width, height };
}

type Props = {
  contentContainerStyle?: object;
};

export function HowToPlayContent({ contentContainerStyle }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {HOW_TO_PLAY_SLIDES.map((slide) => (
        <View key={slide.id} style={styles.slide}>
          <Image
            source={slide.source}
            style={slideImageSize(slide.source)}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={slide.accessibilityLabel}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Theme.bg },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  slide: {
    alignItems: 'center',
    backgroundColor: Theme.surfaceRaised,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Theme.border,
    padding: 8,
  },
});
