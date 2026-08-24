import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ActivityIndicator } from 'react-native';
import { compressImageFile } from '../../utils/imagePicker';
import { Camera, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface DeviceImagePickerProps {
  onImageSelected: (base64Url: string, fileName?: string) => void;
  children?: React.ReactNode;
  style?: any;
  accept?: string;
  buttonLabel?: string;
}

export const DeviceImagePicker: React.FC<DeviceImagePickerProps> = ({
  onImageSelected,
  children,
  style,
  accept = 'image/*',
  buttonLabel = 'Upload Photo from Phone / Camera',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedName, setLoadedName] = useState('');

  // 1. Native Image Picking for Expo Go on iOS & Android
  const handleNativePress = async () => {
    try {
      setIsLoading(true);
      const ImagePicker = require('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access photos is needed.');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Disables OS crop/resize screen!
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Use URI on native for instant rendering without memory lag
        const imageSource = asset.uri || (asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '');
        const name = asset.fileName || 'photo.jpg';
        setLoadedName(name);
        onImageSelected(imageSource, name);
      }
      setIsLoading(false);
    } catch (err) {
      console.warn('Expo ImagePicker error:', err);
      setIsLoading(false);
    }
  };

  // 2. Web File Change for Browsers (Desktop & Mobile Web)
  const handleWebFileChange = async (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setLoadedName(file.name);
      const base64 = await compressImageFile(file);
      onImageSelected(base64, file.name);
      setIsLoading(false);
    } catch (err) {
      console.warn('Compression error, fallback to direct reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string, file.name);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setIsLoading(false);
        alert('Could not read image file.');
      };
      reader.readAsDataURL(file);
    }
    try {
      e.target.value = '';
    } catch (err) {}
  };

  // Render Box Content
  const renderContent = () => {
    if (children) return children;

    return (
      <View style={styles.defaultBox}>
        {isLoading ? (
          <View style={styles.contentRow}>
            <ActivityIndicator size="small" color={colors.brand.purple} />
            <Text style={styles.loadingText}>Loading photo...</Text>
          </View>
        ) : loadedName ? (
          <View style={styles.contentRow}>
            <Check size={18} color="#15803D" />
            <Text style={styles.successText}>Attached: {loadedName}</Text>
          </View>
        ) : (
          <View style={styles.boxInner}>
            <View style={styles.iconCircle}>
              <Camera size={20} color={colors.brand.purple} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.primaryTitle}>{buttonLabel}</Text>
              <Text style={styles.secondarySub}>Tap here to choose from Camera or Gallery</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // On Native Expo Go (iOS / Android), wrap in Pressable and call ImagePicker
  if (Platform.OS !== 'web') {
    return (
      <Pressable onPress={handleNativePress} style={[styles.container, style]}>
        {renderContent()}
      </Pressable>
    );
  }

  // On Web, overlay HTML file input
  return (
    <View style={[styles.container, style]}>
      <input
        type="file"
        accept={accept}
        onChange={handleWebFileChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          zIndex: 999,
          margin: 0,
          padding: 0,
          display: 'block',
        }}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  defaultBox: {
    width: '100%',
    minHeight: 64,
    backgroundColor: '#FAF5FF',
    borderWidth: 2,
    borderColor: '#C4B5FD',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  primaryTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  secondarySub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.brand.purple,
    fontWeight: '600',
  },
  successText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: '#15803D',
    fontWeight: '700',
  },
});
