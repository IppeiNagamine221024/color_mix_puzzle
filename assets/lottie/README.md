# Lottie アセット

画面遷移演出用の Lottie JSON を配置します。  
**差し替え手順:** 同じファイル名で上書きするだけ（`src/lottie/catalog.ts` のパス変更不要）。

## ファイル

| ファイル | 用途 | 配線状況 |
|---------|------|----------|
| `enter.json` | ステージ入場（絵の具混合） | メイン画面から再生 |
| `clear.json` | ステージクリア | ゲーム画面から再生（iOS は既知バグあり） |
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
