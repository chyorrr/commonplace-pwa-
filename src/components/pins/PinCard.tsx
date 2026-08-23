import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Pin } from '../../types';
import { PhotoPin } from './PhotoPin';
import { TextPin } from './TextPin';
import { ThoughtPin } from './ThoughtPin';
import { ChecklistPin } from './ChecklistPin';
import { QuotePin } from './QuotePin';
import { MusicPin } from './MusicPin';
import { VoiceNotePin } from './VoiceNotePin';
import { LinkPin } from './LinkPin';
import { CollagePin } from './CollagePin';
import { JournalPin } from './JournalPin';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Text } from 'react-native';

interface PinCardProps {
  pin: Pin;
  onPress?: () => void;
  showFavoriteBadge?: boolean;
}

export const PinCard: React.FC<PinCardProps> = ({
  pin,
  onPress,
  showFavoriteBadge = true,
}) => {
  const { setActivePinDetail, toggleFavoritePin } = useApp();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      setActivePinDetail(pin);
    }
  };

  const renderContent = () => {
    switch (pin.type) {
      case 'photo':
        return <PhotoPin pin={pin} onPress={handleCardPress} />;
      case 'text':
        return <TextPin pin={pin} onPress={handleCardPress} />;
      case 'thought':
        return <ThoughtPin pin={pin} onPress={handleCardPress} />;
      case 'checklist':
        return <ChecklistPin pin={pin} onPress={handleCardPress} />;
      case 'quote':
        return <QuotePin pin={pin} onPress={handleCardPress} />;
      case 'music':
        return <MusicPin pin={pin} onPress={handleCardPress} />;
      case 'voicenote':
        return <VoiceNotePin pin={pin} onPress={handleCardPress} />;
      case 'link':
        return <LinkPin pin={pin} onPress={handleCardPress} />;
      case 'collage':
        return <CollagePin pin={pin} onPress={handleCardPress} />;
      case 'journal':
        return <JournalPin pin={pin} onPress={handleCardPress} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardWrapper}>
      {renderContent()}

      {/* Floating favorite button */}
      {Boolean(showFavoriteBadge) && (
        <Pressable
          onPress={(e: any) => {
            e.stopPropagation?.();
            toggleFavoritePin(pin.id);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.favButton,
            pin.isFavorite && styles.favButtonActive,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={6}
        >
          <Text style={[styles.favButtonText, pin.isFavorite && styles.favButtonTextActive]}>fav</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  favButtonActive: {
    backgroundColor: '#FFF',
  },
  favButtonText: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.ink.tertiary,
  },
  favButtonTextActive: {
    color: colors.accents.terracotta,
  },
});
