import { useWindowDimensions } from 'react-native';

const SCREEN_H_PAD = 20;
const FRAME_PAD = 12;
const CELL_GAP = 4;
/** ゲーム画面上部の NEXT / ヒント列（課題パターン用に幅を確保） */
export const GAME_TOP_STATUS_WIDTH = 104;

/** 盤面グリッドの1マス辺長（px） */
export function useBoardCellSize(boardWidth: number, boardHeight: number): number {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const maxBoardW = screenW - SCREEN_H_PAD * 2 - FRAME_PAD * 2;
  const maxBoardH = screenH * 0.48;

  const cellFromW = Math.floor(maxBoardW / boardWidth);
  const cellFromH = Math.floor(maxBoardH / boardHeight);

  return Math.max(52, Math.min(cellFromW, cellFromH));
}

/** 課題パターンの1マス辺長（px） */
export function usePatternCellSize(patternWidth: number, patternHeight: number): number {
  const { width: screenW } = useWindowDimensions();
  const topRowPad = 14 * 2;
  const gap = 10;
  const maxPatternW = screenW - topRowPad - gap - GAME_TOP_STATUS_WIDTH;
  const cell = Math.floor(maxPatternW / Math.max(patternWidth, patternHeight));
  return Math.max(28, Math.min(cell, 48));
}

export function cellInnerSize(cellSize: number): number {
  return cellSize - CELL_GAP;
}

export function cellOffset(cellSize: number): number {
  return CELL_GAP / 2;
}
