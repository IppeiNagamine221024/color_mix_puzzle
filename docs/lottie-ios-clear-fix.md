# iOS クリア Lottie 不具合と修正手順

## 現象

- クリア時に `clear.json` ではなく **入場（enter）と同じ絵の具混合** が表示される
- 開発ビルドのデバッグラベル（`clear / stage-clear / #N`）は正しく出る
- `enter.json` の中身を差し替えると **入場だけ** 変わり、クリアの見た目は変わらない

→ JS のアセット参照は正しい。**iOS ネイティブ層で先に再生した enter が残る**（Fabric ビューリサイクル）。

参考: [lottie-react-native#1380](https://github.com/lottie-react-native/lottie-react-native/issues/1380)  
ネイティブ修正: [PR #1385](https://github.com/lottie-react-native/lottie-react-native/pull/1385)（**7.3.5 以降**）

## 現行構成（Expo Go 向け・ビルド不要）

| 演出 | コンポーネント | マウント場所 |
|------|----------------|--------------|
| 入場 | `EnterLottieOverlay` + `EnterLottieView` | `app/index.tsx` |
| クリア | `ClearLottieOverlay` + `ClearLottieView` | `app/game/[stageId].tsx` |

**制限:** Expo Go では `lottie-react-native` のネイティブバージョンが固定のため、上記 iOS バグは **解消されない**。入場は正常、クリアは enter に見える状態が続く。

## 修正版（開発ビルド後に有効化）

修正用コードは **`pending/`** に退避済み（現状は未配線）:

```
components/lottie/pending/AppLottiePlayer.tsx   … LottieView をアプリ内 1 つに統一
src/stores/pending/lottiePlayerStore.ts         … enter / clear の再生キュー
```

### 切り替え手順

#### 1. ネイティブ依存を更新

```bash
npm install lottie-react-native@~7.3.8
npx expo start -c
npx expo run:ios    # または run:android
```

> **Expo Go では 7.3.8 のネイティブ修正は効かない。** 必ず開発ビルド。

#### 2. `pending` を本番パスへ移す

```bash
# PowerShell
Move-Item src/stores/pending/lottiePlayerStore.ts src/stores/lottiePlayerStore.ts
Move-Item components/lottie/pending/AppLottiePlayer.tsx components/lottie/AppLottiePlayer.tsx
```

`AppLottiePlayer.tsx` の import を更新:

```diff
- import { useLottiePlayerStore } from '@/src/stores/pending/lottiePlayerStore';
+ import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';
```

#### 3. `app/_layout.tsx`

```diff
+ import { AppLottiePlayer } from '@/components/lottie/pending/AppLottiePlayer';
  // 移動後は @/components/lottie/AppLottiePlayer

  </Stack>
+ <AppLottiePlayer />
  </View>
```

#### 4. `app/index.tsx` — 入場をストア経由に

**削除:**

- `EnterLottieOverlay` の import / JSX
- `enterVisible` state（ストアで管理）

**追加:**

```tsx
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';

const showEnter = useLottiePlayerStore((s) => s.showEnter);
const hidePlayer = useLottiePlayerStore((s) => s.hide);

const onEnterComplete = useCallback(() => {
  const entry = pendingEntryRef.current;
  pendingEntryRef.current = null;
  enteringRef.current = false;
  setTimeout(() => {
    if (entry) router.push(entry.href as Href);
  }, 100);
}, [router]);

const showEnterLottie = useCallback((stageId: number, href: string) => {
  pendingEntryRef.current = { href };
  showEnter(onEnterComplete);
}, [showEnter, onEnterComplete]);

// useFocusEffect の cleanup
hidePlayer();
```

#### 5. `app/game/[stageId].tsx` — クリアをストア経由に

**削除:**

- `ClearLottieOverlay` と `clearOverlayVisible` / `clearPlayId` 関連 state

**追加:**

```tsx
import { useLottiePlayerStore } from '@/src/stores/lottiePlayerStore';

const showClear = useLottiePlayerStore((s) => s.showClear);

// handleResult 内クリア時
showClear(() => {
  void (async () => {
    await clearStage(stageId);
    router.back();
  })();
});
```

`AppLottiePlayer` の `invokeComplete` 内で `hide()` されるため、別途 `hide` は不要。

#### 6. 旧オーバーレイの整理（任意）

修正版が動作確認できたら削除可:

- `components/lottie/EnterLottieOverlay.tsx`
- `components/lottie/ClearLottieOverlay.tsx`
- `components/lottie/EnterLottieView.tsx`
- `components/lottie/ClearLottieView.tsx`

`components/lottie/index.ts` を `AppLottiePlayer` エクスポートに差し替え。

### 動作確認

1. 入場 → 絵の具混合（enter）が表示され、ゲームへ遷移
2. クリア → **緑バースト（プレースホルダー）** または本番 `stage-clear`
3. ログ: `[Lottie] player clear instance=N nm=stage-clear`
4. 本番 JSON 投入時: `node scripts/prepare-clear-lottie.js "（本番 clear.json パス）"`

### まだ enter に見える場合

1. キャッシュクリア + 再ビルド（`npx expo run:ios`）
2. `app.json` で New Architecture 無効化を検討（Expo SDK 54 のドキュメント参照）
3. クリアのみ Reanimated / 静止画オーバーレイにフォールバック

---

## 関連ファイル

| パス | 役割 |
|------|------|
| `assets/lottie/enter.json` | 入場アセット |
| `assets/lottie/clear.json` | クリアアセット |
| `src/lottie/catalog.ts` | 設定・尺の一元管理 |
| `scripts/prepare-clear-lottie.js` | 本番 clear.json の iOS 向け最適化 |
| `docs/lottie-transitions.md` | 演出設計の全体像 |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06 | iOS Fabric ゴースト enter を調査。修正版を `pending/` に退避、Expo Go 向け分割オーバーレイに戻す |
