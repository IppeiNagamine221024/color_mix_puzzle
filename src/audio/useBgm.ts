import { audio } from '@/src/audio/audioService';
import type { BgmId } from '@/src/audio/catalog';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/** 画面フォーカス中に BGM を再生する */
export function useBgm(id: BgmId) {
  useFocusEffect(
    useCallback(() => {
      audio.setFocusedBgm(id);
      return () => audio.clearFocusedBgm(id);
    }, [id]),
  );
}
