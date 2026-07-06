import { Theme } from '@/constants/Theme';
import { woodButton, woodPanel, woodText, woodTitle } from '@/constants/wood';
import {
  formatPatternRecipeHint,
  getPatternRecipeHints,
  type PatternRecipeHint,
} from '@/src/game/recipeGuide';
import { COLOR_HEX } from '@/src/types/colors';
import type { PatternCell } from '@/src/types/stage';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  patternCells: PatternCell[];
  onClose: () => void;
};

function Swatch({ colorId }: { colorId: string }) {
  return <View style={[styles.swatch, { backgroundColor: COLOR_HEX[colorId] }]} />;
}

function HintRow({ hint }: { hint: PatternRecipeHint }) {
  return (
    <View style={styles.row}>
      <View style={styles.swatchRow}>
        {hint.kind === 'primary' ? (
          <Swatch colorId={hint.color} />
        ) : (
          <>
            <Swatch colorId={hint.color} />
            <Text style={styles.symbol}>：</Text>
            <Swatch colorId={hint.recipe.a} />
            <Text style={styles.symbol}>+</Text>
            <Swatch colorId={hint.recipe.b} />
          </>
        )}
      </View>
      <Text style={styles.hintText}>{formatPatternRecipeHint(hint)}</Text>
    </View>
  );
}

export function ColorRecipeHintOverlay({ visible, patternCells, onClose }: Props) {
  if (!visible) return null;

  const hints = getPatternRecipeHints(patternCells);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>カラーレシピ</Text>
        <Text style={styles.intro}>クリアに必要な課題パターンの色の作り方です。</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {hints.map((hint) => (
            <HintRow key={hint.color} hint={hint} />
          ))}
        </ScrollView>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>閉じる</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    padding: 20,
    ...woodPanel,
    borderColor: Theme.accent,
  },
  title: {
    ...woodTitle,
    fontSize: 20,
    fontWeight: '700',
    color: Theme.accent,
    marginBottom: 6,
    textAlign: 'center',
  },
  intro: {
    ...woodText,
    fontSize: 12,
    lineHeight: 18,
    color: Theme.textDim,
    marginBottom: 14,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 320,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 4,
  },
  row: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  symbol: {
    ...woodText,
    fontSize: 14,
    color: Theme.textDim,
  },
  hintText: {
    ...woodText,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.text,
    marginTop: 8,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
    ...woodButton(Theme.accent),
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
