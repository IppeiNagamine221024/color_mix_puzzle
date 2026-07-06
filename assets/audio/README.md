# 音声アセット

BGM・効果音はこのフォルダに配置します。  
**差し替え手順:** 同じファイル名で上書きするだけ（`src/audio/catalog.ts` のパス変更不要）。

## BGM (`bgm/`)

| ファイル | 用途 |
|---------|------|
| `home.wav` | メイン画面 |
| `game.wav` | ゲーム画面 |

ループ再生されます。mp3 / m4a に変える場合は `catalog.ts` の拡張子を変更してください。

## 効果音 (`se/`)

| ファイル | 用途 |
|---------|------|
| `stage_select.wav` | ステージ選択 |
| `continue.wav` | 続きから |
| `slide.wav` | スライド |
| `mix.wav` | 混合 |
| `swap.wav` | 入替 |
| `clear.wav` | ステージクリア |
| `gameover.wav` | ゲームオーバー |
| `invalid.wav` | 操作不可 |
| `ui_tap.wav` | UI タップ（混合・入替モード開始） |

## プレースホルダー再生成

```bash
node scripts/generate-placeholder-audio.js
```

## 音量・無効化（0% でミュート相当）

`src/types/settings.ts` の `DEFAULT_SETTINGS` が初回起動時の既定値です。  
ユーザーが変更した値は AsyncStorage に保存され、`settingsStore` 経由で `audioService` に反映されます。
