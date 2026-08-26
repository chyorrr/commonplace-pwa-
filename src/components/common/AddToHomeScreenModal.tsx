import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  X, 
  Share, 
  PlusSquare, 
  Smartphone, 
  CheckCircle2, 
  Bookmark, 
  Download, 
  MoreVertical
} from 'lucide-react-native';
import { Tape } from './Tape';
import { 
  isIOS, 
  hasNativeInstallPrompt, 
  triggerNativeInstallPrompt, 
  markInstallPromptDismissed 
} from '../../utils/pwaUtils';

interface AddToHomeScreenModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({ visible, onClose }) => {
  const [deviceTab, setDeviceTab] = useState<'ios' | 'android'>(() => (isIOS() ? 'ios' : 'android'));
  const [hasPrompt, setHasPrompt] = useState<boolean>(hasNativeInstallPrompt);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDeviceTab(isIOS() ? 'ios' : 'android');
      setHasPrompt(hasNativeInstallPrompt());
      setInstallStatus(null);
    }
  }, [visible]);

  const handleDismiss = () => {
    markInstallPromptDismissed();
    onClose();
  };

  const handleDirectInstall = async () => {
    if (hasNativeInstallPrompt()) {
      const { outcome } = await triggerNativeInstallPrompt();
      if (outcome === 'accepted') {
        setInstallStatus('Installation initiated. Check your home screen or app drawer.');
        setTimeout(() => {
          handleDismiss();
        }, 1800);
      }
    } else {
      setInstallStatus('Follow the steps below to add to your Home Screen.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <Pressable style={styles.modalBackdrop} onPress={handleDismiss}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Decorative Washi Tape */}
          <View style={styles.tapeAnchor}>
            <Tape color="rgba(244, 114, 182, 0.65)" variant="top-center" width={52} height={13} />
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
              Full-screen scrapbooking, offline database persistence, and local reminder alerts.
            </Text>
          </View>

          {/* Device Tab Selector */}
          <View style={styles.tabSelectorRow}>
            <Pressable
              onPress={() => setDeviceTab('ios')}
              style={[styles.tabBtn, deviceTab === 'ios' && styles.tabBtnActive]}
            >
              <Smartphone size={15} color={deviceTab === 'ios' ? '#FFFFFF' : colors.ink.secondary} />
              <Text style={[styles.tabBtnText, deviceTab === 'ios' && styles.tabBtnTextActive]}>
                iPhone / iPad
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeviceTab('android')}
              style={[styles.tabBtn, deviceTab === 'android' && styles.tabBtnActive]}
            >
              <Download size={15} color={deviceTab === 'android' ? '#FFFFFF' : colors.ink.secondary} />
              <Text style={[styles.tabBtnText, deviceTab === 'android' && styles.tabBtnTextActive]}>
                Android / Chrome
              </Text>
            </Pressable>
          </View>

          {/* Android Direct 1-Click Action when supported */}
          {deviceTab === 'android' && hasPrompt && (
            <View style={styles.directActionBox}>
              <Pressable
                onPress={handleDirectInstall}
                style={({ pressed }) => [styles.directInstallBtn, pressed && styles.btnPressed]}
              >
                <Download size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.directInstallText}>Install Application</Text>
              </Pressable>
              <Text style={styles.directInstallHint}>1-tap installation directly to your device</Text>
            </View>
          )}

          {Boolean(installStatus) && (
            <View style={styles.statusToast}>
              <CheckCircle2 size={15} color="#16A34A" />
              <Text style={styles.statusToastText}>{installStatus}</Text>
            </View>
          )}

          {/* Step Guide for iOS */}
          {deviceTab === 'ios' && (
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
                  <Share size={17} color={colors.brand.purpleDark} />
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
                  <PlusSquare size={17} color={colors.brand.purpleDark} />
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
                  <CheckCircle2 size={17} color="#16A34A" />
                </View>
              </View>
            </View>
          )}

          {/* Step Guide for Android (when manual fallback) */}
          {deviceTab === 'android' && !hasPrompt && (
            <View style={styles.stepsContainer}>
              {/* Step 1 */}
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Tap the <Text style={styles.boldText}>Menu (⋮)</Text> in Chrome top-right.
                  </Text>
                </View>
                <View style={styles.stepIconWrap}>
                  <MoreVertical size={17} color={colors.brand.purpleDark} />
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Tap <Text style={styles.boldText}>"Install app"</Text> or <Text style={styles.boldText}>"Add to Home screen"</Text>.
                  </Text>
                </View>
                <View style={styles.stepIconWrap}>
                  <Download size={17} color={colors.brand.purpleDark} />
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Tap <Text style={styles.boldText}>"Install"</Text> to complete.
                  </Text>
                </View>
                <View style={styles.stepIconWrap}>
                  <CheckCircle2 size={17} color="#16A34A" />
                </View>
              </View>
            </View>
          )}

          {/* Benefits Note */}
          <View style={styles.benefitsBox}>
            <Bookmark size={14} color={colors.brand.purpleDark} />
            <Text style={styles.benefitsText}>
              Removes browser address bars, caches assets for instant offline access, and activates reminders.
            </Text>
          </View>

          {/* Done Button */}
          <Pressable onPress={handleDismiss} style={({ pressed }) => [styles.gotItBtn, pressed && styles.btnPressed]}>
            <Text style={styles.gotItBtnText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 18, 30, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 99999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1E1B24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    marginTop: 4,
    marginBottom: 14,
  },
  appIconPreview: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
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
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    padding: 3,
    borderRadius: 12,
    width: '100%',
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.brand.purpleDark,
  },
  tabBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  directActionBox: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  directInstallBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directInstallText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  directInstallHint: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 6,
  },
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  statusToastText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: '#FAF7FD',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: colors.brand.purpleDark,
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
    marginTop: 12,
    marginBottom: 16,
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
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.ink.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gotItBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
