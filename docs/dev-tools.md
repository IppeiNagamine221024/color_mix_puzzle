# 開発用ツール（リリース前に削除）

メイン画面に表示される `[DEV]` ボタンは、プレイテスト用です。ストア公開前に無効化または削除してください。

## 現在の開発用ボタン

| ボタン | コンポーネント | 処理 |
|--------|----------------|------|
| スタミナ全回復 | `components/dev/DevStaminaButton.tsx` | `src/dev/stamina.ts` |
| 全クリア | `components/dev/DevClearStagesButtons.tsx` | `src/dev/clearedStages.ts` |
| 全未クリア | 同上 | クリア一覧・解放進行を初期状態に戻す |

## 無効化（コードは残す）

`src/dev/config.ts` のフラグを `false` にします。

```ts
export const DEV_TOOLS_ENABLED = false;
```

これだけで全 `[DEV]` ボタンは非表示になります。

## 完全削除

1. `src/dev/config.ts` を `false` にして動作確認（ボタンが消えること）
2. `app/index.tsx` から以下を削除
   - `DevStaminaButton` の import と JSX
   - `DevClearStagesButtons` の import と JSX
3. 不要になったファイルを削除
   - `components/dev/DevStaminaButton.tsx`
   - `components/dev/DevClearStagesButtons.tsx`
   - `src/dev/stamina.ts`
   - `src/dev/clearedStages.ts`
   - `src/dev/config.ts`（他から参照がなければ）
4. `components/dev/` ディレクトリが空なら削除
5. 本ドキュメント（`docs/dev-tools.md`）を削除

## 注意

- **全クリア**: 全ステージ ID を `clearedStages` に入れ、`unlockedStageId` を最終ステージに設定します。進行中セーブ（`stageProgress`）はクリアします。
- **全未クリア**: `clearedStages` を空、`unlockedStageId` を `1` に戻します。進行中セーブもクリアします。
