import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PinCard } from '../components/pins/PinCard';
import { Tape } from '../components/common/Tape';
import { Board, DeskItem } from '../types';

export const DeskScreen: React.FC = () => {
  const {
    deskItems,
    boards,
    moveDeskItemToBoard,
    removeDeskItem,
    openCreateSheet,
    setActivePinDetail,
  } = useApp();

  const [activeFilingItemId, setActiveFilingItemId] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>The Desk</Text>
        <Text style={styles.mainTitle}>Sort Your Unfiled Memories</Text>
        <Text style={styles.subtitle}>
          Quick notes and photos land here first, then you file them to boards when ready.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{deskItems.length}</Text>
            <Text style={styles.statLabel}>{deskItems.length === 1 ? 'Item Waiting' : 'Items Waiting'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{boards.length}</Text>
            <Text style={styles.statLabel}>Boards Ready</Text>
          </View>
        </View>
      </View>

      <View style={styles.stickyPromptCard}>
        <Tape variant="top-center" width={46} height={12} color="rgba(238, 206, 142, 0.85)" />
        <Text style={styles.stickyPromptText}>
          Toss quick notes, voice memos, songs, and photos here before filing them to boards.
        </Text>
      </View>

      {deskItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Your Desk is Clear</Text>
          <Text style={styles.emptySub}>
            No unorganized items right now. Whenever you capture something in a hurry, it lands here.
          </Text>
          <Pressable onPress={() => openCreateSheet('desk')} style={({ pressed }) => [styles.quickAddBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.quickAddBtnText}>Add Something to Desk</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.itemsGrid}>
          {deskItems.map((item: DeskItem) => {
            const isFilingOpen = activeFilingItemId === item.id;

            return (
              <View key={item.id} style={styles.deskItemWrapper}>
                <PinCard pin={item.pin} showFavoriteBadge={false} onPress={() => setActivePinDetail(item.pin)} />

                <View style={styles.itemActionBar}>
                  <Pressable
                    onPress={() => setActiveFilingItemId(isFilingOpen ? null : item.id)}
                    style={({ pressed }) => [styles.fileBtn, isFilingOpen && styles.fileBtnActive, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={[styles.fileBtnText, isFilingOpen && styles.fileBtnTextActive]}>File to Board</Text>
                  </Pressable>

                  <Pressable onPress={() => removeDeskItem(item.id)} style={({ pressed }) => [styles.discardBtn, pressed && { opacity: 0.7 }]} hitSlop={6}>
                    <Text style={styles.discardText}>Remove</Text>
                  </Pressable>
                </View>

                {isFilingOpen && (
                  <View style={styles.filingDropdown}>
                    <Text style={styles.filingHeading}>Choose Destination Board</Text>
                    {boards.map((board: Board) => (
                      <Pressable
                        key={board.id}
                        onPress={() => {
                          moveDeskItemToBoard(item.id, board.id);
                          setActiveFilingItemId(null);
                        }}
                        style={({ pressed }) => [styles.filingBoardItem, pressed && { backgroundColor: 'rgba(0,0,0,0.05)' }]}
                      >
                        <Text style={styles.filingBoardTitle}>{board.title}</Text>
                        <Text style={styles.filingBoardAction}>File</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 50,
  },
  heroCard: {
    marginBottom: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
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
  mainTitle: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    color: colors.ink.primary,
  },
  subtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    marginTop: 4,
  },
  statsRow: {
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
  stickyPromptCard: {
    backgroundColor: '#FFFDF0',
    borderRadius: 18,
    padding: 16,
    paddingTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(238, 206, 142, 0.4)',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#2D2637',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  stickyPromptText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink.primary,
  },
  emptyCard: {
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  quickAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.brand.purple,
  },
  quickAddBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  itemsGrid: {
    gap: 14,
  },
  deskItemWrapper: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  itemActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  fileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fileBtnActive: {
    backgroundColor: colors.brand.purple,
  },
  fileBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  fileBtnTextActive: {
    color: '#FFF',
  },
  discardBtn: {
    padding: 6,
  },
  discardText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.accents.terracotta,
  },
  filingDropdown: {
    backgroundColor: '#FAF8FD',
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  filingHeading: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.tertiary,
    marginBottom: 8,
  },
  filingBoardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  filingBoardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  filingBoardAction: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.purple,
  },
});
