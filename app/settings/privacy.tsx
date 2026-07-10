import { SettingsSubHeader, settingsSubContent } from '@/components/settings';
import { PRIVACY_POLICY_URL, SUPPORT_URL } from '@/constants/publicLinks';
import { Theme } from '@/constants/Theme';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const LAST_UPDATED = '2026年7月10日';

export default function PrivacyScreen() {
  return (
    <View style={styles.root}>
      <SettingsSubHeader title="プライバシーポリシー" />
      <ScrollView style={settingsSubContent.scroll} contentContainerStyle={settingsSubContent.content}>
        <View style={settingsSubContent.card}>
          <Text style={settingsSubContent.body}>
            本アプリ「Color Order」（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、本アプリの利用にあたって当方が取り扱う情報について説明するものです。
          </Text>
          <Text style={settingsSubContent.note}>最終更新: {LAST_UPDATED}</Text>
          <Pressable onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}>
            <Text style={styles.link}>最新版をブラウザで開く</Text>
          </Pressable>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>1. 収集する情報</Text>
          <Text style={settingsSubContent.body}>
            本アプリは、原則としてユーザーを直接特定する個人情報（氏名、メールアドレス、電話番号など）を収集しません。ただし、以下の情報を取り扱う場合があります。
          </Text>
          <Text style={styles.subheading}>（1）端末内に保存する情報</Text>
          <Text style={settingsSubContent.body}>
            ゲームの進行状況（クリア済みステージ、途中保存など）、音量設定、スタミナの回復状態、リワード広告の視聴回数、遊び放題パスの有効状態などを、お使いの端末内のみに保存します。これらのデータは当方のサーバーには送信されません。
          </Text>
          <Text style={styles.subheading}>（2）アプリ内課金に関する情報</Text>
          <Text style={settingsSubContent.body}>
            課金の決済処理は、Apple App Store または Google Play ストアが行います。当方は、クレジットカード番号などの決済情報を直接取得・保存しません。購入の確認および無限パスの復元のため、各ストアが提供する購入情報を端末上で参照する場合があります。
          </Text>
          <Text style={styles.subheading}>（3）広告に関する情報</Text>
          <Text style={settingsSubContent.body}>
            広告配信のため、Google AdMob が端末情報や広告の表示・クリックに関する情報を収集する場合があります。本アプリは非パーソナライズ広告のみを表示し、他社のアプリやサイトを横断してユーザーを追跡することはありません。
          </Text>
          <Text style={styles.subheading}>（4）通知</Text>
          <Text style={settingsSubContent.body}>
            スタミナが全回復した際のお知らせなど、端末内でスケジュールするローカル通知を使用します。通知のための情報は端末内に保持され、当方のサーバーには送信されません。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>2. 利用目的</Text>
          <Text style={settingsSubContent.body}>
            収集・保存した情報は、以下の目的で使用します。
          </Text>
          <Text style={settingsSubContent.body}>
            {'\u2022'} ゲーム進行・設定・スタミナの管理{'\n'}
            {'\u2022'} 遊び放題パスの有効期間の管理{'\n'}
            {'\u2022'} アプリ内課金の提供および購入内容の反映{'\n'}
            {'\u2022'} 広告の配信および効果測定{'\n'}
            {'\u2022'} スタミナ回復などのローカル通知の送信
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>3. アプリ内課金について</Text>
          <Text style={settingsSubContent.body}>
            本アプリでは、次の有料コンテンツ（遊び放題パス）を提供しています。
          </Text>
          <Text style={styles.subheading}>（1）1週間遊び放題パス（消耗型）</Text>
          <Text style={settingsSubContent.body}>
            購入後、一定期間（1週間）スタミナを消費せずにプレイできるパスです。有効期限は端末内に保存されます。消耗型のため、App Store / Google Play の「購入の復元」では復元されません。また、アプリの削除・再インストール、端末の初期化、データの消去などにより端末内のデータが失われた場合、有効期限の情報も失われ、残り期間は引き継がれません。あらかじめご了承ください。
          </Text>
          <Text style={styles.subheading}>（2）無限パス（非消耗型・買い切り）</Text>
          <Text style={settingsSubContent.body}>
            購入後、スタミナを消費せずにプレイできる買い切りのパスです。非消耗型のため、設定画面の「購入を復元」機能、または各ストアの購入復元機能により、再インストール後などに購入状態を復元できる場合があります。復元は同一のストアアカウントで行ってください。
          </Text>
          <Text style={settingsSubContent.body}>
            いずれのパスを購入した場合でも、バナー広告の表示は継続されます。返金・キャンセルについては、各ストアの規約および手続きに従います。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>4. 第三者への提供</Text>
          <Text style={settingsSubContent.body}>
            本アプリは、以下の第三者サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。
          </Text>
          <Text style={settingsSubContent.body}>
            {'\u2022'} Google LLC（AdMob）— 広告配信{'\n'}
            {'\u2022'} Apple Inc.（App Store）— iOS でのアプリ内課金{'\n'}
            {'\u2022'} Google LLC（Google Play）— Android でのアプリ内課金
          </Text>
          <Text style={settingsSubContent.body}>
            法令に基づく開示請求がある場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>5. データの保管・削除</Text>
          <Text style={settingsSubContent.body}>
            ゲームデータおよびパスの有効状態は、お使いの端末内に保存されます。当方がこれらをサーバー上で保管することはありません。アプリのアンインストールや端末のデータ消去により、端末内の情報は削除されます（無限パスは各ストア経由で復元できる場合があります）。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>6. お子様のプライバシー</Text>
          <Text style={settingsSubContent.body}>
            本アプリは、13歳未満のお子様から故意に個人情報を収集することはありません。保護者の方でご不安な点がある場合は、お問い合わせください。なお本アプリは広告を含むため、お子様向け専用アプリではありません。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>7. ポリシーの変更</Text>
          <Text style={settingsSubContent.body}>
            本ポリシーは、法令の改正やサービス内容の変更に応じて更新することがあります。重要な変更がある場合は、アプリ内の表示または配信ページでお知らせします。変更後に本アプリを利用した場合、変更後のポリシーに同意したものとみなします。
          </Text>
        </View>

        <View style={settingsSubContent.card}>
          <Text style={styles.heading}>8. お問い合わせ</Text>
          <Text style={settingsSubContent.body}>
            本ポリシーに関するお問い合わせは、サポートページよりご連絡ください。
          </Text>
          <Pressable onPress={() => void WebBrowser.openBrowserAsync(SUPPORT_URL)}>
            <Text style={styles.link}>サポートページを開く</Text>
          </Pressable>
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
  subheading: {
    ...settingsSubContent.body,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  link: {
    ...settingsSubContent.body,
    color: Theme.accent,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
