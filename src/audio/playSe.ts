import { audio } from './audioService';
import type { SeId } from './catalog';

export function playSe(id: SeId): void {
  void audio.playSe(id);
}
