import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Download, Smartphone, X, Layers } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  isStandalone, 
  isIOS, 
  shouldShowInstallPrompt, 
  markInstallPromptDismissed, 
  triggerNativeInstallPrompt,
  subscribeInstallPrompt
} from '../../utils/pwaUtils';
import { useApp } from '../../context/AppContext';

export const PWAInstallBanner: React.FC = () => {
  const { openInstallModal } = useApp();
  const [visible, setVisible] = useState(false);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [slideAnim] = useState(new Animated.Value(60));

  useEffect(() => {
    // Check if already installed
    if (isStandalone()) {
      setVisible(false);
      return;
    }

    // Subscribe to browser install prompt availability
    const unsubscribe = subscribeInstallPrompt((canInstall) => {
      setCanDirectInstall(canInstall);
    });

    // Check after a pleasant 2.5s delay on initial page load
    const timer = setTimeout(() => {
      if (!isStandalone() && shouldShowInstallPrompt()) {
        setVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (!visible) return null;

  const handleDismiss = (e?: any) => {
    e?.stopPropagation?.();
    markInstallPromptDismissed();
    Animated.timing(slideAnim, {
      toValue: 80,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleAction = async () => {
    if (canDirectInstall) {
      const { outcome } = await triggerNativeInstallPrompt();
      if (outcome === 'accepted') {
        handleDismiss();
      }
    } else {
      openInstallModal();
      handleDismiss();
    }
  };

  const isApple = isIOS();

  return (
    <Animated.View style={[styles.bannerContainer, { transform: [{ translateY: slideAnim }] }]}>
      <Pressable style={styles.bannerCard} onPress={handleAction}>
        {/* App Icon Capsule */}
        <View style={styles.iconCircle}>
          {isApple ? (
            <Smartphone size={16} color="#FFFFFF" strokeWidth={2.2} />
          ) : (
            <Download size={16} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </View>

        {/* Text Details */}
        <View style={styles.textCol}>
          <Text style={styles.bannerTitle}>
            {isApple ? 'Add to Home Screen' : 'Install Commonplace'}
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {isApple
              ? 'Fullscreen mode & offline access'
              : '1-tap install for offline scrapbook access'}
          </Text>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={handleAction}
          style={({ pressed }) => [styles.actionPill, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.actionPillText}>
            {canDirectInstall ? 'Install' : 'View'}
          </Text>
        </Pressable>

        {/* Close Button */}
        <Pressable
          onPress={handleDismiss}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <X size={14} color={colors.ink.secondary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    maxWidth: 440,
    alignSelf: 'center',
    zIndex: 9999,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#1E1B24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.brand.purpleDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  bannerSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.secondary,
    marginTop: 1,
  },
  actionPill: {
    backgroundColor: colors.brand.purpleDark,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
