import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ThoughtPin as ThoughtPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface ThoughtPinProps {
  pin: ThoughtPinType;
  onPress?: () => void;
}

export const ThoughtPin: React.FC<ThoughtPinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone="peach"
      tapeStyle="none"
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.thoughtContainer}
    >
      <Text
        style={[
          styles.thoughtText,
          pin.isHandwritten ? styles.handwrittenStyle : styles.serifStyle,
        ]}
      >
        "{pin.thought}"
      </Text>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  thoughtContainer: {
    padding: 16,
    paddingVertical: 18,
  },
  thoughtText: {
    lineHeight: 22,
    color: colors.ink.handwritten,
  },
  handwrittenStyle: {
    fontFamily: typography.families.handwritten,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink.handwritten,
  },
  serifStyle: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink.secondary,
  },
});
