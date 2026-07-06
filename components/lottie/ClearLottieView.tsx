import clearAnimation from '@/assets/lottie/clear.json';
import { animationToFileUri } from '@/src/lottie/animationToFileUri';
import LottieView from 'lottie-react-native';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof LottieView>, 'source'> & {
  playId: number;
};

export const ClearLottieView = forwardRef<LottieView, Props>(function ClearLottieView(
  { playId, ...props },
  ref,
) {
  const [uri, setUri] = useState<string | null>(null);
  const lottieRef = useRef<LottieView>(null);
  useImperativeHandle(ref, () => lottieRef.current as LottieView);

  useEffect(() => {
    const fileName = `lottie-clear-${playId}.json`;
    setUri(animationToFileUri(clearAnimation, fileName));
    return () => setUri(null);
  }, [playId]);

  useEffect(() => {
    if (uri == null) return;
    const id = setTimeout(() => {
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }, 16);
    return () => clearTimeout(id);
  }, [uri]);

  if (uri == null) return null;

  return (
    <LottieView
      {...props}
      ref={lottieRef}
      source={{ uri }}
      autoPlay={false}
      renderMode="SOFTWARE"
      cacheComposition={false}
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
