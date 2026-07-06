import { StageEnterExitLottieOverlay } from '@/components/lottie/StageEnterExitLottieOverlay';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

/** 入場演出 — ホーム画面内の View オーバーレイ */
export function EnterLottieOverlay({ visible, onDismiss }: Props) {
  return <StageEnterExitLottieOverlay visible={visible} onDismiss={onDismiss} />;
}
