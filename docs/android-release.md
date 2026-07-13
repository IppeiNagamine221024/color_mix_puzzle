# Android リリース準備・ビルド・配信手順

Color Order を **Google Play** に公開するまでの作業を、初回セットアップから本番提出まで手順化したドキュメントです。  
iOS 向け手順は [ios-build-without-eas.md](./ios-build-without-eas.md) を参照してください。

## このプロジェクトでの実現性

| 項目 | 判定 | 補足 |
| --- | --- | --- |
| Expo prebuild | ✅ 可能 | `android/` は未コミット（`.gitignore` 済み） |
| ネイティブモジュール | ✅ 可能 | AdMob / MMKV / expo-iap は `expo prebuild` で生成 |
| Windows 開発 | ✅ 可能 | エミュレータ・実機デバッグ、ローカル Gradle ビルドが可能 |
| EAS Build | ✅ 推奨 | `.aab` 生成・署名をクラウドで完結（無料枠あり） |
| EAS Submit | ✅ 推奨 | Play Console へのアップロードを自動化 |
| 広告（AdMob） | ⚠️ 要設定 | Android 用 App ID・ユニット ID を AdMob / 環境変数に登録 |
| アプリ内課金 | ⚠️ 要設定 | Play Console で商品作成・ライセンステスター登録が必要 |
| ポリシー URL | ✅ 準備済 | GitHub Pages（`site/`）にプライバシー・利用規約・サポート |

**結論:** コードベースは Android 対応済みです。Play Console・AdMob・署名・ストア掲載情報の初回セットアップが主な作業になります。

## リリースまでの作業チェックリスト

初回リリース時は、おおよそ次の順で進めます。

```
[1] Google Play 開発者アカウント登録（$25 一回）
       ↓
[2] Play Console でアプリ作成（パッケージ名 com.wippeipy221024.colororder）
       ↓
[3] AdMob で Android アプリ・広告ユニット作成
       ↓
[4] app-ads.txt 設定（✅ 済 — 下記 URL で公開中）
       ↓
[5] Play Console で IAP 商品・ライセンステスター設定
       ↓
[6] app.config.ts の version / versionCode 更新
       ↓
[7] 本番 AdMob 環境変数を設定してビルド（EAS Build 推奨）
       ↓
[8] 内部テストで実機確認（広告・課金・通知）
       ↓
[9] ストア掲載情報・データセーフティ・コンテンツレーティングを入力
       ↓
[10] 本番トラックへ提出 → 審査 → 公開
```

## 全体フロー（ビルド〜配信）

```
[ローカル]
  app.config.ts の version / versionCode を更新
  AdMob 本番 ID を .env または EAS 環境変数に設定
       ↓
[EAS Build または ローカル Gradle]
  expo prebuild → bundleRelease → .aab 生成
       ↓
[eas submit または Play Console 手動アップロード]
  Play Console の内部テスト / 本番トラックへアップロード
       ↓
[Play Console]
  ストア掲載・データセーフティ・審査提出
```

## 前提

