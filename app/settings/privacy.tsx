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
            本アプリは、ゲームの進行状況・音量設定などを端末内に保存します。広告配信のため、Google
            AdMob が広告識別子や端末情報を収集する場合があります。iOS では App Tracking
            Transparency（ATT）に基づき、追跡の許可を求める場合があります。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>2. 利用目的</Text>
          <Text style={settingsSubContent.body}>
            保存したデータは、ステージの進行・設定の保持のために使用します。広告データは広告の配信・効果測定のために使用されます。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>3. 第三者への提供</Text>
          <Text style={settingsSubContent.body}>
            広告配信のため Google LLC（AdMob）のサービスを利用しています。詳細は Google のプライバシーポリシーをご確認ください。
          </Text>
        </View>
        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>4. お問い合わせ</Text>
          <Text style={settingsSubContent.body}>
            本ポリシーに関するお問い合わせは、アプリ配信ページの開発者連絡先よりご連絡ください。
          </Text>
          <Text style={settingsSubContent.note}>最終更新: 2026年7月</Text>
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
