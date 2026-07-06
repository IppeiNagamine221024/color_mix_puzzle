import { BlockFace } from '@/components/BlockFace';
import { cellInnerSize, cellOffset, useBoardCellSize } from '@/constants/gameLayout';
import { Theme } from '@/constants/Theme';
import { woodFrame, woodWell } from '@/constants/wood';
import { snapshotBlock } from '@/src/game/blockStack';
import type { BlockSnapshot, BoardAnimation } from '@/src/types/animation';
import { BOARD_ANIM_MS } from '@/src/types/animation';
import type { Board, Direction } from '@/src/types/board';
import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

type Props = {
  board: Board;
  animation?: BoardAnimation | null;
  animationKey?: number;
  onAnimationComplete?: () => void;
  onCellPress?: (x: number, y: number) => void;
  highlight?: { x: number; y: number }[];
  matchHighlight?: { x: number; y: number }[];
};

const EASE = Easing.out(Easing.cubic);

export function BoardView({
  board,
  animation = null,
  animationKey = 0,
  onAnimationComplete,
  onCellPress,
  highlight = [],
  matchHighlight = [],
}: Props) {
  const height = board.length;
  const width = board[0]?.length ?? 0;
  const cellSize = useBoardCellSize(width, height);
  const inner = cellInnerSize(cellSize);
  const offset = cellOffset(cellSize);
  const animating = animation != null;

  const isHighlighted = (x: number, y: number) =>
    highlight.some((h) => h.x === x && h.y === y);
  const isMatch = (x: number, y: number) =>
    matchHighlight.some((h) => h.x === x && h.y === y);

  const animatingCells = useMemo(() => {
    if (!animation) return new Set<string>();
    const set = new Set<string>();
    const mark = (x: number, y: number) => set.add(`${x},${y}`);

    if (animation.type === 'slide') {
      for (const m of animation.moves) {
        mark(m.from.x, m.from.y);
        mark(m.to.x, m.to.y);
      }
      if (animation.spawn) mark(animation.spawn.x, animation.spawn.y);
    } else if (animation.type === 'mix') {
      mark(animation.a.x, animation.a.y);
      mark(animation.b.x, animation.b.y);
      mark(animation.target.x, animation.target.y);
    } else {
      mark(animation.a.x, animation.a.y);
      mark(animation.b.x, animation.b.y);
    }
    return set;
  }, [animation]);

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        <View style={[styles.grid, { width: width * cellSize, height: height * cellSize }]}>
          {board.map((row, y) =>
            row.map((cell, x) => {
              const key = `${x},${y}`;
              const hideBlock = animating && animatingCells.has(key);
              const showAsBlock = cell.kind === 'block' && !hideBlock;
              const block =
                cell.kind === 'block' ? snapshotBlock(cell.ratio) : null;

              return (
                <Pressable
                  key={key}
                  onPress={() => !animating && onCellPress?.(x, y)}
                  disabled={animating}
                  style={[
                    styles.cell,
                    {
                      width: inner,
                      height: inner,
                      left: x * cellSize + offset,
                      top: y * cellSize + offset,
                      backgroundColor:
                        cell.kind === 'obstacle'
                          ? Theme.obstacle
                          : showAsBlock
                            ? 'transparent'
                            : Theme.boardEmpty,
                    },
                    cell.kind === 'empty' && styles.well,
                    showAsBlock && styles.blockCell,
                    isHighlighted(x, y) && styles.selected,
                    cell.kind === 'obstacle' && styles.obstacle,
                  ]}
                >
                  {showAsBlock && block && (
                    <>
                      {isMatch(x, y) && <MatchGlowRing size={inner} />}
                      <View style={styles.blockFaceLayer}>
                        <BlockFace color={block.color} stack={block.stack} size={inner} />
                      </View>
                    </>
                  )}
                </Pressable>
              );
            }),
          )}

          {animation?.type === 'slide' && (
            <>
              {animation.moves.map((m, i) => (
                <SlideBlock
                  key={`${animationKey}-slide-${i}`}
                  cellSize={cellSize}
                  inner={inner}
                  offset={offset}
                  from={m.from}
                  to={m.to}
                  block={m}
                />
              ))}
              {animation.spawn && (
                <SpawnBlock
                  key={`${animationKey}-spawn`}
                  cellSize={cellSize}
                  inner={inner}
                  offset={offset}
                  pos={{ x: animation.spawn.x, y: animation.spawn.y }}
                  block={animation.spawn}
                  direction={animation.direction}
                />
              )}
              <AnimationDriver
                key={`${animationKey}-slide-driver`}
                duration={BOARD_ANIM_MS}
                onComplete={onAnimationComplete}
              />
            </>
          )}

          {animation?.type === 'mix' && (
            <>
              <MixBlocks
                key={`${animationKey}-mix`}
                cellSize={cellSize}
                inner={inner}
                offset={offset}
                animation={animation}
              />
              <AnimationDriver
                key={`${animationKey}-mix-driver`}
                duration={BOARD_ANIM_MS + 100}
                onComplete={onAnimationComplete}
              />
            </>
          )}

          {animation?.type === 'swap' && (
            <>
              <SwapBlocks
                key={`${animationKey}-swap`}
                cellSize={cellSize}
                inner={inner}
                offset={offset}
                animation={animation}
              />
              <AnimationDriver
                key={`${animationKey}-swap-driver`}
                duration={BOARD_ANIM_MS}
                onComplete={onAnimationComplete}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function MatchGlowRing({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const radius = Math.max(6, size * 0.24);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const outerScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, 1.28],
  });
  const outerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.95],
  });
  const innerScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.04, 1.12],
  });
  const innerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowRing,
          styles.glowRingOuter,
          {
            width: size,
            height: size,
            borderRadius: radius,
            opacity: outerOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowRing,
          styles.glowRingInner,
          {
            width: size,
            height: size,
            borderRadius: radius,
            opacity: innerOpacity,
            transform: [{ scale: innerScale }],
          },
        ]}
      />
    </>
  );
}

