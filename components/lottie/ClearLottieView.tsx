import clearAnimation from '@/assets/lottie/clear.json';
import { animationToFileUri } from '@/src/lottie/animationToFileUri';
import LottieView from 'lottie-react-native';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

type Props = Omit<ComponentProps<typeof LottieView>, 'source'> & {
  playId: number;
};

export const ClearLottieView = forwardRef<LottieView, Props>(function ClearLottieView(
  { playId, onAnimationLoaded, ...props },
  ref,
) {
  const [uri, setUri] = useState<string | null>(null);
  const lottieRef = useRef<LottieView>(null);
  useImperativeHandle(ref, () => lottieRef.current as LottieView);

  useEffect(() => {
    const fileName = `lottie-clear-${playId}.json`;
    setUri(animationToFileUri(clearAnimation, fileName, playId));
    return () => setUri(null);
  }, [playId]);

  if (uri == null) return null;

  return (
    <LottieView
      {...props}
      ref={lottieRef}
      source={{ uri }}
      autoPlay
      cacheComposition={false}
      onAnimationLoaded={onAnimationLoaded}
    />
  );
});

export function getClearAnimationMeta() {
  const src = clearAnimation as { nm?: string; op?: number; fr?: number; layers?: unknown[] };
  return {
    nm: src.nm ?? '(unknown)',
    op: src.op,
    fr: src.fr,
    layers: src.layers?.length ?? 0,
  };
}
