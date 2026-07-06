import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const STEPS = [
  {
    title: '目的',
    body: '盤面上の色の配置を、課題パターンと同じ配色になるよう再現するとクリアです。',
  },
  {
    title: 'スライド',
    body: '盤面をスワイプすると、ブロックがその方向へ滑ります。反対側の空きマスに NEXT の色が1つ出現します。',
  },
  {
    title: '混合',
    body: '「混合」を選び、隣接する2つのブロックをタップすると1つに混ざります。絵の具のように CMY の色が足し合わされます。',
  },
  {
    title: '入替',
    body: '「入替」を選び、隣接する2つのブロックをタップすると、位置が入れ替わります。',
  },
  {
    title: 'スタミナ',
    body: 'ステージ挑戦にはスタミナを消費します。チュートリアル（ステージ1〜5）は無料です。時間経過と広告で回復できます。',
  },
];

export default function HowToPlayScreen() {
  return (
    <View style={styles.root}>
      <SettingsSubHeader title="遊び方" />
      <ScrollView style={settingsSubContent.scroll} contentContainerStyle={settingsSubContent.content}>
        {STEPS.map((step) => (
          <View key={step.title} style={settingsSubContent.card}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={settingsSubContent.body}>{step.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  stepTitle: {
    ...settingsSubContent.body,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    color: Theme.accent,
  },
});
