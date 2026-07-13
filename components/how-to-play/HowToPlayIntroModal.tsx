import { HOW_TO_PLAY_SLIDES } from '@/components/how-to-play/howToPlayImages';
import { Theme } from '@/constants/Theme';
import { woodButton, woodText, woodTitle } from '@/constants/wood';
import { playSe } from '@/src/audio/playSe';
import { markHowToPlayIntroSeen } from '@/src/storage/howToPlayIntro';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SETTINGS_HINT = '遊び方は「設定 > 遊び方」からいつでも確認できます。';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HowToPlayIntroModal({ visible, onClose }: Props) {
  const listRef = useRef<FlatList<(typeof HOW_TO_PLAY_SLIDES)[number]>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const isLastPage = pageIndex === HOW_TO_PLAY_SLIDES.length - 1;

  useEffect(() => {
    if (visible) {
      setPageIndex(0);
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
    }
  }, [visible]);

  const handleStart = useCallback(() => {
    playSe('uiTap');
    void markHowToPlayIntroSeen();
    onClose();
  }, [onClose]);

  const goToPage = useCallback(
    (index: number) => {
      if (pageWidth <= 0) return;
      listRef.current?.scrollToIndex({ index, animated: true });
      setPageIndex(index);
    },
    [pageWidth],
  );

  const onNext = useCallback(() => {
    playSe('uiTap');
    if (isLastPage) {
      handleStart();
      return;
    }
    goToPage(pageIndex + 1);
  }, [goToPage, handleStart, isLastPage, pageIndex]);

  const onBack = useCallback(() => {
    if (pageIndex === 0) return;
    playSe('uiTap');
    goToPage(pageIndex - 1);
  }, [goToPage, pageIndex]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) return;
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setPageIndex(index);
    },
    [pageWidth],
  );

  const renderPage = useCallback(
    ({ item, index }: ListRenderItemInfo<(typeof HOW_TO_PLAY_SLIDES)[number]>) => {
      const isLast = index === HOW_TO_PLAY_SLIDES.length - 1;
      return (
        <View style={[styles.page, { width: pageWidth }]}>
          <View style={styles.imageFrame}>
            <Image
              source={item.source}
              style={styles.image}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={item.accessibilityLabel}
            />
          </View>
          {isLast ? (
            <Text style={styles.footerNote} accessibilityRole="text">
              {SETTINGS_HINT}
            </Text>
          ) : null}
        </View>
      );
    },
    [pageWidth],
  );

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.panel}>
            <Text style={styles.title}>遊び方</Text>

            <View
              style={styles.pager}
              onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
            >
              {pageWidth > 0 ? (
                <FlatList
                  ref={listRef}
                  data={HOW_TO_PLAY_SLIDES}
                  keyExtractor={(item) => item.id}
                  renderItem={renderPage}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  onMomentumScrollEnd={onMomentumScrollEnd}
                  getItemLayout={(_, index) => ({
                    length: pageWidth,
                    offset: pageWidth * index,
                    index,
                  })}
                />
              ) : null}
            </View>

            <View style={styles.dots} accessibilityRole="tablist">
              {HOW_TO_PLAY_SLIDES.map((slide, index) => (
                <View
                  key={slide.id}
                  style={[styles.dot, index === pageIndex && styles.dotActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: index === pageIndex }}
                />
              ))}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.navBtn, pageIndex === 0 && styles.navBtnHidden]}
                onPress={onBack}
                disabled={pageIndex === 0}
                accessibilityRole="button"
                accessibilityLabel="戻る"
              >
                <Text style={[styles.navText, pageIndex === 0 && styles.navTextHidden]}>戻る</Text>
              </Pressable>

              <Pressable
                style={styles.primaryBtn}
                onPress={onNext}
                accessibilityRole="button"
                accessibilityLabel={isLastPage ? 'はじめる' : '次へ'}
              >
                <Text style={styles.primaryText}>{isLastPage ? 'はじめる' : '次へ'}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  safe: { flex: 1 },
  panel: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.border,
    backgroundColor: Theme.bg,
    overflow: 'hidden',
  },
  title: {
    ...woodTitle,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  imageFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceRaised,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Theme.border,
    padding: 8,
    minHeight: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footerNote: {
    ...woodText,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: Theme.textDim,
    paddingHorizontal: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.border,
  },
  dotActive: {
    backgroundColor: Theme.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  navBtn: {
    minWidth: 72,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnHidden: {
    opacity: 0,
  },
  navText: {
    ...woodText,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.textDim,
  },
  navTextHidden: {
    color: 'transparent',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    ...woodButton(Theme.accentSoft),
  },
  primaryText: {
    ...woodText,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.accent,
  },
});
