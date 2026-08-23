import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Image } from 'react-native';
import { Board, Pin } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, Printer, Download, Share2 } from 'lucide-react-native';
import { Tape } from '../common/Tape';

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
  const handlePrint = () => {
    window.print();
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
            <View>
              <Text style={styles.modalTitle}>export & print scrapbook page</Text>
              <Text style={styles.modalSub}>
                printable editorial journal sheet for "{board.title}"
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={handlePrint}
                style={({ pressed }: { pressed: boolean }) => [styles.printBtn, pressed && { opacity: 0.8 }]}
              >
                <Printer size={14} color="#FFF" />
                <Text style={styles.printBtnText}>print / save pdf</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <X size={18} color={colors.ink.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Printable Page Canvas */}
          <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
            <View style={styles.sheetPaper}>
              {/* Header Stamp */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetBrand}>commonplace archive</Text>
                <Text style={styles.sheetDate}>
                  curated {new Date(board.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
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
                <Text style={styles.footerNote}>preserved in commonplace notes</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FAF8F4',
    borderRadius: 14,
    maxWidth: 580,
    width: '100%',
    maxHeight: '92%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
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
    fontFamily: typography.families.serif,
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  modalSub: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.ink.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  printBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF',
  },
  closeBtn: {
    padding: 4,
  },
  scrollCanvas: {
    maxHeight: 520,
    marginTop: 12,
  },
  sheetPaper: {
    backgroundColor: '#FFFDF9',
    padding: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetBrand: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
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
    fontFamily: typography.families.serif,
    fontSize: 24,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  sheetSubtitle: {
    fontFamily: typography.families.handwritten,
    fontSize: 16,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 14,
  },
  memoriesGrid: {
    gap: 16,
  },
  exportItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    paddingBottom: 12,
  },
  photoPrintWrap: {
    alignItems: 'center',
  },
  photoPrintImg: {
    width: '100%',
    height: 200,
    borderRadius: 4,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  textPrintBody: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink.secondary,
  },
  thoughtPrintWrap: {},
  thoughtPrintText: {
    fontFamily: typography.families.handwritten,
    fontSize: 16.5,
    lineHeight: 22,
    color: colors.ink.primary,
  },
  quotePrintWrap: {},
  quotePrintText: {
    fontFamily: typography.families.serif,
    fontSize: 15,
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
    fontSize: 14.5,
    fontWeight: '500',
    marginBottom: 4,
  },
  listPrintItem: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    lineHeight: 18,
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
    fontSize: 14,
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
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  footerNote: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.faded,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
