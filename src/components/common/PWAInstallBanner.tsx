import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Download, Smartphone, X, Layers } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  isStandalone, 
  isIOS, 
  triggerNativeInstallPrompt,
  subscribeInstallPrompt
} from '../../utils/pwaUtils';
import { useApp } from '../../context/AppContext';

export const PWAInstallBanner: React.FC = () => {
  const { openInstallModal, isAuthenticated } = useApp();
  const [visible, setVisible] = useState(false);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [slideAnim] = useState(new Animated.Value(60));

  useEffect(() => {
    // If running as standalone PWA app, never show install banner
    if (isStandalone()) {
      setVisible(false);
      return;
    }

    const unsubscribe = subscribeInstallPrompt((canInstall) => {
      setCanDirectInstall(canInstall);
    });

    // Auto-prompt on initial visit (before sign in) and also right after sign in
    const delayMs = isAuthenticated ? 2800 : 1800;
    const timer = setTimeout(() => {
      if (!isStandalone()) {
        setVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isAuthenticated]);

  if (!visible) return null;

  const handleDismiss = (e?: any) => {
    e?.stopPropagation?.();
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
            {isApple ? 'Add to Home Screen' : 'Install Commonplace App'}
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {isApple
              ? 'Fullscreen app & offline journals'
              : '1-tap install for offline scrapbook access'}
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>
            {isApple ? 'Guide' : 'Install'}
          </Text>
        </View>

        {/* Close Button */}
        <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={10}>
          <X size={14} color={colors.ink.tertiary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    maxWidth: 440,
    alignSelf: 'center',
    zIndex: 9999,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.22)',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  actionBtn: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  closeBtn: {
    padding: 6,
    marginLeft: -2,
  },
});
