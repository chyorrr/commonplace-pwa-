import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinkPin as LinkPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';

interface LinkPinProps {
  pin: LinkPinType;
  onPress?: () => void;
}

export const LinkPin: React.FC<LinkPinProps> = ({ pin, onPress }) => {
  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone="linen"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.linkContainer}
    >
      {!!pin.thumbnailUrl && (
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: pin.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.contentPad}>
        <View style={styles.siteRow}>
          <Text style={styles.siteName}>{pin.siteName}</Text>
          <Text style={styles.openText}>open</Text>
        </View>

        <Text style={styles.headlineText} numberOfLines={2}>
          {pin.headline}
        </Text>

        {!!pin.snippet && (
          <Text style={styles.snippetText} numberOfLines={3}>
            {pin.snippet}
          </Text>
        )}
      </View>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  linkContainer: {
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#EAE5DC',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  contentPad: {
    padding: 12,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  siteName: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  openText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headlineText: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  snippetText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink.secondary,
  },
});
