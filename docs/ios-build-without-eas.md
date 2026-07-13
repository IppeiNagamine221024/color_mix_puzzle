# EAS Build を使わない iOS 本番ビルド手順

EAS Build の無料枠（iOS 月 15 回）を使い切った場合でも、**GitHub Actions の macOS ランナーで IPA を生成**し、**アップロードだけ `eas submit` に任せる**ことで、Expo 有料プランなしで App Store 提出用ビルドを作れます。

Android 向けリリース手順は [android-release.md](./android-release.md) を参照してください。

参考: [iOSアプリ（個人）開発を止めるな！Mac無し・$0・EAS Build枠切れでもリリースできる完全ガイド](https://qiita.com/banquet_kuma/items/9250dcdce8e85a98c50a)

## このプロジェクトでの実現性


| 項目                 | 判定    | 補足                                                              |
| ------------------ | ----- | --------------------------------------------------------------- |
| Expo prebuild      | ✅ 可能  | `ios/` / `android/` は未コミット（`.gitignore` 済み）                     |
| ネイティブモジュール         | ✅ 可能  | AdMob / MMKV / expo-iap などは `expo prebuild` で生成                 |
| Xcode 26 要件        | ✅ 対応  | Expo SDK 54 + App Store 提出要件（2026-04-28〜）のため `macos-26` ランナーを使用 |
| EAS credentials    | ✅ 流用可 | これまで EAS Build で使っていた Distribution 証明書・プロファイルを再利用               |
| EAS Submit         | ✅ 無料  | ビルド枠とは別。IPA のアップロードは制限なし                                        |
| GitHub Actions 無料枠 | ⚠️ 注意 | Private リポジトリでは macOS ランナーは **10 倍係数**（実質 月 200 分 ≒ **6〜7 回**）  |


**結論:** Color Order はこの方式でビルド可能です。初回のみ GitHub Secrets の登録（30〜60 分）が必要です。

## 全体フロー

```
[ローカル]
  app.config.ts の version / buildNumber を更新
       ↓
[GitHub Actions: ios-build.yml]
  expo prebuild → xcodebuild archive → IPA 生成
       ↓
[ローカル or CI]
  eas submit で App Store Connect にアップロード
       ↓
[App Store Connect]
  マーケティング URL 等を設定 → 審査提出
```

**EAS Build は使わない。EAS Submit は使う（推奨）。**

## 前提

- Apple Developer Program 登録済み
- App Store Connect にアプリ登録済み
- これまで `eas build` で iOS production ビルドを行ったことがある（証明書・プロファイルが EAS に存在）
- Expo アカウント（無料）と `eas-cli` が使えること
- GitHub リポジトリがこのプロジェクトと連携済み

## 1. ビルド前に `app.config.ts` を更新

App Store Connect に送るバージョンと一致させます。

```ts
// app.config.ts
version: '1.0.1',
ios: {
  buildNumber: '2', // 前回より大きい値
}
```

`eas.json` の `appVersionSource: "remote"` は **EAS Build 専用**です。GitHub Actions ビルドでは `app.config.ts` の値が使われます。

## 2. EAS から署名素材を取得

プロジェクトルートで実行します。

```bash
npx eas credentials
```

メニュー例:

1. **iOS**
2. **production**
3. **Credentials.json: Update credentials.json with values from EAS servers**

成功すると `credentials/ios/` に以下が生成されます。

- `dist-cert.p12` — Distribution 証明書 + 秘密鍵
- `profile.mobileprovision` — App Store 用プロビジョニングプロファイル

> `credentials/` は **絶対にコミットしない**（`.gitignore` 済み）。

### プロビジョニングプロファイル名の確認

`eas credentials` の一覧、または Xcode / Apple Developer Portal で **Profile 名を完全一致**で控えます。例:

```text
*[expo] com.wippeipy221024.colororder AppStore 2026-07-12T...
```

この文字列が `PROVISIONING_PROFILE_NAME` Secret になります。

### Apple Team ID の確認

[Apple Developer](https://developer.apple.com/account) → Membership → **Team ID**（10 文字）。

## 3. GitHub Secrets を登録

リポジトリ → **Settings → Secrets and variables → Actions → New repository secret**

### 必須（ビルド用）


| Secret 名                         | 内容                                                                  |
| -------------------------------- | ------------------------------------------------------------------- |
| `EXPO_TOKEN`                     | [expo.dev](https://expo.dev) → Account settings → Access tokens で作成 |
| `APPLE_TEAM_ID`                  | Apple Developer Team ID                                             |
| `DISTRIBUTION_CERT_BASE64`       | `dist-cert.p12` を Base64 化した文字列                                     |
| `DISTRIBUTION_CERT_PASSWORD`     | `.p12` エクスポート時のパスワード                                                |
| `PROVISIONING_PROFILE_BASE64`    | `profile.mobileprovision` を Base64 化                                |
| `PROVISIONING_PROFILE_NAME`      | 上記プロファイル名（完全一致）                                                     |
| `KEYCHAIN_PASSWORD`              | CI 用の任意文字列（例: `ci_keychain_color_order_2026`）                       |
| `ADMOB_IOS_APP_ID`               | 本番 AdMob App ID                                                     |
| `EXPO_PUBLIC_ADMOB_BANNER_IOS`   | 本番バナーユニット ID                                                        |
| `EXPO_PUBLIC_ADMOB_REWARDED_IOS` | 本番リワードユニット ID                                                       |


### 任意（`eas submit` を非対話で行う場合）


| Secret 名                           | 内容                          |
| ---------------------------------- | --------------------------- |
| `APP_STORE_CONNECT_API_KEY_ID`     | ASC API Key ID              |
| `APP_STORE_CONNECT_ISSUER_ID`      | ASC Issuer ID               |
| `APP_STORE_CONNECT_API_KEY_BASE64` | `AuthKey_XXXXX.p8` の Base64 |


### Base64 エンコード（Windows / WSL）

**改行を入れない**ことが重要です。

```bash
# WSL または Git Bash
base64 -w0 credentials/ios/dist-cert.p12
base64 -w0 credentials/ios/profile.mobileprovision
```

PowerShell の場合:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials\ios\dist-cert.p12")) | Set-Clipboard
```

表示された文字列をそのまま Secret に貼り付けます。

### `gh` CLI で登録する例

```bash
gh secret set EXPO_TOKEN --body "<トークン>"
gh secret set APPLE_TEAM_ID --body "XXXXXXXXXX"
gh secret set DISTRIBUTION_CERT_PASSWORD --body "<p12パスワード>"
gh secret set PROVISIONING_PROFILE_NAME --body "*[expo] com.wippeipy221024.colororder AppStore ..."
gh secret set KEYCHAIN_PASSWORD --body "ci_keychain_color_order_2026"
gh secret set ADMOB_IOS_APP_ID --body "ca-app-pub-4008791172254996~5943271981"
gh secret set EXPO_PUBLIC_ADMOB_BANNER_IOS --body "ca-app-pub-4008791172254996/2473553425"
gh secret set EXPO_PUBLIC_ADMOB_REWARDED_IOS --body "ca-app-pub-4008791172254996/5384833391"

base64 -w0 credentials/ios/dist-cert.p12 | gh secret set DISTRIBUTION_CERT_BASE64
base64 -w0 credentials/ios/profile.mobileprovision | gh secret set PROVISIONING_PROFILE_BASE64
```

## 4. GitHub Actions でビルド

ワークフロー: `.github/workflows/ios-build.yml`

### 手動実行

GitHub → **Actions** → **iOS Production Build (without EAS Build)** → **Run workflow**

または CLI:

```bash
gh workflow run ios-build.yml
gh run watch
```

所要時間の目安: **25〜40 分**（初回は CocoaPods 取得で長め）。

### 成功確認

```bash
gh run list --workflow=ios-build.yml --limit 1
gh run download <RUN_ID> -n color-order-ios -D ./build-output
ls ./build-output
```

`*.ipa` がダウンロードできればビルド成功です。

## 5. App Store Connect にアップロード（`eas submit`）

ビルドだけ EAS を迂回し、**アップロードは EAS Submit（無料）** を使うのが簡単です。

```bash
npx eas submit --platform ios --path ./build-output/ColorOrder.ipa
```

対話的に Apple ID または ASC API Key を聞かれたら、いつも通り選択します。

非対話（API Key）の場合は `eas.json` の `submit.production` に ASC API Key を設定するか、環境変数で渡します。詳細は [EAS Submit ドキュメント](https://docs.expo.dev/submit/ios/) を参照。

アップロード後 **5〜15 分**で TestFlight / ビルド一覧に表示されます。

## 6. App Store Connect で審査提出

1. 新バージョン（例: 1.0.1）を作成
2. **マーケティング URL** に `https://ippeinagamine221024.github.io/` を入力（[app-ads.txt](https://ippeinagamine221024.github.io/app-ads.txt) のクロール用）
3. 今回アップロードしたビルドを選択
4. 「このバージョンの新機能」を記入
5. 審査に提出

## トラブルシューティング

### `No .xcworkspace found under ios/`

`expo prebuild` が失敗しています。Actions ログの直前ステップを確認してください。

### 署名エラー（`Code Sign Error` / `Provisioning profile`）

- `PROVISIONING_PROFILE_NAME` が Apple 上の名前と **1 文字でも違う**と失敗します
- `BUNDLE_ID`（`com.wippeipy221024.colororder`）とプロファイルの App ID が一致しているか確認
- 証明書の有効期限切れの場合は `eas credentials` で再発行

### `does not support provisioning profiles`（CocoaPods ターゲット）

ログ例:

```text
Google-Mobile-Ads-SDK does not support provisioning profiles, but provisioning profile ... has been manually specified.
```

**原因:** `xcodebuild` のコマンドライン引数で `PROVISIONING_PROFILE_SPECIFIER` を渡すと、メインアプリだけでなく **Pods 内のライブラリターゲットにも** プロファイルが適用されてしまいます。ライブラリはプロビジョニングプロファイルを持てないため失敗します。

**解決:** ワークフローでは `Configure code signing (app target only)` ステップで **ColorOrder アプリターゲットだけ** に手動署名を設定し、`xcodebuild archive` には署名オプションを渡しません（`.github/workflows/ios-build.yml` 参照）。

### AdMob がテスト広告のまま

GitHub Secrets の `EXPO_PUBLIC_`* と `ADMOB_IOS_APP_ID` が未設定だと、ビルド時にテスト ID が埋め込まれます。Secret を確認して再ビルドしてください。

### Xcode / SDK 警告

2026 年 4 月 28 日以降、App Store 提出には **Xcode 26 以降**が必要です。ワークフローは `macos-26` を指定しています。`macos-15` など古いランナーは使わないでください。

### GitHub Actions の無料枠

Private リポジトリでは macOS ランナーは **10 倍係数**で消費されます。

- 1 ビルド ≒ 25〜40 分 × 10 ≒ 250〜400 分
- 無料枠 2,000 分/月 → **月 5〜8 回**が目安

使用量確認:

```bash
gh api /user/settings/billing/actions
```

## EAS Build との使い分け


| 用途              | 推奨                                              |
| --------------- | ----------------------------------------------- |
| 通常の本番ビルド        | `eas build --platform ios --profile production` |
| EAS 枠切れ・緊急の 1 回 | このドキュメントの GitHub Actions 手順                     |
| IPA のアップロード     | どちらの場合も `eas submit` で可                         |


## 関連ファイル


| ファイル                              | 役割                          |
| --------------------------------- | --------------------------- |
| `.github/workflows/ios-build.yml` | GitHub Actions ビルド定義        |
| `app.config.ts`                   | バージョン・Bundle ID・AdMob 設定    |
| `eas.json`                        | EAS Submit 設定（ビルドは使わなくても残す） |
| `.env.example`                    | ローカル用の環境変数テンプレート            |


## 参考リンク

- [AdMob app-ads.txt（iOS）](https://developers.google.com/admob/ios/app-ads)
- [Expo prebuild](https://docs.expo.dev/workflow/prebuild/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [GitHub Actions macOS ランナー](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-Readme.md)
- [App Store Connect 最低 SDK 要件（Expo ブログ）](https://expo.dev/blog/app-store-connect-minimum-sdk-26)

