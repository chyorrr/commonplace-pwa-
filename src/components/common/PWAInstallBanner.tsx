import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Download, Share, Smartphone, X, Sparkles } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  isStandalone, 
  isIOS, 
  isAndroid, 
  shouldShowInstallPrompt, 
  markInstallPromptDismissed, 
  hasNativeInstallPrompt, 
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
            <Smartphone size={16} color="#FFFFFF" strokeWidth={2.4} />
          ) : (
            <Download size={16} color="#FFFFFF" strokeWidth={2.4} />
          )}
        </View>

        {/* Text Details */}
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.bannerTitle}>
              {isApple ? 'Add to Home Screen' : 'Install Commonplace'}
            </Text>
            <Sparkles size={11} color={colors.accents.sakura} />
          </View>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {isApple
              ? 'Tap to open 3-step guide for full screen'
              : '1-tap install for full-screen offline use'}
          </Text>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={handleAction}
          style={({ pressed }) => [styles.actionPill, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.actionPillText}>
            {canDirectInstall ? 'Install' : 'Get App'}
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
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 210, 0.16)',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    backgroundColor: colors.brand.purple,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 14,
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
