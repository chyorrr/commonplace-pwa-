import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Tape } from '../components/common/Tape';
import { ChevronLeft, MoreHorizontal, Plus, Share2, Download, Trash2, Eye, EyeOff, ShieldAlert } from 'lucide-react-native';
import { ShareModal } from '../components/modals/ShareModal';
import { BoardExportModal } from '../components/modals/BoardExportModal';
import { PinCard } from '../components/pins/PinCard';
import { Pin } from '../types';

export const BoardDetailScreen: React.FC = () => {
  const {
    activeBoard,
    setActiveBoardId,
    openCreateSheet,
    deleteBoard,
    toggleHideBoard,
    showHiddenItems,
    toggleShowHiddenItems,
  } = useApp();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // iOS Edge Swipe Back Gesture
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  if (!activeBoard) return null;

  const boardBg = activeBoard.colorHex || '#FFF5ED';
  const rawPins = activeBoard.pins || [];
  const pins = showHiddenItems ? rawPins : rawPins.filter((p) => !p.isHidden);
  const hiddenCount = rawPins.filter((p) => p.isHidden).length;

  const handleDeleteBoard = () => {
    deleteBoard(activeBoard.id);
    setShowDeleteConfirm(false);
  };

  const handleTouchStart = (e: any) => {
    const touch = e.nativeEvent?.touches?.[0] || e.nativeEvent;
    if (touch) {
      touchStartRef.current = {
        x: touch.pageX || touch.clientX || 0,
        y: touch.pageY || touch.clientY || 0,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: any) => {
    const touch = e.nativeEvent?.changedTouches?.[0] || e.nativeEvent;
    if (touch && touchStartRef.current) {
      const deltaX = (touch.pageX || touch.clientX || 0) - touchStartRef.current.x;
      const deltaY = Math.abs((touch.pageY || touch.clientY || 0) - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;

      // If swipe started near left edge (< 60px) and moved right > 70px with low vertical slope
      if (touchStartRef.current.x < 70 && deltaX > 65 && deltaY < 80 && deltaTime < 400) {
        setActiveBoardId(null);
      }
    }
  };

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ScrollView
        style={styles.canvasScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.canvasContent}
      >
        {/* 1. Header matching Home Screen layout exactly */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <Tape variant="diagonal-left" width={38} height={10} color="rgba(255, 182, 193, 0.75)" />

            <Pressable
              onPress={() => setActiveBoardId(null)}
              style={styles.titleWithBack}
              hitSlop={8}
              accessibilityLabel="Back to boards"
            >
              <ChevronLeft size={24} color={colors.ink.primary} strokeWidth={2.8} />
              <Text style={styles.boardMainTitle} numberOfLines={1}>
                {activeBoard.title}
              </Text>
              {activeBoard.isHidden && (
                <View style={styles.hiddenPill}>
                  <EyeOff size={10} color="#7C3AED" />
                  <Text style={styles.hiddenPillText}>Hidden</Text>
                </View>
              )}
            </Pressable>

            {/* Cute Mood / Count Capsule matching Home Screen */}
            <View style={styles.moodCapsule}>
              <Text style={styles.moodCapsuleText}>
                {pins.length === 1 ? '1 item captured ♡' : `${pins.length} items captured ♡`}
                {hiddenCount > 0 && !showHiddenItems ? ` • ${hiddenCount} hidden` : ''}
              </Text>
            </View>
          </View>

          {/* Right Header Actions matching Home Screen Search Button */}
          <View style={styles.headerActionsRow}>
            {/* Hide / Unhide Board Toggle */}
            <Pressable
              onPress={() => toggleHideBoard(activeBoard.id)}
              style={({ pressed }) => [styles.headerBtnSquare, pressed && styles.btnPressed]}
              hitSlop={6}
              accessibilityLabel={activeBoard.isHidden ? 'Unhide board' : 'Hide board'}
            >
              {activeBoard.isHidden ? (
                <Eye size={18} color="#7C3AED" strokeWidth={2} />
              ) : (
                <EyeOff size={18} color={colors.ink.secondary} strokeWidth={1.8} />
              )}
            </Pressable>

            {/* More / Export Options */}
            <Pressable
              onPress={() => setIsExportOpen(true)}
              style={({ pressed }) => [styles.headerBtnSquare, pressed && styles.btnPressed]}
              hitSlop={6}
            >
              <MoreHorizontal size={18} color={colors.ink.primary} strokeWidth={2} />
            </Pressable>

            {/* Delete Board */}
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={({ pressed }) => [styles.headerBtnSquare, pressed && styles.btnPressed]}
              hitSlop={6}
              accessibilityLabel="Delete board"
            >
              <Trash2 size={16} color={colors.accents.terracotta} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View id="board-canvas-container" style={styles.canvasWrapper}>
          {/* Hidden Items Notice Banner */}
          {hiddenCount > 0 && (
            <Pressable
              onPress={toggleShowHiddenItems}
              style={({ pressed }) => [styles.hiddenNoticeBanner, pressed && styles.btnPressed]}
              hitSlop={6}
            >
              <EyeOff size={13} color="#7C3AED" />
              <Text style={styles.hiddenNoticeText}>
                {showHiddenItems
                  ? `Showing all items (${hiddenCount} hidden unmasked)`
                  : `${hiddenCount} hidden note${hiddenCount > 1 ? 's' : ''} in this board • Tap to reveal`}
              </Text>
            </Pressable>
          )}

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

      {/* Delete Board Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable style={styles.deleteModalOverlay} onPress={() => setShowDeleteConfirm(false)}>
          <Pressable style={styles.deleteModalCard} onPress={(e) => e.stopPropagation()}>
            <Tape variant="top-center" width={44} height={12} color="rgba(225, 29, 72, 0.6)" />
            <View style={styles.deleteModalIcon}>
              <Trash2 size={24} color="#E11D48" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete this board?</Text>
            <Text style={styles.deleteModalSub}>
              "{activeBoard.title}" and all its {rawPins.length} item{rawPins.length === 1 ? '' : 's'} will be permanently removed.
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.deleteCancelBtn}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteBoard}
                style={styles.deleteConfirmBtn}
              >
                <Text style={styles.deleteConfirmText}>Delete Board</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  headerTitleGroup: {
    flex: 1,
    position: 'relative',
  },
  titleWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
    marginLeft: -4,
  },
  boardMainTitle: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink.primary,
    letterSpacing: -0.4,
  },
  moodCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  moodCapsuleText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink.secondary,
    letterSpacing: 0.2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerBtnSquare: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  hiddenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EDE8FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  hiddenPillText: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6D28D9',
  },
  hiddenNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  hiddenNoticeText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#6D28D9',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 15, 30, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-top, 20px))' : 20) as any,
    paddingBottom: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-bottom, 20px))' : 20) as any,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  deleteModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  deleteModalSub: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 18,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  deleteCancelText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E11D48',
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 110,
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
    bottom: 8,
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
