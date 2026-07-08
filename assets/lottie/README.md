# Lottie アセット

画面遷移演出用の Lottie JSON を配置します。  
**差し替え手順:** 同じファイル名で上書きするだけ（`src/lottie/catalog.ts` のパス変更不要）。

## ファイル

| ファイル | 用途 | 配線状況 |
|---------|------|----------|
| `enter.json` | ステージ入場（絵の具混合） | メイン画面から再生 |
| `clear.json` | ステージクリア | ゲーム画面から再生 |
| `clear.production.json` | 本番クリア JSON のバックアップ | 切り分けテスト後に `npm run lottie:clear-production` で復元 |
| `exit.json` | ステージ退場 | 未配線（プレースホルダー） |

## 推奨スペック

| 項目 | 推奨値 |
|------|--------|
| 解像度 | 1080 × 1920（縦） |
| フレームレート | 30 fps |
| ループ | なし（1回再生） |
| 形式 | `.json`（Bodymovin / LottieFiles） |
| 背景 | `Theme.bg`（`#dbc9a8`）に合わせるか透過 |
| 尺 | 入場 **1 秒**（30fps × 30 フレーム） |

## 制作フロー（本番アセット）

1. After Effects で「シアン・マゼンタ・黄」の絵の具が中央で混ざるモーションを作成
2. [Bodymovin](https://aescripts.com/bodymovin/) または LottieFiles プラグインで JSON エクスポート
3. `enter.json` を上書き
4. `npx expo start -c` でキャッシュクリア後に実機確認

## クリア Lottie 再生成（本番に近い軽量版）

iOS 向けに shape のみ・`gr` グループ形式で `STAGE CLEAR` 演出を生成:

```bash
npm run lottie:clear-generate
```

- 出力: `clear.json`（約 70KB / 50 レイヤー前後 / 3.07 秒）
- 本番 `clear.production.json`（約 88KB / 71 レイヤー）より軽量
- テキストレイヤー・埋め込みフォントなし

## クリア Lottie 切り分け（iOS）

本番 `clear.json` が重く再生できない場合の診断:

```bash
# 軽量プレースホルダーへ差し替え（~1KB・緑バースト）
npm run lottie:clear-placeholder

# 本番へ戻す（clear.production.json から復元）
npm run lottie:clear-production
```

TestFlight でクリア演出を確認:

- **プレースホルダーで動く** → 本番 JSON のサイズ／構造が原因。`prepare-clear-lottie.js` で軽量化を継続
- **プレースホルダーでも動かない** → 再生ロジック側を再調査

## プレースホルダー再生成

開発用の簡易アニメーションを再生成する場合:

```bash
node scripts/generate-placeholder-lottie.js
```

## 関連コード

- カタログ: `src/lottie/catalog.ts`
- 入場: `components/lottie/EnterLottieOverlay.tsx`
- クリア: `components/lottie/ClearLottieOverlay.tsx`
- **iOS クリア不具合・修正手順:** `docs/lottie-ios-clear-fix.md`
- 設計書: `docs/lottie-transitions.md`
