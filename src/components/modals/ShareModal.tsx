import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, MessageCircle, Instagram, MoreHorizontal, FileImage, FileText, Type, Link2, Check } from 'lucide-react-native';
import { shareService } from '../../services/shareService';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  title = 'Scrapbook Memory',
  content = 'Curated in Commonplace',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>share</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color={colors.ink.primary} />
            </Pressable>
          </View>

          {/* Aesthetic Card Preview */}
          <View style={styles.cardPreviewWrapper}>
            <View style={styles.cardPreviewInner}>
              <View style={styles.cardContentLeft}>
                <Text style={styles.cardPreviewTitle}>{title}</Text>
                {Boolean(content) && <Text style={styles.cardPreviewBody}>{content}</Text>}
                <Text style={styles.cardFooterBrand}>commonplace scrapbook</Text>
              </View>

              {/* Brand Logo Mask Badge */}
              <View style={styles.flowerStickerWrapper}>
                <Image
                  source={{ uri: '/icons/icon-192.png' }}
                  style={styles.flowerImg}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Social Row */}
          <View style={styles.socialRow}>
            <Pressable
              style={({ pressed }) => [styles.socialItem, pressed && { opacity: 0.75 }]}
              onPress={() => {
                shareService.shareToWhatsApp(`${title ? `*${title}*\n\n` : ''}${content}\n\n— commonplace scrapbook`);
                onClose();
              }}
            >
              <View style={[styles.socialCircle, { backgroundColor: '#25D366' }]}>
                <MessageCircle size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialLabel}>whatsapp</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.socialItem, pressed && { opacity: 0.75 }]}
              onPress={() => {
                shareService.shareToInstagram(`${title ? `*${title}*\n\n` : ''}${content}\n\n— commonplace scrapbook`);
                onClose();
              }}
            >
              <View style={[styles.socialCircle, { backgroundColor: '#E1306C' }]}>
                <Instagram size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialLabel}>instagram dm</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.socialItem, pressed && { opacity: 0.75 }]}
              onPress={() => {
                shareService.shareToInstagram(`${title ? `*${title}*\n\n` : ''}${content}\n\n— commonplace scrapbook`);
                onClose();
              }}
            >
              <View style={[styles.socialCircle, { backgroundColor: '#C13584' }]}>
                <Instagram size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialLabel}>instagram story</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.socialItem, pressed && { opacity: 0.75 }]}
              onPress={() => {
                shareService.shareNative({
                  title: title || 'Commonplace Scrapbook',
                  message: `${title ? `${title}\n\n` : ''}${content}\n\n— commonplace scrapbook`,
                });
                onClose();
              }}
            >
              <View style={[styles.socialCircle, { backgroundColor: '#F3F4F6' }]}>
                <MoreHorizontal size={22} color={colors.ink.secondary} />
              </View>
              <Text style={styles.socialLabel}>more</Text>
            </Pressable>
          </View>

          {/* Export Row */}
          <View style={styles.exportRow}>
            <Pressable style={styles.exportItem}>
              <View style={styles.exportIconBox}>
                <FileImage size={18} color={colors.ink.secondary} />
              </View>
              <Text style={styles.exportLabel}>image</Text>
            </Pressable>

            <Pressable style={styles.exportItem}>
              <View style={styles.exportIconBox}>
                <FileText size={18} color={colors.ink.secondary} />
              </View>
              <Text style={styles.exportLabel}>pdf</Text>
            </Pressable>

            <Pressable style={styles.exportItem}>
              <View style={styles.exportIconBox}>
                <Type size={18} color={colors.ink.secondary} />
              </View>
              <Text style={styles.exportLabel}>text</Text>
            </Pressable>

            <Pressable style={styles.exportItem} onPress={handleCopy}>
              <View style={styles.exportIconBox}>
                {copied ? <Check size={18} color="#22C55E" /> : <Link2 size={18} color={colors.ink.secondary} />}
              </View>
              <Text style={styles.exportLabel}>{copied ? 'copied!' : 'copy link'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: typography.families.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  closeBtn: {
    padding: 4,
  },
  cardPreviewWrapper: {
    borderRadius: 20,
    backgroundColor: '#FFE8E1',
    padding: 18,
    shadowColor: '#4B4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardPreviewInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContentLeft: {
    flex: 1,
    paddingRight: 10,
    gap: 6,
  },
  cardPreviewTitle: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  cardPreviewBody: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.secondary,
    lineHeight: 20,
  },
  cardFooterBrand: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
    marginTop: 6,
  },
  flowerStickerWrapper: {
    width: 60,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
  },
  flowerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  socialItem: {
    alignItems: 'center',
    gap: 6,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.secondary,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  exportItem: {
    alignItems: 'center',
    gap: 6,
  },
  exportIconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAF8FC',
  },
  exportLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.secondary,
  },
});
