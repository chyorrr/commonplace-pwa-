import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, Share, PlusSquare, Smartphone, CheckCircle, Bookmark } from 'lucide-react-native';
import { Tape } from './Tape';
import { markInstallPromptDismissed } from '../../utils/pwaUtils';

interface AddToHomeScreenModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({ visible, onClose }) => {
  const handleDismiss = () => {
    markInstallPromptDismissed();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Decorative Washi Tape */}
          <View style={styles.tapeAnchor}>
            <Tape color="rgba(244, 114, 182, 0.45)" variant="top-center" />
          </View>

          {/* Close button */}
          <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={10}>
            <X size={18} color={colors.ink.secondary} />
          </Pressable>

          {/* Header & Icon */}
          <View style={styles.headerBlock}>
            <View style={styles.appIconPreview}>
              <Image source={{ uri: '/icons/icon-192.png' }} style={styles.appIconImg} />
            </View>
            <Text style={styles.modalTitle}>Install Commonplace</Text>
            <Text style={styles.modalSubtitle}>
              Install to your iPhone Home Screen for full-screen mode, safe-area immersion, and offline scrapbooking.
            </Text>
          </View>

          {/* 3 Step Guide for iOS */}
          <View style={styles.stepsContainer}>
            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  Tap the <Text style={styles.boldText}>Share</Text> button in Safari's bottom toolbar.
                </Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Share size={18} color={colors.brand.purpleDark} />
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  Scroll down and tap <Text style={styles.boldText}>"Add to Home Screen"</Text>.
                </Text>
              </View>
              <View style={styles.stepIconWrap}>
                <PlusSquare size={18} color={colors.brand.purpleDark} />
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>
                  Tap <Text style={styles.boldText}>"Add"</Text> in the top-right corner.
                </Text>
              </View>
              <View style={styles.stepIconWrap}>
                <CheckCircle size={18} color="#16A34A" />
              </View>
            </View>
          </View>

          {/* Benefits Note */}
          <View style={styles.benefitsBox}>
            <Bookmark size={15} color={colors.brand.purple} />
            <Text style={styles.benefitsText}>
              Opens fullscreen without Safari navigation bars, caches all fonts & notes for offline use, and delivers instant notifications.
            </Text>
          </View>

          {/* Got it Button */}
          <Pressable onPress={handleDismiss} style={({ pressed }) => [styles.gotItBtn, pressed && styles.btnPressed]}>
            <Text style={styles.gotItBtnText}>Got it ♡</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 18, 30, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 210, 0.12)',
  },
  tapeAnchor: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  appIconPreview: {
    width: 60,
    height: 60,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  appIconImg: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink.primary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: '#FAF7FD',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 210, 0.1)',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.primary,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  stepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  benefitsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  benefitsText: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    lineHeight: 15,
  },
  gotItBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gotItBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
