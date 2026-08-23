import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const compressImageFile = (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75,
  autoCrop = true
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If already small SVG or WebP, read directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}

        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        let srcX = 0;
        let srcY = 0;
        let srcW = origW;
        let srcH = origH;

        // Smart Auto-Crop: automatically center-crops to clean 1:1 / 4:5 balanced frame without manual effort
        if (autoCrop && origW > 0 && origH > 0) {
          const minDim = Math.min(origW, origH);
          srcW = minDim;
          srcH = minDim;
          srcX = (origW - minDim) / 2;
          srcY = (origH - minDim) / 2;
        }

        const targetW = Math.min(srcW, maxWidth);
        const targetH = Math.min(srcH, maxHeight);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
          return;
        }

        // Draw cropped centered photo
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (e) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
      };

      img.onerror = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to load image'));
        reader.readAsDataURL(file);
      };

      img.src = objectUrl;
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(err);
      reader.readAsDataURL(file);
    }
  });
};

export const pickImageFromDevice = async (
  callback: (base64Url: string, fileName?: string) => void
): Promise<void> => {
  // On Native (Expo Go on iOS / Android)
  if (Platform.OS !== 'web') {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access photos is needed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Disables manual OS crop/resize screen
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageSource = asset.uri || (asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '');
        callback(imageSource, asset.fileName || 'photo.jpg');
      }
    } catch (err) {
      console.warn('Native ImagePicker error:', err);
    }
    return;
  }

  // On Web
  if (typeof document === 'undefined') {
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.position = 'fixed';
  input.style.top = '-9999px';
  input.style.left = '-9999px';
  input.style.opacity = '0';
  input.style.zIndex = '-1';

  document.body.appendChild(input);

  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImageFile(file, 800, 800, 0.75, true);
        callback(compressedBase64, file.name);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            callback(event.target.result as string, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 1000);
  };

  try {
    input.click();
  } catch (err) {
    console.warn('Direct file click fallback:', err);
  }
};
