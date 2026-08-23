import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pin } from '../../types';
import { PinCard } from '../pins/PinCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface MasonryGridProps {
  pins: Pin[];
  onPinPress?: (pin: Pin) => void;
  emptyMessage?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  pins,
  onPinPress,
  emptyMessage = 'nothing here yet. add a note, photo, thought, or link when you want to keep it.',
}) => {
  if (!pins || pins.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>no items yet</Text>
          <Text style={styles.emptySub}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  // Distribute pins into 2 organic staggered columns
  const leftColumn: Pin[] = [];
  const rightColumn: Pin[] = [];

  pins.forEach((pin, index) => {
    if (index % 2 === 0) {
      leftColumn.push(pin);
    } else {
      rightColumn.push(pin);
    }
  });

  return (
    <View style={styles.gridContainer}>
      {/* Left Column */}
      <View style={styles.column}>
        {leftColumn.map((pin) => (
          <PinCard
            key={pin.id}
            pin={pin}
            onPress={onPinPress ? () => onPinPress(pin) : undefined}
          />
        ))}
      </View>

      {/* Right Column */}
      <View style={styles.column}>
        {rightColumn.map((pin) => (
          <PinCard
            key={pin.id}
            pin={pin}
            onPress={onPinPress ? () => onPinPress(pin) : undefined}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 90,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  emptyContainer: {
    paddingVertical: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(104, 86, 72, 0.08)',
    backgroundColor: 'rgba(255, 250, 244, 0.72)',
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontFamily: typography.families.serif,
    fontSize: 17,
    color: colors.ink.primary,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: typography.families.sans,
    fontSize: 12.75,
    color: colors.ink.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
