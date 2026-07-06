import { cellInnerSize, cellOffset, usePatternCellSize } from '@/constants/gameLayout';
import { Theme } from '@/constants/Theme';
import { woodPanel, woodText, woodWell } from '@/constants/wood';
import { COLOR_HEX } from '@/src/types/colors';
import type { PatternCell } from '@/src/types/stage';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  cells: PatternCell[];
  cellSize?: number;
  glow?: boolean;
  compact?: boolean;
};

export function PatternView({ cells, cellSize: cellSizeProp, glow, compact }: Props) {
  const maxX = Math.max(...cells.map((c) => c.dx));
  const maxY = Math.max(...cells.map((c) => c.dy));
  const autoSize = usePatternCellSize(maxX + 1, maxY + 1);
  const cellSize = cellSizeProp ?? autoSize;
  const inner = cellInnerSize(cellSize);
  const offset = cellOffset(cellSize);

  return (
    <View style={[styles.card, compact && styles.cardCompact, glow && styles.glow]}>
      <View style={{ width: (maxX + 1) * cellSize, height: (maxY + 1) * cellSize }}>
        {cells.map((cell, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                width: inner,
                height: inner,
                left: cell.dx * cellSize + offset,
                top: cell.dy * cellSize + offset,
                backgroundColor: COLOR_HEX[cell.color],
              },
            ]}
          />
        ))}
      </View>
      {glow && <Text style={styles.matchLabel}>一致！</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 8,
    ...woodPanel,
    ...woodWell(),
    backgroundColor: Theme.boardEmpty,
  },
  cardCompact: {
    padding: 6,
  },
  glow: {
    borderColor: Theme.warm,
    backgroundColor: Theme.warmSoft,
  },
  cell: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.45)',
    borderLeftColor: 'rgba(255,255,255,0.35)',
    borderRightColor: 'rgba(0,0,0,0.2)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  matchLabel: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    ...woodText,
    color: Theme.success,
    fontSize: 12,
    fontWeight: '700',
  },
});
