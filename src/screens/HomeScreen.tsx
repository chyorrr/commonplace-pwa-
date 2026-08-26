import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useApp, ThemeMode } from '../context/AppContext';
import { PastelBoardCard } from '../components/board/PastelBoardCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Tape } from '../components/common/Tape';
import { Search, Plus, FolderPlus, Heart, Eye, EyeOff } from 'lucide-react-native';
import { Board } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    boards,
    setActiveBoardId,
    setActiveTab,
    unlockedBoards,
    openLockModal,
    openGuide,
    openCreateSheet,
    themeMode,
    showHiddenItems,
    toggleShowHiddenItems,
  } = useApp();

  const [heartBounce] = useState(new Animated.Value(1));

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.timing(heartBounce, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.spring(heartBounce, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleBoardClick = (boardId: string) => {
    const board = boards.find((b: Board) => b.id === boardId);
    if (board?.isLocked && !unlockedBoards.has(board.id)) {
      openLockModal(boardId);
    } else {
      setActiveBoardId(boardId);
    }
  };

  const visibleBoards = showHiddenItems ? boards : boards.filter((b) => !b.isHidden);
  const hiddenBoardsCount = boards.filter((b) => b.isHidden).length;

  // Dynamic Theme Color Mapping for the 7 Pastel Atmospheres
  const themeBrandColors: Record<ThemeMode, { primary: string; accent: string; heart: string; moodBg: string; moodText: string; moodLabel: string }> = {
    sakura: {
      primary: '#4A1D36',
      accent: '#E11D48',
      heart: '#FB7185',
      moodBg: '#FFE4EE',
      moodText: '#BE123C',
      moodLabel: '🌸 cherry blossom mood',
    },
    lilac: {
      primary: '#2D1B4E',
      accent: '#7C3AED',
      heart: '#A78BFA',
      moodBg: '#EDE8FF',
      moodText: '#6D28D9',
      moodLabel: '💜 fairy lilac dream',
    },
    matcha: {
      primary: '#0F3822',
      accent: '#16A34A',
      heart: '#34D399',
      moodBg: '#DCFCE7',
      moodText: '#15803D',
      moodLabel: '🍵 matcha latte vibe',
    },
    butter: {
      primary: '#422A14',
      accent: '#D97706',
      heart: '#FBBF24',
      moodBg: '#FEF3C7',
      moodText: '#B45309',
      moodLabel: '🍯 honey butter glow',
    },
    peach: {
      primary: '#431407',
      accent: '#EA580C',
      heart: '#FB923C',
      moodBg: '#FFEDD5',
      moodText: '#C2410C',
      moodLabel: '🍑 sweet peach macaron',
    },
    sky: {
      primary: '#0C2A4D',
      accent: '#0284C7',
      heart: '#38BDF8',
      moodBg: '#E0F2FE',
      moodText: '#0369A1',
      moodLabel: '☁️ baby blue cloud',
    },
    dark: {
      primary: '#FAF5FF',
      accent: '#C084FC',
      heart: '#F472B6',
      moodBg: '#2E1E3F',
      moodText: '#E9D5FF',
      moodLabel: '🌙 midnight velvet',
    },
  };

  const currentThemeColors = themeBrandColors[themeMode] || themeBrandColors.sakura;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 1. Cute Beautified Header with Tape, Dynamic Theme Colors, and Interactive Heart */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Tape variant="diagonal-left" width={38} height={10} color="rgba(255, 182, 193, 0.75)" />

          <Pressable onPress={openGuide} style={styles.titleWithHeart} hitSlop={6}>
            <Text style={[styles.brandCommon, { color: currentThemeColors.primary }]}>common</Text>
            <Text style={[styles.brandPlace, { color: currentThemeColors.accent }]}>place</Text>
            <Animated.View style={{ transform: [{ scale: heartBounce }] }}>
              <Pressable onPress={handleHeartPress} hitSlop={8}>
                <Text style={[styles.brandHeart, { color: currentThemeColors.heart }]}>♡</Text>
              </Pressable>
            </Animated.View>
          </Pressable>

          {/* Cute Mood Capsule */}
          <View style={[styles.moodCapsule, { backgroundColor: currentThemeColors.moodBg }]}>
            <Text style={[styles.moodCapsuleText, { color: currentThemeColors.moodText }]}>
              {currentThemeColors.moodLabel}
            </Text>
          </View>
        </View>

        {/* Right Header Actions: Search & Hidden Vault Toggle */}
        <View style={styles.headerActionsRow}>
          {hiddenBoardsCount > 0 && (
            <Pressable
              onPress={toggleShowHiddenItems}
              style={({ pressed }) => [
                styles.vaultBtn,
                showHiddenItems && styles.vaultBtnActive,
                pressed && styles.btnPressed,
              ]}
              hitSlop={8}
            >
              {showHiddenItems ? (
                <Eye size={16} color="#7C3AED" />
              ) : (
                <EyeOff size={16} color={colors.ink.secondary} />
              )}
              <Text style={[styles.vaultBtnText, showHiddenItems && styles.vaultBtnTextActive]}>
                {showHiddenItems ? 'Vault Visible' : `${hiddenBoardsCount} Hidden`}
              </Text>
            </Pressable>
          )}

          {/* Beautified Search Button */}
          <Pressable
            onPress={() => setActiveTab('search')}
            style={({ pressed }) => [styles.searchBtnSquare, pressed && styles.btnPressed]}
            hitSlop={8}
          >
            <Search size={18} color={currentThemeColors.accent} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {/* 2. Big Centered 'Create Your First Board' Card when no boards exist */}
      {visibleBoards.length === 0 && boards.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.bigNewBoardCard}>
            <Tape variant="top-center" width={56} height={14} color="rgba(251, 113, 133, 0.85)" />

            <View style={[styles.bigPlusCircle, { backgroundColor: currentThemeColors.accent }]}>
              <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
            </View>

            <Text style={styles.bigCardTitle}>Create Your First Board</Text>
            <Text style={styles.bigCardSubtitle}>
              Create mood boards and folders to organize your notes, photos, song links, checklists, and voice memos.
            </Text>

            <Pressable
              onPress={() => openCreateSheet('board', 'new-board')}
              style={({ pressed }) => [
                styles.bigAddBtn,
                { backgroundColor: currentThemeColors.accent },
                pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
              ]}
            >
              <FolderPlus size={16} color="#FFFFFF" />
              <Text style={styles.bigAddBtnText}>Create Board</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* 3. Consecutive 3-Column Grid: Boards and '+ New Board' Card sit right next to each other */
        <View style={styles.boardsGrid}>
          {visibleBoards.map((board: Board) => (
            <PastelBoardCard
              key={board.id}
              boardId={board.id}
              title={board.title}
              subtitle={board.pins.length === 1 ? '1 item' : `${board.pins.length} items`}
              backgroundColor={board.colorHex || colors.paper.sakura}
              pins={board.pins}
              onPress={() => handleBoardClick(board.id)}
            />
          ))}

          {/* '+ New Board' Card sits immediately next to the last board card! */}
          <Pressable
            onPress={() => openCreateSheet('board', 'new-board')}
            style={({ pressed }) => [styles.newBoardCard, pressed && styles.btnPressed]}
          >
            <View style={[styles.newBoardPlusCircle, { backgroundColor: currentThemeColors.moodBg }]}>
              <Plus size={16} color={currentThemeColors.accent} strokeWidth={2.4} />
            </View>
            <Text style={[styles.newBoardTitle, { color: currentThemeColors.primary }]}>New Board</Text>
            <Text style={styles.newBoardSub}>Create folder</Text>
          </Pressable>
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
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 60,
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
  titleWithHeart: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandCommon: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    fontWeight: '300', // Sleek Thin weight
    letterSpacing: -0.4,
  },
  brandPlace: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    fontWeight: '800', // Juicy Bold weight
    letterSpacing: -0.4,
  },
  brandHeart: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    marginLeft: 4,
    fontWeight: '700',
  },
  moodCapsule: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  moodCapsuleText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  vaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  vaultBtnActive: {
    backgroundColor: '#F3E8FF',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  vaultBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  vaultBtnTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  searchBtnSquare: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  emptyStateContainer: {
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNewBoardCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(244, 114, 182, 0.4)',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    position: 'relative',
  },
  bigPlusCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  bigCardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 19,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  bigCardSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink.tertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  bigAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 22,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bigAddBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  newBoardCard: {
    width: '31.4%',
    minHeight: 154,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(244, 114, 182, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 10,
    gap: 4,
  },
  newBoardPlusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  newBoardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  newBoardSub: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    color: colors.ink.tertiary,
    textAlign: 'center',
  },
});
