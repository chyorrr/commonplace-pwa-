import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Board, Pin } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, Printer, Download, Share2, MessageCircle, Instagram, Check, FileImage } from 'lucide-react-native';
import { exportBoardAsImage, exportBoardAsPdf } from '../../utils/boardExport';
import { shareService } from '../../services/shareService';

interface BoardExportModalProps {
  visible: boolean;
  board: Board;
  onClose: () => void;
}

export const BoardExportModal: React.FC<BoardExportModalProps> = ({
  visible,
  board,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const getTargetElement = (): HTMLElement | null => {
    return (
      document.getElementById('board-canvas-container') ||
      document.getElementById('export-sheet-paper')
    );
  };

  const handleExportImage = async (format: 'png' | 'jpg') => {
    setIsExporting(true);
    setDownloadSuccess(null);
    try {
      const targetElem = getTargetElement();
      if (targetElem) {
        const cleanName = `${(board.title || 'scrapbook').toLowerCase().replace(/[^a-z0-9]/g, '-')}-board.${format}`;
        await exportBoardAsImage(targetElem, format, cleanName);
        setDownloadSuccess(`${format.toUpperCase()} Downloaded`);
        setTimeout(() => setDownloadSuccess(null), 3000);
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('Image export error:', e);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(null);
    try {
      const targetElem = getTargetElement();
      if (targetElem) {
        const cleanName = `${(board.title || 'scrapbook').toLowerCase().replace(/[^a-z0-9]/g, '-')}-board.pdf`;
        await exportBoardAsPdf(targetElem, cleanName);
        setDownloadSuccess('PDF Downloaded');
        setTimeout(() => setDownloadSuccess(null), 3000);
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('PDF export error:', e);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    shareService.shareBoardToWhatsApp(board);
    onClose();
  };

  const handleShareInstagram = () => {
    shareService.shareBoardToInstagram(board);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Export Scrapbook Board</Text>
              <Text style={styles.modalSub}>
                Save or share "{board.title}" exactly as decorated
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color={colors.ink.secondary} />
            </Pressable>
          </View>

          {/* Download Success Pill */}
          {Boolean(downloadSuccess) && (
            <View style={styles.successBanner}>
              <Check size={14} color="#16A34A" />
              <Text style={styles.successBannerText}>{downloadSuccess}! Check your downloads.</Text>
            </View>
          )}

          {/* Quick Action Export Buttons */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              onPress={() => handleExportImage('jpg')}
              disabled={isExporting}
              style={({ pressed }) => [styles.exportBtn, styles.exportBtnPrimary, pressed && { opacity: 0.8 }]}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FileImage size={15} color="#FFF" />
              )}
              <Text style={styles.exportBtnPrimaryText}>Save JPG</Text>
            </Pressable>

            <Pressable
              onPress={() => handleExportImage('png')}
              disabled={isExporting}
              style={({ pressed }) => [styles.exportBtn, styles.exportBtnSecondary, pressed && { opacity: 0.8 }]}
            >
              <Download size={15} color={colors.brand.purpleDark} />
              <Text style={styles.exportBtnSecondaryText}>Save PNG</Text>
            </Pressable>

            <Pressable
              onPress={handleExportPdf}
              disabled={isExporting}
              style={({ pressed }) => [styles.exportBtn, styles.exportBtnSecondary, pressed && { opacity: 0.8 }]}
            >
              <Printer size={15} color={colors.brand.purpleDark} />
              <Text style={styles.exportBtnSecondaryText}>Save PDF</Text>
            </Pressable>
          </View>

          {/* Social Share Row */}
          <View style={styles.socialShareRow}>
            <Text style={styles.shareRowLabel}>Direct Share:</Text>
            <View style={styles.socialIconsGroup}>
              <Pressable
                onPress={handleShareWhatsApp}
                style={({ pressed }) => [styles.socialPill, { backgroundColor: '#25D366' }, pressed && { opacity: 0.8 }]}
              >
                <MessageCircle size={15} color="#FFF" />
                <Text style={styles.socialPillText}>WhatsApp</Text>
              </Pressable>

              <Pressable
                onPress={handleShareInstagram}
                style={({ pressed }) => [styles.socialPill, { backgroundColor: '#E1306C' }, pressed && { opacity: 0.8 }]}
              >
                <Instagram size={15} color="#FFF" />
                <Text style={styles.socialPillText}>Instagram</Text>
              </Pressable>
            </View>
          </View>

          {/* Printable Page Preview */}
          <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
            <View id="export-sheet-paper" style={[styles.sheetPaper, { backgroundColor: board.colorHex || '#FFFDF9' }]}>
              {/* Header Stamp */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetBrand}>commonplace scrapbook</Text>
                <Text style={styles.sheetDate}>
                  {board.pins.length} {board.pins.length === 1 ? 'memory' : 'memories'}
                </Text>
              </View>

              <Text style={styles.sheetTitle}>{board.title}</Text>
              {!!board.subtitle && (
                <Text style={styles.sheetSubtitle}>{board.subtitle}</Text>
              )}

              <View style={styles.dividerLine} />

              {/* Grid of Board Memories */}
              <View style={styles.memoriesGrid}>
                {board.pins.map((pin: Pin) => (
                  <View key={pin.id} style={styles.exportItem}>
                    {pin.type === 'photo' && (
                      <View style={styles.photoPrintWrap}>
                        <Image source={{ uri: pin.imageUrl }} style={styles.photoPrintImg} resizeMode="cover" />
                        {!!pin.caption && <Text style={styles.photoPrintCaption}>{pin.caption}</Text>}
                        {!!pin.handwrittenDate && <Text style={styles.photoPrintDate}>{pin.handwrittenDate}</Text>}
                      </View>
                    )}

                    {pin.type === 'text' && (
                      <View style={styles.textPrintWrap}>
                        {!!pin.title && <Text style={styles.textPrintTitle}>{pin.title}</Text>}
                        <Text style={styles.textPrintBody}>{pin.body}</Text>
                      </View>
                    )}

                    {pin.type === 'thought' && (
                      <View style={styles.thoughtPrintWrap}>
                        <Text style={styles.thoughtPrintText}>"{pin.thought}"</Text>
                      </View>
                    )}

                    {pin.type === 'quote' && (
                      <View style={styles.quotePrintWrap}>
                        <Text style={styles.quotePrintText}>“{pin.quote}”</Text>
                        {!!pin.author && <Text style={styles.quotePrintAuthor}>— {pin.author}</Text>}
                      </View>
                    )}

                    {pin.type === 'checklist' && (
                      <View style={styles.listPrintWrap}>
                        <Text style={styles.listPrintTitle}>{pin.title}</Text>
                        {pin.items.map((it) => (
                          <Text key={it.id} style={[styles.listPrintItem, it.completed && styles.listPrintDone]}>
                            {it.completed ? '✓ ' : '• '} {it.text}
                          </Text>
                        ))}
                      </View>
                    )}

                    {pin.type === 'voicenote' && (
                      <View style={styles.voicePrintWrap}>
                        <Text style={styles.voicePrintTitle}>🎙 {pin.title}</Text>
                        {!!pin.transcriptExcerpt && (
                          <Text style={styles.voicePrintTranscript}>{pin.transcriptExcerpt}</Text>
                        )}
                      </View>
                    )}

                    {pin.type === 'music' && (
                      <View style={styles.musicPrintWrap}>
                        <Text style={styles.musicPrintTitle}>🎵 {pin.songTitle} — {pin.artist}</Text>
                        {!!pin.personalMemoryNote && (
                          <Text style={styles.musicPrintNote}>"{pin.personalMemoryNote}"</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.sheetFooter}>
                <Text style={styles.footerNote}>curated in commonplace scrapbook</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    maxWidth: 520,
    width: '100%',
    maxHeight: '90%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  modalSub: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successBannerText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
  },
  exportBtnPrimary: {
    backgroundColor: colors.brand.purple,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  exportBtnPrimaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  exportBtnSecondary: {
    backgroundColor: '#F3E8FF',
  },
  exportBtnSecondaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  socialShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  shareRowLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.tertiary,
  },
  socialIconsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  socialPillText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollCanvas: {
    maxHeight: 400,
    marginTop: 4,
    borderRadius: 12,
  },
  sheetPaper: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sheetBrand: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.ink.tertiary,
  },
  sheetDate: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
  },
  sheetTitle: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  sheetSubtitle: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
  },
  memoriesGrid: {
    gap: 14,
  },
  exportItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    paddingBottom: 10,
  },
  photoPrintWrap: {
    alignItems: 'center',
  },
  photoPrintImg: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  photoPrintCaption: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.handwritten,
    marginTop: 6,
  },
  photoPrintDate: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  textPrintWrap: {},
  textPrintTitle: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  textPrintBody: {
    fontFamily: typography.families.serif,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.ink.secondary,
  },
  thoughtPrintWrap: {},
  thoughtPrintText: {
    fontFamily: typography.families.handwritten,
    fontSize: 15.5,
    lineHeight: 20,
    color: colors.ink.primary,
  },
  quotePrintWrap: {},
  quotePrintText: {
    fontFamily: typography.families.serif,
    fontSize: 14.5,
    color: colors.ink.primary,
  },
  quotePrintAuthor: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 4,
  },
  listPrintWrap: {},
  listPrintTitle: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  listPrintItem: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    lineHeight: 17,
  },
  listPrintDone: {
    color: colors.ink.faded,
    textDecorationLine: 'line-through',
  },
  voicePrintWrap: {},
  voicePrintTitle: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  voicePrintTranscript: {
    fontFamily: typography.families.handwritten,
    fontSize: 13.5,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  musicPrintWrap: {},
  musicPrintTitle: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  musicPrintNote: {
    fontFamily: typography.families.handwritten,
    fontSize: 13,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  sheetFooter: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  footerNote: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    color: colors.ink.faded,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
