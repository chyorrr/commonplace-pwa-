import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuotePin as QuotePinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface QuotePinProps {
  pin: QuotePinType;
  onPress?: () => void;
}

export const QuotePin: React.FC<QuotePinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone="parchment"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.quoteCard}
    >
      <Text style={styles.openQuote}>“</Text>
      
      <Text style={styles.quoteBody}>
        {pin.quote}
      </Text>

      {Boolean(pin.author || pin.source) && (
        <View style={styles.citationBlock}>
          {!!pin.author && (
            <Text style={styles.authorText}>— {pin.author}</Text>
          )}
          {!!pin.source && (
            <Text style={styles.sourceText}>
              {pin.source} {pin.year ? `(${pin.year})` : ''}
            </Text>
          )}
        </View>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  quoteCard: {
    padding: 18,
  },
  openQuote: {
    fontFamily: typography.families.serif,
    fontSize: 34,
    lineHeight: 28,
    color: colors.accents.ochre,
    opacity: 0.6,
    marginBottom: -4,
  },
  quoteBody: {
    fontFamily: typography.families.serif,
    fontSize: 16.5,
    lineHeight: 25,
    color: colors.ink.primary,
  },
  citationBlock: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  authorText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
    letterSpacing: 0.3,
  },
  sourceText: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
    marginTop: 2,
  },
});
