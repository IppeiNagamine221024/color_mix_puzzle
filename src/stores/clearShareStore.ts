import { create } from 'zustand';

type ClearShareState = {
  stageId: number | null;
  imageUri: string | null;
  prepare: (stageId: number, imageUri: string | null) => void;
  clear: () => void;
};

/** クリア演出中に使うシェア用スクショ／ステージ情報 */
export const useClearShareStore = create<ClearShareState>((set) => ({
  stageId: null,
  imageUri: null,
  prepare: (stageId, imageUri) => set({ stageId, imageUri }),
  clear: () => set({ stageId: null, imageUri: null }),
}));