function AnimationDriver({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete?: () => void;
}) {
  const called = useRef(false);

  useEffect(() => {
    called.current = false;
    const timer = setTimeout(() => {
      if (!called.current) {
        called.current = true;
        onComplete?.();
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return null;
}

function posPx(x: number, y: number, cellSize: number, offset: number, inner: number) {
  return {
    left: x * cellSize + offset,
    top: y * cellSize + offset,
    width: inner,
    height: inner,
  };
}

function useProgress(deps: unknown[]) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: BOARD_ANIM_MS,
      easing: EASE,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return progress;
}

function AnimatedBlock({
  inner,
  block,
  style,
}: {
  inner: number;
  block: BlockSnapshot;
  style?: object;
}) {
  return (
    <View style={[{ width: inner, height: inner }, style]}>
      <BlockFace color={block.color} stack={block.stack} size={inner} />
    </View>
  );
}

function SlideBlock({
  cellSize,
  inner,
  offset,
  from,
  to,
  block,
}: {
  cellSize: number;
  inner: number;
  offset: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  block: BlockSnapshot;
}) {
  const progress = useProgress([from.x, from.y, to.x, to.y, cellSize]);
  const dx = (to.x - from.x) * cellSize;
  const dy = (to.y - from.y) * cellSize;

  return (
    <Animated.View
      style={[
        styles.animBlock,
        posPx(from.x, from.y, cellSize, offset, inner),
        {
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, dx],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, dy],
              }),
            },
          ],
        },
      ]}
    >
      <AnimatedBlock inner={inner} block={block} />
    </Animated.View>
  );
}

function SpawnBlock({
  cellSize,
  inner,
  offset,
  pos,
  block,
  direction,
}: {
  cellSize: number;
  inner: number;
  offset: number;
  pos: { x: number; y: number };
  block: BlockSnapshot;
  direction: Direction;
}) {
  const progress = useProgress([pos.x, pos.y, direction, cellSize, block.color]);
  const entry = spawnEntryOffset(direction, cellSize);

  return (
    <Animated.View
      style={[
        styles.animBlock,
        posPx(pos.x, pos.y, cellSize, offset, inner),
        {
          opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.2, 0.85, 1] }),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [entry.dx, 0],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [entry.dy, 0],
              }),
            },
            {
              scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
            },
          ],
        },
      ]}
    >
      <AnimatedBlock inner={inner} block={block} />
    </Animated.View>
  );
}

