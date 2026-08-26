import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { JournalPin as JournalPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface JournalPinProps {
  pin: JournalPinType;
  onPress?: () => void;
}

export const JournalPin: React.FC<JournalPinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone="linen"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.journalCard}
    >
      <View style={styles.headerRow}>
        <Text style={styles.dateLabel}>{pin.dateLabel}</Text>
        {!!pin.weatherOrMood && (
          <Text style={styles.moodLabel}>{pin.weatherOrMood}</Text>
        )}
      </View>

      <Text style={styles.headline}>{pin.headline}</Text>

      {Boolean(pin.photoUrls && pin.photoUrls.length > 0) && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: pin.photoUrls[0] }}
            style={styles.inlinePhoto}
            resizeMode="cover"
          />
        </View>
      )}

      {pin.paragraphs.map((p, idx) => (
        <Text key={idx} style={styles.paragraphText}>
          {p}
        </Text>
      ))}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  journalCard: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
  },
  moodLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  headline: {
    fontFamily: typography.families.serif,
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink.primary,
    marginBottom: 10,
  },
  photoContainer: {
    width: '100%',
    height: 140,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#EBE5DC',
  },
  inlinePhoto: {
    width: '100%',
    height: '100%',
  },
  paragraphText: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink.secondary,
    marginBottom: 8,
  },
});
