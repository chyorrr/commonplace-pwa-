import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { PhotoPin as PhotoPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface PhotoPinProps {
  pin: PhotoPinType;
  onPress?: () => void;
}

export const PhotoPin: React.FC<PhotoPinProps> = ({ pin, onPress }) => {
  const photoUri = pin.imageUrl || (pin as any).url;

  return (
    <PaperCard
      rotation={pin.rotation}
      paperTone="cream"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.polaroidContainer}
    >
      {/* Photo Frame */}
      <View style={styles.imageWrapper} pointerEvents="none">
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Handwritten Caption & Date */}
      {Boolean(pin.caption || pin.handwrittenDate || pin.location) && (
        <View style={styles.captionArea} pointerEvents="none">
          {!!pin.caption && (
            <Text style={styles.captionText}>{pin.caption}</Text>
          )}

          <View style={styles.metaRow}>
            {!!pin.location && <Text style={styles.locationText}>{pin.location}</Text>}
            {!!pin.handwrittenDate && (
              <Text style={styles.dateText}>{pin.handwrittenDate}</Text>
            )}
          </View>
        </View>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  polaroidContainer: {
    padding: 7,
    paddingBottom: 10,
    backgroundColor: '#FDFBF7',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#EAE5DC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  captionArea: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  captionText: {
    fontFamily: typography.families.handwritten,
    fontSize: 17,
    lineHeight: 20,
    color: colors.ink.handwritten,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  locationText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
    textTransform: 'lowercase',
  },
  dateText: {
    fontFamily: typography.families.handwritten,
    fontSize: 14.5,
    color: colors.ink.handwrittenFaded,
    marginLeft: 'auto',
  },
});
