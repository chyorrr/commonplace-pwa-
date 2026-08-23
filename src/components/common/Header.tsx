import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ArrowLeft, Lock, Unlock, Grid, Move, Palette, Plus, HelpCircle } from 'lucide-react-native';

interface HeaderProps {
  onOpenAtmosphere?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAtmosphere }) => {
  const {
    activeTab,
    activeBoard,
    setActiveBoardId,
    isFreeformMode,
    setIsFreeformMode,
    unlockedBoards,
    openLockModal,
    lockBoard,
    openCreateSheet,
    openSettings,
  } = useApp();

  const isInsideBoard = !!activeBoard;
  const isLockedBoard = activeBoard?.isLocked && !unlockedBoards.has(activeBoard.id);

  const getFormattedDate = () => {
    const now = new Date();
    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
    const month = now.toLocaleDateString(undefined, { month: 'short' }).toLowerCase();
    const day = now.getDate();
    return `${weekday}, ${month} ${day}`;
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Top row */}
      <View style={styles.topRow}>
        {isInsideBoard ? (
          <Pressable
            onPress={() => setActiveBoardId(null)}
            style={({ pressed }: { pressed: boolean }) => [styles.backButton, pressed && styles.buttonPressed]}
            hitSlop={12}
          >
            <ArrowLeft size={17} color={colors.ink.primary} strokeWidth={1.8} />
            <Text style={styles.backLabel}>boards</Text>
          </Pressable>
        ) : (
          <View style={styles.branding}>
            <Text style={styles.dateSubtitle}>{getFormattedDate()}</Text>
            <Text style={styles.heroBrand}>commonplace</Text>
          </View>
        )}

        {/* Right side controls */}
        <View style={styles.actionsRight}>
          {/* Permanent Help & Settings trigger on Home / Screens */}
          {!isInsideBoard && (
            <Pressable
              onPress={openSettings}
              style={({ pressed }: { pressed: boolean }) => [styles.iconBtn, pressed && styles.buttonPressed]}
              hitSlop={8}
            >
              <HelpCircle size={17} color={colors.ink.secondary} strokeWidth={1.6} />
            </Pressable>
          )}

          {isInsideBoard ? (
            <>
              {/* Atmosphere palette toggle */}
              <Pressable
                onPress={onOpenAtmosphere}
                style={({ pressed }: { pressed: boolean }) => [styles.iconBtn, pressed && styles.buttonPressed]}
                hitSlop={8}
              >
                <Palette size={16} color={colors.ink.secondary} strokeWidth={1.6} />
              </Pressable>

              {/* Freeform Desk vs Masonry Layout Toggle */}
              <Pressable
                onPress={() => setIsFreeformMode((prev) => !prev)}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.toggleBtn,
                  isFreeformMode && styles.toggleBtnActive,
                  pressed && styles.buttonPressed,
                ]}
                hitSlop={8}
              >
                {isFreeformMode ? (
                  <>
                    <Grid size={13} color="#FFF" strokeWidth={2} />
                    <Text style={styles.toggleTextActive}>grid</Text>
                  </>
                ) : (
                  <>
                    <Move size={13} color={colors.ink.primary} strokeWidth={1.8} />
                    <Text style={styles.toggleText}>desk</Text>
                  </>
                )}
              </Pressable>

              {/* Lock / Unlock button for board */}
              {Boolean(activeBoard.isLocked) && (
                <Pressable
                  onPress={() => {
                    if (isLockedBoard) {
                      openLockModal(activeBoard.id);
                    } else {
                      lockBoard(activeBoard.id);
                    }
                  }}
                  style={({ pressed }: { pressed: boolean }) => [styles.iconBtn, pressed && styles.buttonPressed]}
                  hitSlop={8}
                >
                  {isLockedBoard ? (
                    <Lock size={15} color={colors.accents.terracotta} strokeWidth={1.8} />
                  ) : (
                    <Unlock size={15} color={colors.accents.sageOlive} strokeWidth={1.8} />
                  )}
                </Pressable>
              )}
            </>
          ) : activeTab === 'desk' ? (
            <View style={styles.deskTag}>
              <Text style={styles.deskTagText}>inbox</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => openCreateSheet('board')}
              style={({ pressed }: { pressed: boolean }) => [styles.smallAddBtn, pressed && styles.buttonPressed]}
            >
              <Plus size={13} color="#FFF" strokeWidth={2.4} />
              <Text style={styles.smallAddBtnText}>add</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* When inside a board, show the board's editorial title and subtitle */}
      {Boolean(isInsideBoard && activeBoard) && (
        <View style={styles.boardTitleBlock}>
          <Text style={styles.boardTitle}>{activeBoard.title}</Text>
          {!!activeBoard.subtitle && (
            <Text style={styles.boardSubtitle}>{activeBoard.subtitle}</Text>
          )}
          <View style={styles.boardMetaRow}>
            <Text style={styles.pinCount}>
              {activeBoard.pins.length} {activeBoard.pins.length === 1 ? 'item' : 'items'}
            </Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.atmosphereBadge}>{activeBoard.atmosphere}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 99, 210, 0.08)',
    backgroundColor: 'rgba(252, 250, 246, 0.94)',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  branding: {
    flexDirection: 'column',
  },
  dateSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink.tertiary,
    marginBottom: 2,
  },
  heroBrand: {
    ...typography.styles.heroTitle,
    fontSize: 25,
    lineHeight: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backLabel: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    color: colors.ink.primary,
    fontWeight: '500',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(104, 86, 72, 0.06)',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(104, 86, 72, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(104, 86, 72, 0.08)',
  },
  toggleBtnActive: {
    backgroundColor: colors.ink.primary,
    borderColor: colors.ink.primary,
  },
  toggleText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  toggleTextActive: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#FFF',
  },
  deskTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(152, 132, 186, 0.14)',
  },
  deskTagText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.accents.lavender,
    textTransform: 'uppercase',
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.ink.primary,
  },
  smallAddBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF',
  },
  boardTitleBlock: {
    marginTop: 10,
    paddingBottom: 4,
  },
  boardTitle: {
    ...typography.styles.boardTitle,
    fontSize: 23,
    lineHeight: 27,
  },
  boardSubtitle: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  boardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  pinCount: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.ink.faded,
  },
  atmosphereBadge: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    textTransform: 'lowercase',
  },
});