function spawnEntryOffset(direction: Direction, cellSize: number) {
  switch (direction) {
    case 'left':
      return { dx: cellSize * 0.85, dy: 0 };
    case 'right':
      return { dx: -cellSize * 0.85, dy: 0 };
    case 'up':
      return { dx: 0, dy: cellSize * 0.85 };
    case 'down':
      return { dx: 0, dy: -cellSize * 0.85 };
  }
}

function MixBlocks({
  cellSize,
  inner,
  offset,
  animation,
}: {
  cellSize: number;
  inner: number;
  offset: number;
  animation: Extract<BoardAnimation, { type: 'mix' }>;
}) {
  const { a, b, target, vanish, result } = animation;
  const progress = useProgress([a.x, a.y, b.x, b.y, target.x, target.y, cellSize, vanish]);
  const dx = (target.x - a.x) * cellSize;
  const dy = (target.y - a.y) * cellSize;
  const half = 0.55;

  return (
    <>
      <Animated.View
        style={[
          styles.animBlock,
          posPx(a.x, a.y, cellSize, offset, inner),
          {
            opacity: progress.interpolate({
              inputRange: [0, half, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, half],
                  outputRange: [0, dx],
                  extrapolate: 'clamp',
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, half],
                  outputRange: [0, dy],
                  extrapolate: 'clamp',
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, half, 1],
                  outputRange: [1, vanish ? 0.6 : 0.5, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <AnimatedBlock inner={inner} block={a} />
      </Animated.View>
      <Animated.View
        style={[
          styles.animBlock,
          posPx(b.x, b.y, cellSize, offset, inner),
          {
            opacity: progress.interpolate({
              inputRange: [0, half, 1],
              outputRange: [1, 0, 0],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, half],
                  outputRange: [1, 0.4],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <AnimatedBlock inner={inner} block={b} />
      </Animated.View>
      {!vanish && result && (
        <Animated.View
          style={[
            styles.animBlock,
            posPx(target.x, target.y, cellSize, offset, inner),
            {
              opacity: progress.interpolate({
                inputRange: [0, half, half + 0.08, 1],
                outputRange: [0, 0, 1, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, half, half + 0.12, 1],
                    outputRange: [0.3, 0.3, 1.15, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <AnimatedBlock inner={inner} block={result} />
        </Animated.View>
      )}
    </>
  );
}

function SwapBlocks({
  cellSize,
  inner,
  offset,
  animation,
}: {
  cellSize: number;
  inner: number;
  offset: number;
  animation: Extract<BoardAnimation, { type: 'swap' }>;
}) {
  const { a, b } = animation;
  const progress = useProgress([a.x, a.y, b.x, b.y, cellSize]);
  const aDx = (b.x - a.x) * cellSize;
  const aDy = (b.y - a.y) * cellSize;
  const bDx = (a.x - b.x) * cellSize;
  const bDy = (a.y - b.y) * cellSize;

  return (
    <>
      <Animated.View
        style={[
          styles.animBlock,
          posPx(a.x, a.y, cellSize, offset, inner),
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, aDx],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, aDy],
                }),
              },
            ],
          },
        ]}
      >
        <AnimatedBlock inner={inner} block={a} />
      </Animated.View>
      <Animated.View
        style={[
          styles.animBlock,
          posPx(b.x, b.y, cellSize, offset, inner),
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, bDx],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, bDy],
                }),
              },
            ],
          },
        ]}
      >
        <AnimatedBlock inner={inner} block={b} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  frame: {
    ...woodFrame,
    overflow: 'visible',
  },
  grid: { position: 'relative', overflow: 'visible' },
  cell: {
    position: 'absolute',
    borderRadius: 6,
    overflow: 'visible',
  },
  well: {
    ...woodWell(),
  },
  animBlock: {
    position: 'absolute',
    zIndex: 10,
    overflow: 'visible',
  },
  blockCell: {
    borderWidth: 0,
  },
  blockFaceLayer: {
    zIndex: 1,
  },
  selected: {
    borderWidth: 3,
    borderColor: Theme.selection,
    borderRadius: 6,
  },
  glowRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  glowRingOuter: {
    borderWidth: 4,
    borderColor: Theme.warm,
    shadowColor: Theme.warm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  glowRingInner: {
    borderWidth: 2,
    borderColor: '#fff6d8',
    shadowColor: '#fff6d8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 6,
    elevation: 4,
  },
  obstacle: {
    opacity: 0.9,
    ...woodWell(),
    backgroundColor: Theme.obstacle,
  },
});
