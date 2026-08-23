import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Tape } from '../common/Tape';
import { Pin } from '../../types';

interface PastelBoardCardProps {
  boardId: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  pins?: Pin[];
  onPress: () => void;
}

export const PastelBoardCard: React.FC<PastelBoardCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  pins = [],
  onPress,
}) => {
  const renderPreview = () => {
    // If the user has added pins to this board, preview their actual items!
    if (pins && pins.length > 0) {
      const firstPin = pins[0];
      const secondPin = pins[1];

      return (
        <View style={styles.collageContainer}>
          {(firstPin as any)?.imageUrl ? (
            <View style={styles.previewPhotoWrap}>
              <Image source={{ uri: (firstPin as any).imageUrl }} style={styles.previewImg} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.previewNoteWrap}>
              <Tape variant="top-center" width={18} height={5} color="rgba(245, 158, 11, 0.82)" />
              <Text style={styles.previewNoteText} numberOfLines={3}>
                {(firstPin as any)?.body || firstPin?.title || 'Note'}
              </Text>
            </View>
          )}

          {secondPin && (
            <View style={styles.secondPreviewWrap}>
              {(secondPin as any).imageUrl ? (
                <Image source={{ uri: (secondPin as any).imageUrl }} style={styles.previewImg} resizeMode="cover" />
              ) : (
                <Text style={styles.secondNoteText} numberOfLines={2}>
                  {secondPin.title || (secondPin as any).body || ''}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    }

    // Clean Empty Board Journal Pocket
    return (
      <View style={styles.emptyPocket}>
        <View style={styles.pocketInner}>
          <Text style={styles.emptyPocketText}>+ Tap to open</Text>
        </View>
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        { backgroundColor },
        pressed && styles.cardPressed,
      ]}
    >
      <Tape variant="top-center" width={32} height={8} color="rgba(255, 255, 255, 0.7)" />

      <View style={styles.headerArea}>
        <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
        <View style={styles.subtitlePill}>
          <Text style={styles.subtitleText}>{pins.length === 1 ? '1 item ♡' : `${pins.length} items ♡`}</Text>
        </View>
      </View>

      <View style={styles.bodyCollageArea}>
        {renderPreview()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '31.4%',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 8,
    marginBottom: 10,
    minHeight: 154,
    justifyContent: 'space-between',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  headerArea: {
    marginBottom: 6,
    gap: 3,
  },
  titleText: {
    fontFamily: typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
    lineHeight: 16,
  },
  subtitlePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subtitleText: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    color: colors.ink.secondary,
    fontWeight: '600',
  },
  bodyCollageArea: {
    flex: 1,
    height: 76,
    position: 'relative',
    overflow: 'hidden',
  },
  collageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewPhotoWrap: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 44,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  previewNoteWrap: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 46,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  previewNoteText: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    lineHeight: 11,
    color: colors.ink.primary,
  },
  secondPreviewWrap: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 40,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  secondNoteText: {
    fontFamily: typography.families.sans,
    fontSize: 8.5,
    color: colors.ink.secondary,
    textAlign: 'center',
  },
  emptyPocket: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pocketInner: {
    width: '94%',
    height: 52,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  emptyPocketText: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.ink.tertiary,
    letterSpacing: 0.2,
  },
});
