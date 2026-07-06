# Color Order

三原色（シアン・マゼンタ・イエロー）ブロックを混ぜ・動かし、課題の配色パターンを盤上に再現するパズルゲーム（Expo / React Native）。

## 開発

```bash
npm install
npm start          # Expo Go で起動
npm test           # ゲームロジックのユニットテスト
npm run generate-stages   # stages.json を再生成（100ステージ）
```

### Expo Go で動かすとき

- 本プロジェクトは **Expo SDK 54** です（App Store / Google Play の Expo Go と互換）。
- 起動前に `npm install` と `npx expo install --check` で依存関係を揃えてください。
- 起動: `npx expo start -c`（キャッシュクリア推奨）
- 依存の整合性: `npx expo install --check`

## 構成

- `app/` — メイン画面・ゲーム画面（Expo Router）
- `src/game/` — 混合・スライド・パターン判定（UI 非依存）
- `src/storage/` — オートセーブ（AsyncStorage）
- `src/ads/` — 広告モック
- `assets/data/` — 色カタログ（`colors.json`）・ステージ JSON

詳細は [docs/requirements.md](./docs/requirements.md) と [docs/wireframes.md](./docs/wireframes.md) を参照。
