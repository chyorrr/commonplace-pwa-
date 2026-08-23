import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { CollagePin as CollagePinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface CollagePinProps {
  pin: CollagePinType;
  onPress?: () => void;
}

export const CollagePin: React.FC<CollagePinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      rotation={pin.rotation}
      paperTone="parchment"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.collageCard}
    >
      <View style={styles.collageGrid}>
        {pin.items.map((item, idx) => (
          <View
            key={item.id || idx}
            style={[
              styles.itemFrame,
              {
                transform: [{ rotate: `${item.rotation || 0}deg` }],
                zIndex: idx + 1,
              },
            ]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>

      {!!pin.caption && (
        <Text style={styles.captionText}>{pin.caption}</Text>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  collageCard: {
    padding: 10,
  },
  collageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  itemFrame: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 3,
    padding: 3,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  captionText: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwritten,
    textAlign: 'center',
    marginTop: 8,
  },
});
