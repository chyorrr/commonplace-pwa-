import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ViewStyle } from 'react-native';
import { Board, Pin, PhotoPin } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { Lock } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Tape } from '../common/Tape';

interface BoardCoverCollageProps {
  board: Board;
  onPress: () => void;
  rotation?: number;
  style?: ViewStyle;
}

export const BoardCoverCollage: React.FC<BoardCoverCollageProps> = ({ board, onPress, rotation = 0, style }) => {
  const { unlockedBoards } = useApp();
  const isLocked = board.isLocked && !unlockedBoards.has(board.id);

  const previewPins = board.pins.slice(0, 4);
  const photoPins = previewPins.filter((p) => p.type === 'photo') as PhotoPin[];
  const previewPhotos = photoPins.slice(0, 2).map((p) => p.imageUrl);

  const displayPhotos = previewPhotos;

  const renderContentTile = (pin: Pin, index: number) => {
    const tint = board.accentColor || colors.accents.lavender;
    if (pin.type === 'photo') {
      return (
        <View key={pin.id} style={[styles.previewTile, styles.photoTile, index === 0 ? styles.largeTile : styles.smallTile]}>
          <Image source={{ uri: (pin as PhotoPin).imageUrl }} style={styles.previewImage} resizeMode="cover" />
        </View>
      );
    }

    const label =
      pin.type === 'text'
        ? pin.body.slice(0, 54)
        : pin.type === 'thought'
        ? pin.thought.slice(0, 54)
        : pin.type === 'quote'
        ? pin.quote.slice(0, 54)
        : pin.type === 'music'
        ? `${pin.songTitle} · ${pin.artist}`
        : pin.type === 'link'
        ? pin.headline
        : pin.type === 'checklist'
        ? pin.title
        : pin.type === 'journal'
        ? pin.headline
        : 'saved memory';

    return (
      <View
        key={pin.id}
        style={[
          styles.previewTile,
          styles.textTile,
          index === 0 ? styles.largeTile : styles.smallTile,
          { backgroundColor: `${tint}18`, borderColor: `${tint}22` },
        ]}
      >
        <Text style={[styles.previewLabel, { color: board.accentColor || colors.accents.lavender }]} numberOfLines={3}>
          {label}
        </Text>
        <Text style={styles.previewType}>{pin.type}</Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.collageCard,
        shadows.paperCard,
        rotation !== 0 && { transform: [{ rotate: `${rotation}deg` }] },
        style,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.collageFrame}>
        <View style={[styles.paperBackdrop, { backgroundColor: board.accentColor ? `${board.accentColor}14` : '#F5F0F8' }]} />
        <View style={[styles.contentStripe, { backgroundColor: board.accentColor || colors.accents.lavender }]} />
        <View style={styles.previewGrid}>
          {previewPins.length > 0 ? (
            <>
              {renderContentTile(previewPins[0], 0)}
              {previewPins[1] ? renderContentTile(previewPins[1], 1) : null}
            </>
          ) : (
            <>
              <View style={[styles.previewTile, styles.largeTile, styles.emptyTile, { backgroundColor: '#FDFBF7' }]}> 
                <Text style={styles.emptyTileTitle} numberOfLines={2}>
                  {board.title}
                </Text>
                <Text style={styles.emptyTileMeta}>{board.subtitle || 'a place to begin'}</Text>
              </View>
              <View style={[styles.previewTile, styles.smallTile, styles.emptyTile, { backgroundColor: board.accentColor ? `${board.accentColor}18` : '#EFF6FA' }]}> 
                <Text style={styles.emptyTileCount}>{board.pins.length}</Text>
                <Text style={styles.emptyTileMeta}>items</Text>
              </View>
            </>
          )}
        </View>

        {previewPins[0] ? (
          <View style={styles.metaRibbon}>
            <Text style={styles.metaText} numberOfLines={1}>
              {previewPins[0].title || board.title}
            </Text>
            <Text style={styles.metaCount}>{board.pins.length} items</Text>
          </View>
        ) : null}

        {/* Lock overlay if private */}
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <View style={styles.lockIconCircle}>
              <Lock size={14} color="#FFF" />
            </View>
            <Text style={styles.lockedText}>locked</Text>
          </View>
        )}
      </View>

      {/* Board Information */}
      <View style={styles.infoBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {board.title}
          </Text>
          {isLocked && (
            <Lock size={12} color={colors.accents.terracotta} strokeWidth={2} />
          )}
        </View>

        {board.subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {board.subtitle}
          </Text>
        ) : null}

        <View style={styles.bottomMeta}>
          <Text style={styles.countText}>
            {board.pins.length} {board.pins.length === 1 ? 'item' : 'items'}
          </Text>
          <View style={styles.atmospherePill}>
            <Text style={styles.atmosphereLabel}>
              {board.atmosphere === 'periwinkle' ? 'sky' : board.atmosphere}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  collageCard: {
    backgroundColor: '#FBF7F2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(104, 86, 72, 0.09)',
    padding: 10,
    marginBottom: 14,
    shadowColor: '#4B4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  collageFrame: {
    height: 166,
    width: '100%',
    position: 'relative',
    borderRadius: 14,
    backgroundColor: '#F1E8DE',
    overflow: 'hidden',
  },
  paperBackdrop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 12,
    borderRadius: 12,
  },
  contentStripe: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 42,
    height: 6,
    borderRadius: 999,
  },
  previewGrid: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  previewTile: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  largeTile: {
    flex: 1.18,
  },
  smallTile: {
    flex: 0.82,
  },
  photoTile: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyTile: {
    padding: 12,
    justifyContent: 'space-between',
  },
  emptyTileTitle: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink.primary,
    flex: 1,
  },
  emptyTileCount: {
    fontFamily: typography.families.serif,
    fontSize: 26,
    lineHeight: 28,
    color: colors.ink.primary,
  },
  emptyTileMeta: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  textTile: {
    padding: 12,
    justifyContent: 'space-between',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewLabel: {
    fontFamily: typography.families.serif,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  previewType: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  metaRibbon: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.primary,
    marginRight: 8,
  },
  metaCount: {
    fontFamily: typography.families.mono,
    fontSize: 9.5,
    color: colors.ink.tertiary,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 26, 34, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 4,
  },
  lockIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accents.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoBlock: {
    paddingTop: 11,
    paddingHorizontal: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  titleText: {
    fontFamily: typography.families.serif,
    fontSize: 16.5,
    fontWeight: '500',
    color: colors.ink.primary,
    flex: 1,
  },
  subtitleText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    marginTop: 1,
  },
  bottomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  countText: {
    fontFamily: typography.families.mono,
    fontSize: 10.5,
    color: colors.ink.tertiary,
  },
  atmospherePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(152, 132, 186, 0.1)',
  },
  atmosphereLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '500',
    color: colors.accents.lavender,
    textTransform: 'capitalize',
  },
});
