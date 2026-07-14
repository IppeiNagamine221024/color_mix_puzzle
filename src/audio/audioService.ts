import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { AppState, type AppStateStatus } from 'react-native';
import { getAudioVolumes } from './volumes';
import { BGM_SOURCES, SE_SOURCES, type BgmId, type SeId } from './catalog';

const BGM_PLAYER_OPTIONS = { keepAudioSessionActive: true } as const;
const LOAD_TIMEOUT_MS = 5_000;

class AudioService {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private bgmPlayer: AudioPlayer | null = null;
  private currentBgm: BgmId | null = null;
  private focusedBgm: BgmId | null = null;
  /** 広告表示のために BGM を一時停止したか（終了後に再開する） */
  private pausedForAd = false;
  private bgmRequestId = 0;
  private readonly sePlayers = new Map<SeId, AudioPlayer>();
  private appStateSubscription: { remove: () => void } | null = null;

  constructor() {
    this.appStateSubscription = AppState.addEventListener('change', this.onAppStateChange);
  }

  private onAppStateChange = (nextState: AppStateStatus): void => {
    if (nextState !== 'active') return;
    if (this.pausedForAd) return;
    void setIsAudioActiveAsync(true).then(() => {
      if (this.focusedBgm) {
        void this.playBgm(this.focusedBgm, { force: true });
      }
    });
  };

  async init(): Promise<void> {
    if (this.initialized) return;
    if (!this.initPromise) {
      this.initPromise = setAudioModeAsync({
        // マナーモード（サイレント）時は BGM / SE を鳴らさない
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
      }).then(() => {
        this.initialized = true;
      });
    }
    await this.initPromise;
  }

  /** フォーカス中の画面が再生すべき BGM を登録して再生する */
  setFocusedBgm(id: BgmId): void {
    this.focusedBgm = id;
    void this.playBgm(id);
  }

  clearFocusedBgm(id: BgmId): void {
    if (this.focusedBgm === id) {
      this.focusedBgm = null;
    }
  }

  applyVolumes(): void {
    const { bgmVolume, seVolume } = getAudioVolumes();
    if (this.bgmPlayer) {
      this.bgmPlayer.volume = bgmVolume;
    }
    for (const player of this.sePlayers.values()) {
      player.volume = seVolume;
    }
    if (this.focusedBgm && bgmVolume > 0 && !this.bgmPlayer?.playing && !this.pausedForAd) {
      void this.playBgm(this.focusedBgm, { force: true });
    }
  }

  private async waitUntilLoaded(player: AudioPlayer): Promise<void> {
    if (player.isLoaded) return;

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        subscription.remove();
        resolve();
      }, LOAD_TIMEOUT_MS);

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded) {
          clearTimeout(timeout);
          subscription.remove();
          resolve();
        }
      });
    });
  }

  private ensureBgmPlayer(id: BgmId): AudioPlayer {
    if (!this.bgmPlayer) {
      this.bgmPlayer = createAudioPlayer(BGM_SOURCES[id], BGM_PLAYER_OPTIONS);
      this.bgmPlayer.loop = true;
      this.currentBgm = id;
      return this.bgmPlayer;
    }

    if (this.currentBgm !== id) {
      this.bgmPlayer.replace(BGM_SOURCES[id]);
      this.currentBgm = id;
    }

    return this.bgmPlayer;
  }

  async playBgm(id: BgmId, options?: { force?: boolean }): Promise<void> {
    const requestId = ++this.bgmRequestId;
    await this.init();

    if (requestId !== this.bgmRequestId) return;

    const { bgmVolume } = getAudioVolumes();
    if (bgmVolume <= 0) return;

    const player = this.bgmPlayer;
    if (
      !options?.force &&
      this.currentBgm === id &&
      player?.playing
    ) {
      return;
    }

    const bgmPlayer = this.ensureBgmPlayer(id);
    if (requestId !== this.bgmRequestId) return;

    await this.waitUntilLoaded(bgmPlayer);
    if (requestId !== this.bgmRequestId) return;

    bgmPlayer.loop = true;
    bgmPlayer.volume = bgmVolume;

    if (this.currentBgm === id && bgmPlayer.playing) {
      return;
    }

    await bgmPlayer.seekTo(0);
    if (requestId !== this.bgmRequestId) return;

    bgmPlayer.play();

    if (!bgmPlayer.playing) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (requestId !== this.bgmRequestId) return;
      if (!bgmPlayer.playing) {
        bgmPlayer.play();
      }
    }
  }

  stopBgm(): void {
    this.bgmPlayer?.pause();
    this.currentBgm = null;
    this.focusedBgm = null;
    this.pausedForAd = false;
  }

  /** リワード広告など全画面広告の表示中に BGM を一時停止する */
  pauseForAd(): void {
    if (!this.bgmPlayer?.playing) {
      this.pausedForAd = false;
      return;
    }
    this.bgmPlayer.pause();
    this.pausedForAd = true;
  }

  /** 広告終了後にフォーカス中の BGM を続きから再開する */
  resumeAfterAd(): void {
    if (!this.pausedForAd) return;
    this.pausedForAd = false;

    const id = this.focusedBgm;
    if (!id || !this.bgmPlayer || this.currentBgm !== id) {
      if (id) void this.playBgm(id, { force: true });
      return;
    }

    const { bgmVolume } = getAudioVolumes();
    if (bgmVolume <= 0) return;

    this.bgmPlayer.volume = bgmVolume;
    if (!this.bgmPlayer.playing) {
      this.bgmPlayer.play();
    }
  }

  async playSe(id: SeId): Promise<void> {
    await this.init();
    const { seVolume } = getAudioVolumes();
    if (seVolume <= 0) return;

    let player = this.sePlayers.get(id);
    if (!player) {
      player = createAudioPlayer(SE_SOURCES[id], { keepAudioSessionActive: true });
      this.sePlayers.set(id, player);
    }

    player.volume = seVolume;
    await player.seekTo(0);
    player.play();
  }

  release(): void {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;

    for (const player of this.sePlayers.values()) {
      player.release();
    }
    this.sePlayers.clear();
    this.bgmPlayer?.release();
    this.bgmPlayer = null;
    this.currentBgm = null;
    this.focusedBgm = null;
    this.pausedForAd = false;
    this.initialized = false;
    this.initPromise = null;
    this.bgmRequestId = 0;
  }
}

export const audio = new AudioService();
