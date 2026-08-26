import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TextPin as TextPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography, getFontFamily } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface TextPinProps {
  pin: TextPinType;
  onPress?: () => void;
}

export const TextPin: React.FC<TextPinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone={pin.paperTone || 'cream'}
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.textContainer}
    >
      {!!pin.title && (
        <Text style={styles.titleText}>{pin.title}</Text>
      )}

      {!!pin.imageUrl && (
        <View style={styles.noteImageWrap}>
          <Image source={{ uri: pin.imageUrl }} style={styles.noteImage} resizeMode="cover" />
        </View>
      )}

      <Text style={[styles.bodyText, { fontFamily: getFontFamily(pin.fontStyle) }]}>
        {pin.body}
      </Text>

      {!!pin.authorNote && (
        <View style={styles.authorNoteContainer}>
          <Text style={styles.authorNoteText}>— {pin.authorNote}</Text>
        </View>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    padding: 16,
    paddingTop: 18,
  },
  titleText: {
    fontFamily: typography.families.serif,
    fontSize: 17,
    fontWeight: '500',
    color: colors.ink.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  noteImageWrap: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  noteImage: {
    width: '100%',
    height: '100%',
  },
  bodyText: {
    fontFamily: typography.families.serif,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink.secondary,
  },
  authorNoteContainer: {
    marginTop: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  authorNoteText: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
  },
});
