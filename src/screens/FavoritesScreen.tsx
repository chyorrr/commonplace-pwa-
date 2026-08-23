import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { MasonryGrid } from '../components/board/MasonryGrid';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Board, DeskItem, Pin } from '../types';

export const FavoritesScreen: React.FC = () => {
  const { boards, deskItems, setActivePinDetail } = useApp();

  const favoritePins: Pin[] = [];

  boards.forEach((board: Board) => {
    board.pins.forEach((pin: Pin) => {
      if (pin.isFavorite) {
        favoritePins.push(pin);
      }
    });
  });

  deskItems.forEach((item: DeskItem) => {
    if (item.pin.isFavorite) {
      favoritePins.push(item.pin);
    }
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Quiet Corner</Text>
        <Text style={styles.title}>Favorites & Keepsakes</Text>
        <Text style={styles.subtitle}>
          A dedicated place for the notes, photos, and thoughts you cherish most.
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{favoritePins.length}</Text>
            <Text style={styles.statLabel}>Kept Here</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{boards.length}</Text>
            <Text style={styles.statLabel}>Boards Scanned</Text>
          </View>
        </View>
      </View>

      <View style={styles.collectionCard}>
        <MasonryGrid
          pins={favoritePins}
          onPinPress={(pin: Pin) => setActivePinDetail(pin)}
          emptyMessage="Tap the heart icon on any note or photograph to keep it here."
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingTop: 18,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  heroCard: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  eyebrow: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brand.purple,
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  subtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FDFBF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statValue: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  statLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  collectionCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
