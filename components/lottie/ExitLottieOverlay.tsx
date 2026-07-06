import { StageEnterExitLottieOverlay } from '@/components/lottie/StageEnterExitLottieOverlay';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

/** 退場演出 — ゲーム画面からメインへ戻る直前 */
export function ExitLottieOverlay({ visible, onDismiss }: Props) {
  return <StageEnterExitLottieOverlay visible={visible} reverse onDismiss={onDismiss} />;
}
