import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { Tape } from './Tape';
import { AttachedSticker } from '../../types';
import { useApp } from '../../context/AppContext';

export interface PaperCardProps {
  children: React.ReactNode;
  style?: any;
  rotation?: number;
  paperTone?: 'lilac' | 'peach' | 'butter' | 'sage' | 'sky' | 'blush' | 'matcha' | 'vanilla' | 'cream' | 'linen' | 'cotton' | 'parchment' | 'kraft' | 'darkPaper';
  tapeStyle?: 'top-center' | 'top-corners' | 'diagonal-left' | 'none';
  tapeColor?: string;
  onPress?: () => void;
  isLifted?: boolean;
  stickers?: AttachedSticker[];
  borderStyle?: 'subtle' | 'deckle' | 'none';
}

export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  style,
  rotation = 0,
  paperTone = 'lilac',
  tapeStyle = 'none',
  tapeColor,
  onPress,
  isLifted = false,
  stickers = [],
  borderStyle = 'subtle',
}) => {
  const { stickers: stickerLibrary } = useApp();

  const getBackgroundColor = () => {
    switch (paperTone) {
      case 'lilac':
        return colors.paper.lilac;
      case 'peach':
      case 'parchment':
        return colors.paper.peach;
      case 'butter':
        return colors.paper.butter;
      case 'sage':
        return colors.paper.sage;
      case 'sky':
      case 'linen':
        return colors.paper.sky;
      case 'blush':
        return colors.paper.blush;
      case 'matcha':
        return colors.paper.matcha;
      case 'vanilla':
      case 'cream':
        return colors.paper.vanilla;
      case 'darkPaper':
        return colors.paper.dark;
      default:
        return colors.paper.lilac;
    }
  };

  const getStickerImage = (stickerId: string) => {
    return stickerLibrary.find((s) => s.id === stickerId)?.imageUrl;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: getBackgroundColor(),
          transform: [
            { rotate: `${rotation}deg` },
            { scale: pressed ? 0.985 : 1 },
          ],
        },
        isLifted ? shadows.paperLifted : shadows.paperCard,
        borderStyle === 'subtle' && styles.subtleBorder,
        borderStyle === 'deckle' && styles.deckleBorder,
        style,
      ]}
    >
      {/* Tape attachment if present */}
      {tapeStyle && tapeStyle !== 'none' && (
        <Tape variant={tapeStyle} tapeColor={tapeColor} />
      )}

      {/* Card Content */}
      <View style={styles.innerContent}>{children}</View>

      {/* User placed stickers with contour cut & dynamic sizing */}
      {stickers.map((st) => {
        const url = getStickerImage(st.stickerId);
        if (!url) return null;

        const baseSize =
          st.sizePreset === 'sm'
            ? 32
            : st.sizePreset === 'lg'
            ? 64
            : st.sizePreset === 'xl'
            ? 84
            : 48;
        const finalDim = Math.round(baseSize * (st.scale || 1));

        return (
          <View
            key={st.id}
            style={[
              styles.placedSticker,
              {
                width: finalDim,
                height: finalDim,
                left: `${st.xPercent}%`,
                top: `${st.yPercent}%`,
                transform: [{ rotate: `${st.rotation || 0}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.dieCutContourWrap,
                st.contourStyle === 'glow' && styles.contourGlow,
                st.contourStyle === 'stamp' && styles.contourStamp,
                st.contourStyle === 'badge' && styles.contourBadge,
              ]}
            >
              <Image
                source={{ uri: url }}
                style={styles.stickerImg}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    position: 'relative',
    overflow: 'visible',
    marginVertical: 6,
  },
  subtleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.045)',
  },
  deckleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(152, 132, 186, 0.15)',
  },
  innerContent: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  placedSticker: {
    position: 'absolute',
    zIndex: 30,
    pointerEvents: 'none',
  },
  dieCutContourWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  contourGlow: {
    borderColor: '#F472B6',
    borderWidth: 2,
    shadowColor: '#EC4899',
    shadowOpacity: 0.35,
  },
  contourStamp: {
    borderColor: '#D97706',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 8,
  },
  contourBadge: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  stickerImg: {
    width: '100%',
    height: '100%',
  },
});
