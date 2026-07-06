import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { Theme } from '@/constants/Theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyScreen() {
  return (
    <View style={styles.root}>
      <SettingsSubHeader title="プライバシーポリシー" />
      <ScrollView style={settingsSubContent.scroll} contentContainerStyle={settingsSubContent.content}>
        <View style={settingsSubContent.card}>
          <Text style={settingsSubContent.body}>
            本アプリ「Color Order」（以下「本アプリ」）は、ユーザーの個人情報の保護に努めます。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>1. 収集する情報</Text>
          <Text style={settingsSubContent.body}>
            本アプリは、ゲームの進行状況を端末内に保存します。現時点ではサーバーへの個人情報の送信は行いません（広告・課金を導入する際は本ポリシーを更新します）。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>2. 利用目的</Text>
          <Text style={settingsSubContent.body}>
            保存したデータは、ステージの進行・設定の保持のためにのみ使用します。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>3. お問い合わせ</Text>
          <Text style={settingsSubContent.body}>
            本ポリシーに関するお問い合わせは、アプリ配信ページの開発者連絡先よりご連絡ください。
          </Text>
          <Text style={settingsSubContent.note}>最終更新: 2026年6月（仮）</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  heading: {
    ...settingsSubContent.body,
    fontWeight: '700',
    marginBottom: 8,
  },
});