- Google Play 開発者アカウント（[登録](https://play.google.com/console/signup)）
- Expo アカウント（無料）と `eas-cli`
- 本プロジェクトのパッケージ名: **`com.wippeipy221024.colororder`**
- プライバシーポリシー等の公開 URL（本プロジェクト）:
  - プライバシー: `https://ippeinagamine221024.github.io/color_mix_puzzle/privacy/`
  - 利用規約: `https://ippeinagamine221024.github.io/color_mix_puzzle/terms/`
  - サポート: `https://ippeinagamine221024.github.io/color_mix_puzzle/support/`

---

## 1. Google Play 開発者アカウント

1. [Google Play Console](https://play.google.com/console) にアクセス
2. 開発者アカウントを作成（**登録料 $25・一回払い**）
3. 本人確認・支払いプロファイル（アプリ内課金を行う場合は **販売者アカウント / マーチャント** の設定も必要）

> アプリ内課金（遊び放題パス）を有効にするには、Play Console の **「収益化の設定」** でマーチャント登録を完了してください。

---

## 2. Play Console でアプリを作成

1. **「アプリを作成」**
2. アプリ名: `Color Order`
3. デフォルト言語: 日本語（必要に応じて英語も追加）
4. アプリ / ゲーム: **ゲーム**
5. 無料 / 有料: **無料**（課金はアプリ内課金）

### アプリの基本設定で確認すること

| 項目 | 値 |
| --- | --- |
| パッケージ名（applicationId） | `com.wippeipy221024.colororder` |
| カテゴリ | ゲーム → パズル（案） |
| 連絡先メール | `colororder.support@gmail.com`（`constants/publicLinks.ts` と一致させる） |
| プライバシーポリシー URL | 上記 GitHub Pages の privacy URL |

パッケージ名は **一度公開すると変更不可** です。`app.config.ts` の `android.package` と必ず一致させてください。

### Play アプリ署名

初回アップロード時に **Google Play アプリ署名** を有効にすることを推奨します。

- **アップロード鍵（Upload key）**: ビルド時に署名する鍵（EAS が管理する keystore）
- **アプリ署名鍵（App signing key）**: Google が配信用 APK に再署名する鍵

EAS Build を使う場合、初回ビルド時に keystore を EAS に生成・保存させるのが最も簡単です。

---

## 3. Google AdMob 設定（Android）

本アプリは `react-native-google-mobile-ads` を使用しています。Android 向けに AdMob コンソールでアプリと広告ユニットを作成します。

### 3.1 AdMob でアプリを登録

1. [AdMob コンソール](https://admob.google.com/) → **アプリ** → **アプリを追加**
2. プラットフォーム: **Android**
3. アプリ名: `Color Order`
4. パッケージ名: `com.wippeipy221024.colororder`
5. 発行された **Android App ID**（`ca-app-pub-xxxxxxxx~xxxxxxxx` 形式）を控える

> Play Store に未公開でも AdMob アプリは作成できます。公開後にストア URL を紐づけると審査がスムーズになる場合があります。

### 3.2 広告ユニットを作成

| 種類 | 用途（本アプリ） | 環境変数 |
| --- | --- | --- |
| バナー | ゲーム画面下部 | `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` |
| リワード | スタミナ回復 | `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` |

各ユニット ID（`ca-app-pub-xxxxxxxx/xxxxxxxx` 形式）を控えます。

### 3.3 本プロジェクトへの反映

環境変数は次の 3 つが Android 本番ビルドに必要です（iOS 用と合わせて 4 ユニットすべて揃うと `useTestAds` が自動でオフになります）。

```bash
# App ID（ネイティブ manifest 用。EXPO_PUBLIC 不要）
ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx

# 広告ユニット ID（ランタイム JS 用。EXPO_PUBLIC 必須）
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
```

設定の流れ:

1. `.env.example` を `.env` にコピーして値を入力（ローカルビルド用）
2. EAS では [Expo 環境変数](https://expo.dev/accounts/wippeipy221024/projects/color-order/environment-variables) の **production** に同じ変数を登録

```bash
# EAS 環境変数の登録例
eas env:create --environment production --name ADMOB_ANDROID_APP_ID --value "ca-app-pub-..."
eas env:create --environment production --name EXPO_PUBLIC_ADMOB_BANNER_ANDROID --value "ca-app-pub-.../..."
eas env:create --environment production --name EXPO_PUBLIC_ADMOB_REWARDED_ANDROID --value "ca-app-pub-.../..."
```

### 3.4 広告の挙動（実装済み）

- 非パーソナライズ広告のみ（`requestNonPersonalizedAdsOnly: true`）
- 本番ユニット ID が 4 つ（iOS + Android のバナー・リワード）揃っていない、または `EXPO_PUBLIC_USE_TEST_ADS=true` のときは **Google 公式テスト ID** を使用
- `app.config.ts` の `android.permissions` に `com.google.android.gms.permission.AD_ID` を宣言済み

### 3.5 Play Console での広告申告

ストア提出時に次を申告します。

- **アプリに広告が含まれる**: はい
- **広告 ID（AD_ID）**: 使用する（AdMob のため）
- データセーフティフォームで広告関連のデータ収集を正確に記載

---

## 4. app-ads.txt の設定

AdMob の収益化・不正防止のため、[app-ads.txt](https://developers.google.com/admob/android/app-ads) を設定します。

### ✅ 本プロジェクトは設定済み

次の URL で **すでに公開されています**（内容も AdMob 用の正しい形式です）。

**https://ippeinagamine221024.github.io/app-ads.txt**

```
google.com, pub-4008791172254996, DIRECT, f08c47fec0942fa0
```

`site/`（`color_mix_puzzle` リポジトリ）とは別に、GitHub ユーザー Pages のルート（`ippeinagamine221024.github.io` リポジトリ）でホストされています。追加作業は不要です。

### AdMob / ストアでの登録

各コンソールで **開発者サイト / ウェブサイト** を次のルート URL に揃えると、Google が `app-ads.txt` をクロールしやすくなります。

| 登録先 | 推奨 URL |
| --- | --- |
| AdMob → アプリ設定 → 開発者サイト | `https://ippeinagamine221024.github.io/` |
| Play Console → ストアの掲載情報 → ウェブサイト | 上記、またはサポートサイト `https://ippeinagamine221024.github.io/color_mix_puzzle/` |
| App Store Connect → マーケティング URL（iOS） | 上記ルート URL |

AdMob コンソールで **app-ads.txt** の検証ステータスが「承認済み」になるまで数時間〜数日かかることがあります。

### 代替: Play Store の掲載情報のみ

Play Console のストア URL を AdMob に登録する方法もあります。詳細は [AdMob ヘルプ](https://support.google.com/admob/answer/9363762) を参照。

---

## 5. アプリ内課金（Google Play）

商品 ID は iOS と共通です（`src/iap/productIds.ts`）。

| 商品 ID | 種類 | 価格（案） |
| --- | --- | --- |
| `com.wippeipy221024.colororder.weekly_play_pass` | **消耗型**（Consumable） | ¥100 |
| `com.wippeipy221024.colororder.infinite_pass` | **非消耗型**（Non-consumable） | ¥500 |

### Play Console での設定手順

1. **収益化** → **アプリ内商品** → **商品を作成**
2. 上記 Product ID を **完全一致** で登録
3. 各商品のタイトル・説明・価格を設定し **有効化**
4. **設定** → **ライセンステスト** にテスト用 Google アカウントを追加
5. 内部テストトラックにテスターを追加し、**署名付きリリースビルド** で購入フローを確認

### テスト時の注意

- Expo Go では IAP はモック動作（即時付与）
- 実機の **Development Build または本番ビルド** でテストする
- 消耗型（週間パス）は購入 → 消費（`finishTransaction` + `isConsumable: true`）の実装済み

---

## 6. ビルド前に `app.config.ts` を更新

Play Console に送るバージョンと一致させます。

```ts
// app.config.ts
version: '1.0.1',        // ユーザー向け表示バージョン（versionName）
android: {
  versionCode: 2,        // 整数。前回より必ず大きい値
  package: 'com.wippeipy221024.colororder',
}
```

| フィールド | 用途 |
| --- | --- |
| `version` | ストアに表示されるバージョン名 |
| `android.versionCode` | Play Console が識別する内部ビルド番号（単調増加必須） |

`eas.json` の `appVersionSource: "remote"` と `autoIncrement` は **EAS Build 専用**です。ローカル Gradle ビルドでは `app.config.ts` の値が使われます。

---

## 7. ビルド方法

Google Play への提出形式は **AAB（Android App Bundle）** です。APK 直アップロードは本番公開には使えません。

### 7.1 EAS Build（推奨）

最も手軽で、署名管理も EAS に任せられます。

#### 初回: 依存関係とログイン

```bash
npm ci
npx eas login
```

#### 本番ビルド

```bash
# production プロファイル（EXPO_PUBLIC_USE_TEST_ADS=false）
eas build --platform android --profile production
```

初回は Android keystore の生成を EAS に任せるか、既存 keystore をアップロードするかを対話で選択します。**Upload key は必ずバックアップ**（EAS に保存されるが、ローカルエクスポートも推奨）。

#### ビルド成果物の取得

```bash
eas build:list --platform android --limit 1
# 完了後、表示される URL から .aab をダウンロード
```

#### EAS 環境変数（production）

最低限、Android AdMob 用に以下を登録します（iOS と合わせて 6 変数）。

| 変数名 | 用途 |
| --- | --- |
| `ADMOB_ANDROID_APP_ID` | AdMob Android App ID |
| `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` | バナーユニット |
| `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` | リワードユニット |
| `ADMOB_IOS_APP_ID` | （iOS ビルドと共用プロジェクトの場合） |
| `EXPO_PUBLIC_ADMOB_BANNER_IOS` | 同上 |
| `EXPO_PUBLIC_ADMOB_REWARDED_IOS` | 同上 |

`eas.json` の `production` プロファイルは `EXPO_PUBLIC_USE_TEST_ADS=false` を設定済みです。

### 7.2 ローカルビルド（Windows）

EAS の無料枠を使いたくない場合、またはデバッグ用にローカルで AAB を作る場合。

#### 前提

- Android Studio（SDK / platform-tools）
- JDK 17 推奨（Expo SDK 54 の Gradle 要件に合わせる）
- 環境変数 `ANDROID_HOME` が設定済み

#### 手順

```powershell
# 1. 本番用 .env を用意（AdMob ID など）
Copy-Item .env.example .env
# .env を編集

# 2. ネイティブプロジェクト生成
npx expo prebuild --platform android --clean

# 3. リリース AAB ビルド
cd android
.\gradlew.bat bundleRelease
```

成果物: `android\app\build\outputs\bundle\release\app-release.aab`

#### 署名（ローカルで初めて行う場合）

1. keystore を生成:

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore color-order-upload.keystore -alias color-order -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/gradle.properties` または `android/app/build.gradle` に署名設定を追加（[Expo 署名ドキュメント](https://docs.expo.dev/app-signing/local-credentials/) 参照）
3. keystore ファイルは **リポジトリにコミットしない**（`.gitignore` に追加）

> Play Console で Google Play アプリ署名を有効にしている場合、アップロードするのは **Upload key** で署名した AAB です。

### 7.3 Development Build（日常開発・実機テスト）

```bash
eas build --profile development --platform android
```

またはローカル:

```bash
npx expo run:android
```

AdMob はテスト ID（`eas.json` の `development` / `preview` で `EXPO_PUBLIC_USE_TEST_ADS=true`）が使われます。

---

## 8. Play Console へアップロード

### 8.1 EAS Submit（推奨）

```bash
eas submit --platform android --profile production
```

初回は Google Play サービスアカウント JSON の登録を求められます。

#### サービスアカウントの作成（初回のみ）

1. Play Console → **設定** → **API アクセス**
2. Google Cloud プロジェクトをリンク
3. サービスアカウントを作成し、JSON キーをダウンロード
4. Play Console で当該アカウントに **リリース管理** 権限を付与
5. `eas credentials` または `eas submit` の対話で JSON を登録

```bash
# ビルドと同時に提出
eas build --platform android --profile production --auto-submit
```

### 8.2 Play Console から手動アップロード

1. Play Console → **テストとリリース** → **内部テスト**（初回はここから）
2. **新しいリリースを作成** → `.aab` をアップロード
3. リリースノートを記入 → **確認** → **ロールアウト**

---

## 9. 内部テストで実機確認

本番提出前に、内部テストトラックで以下を確認します。

| 確認項目 | 内容 |
| --- | --- |
| 起動・クラッシュ | コールドスタート、バックグラウンド復帰 |
| バナー広告 | 本番ビルドでテスト広告でないこと |
| リワード広告 | 視聴完了でスタミナ回復 |
| アプリ内課金 | 週間パス・無限パスの購入とリストア |
| 通知 | スタミナ回復通知（Android 通知チャンネル） |
| バックキー | `predictiveBackGestureEnabled: false` の挙動 |
| 縦画面固定 | ゲーム画面のレイアウト |

テスター追加: Play Console → 内部テスト → **テスター** → メールリストまたは Google グループ。

---

## 10. ストア掲載・ポリシー（本番提出前チェックリスト）

### ストアの掲載情報

- [ ] アプリ名・短い説明（80 文字）・詳しい説明
- [ ] アプリアイコン 512×512
- [ ] フィーチャーグラフィック 1024×500
- [ ] スクリーンショット（スマホ最低 2 枚、推奨 4〜8 枚）
- [ ] 7 インチ / 10 インチタブレット用（任意、`supportsTablet` は iOS のみだが Play でも推奨）
- [ ] プライバシーポリシー URL
- [ ] 連絡先メール

### ポリシーとプログラム

- [ ] **データセーフティ**: 収集データの申告（広告 SDK、クラッシュなし、個人アカウントなし など）
- [ ] **コンテンツレーティング**: IARC 質問票に回答
- [ ] **ターゲット層とコンテンツ**: 子供向け専用ではない旨（本アプリは Designed for Families 対象外）
- [ ] **広告**: アプリに広告あり
- [ ] **アプリのアクセス権**: 特別なログイン不要（該当する場合「すべての機能に制限なし」）
- [ ] **政府アプリ / 金融 / 健康** など該当フォーム（通常は「いいえ」）

### データセーフティの記入の目安（本アプリ）

| データ | 収集 | 共有 | 備考 |
| --- | --- | --- | --- |
| 広告 ID | はい（AdMob） | はい（Google） | 非パーソナライズ広告 |
| 購入履歴 | はい（Google Play Billing） | いいえ | オンデバイス + Play |
| ゲーム進行 | いいえ（サーバー送信なし） | — | MMKV / AsyncStorage のみ |
| 個人を特定できる情報 | いいえ | — | アカウント機能なし |

> 実際のフォームはアプリの最新実装に合わせて正確に記入してください。

### リリース

- [ ] 国 / 地域の配信設定
- [ ] 本番トラックに AAB をアップロード
- [ ] 「審査に送信」

初回審査は **数日〜1 週間** かかることがあります。

---

## 11. Target API レベル

Google Play は **targetSdkVersion** の最低要件を定期的に引き上げます。

| 時期（目安） | 要件 |
| --- | --- |
| 2025-08-31 以降の新規・更新 | Android 15（API 35）以上 |
| 2026-08-31 以降（予告） | Android 16（API 36）以上になる見込み |

Expo SDK 54 のデフォルト targetSdk を確認し、不足する場合は `expo-build-properties` で上書きします。

```ts
// app.config.ts の plugins に追加する例（必要な場合のみ）
[
  'expo-build-properties',
  {
    android: {
      compileSdkVersion: 35,
      targetSdkVersion: 35,
    },
    ios: { useFrameworks: 'static' },
  },
],
```

ビルド後に `bundletool` や Play Console の **アプリの完全性** 画面で実際の targetSdk を確認してください。

---

## 12. iOS とのバージョン管理

iOS と Android を同時メンテする場合の対応表です。

| 項目 | iOS | Android |
| --- | --- | --- |
| 表示バージョン | `ios` セクション外の `version` | 同じ `version` |
| ビルド番号 | `ios.buildNumber`（文字列） | `android.versionCode`（整数） |
| バンドル ID | `ios.bundleIdentifier` | `android.package` |
| ストア提出物 | `.ipa` | `.aab` |

---

## トラブルシューティング

### AdMob がテスト広告のまま

- `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` / `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` が未設定
- iOS 側のユニット ID が未設定のため `hasProductionUnits` が false になっている
- `EXPO_PUBLIC_USE_TEST_ADS` が `true` のまま

→ 4 ユニットすべて設定し、`EXPO_PUBLIC_USE_TEST_ADS=false` で再ビルド。

### `versionCode` 重複エラー

Play Console に既にアップロードした `versionCode` より大きい値に `app.config.ts` を更新して再ビルド。

### 署名エラー（ローカルビルド）

- keystore のパス・エイリアス・パスワードが `gradle.properties` と一致しているか
- EAS で生成した keystore と Play Console の Upload key が一致しているか

```bash
npx eas credentials --platform android
```

### IAP が「アイテムが見つかりません」

- Product ID の typo
- Play Console で商品が **有効** になっていない
- テストアカウントがライセンステスターに含まれていない
- インストールしたビルドの `applicationId` が Play Console のパッケージ名と一致していない

### `AD_ID` 権限に関する Play Console 警告

`app.config.ts` で `com.google.android.gms.permission.AD_ID` を宣言済みです。データセーフティと広告申告を整合させてください。

### Gradle / JDK エラー（Windows）

- `JAVA_HOME` を JDK 17 に設定
- Android Studio の SDK Manager で **Android SDK Build-Tools** と **Platform API 35** をインストール
- `npx expo-doctor` で依存関係を確認

---

## EAS Build とローカルビルドの使い分け

| 用途 | 推奨 |
| --- | --- |
| 初回本番・通常リリース | `eas build --platform android --profile production` |
| 日常開発・UI 確認 | `npx expo run:android` または development プロファイル |
| EAS 枠節約・オフライン | ローカル `gradlew bundleRelease` |
| Play Console へのアップロード | `eas submit`（手動アップロードも可） |

---

## 関連ファイル

| ファイル | 役割 |
| --- | --- |
| `app.config.ts` | バージョン・パッケージ名・AdMob・権限 |
| `eas.json` | EAS Build / Submit プロファイル |
| `.env.example` | AdMob / ローカル用環境変数テンプレート |
| `src/ads/adUnits.ts` | 広告ユニット ID の解決 |
| `src/ads/adRequestOptions.ts` | 非パーソナライズ広告設定 |
| `src/iap/productIds.ts` | IAP 商品 ID |
| `constants/publicLinks.ts` | プライバシー・サポート URL |
| `site/` | GitHub Pages（プライバシー・利用規約・サポート） |
| `ippeinagamine221024.github.io` リポジトリ | [app-ads.txt](https://ippeinagamine221024.github.io/app-ads.txt)（ユーザー Pages ルート） |

---

## 参考リンク

- [Expo — Android ビルド](https://docs.expo.dev/build-reference/android-builds/)
- [Expo — EAS Submit（Android）](https://docs.expo.dev/submit/android/)
- [Expo — ローカルアプリ署名](https://docs.expo.dev/app-signing/local-credentials/)
- [Google Play Console ヘルプ](https://support.google.com/googleplay/android-developer/)
- [Target API level 要件](https://support.google.com/googleplay/android-developer/answer/11926878)
- [AdMob Android セットアップ](https://developers.google.com/admob/android/quick-start)
- [AdMob app-ads.txt（Android）](https://developers.google.com/admob/android/app-ads)
- [react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)
