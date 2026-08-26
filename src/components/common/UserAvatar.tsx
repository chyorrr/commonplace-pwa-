import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { 
  Camera, 
  Feather, 
  Leaf, 
  Coffee, 
  BookOpen, 
  Moon, 
  Palette, 
  Compass, 
  Sun, 
  Heart 
} from 'lucide-react-native';
import { AVATAR_PRESETS, AvatarIconType } from '../../data/avatarPresets';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface UserAvatarProps {
  avatarUrl?: string;
  name?: string;
  size?: number;
  style?: any;
  showBorder?: boolean;
}

const renderPresetIcon = (iconType: AvatarIconType, size: number, color: string) => {
  const iconSize = Math.round(size * 0.48);
  const strokeWidth = 2;

  switch (iconType) {
    case 'camera':
      return <Camera size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'quill':
      return <Feather size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'leaf':
      return <Leaf size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'coffee':
      return <Coffee size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'book':
      return <BookOpen size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'moon':
      return <Moon size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'palette':
      return <Palette size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'compass':
      return <Compass size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'sun':
      return <Sun size={iconSize} color={color} strokeWidth={strokeWidth} />;
    case 'heart':
      return <Heart size={iconSize} color={color} strokeWidth={strokeWidth} />;
    default:
      return <Camera size={iconSize} color={color} strokeWidth={strokeWidth} />;
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name = 'User',
  size = 40,
  style,
  showBorder = true,
}) => {
  const isPreset = avatarUrl?.startsWith('avatar:');
  const preset = isPreset ? AVATAR_PRESETS.find((p) => p.id === avatarUrl) : null;
  const isImage = avatarUrl && (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http') || avatarUrl.startsWith('/'));

  const borderRadius = Math.round(size * 0.32);

  if (isImage) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            borderWidth: showBorder ? 1 : 0,
            borderColor: 'rgba(0, 0, 0, 0.08)',
          },
          style,
        ]}
      >
        <Image source={{ uri: avatarUrl }} style={[styles.image, { borderRadius }]} />
      </View>
    );
  }

  if (preset) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: preset.bg,
            borderWidth: showBorder ? 1 : 0,
            borderColor: preset.border,
          },
          style,
        ]}
      >
        {renderPresetIcon(preset.icon, size, preset.color)}
      </View>
    );
  }

  // Fallback initial typography
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'C';
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: '#EDE8FA',
          borderWidth: showBorder ? 1 : 0,
          borderColor: '#DDD6FE',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: typography.families.heading,
          fontSize: Math.round(size * 0.42),
          fontWeight: '700',
          color: colors.brand.purpleDark,
        }}
      >
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
