import { getLottieSource } from '@/src/lottie/catalog';
import LottieView from 'lottie-react-native';
import { forwardRef, type ComponentProps } from 'react';
import { Platform } from 'react-native';

const stageEnterExitAnimation = getLottieSource('enter');

type Props = Omit<ComponentProps<typeof LottieView>, 'source'>;

export const EnterLottieView = forwardRef<LottieView, Props>(function EnterLottieView(props, ref) {
  return (
    <LottieView
      {...props}
      ref={ref}
      source={stageEnterExitAnimation}
      renderMode={Platform.OS === 'ios' ? 'SOFTWARE' : undefined}
      cacheComposition={false}
    />
  );
});
