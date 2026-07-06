import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { woodText } from '@/constants/wood';
import { formatRecipe, getColorRecipes } from '@/src/game/recipeGuide';
import { COLOR_HEX } from '@/src/types/colors';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const recipes = getColorRecipes();

export default function RecipesScreen() {
  return (
    <View style={styles.root}>
      <SettingsSubHeader title="色のレシピ" />
      <ScrollView style={settingsSubContent.scroll} contentContainerStyle={settingsSubContent.content}>
        <Text style={styles.intro}>
          隣接する2色を混合すると、CMY比の足し算で新しい色になります。黒同士だけは消滅します。
        </Text>
        {recipes.map((entry) => (
          <View key={`${entry.a}-${entry.b}`} style={settingsSubContent.card}>
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: COLOR_HEX[entry.a] }]} />
              <Text style={styles.plus}>+</Text>
              <View style={[styles.swatch, { backgroundColor: COLOR_HEX[entry.b] }]} />
              <Text style={styles.arrow}>→</Text>
              <View style={[styles.swatch, { backgroundColor: COLOR_HEX[entry.result] }]} />
            </View>
            <Text style={settingsSubContent.body}>{formatRecipe(entry)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  intro: {
    ...woodText,
    fontSize: 13,
    lineHeight: 20,
    color: Theme.textDim,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  plus: { ...woodText, fontSize: 14, color: Theme.textDim },
  arrow: { ...woodText, fontSize: 14, color: Theme.textDim },
});
