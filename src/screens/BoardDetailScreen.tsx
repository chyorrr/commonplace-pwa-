import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Tape } from '../components/common/Tape';
import { ChevronLeft, MoreHorizontal, Plus, Share2, Download } from 'lucide-react-native';
import { ShareModal } from '../components/modals/ShareModal';
import { BoardExportModal } from '../components/modals/BoardExportModal';
import { PinCard } from '../components/pins/PinCard';
import { Pin } from '../types';

export const BoardDetailScreen: React.FC = () => {
  const {
    activeBoard,
    setActiveBoardId,
    openCreateSheet,
  } = useApp();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!activeBoard) return null;

  const boardBg = activeBoard.colorHex || '#FFF5ED';
  const pins = activeBoard.pins || [];

  return (
    <View style={[styles.container, { backgroundColor: boardBg }]}>
      {/* 1. Top Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => setActiveBoardId(null)} style={styles.backBtn} hitSlop={10}>
          <ChevronLeft size={24} color={colors.ink.primary} />
        </Pressable>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.boardTitle}>{activeBoard.title}</Text>
          <Text style={styles.boardSubtitle}>
            {pins.length === 1 ? '1 item' : `${pins.length} items`}
          </Text>
        </View>

        <Pressable onPress={() => setIsExportOpen(true)} style={styles.menuBtn} hitSlop={10}>
          <MoreHorizontal size={22} color={colors.ink.primary} />
        </Pressable>
      </View>

      {/* 2. Scrapbook Pins Canvas */}
      <ScrollView
        style={styles.canvasScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.canvasContent}
      >
        <View id="board-canvas-container" style={[styles.canvasWrapper, { backgroundColor: boardBg }]}>
          {pins.length === 0 ? (
            /* Clean Empty Board State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <Tape variant="top-center" width={48} height={12} color="rgba(245, 158, 11, 0.82)" />
                <Text style={styles.emptyTitle}>Empty Scrapbook Board</Text>
                <Text style={styles.emptySub}>
                  Capture your favorite memories, photos, thoughts, checklists, or Spotify songs to this board.
                </Text>
                <Pressable
                  onPress={() => openCreateSheet('board')}
                  style={({ pressed }) => [styles.emptyAddBtn, pressed && styles.btnPressed]}
                >
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.emptyAddBtnText}>Add Something</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Render Real User Pins in 2-column layout */
            <View style={styles.pinsGrid}>
              <View style={styles.gridColumn}>
                {pins.filter((_, idx) => idx % 2 === 0).map((pin: Pin) => (
                  <PinCard key={pin.id} pin={pin} />
                ))}
              </View>
              <View style={styles.gridColumn}>
                {pins.filter((_, idx) => idx % 2 === 1).map((pin: Pin) => (
                  <PinCard key={pin.id} pin={pin} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Floating Bottom Action Dock (Add Pin, Share & Export) */}
      <View style={styles.floatingBottomDock}>
        <View style={styles.dockCapsule}>
          {/* Add Pin Button */}
          <Pressable
            onPress={() => openCreateSheet('board')}
            style={({ pressed }) => [styles.dockBtn, styles.dockBtnPrimary, pressed && styles.btnPressed]}
            hitSlop={6}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.dockBtnPrimaryText}>Add</Text>
          </Pressable>

          {/* Share Button (WhatsApp, Instagram, etc.) */}
          <Pressable
            onPress={() => setIsShareOpen(true)}
            style={({ pressed }) => [styles.dockBtn, styles.dockBtnSecondary, pressed && styles.btnPressed]}
            hitSlop={6}
          >
            <Share2 size={15} color={colors.brand.purpleDark} />
            <Text style={styles.dockBtnSecondaryText}>Share</Text>
          </Pressable>

          {/* Export PNG / JPG Button */}
          <Pressable
            onPress={() => setIsExportOpen(true)}
            style={({ pressed }) => [styles.dockBtn, styles.dockBtnSecondary, pressed && styles.btnPressed]}
            hitSlop={6}
          >
            <Download size={15} color={colors.brand.purpleDark} />
            <Text style={styles.dockBtnSecondaryText}>Export</Text>
          </Pressable>
        </View>
      </View>

      {/* Share Modal (WhatsApp / Instagram / Copy Link) */}
      <ShareModal
        visible={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={activeBoard.title}
        content={`${activeBoard.title} — ${activeBoard.subtitle || `${pins.length} memories`}`}
      />

      {/* Board Export Modal (PNG / JPG / Print) */}
      <BoardExportModal
        visible={isExportOpen}
        board={activeBoard}
        onClose={() => setIsExportOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  backBtn: {
    padding: 6,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  boardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
    letterSpacing: -0.3,
  },
  boardSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
  },
  menuBtn: {
    padding: 6,
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContent: {
    padding: 14,
    paddingBottom: 100,
  },
  canvasWrapper: {
    width: '100%',
    borderRadius: 16,
  },
  pinsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridColumn: {
    flex: 1,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 22,
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 19,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptySub: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink.tertiary,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  emptyAddBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floatingBottomDock: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 50,
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 28,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  dockBtnPrimary: {
    backgroundColor: colors.brand.purple,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  dockBtnPrimaryText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dockBtnSecondary: {
    backgroundColor: '#F3E8FF',
  },
  dockBtnSecondaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
