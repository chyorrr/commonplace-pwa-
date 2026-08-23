import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Image, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  X, 
  Check, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Image as ImageIcon, 
  ChevronDown 
} from 'lucide-react-native';
import { DeviceImagePicker } from '../common/DeviceImagePicker';
import { Tape } from '../common/Tape';

interface NoteEditorModalProps {
  visible: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialBody?: string;
  onSave?: (title: string, body: string) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  onClose,
  initialTitle = '',
  initialBody = '',
  onSave,
}) => {
  const { addPin, activeBoardId, addToDesk } = useApp();

  const [title, setTitle] = useState(initialTitle);
  const [bodyText, setBodyText] = useState(initialBody);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [selectedPaperTone, setSelectedPaperTone] = useState<'peach' | 'lilac' | 'butter' | 'matcha' | 'sky' | 'white'>('lilac');
  const [selectedTextColor, setSelectedTextColor] = useState('#1E1B24');
  const [fontSize, setFontSize] = useState<number>(18);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);

  // Popover Toggles
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [isPaperToneOpen, setIsPaperToneOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [selectedFontId, setSelectedFontId] = useState<'modern' | 'clean' | 'typewriter'>('modern');

  const fontOptions = [
    { id: 'modern', label: 'Modern Sans', font: typography.families.sans, fontStyleName: 'sans' as const },
    { id: 'clean', label: 'Editorial', font: typography.families.heading, fontStyleName: 'display' as const },
    { id: 'typewriter', label: 'Typewriter', font: typography.families.typewriter, fontStyleName: 'typewriter' as const },
  ];

  const availableSizes = [16, 18, 22, 26, 32];

  const paletteColors = [
    { name: 'Charcoal', hex: '#1E1B24' },
    { name: 'Lavender', hex: '#8B5CF6' },
    { name: 'Rose', hex: '#E11D48' },
    { name: 'Amber', hex: '#D97706' },
    { name: 'Forest', hex: '#16A34A' },
    { name: 'Indigo', hex: '#2563EB' },
  ];

  const paperTones: { id: typeof selectedPaperTone; bg: string; name: string }[] = [
    { id: 'lilac', bg: '#F5EEFC', name: 'Lilac' },
    { id: 'peach', bg: '#FFF5ED', name: 'Peach' },
    { id: 'butter', bg: '#FEF9EB', name: 'Butter' },
    { id: 'matcha', bg: '#F0F9F3', name: 'Matcha' },
    { id: 'sky', bg: '#EFF6FF', name: 'Sky' },
    { id: 'white', bg: '#FFFFFF', name: 'Crisp White' },
  ];

  const currentFont = fontOptions.find((f) => f.id === selectedFontId) || fontOptions[0];
  const currentPaper = paperTones.find((p) => p.id === selectedPaperTone) || paperTones[0];

  const handleSave = () => {
    const finalTitle = title.trim();
    const finalBody = bodyText.trim() || '...';

    const pinData: any = {
      type: 'text',
      title: finalTitle || undefined,
      body: finalBody,
      fontStyle: currentFont.fontStyleName,
      paperTone: selectedPaperTone,
      imageUrl: attachedImageUrl || undefined,
    };

    if (onSave) {
      onSave(finalTitle, finalBody);
    } else if (activeBoardId) {
      addPin(activeBoardId, pinData);
    } else {
      addToDesk(pinData);
    }

    setTitle('');
    setBodyText('');
    setAttachedImageUrl(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.editorContainer, { backgroundColor: currentPaper.bg }]}>
          <Tape variant="top-center" width={52} height={12} color="rgba(196, 184, 226, 0.85)" />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>

            <Text style={styles.headerTitle}>New Note</Text>

            <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.titleWrapper}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={[styles.titleInput, { color: selectedTextColor }]}
                placeholder="Note Title (Optional)"
                placeholderTextColor={colors.ink.faded}
              />
            </View>

            {/* Attached Photo Preview if any */}
            {attachedImageUrl && (
              <View style={styles.attachedImageContainer}>
                <Image source={{ uri: attachedImageUrl }} style={styles.attachedImagePreview} resizeMode="cover" />
                <Pressable onPress={() => setAttachedImageUrl(null)} style={styles.removeImageBtn} hitSlop={6}>
                  <X size={14} color="#FFF" />
                </Pressable>
              </View>
            )}

            {/* Main Note Body Area */}
            <TextInput
              value={bodyText}
              onChangeText={setBodyText}
              multiline
              style={[
                styles.mainBodyInput,
                {
                  fontFamily: currentFont.font,
                  fontSize: fontSize,
                  lineHeight: Math.round(fontSize * 1.45),
                  color: selectedTextColor,
                  fontWeight: isBold ? '700' : '400',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textAlign: textAlign,
                },
              ]}
              placeholder="Type your thoughts, reflections, or quotes..."
              placeholderTextColor={colors.ink.faded}
              autoFocus
            />
          </ScrollView>

          {/* Bottom Formatting & Tone Control Bar */}
          <View style={styles.bottomControlBar}>
            {/* Toolbar Buttons Row */}
            <View style={styles.toolbarRow}>
              {/* Bold */}
              <Pressable
                onPress={() => setIsBold(!isBold)}
                style={[styles.toolIconBtn, isBold && styles.toolIconActive]}
                hitSlop={4}
              >
                <Bold size={16} color={isBold ? colors.brand.purple : colors.ink.secondary} />
              </Pressable>

              {/* Italic */}
              <Pressable
                onPress={() => setIsItalic(!isItalic)}
                style={[styles.toolIconBtn, isItalic && styles.toolIconActive]}
                hitSlop={4}
              >
                <Italic size={16} color={isItalic ? colors.brand.purple : colors.ink.secondary} />
              </Pressable>

              {/* Text Alignment */}
              <Pressable
                onPress={() => {
                  const nextAlign = textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left';
                  setTextAlign(nextAlign);
                }}
                style={styles.toolIconBtn}
                hitSlop={4}
              >
                {textAlign === 'left' ? (
                  <AlignLeft size={16} color={colors.brand.purple} />
                ) : textAlign === 'center' ? (
                  <AlignCenter size={16} color={colors.brand.purple} />
                ) : (
                  <AlignRight size={16} color={colors.brand.purple} />
                )}
              </Pressable>

              {/* Attach Image from Device */}
              <DeviceImagePicker
                onImageSelected={(base64) => setAttachedImageUrl(base64)}
                style={{ width: 'auto', display: 'inline-block' }}
              >
                <View style={[styles.toolIconBtn, attachedImageUrl && styles.toolIconActive]}>
                  <ImageIcon size={16} color={attachedImageUrl ? colors.brand.purple : colors.ink.secondary} />
                </View>
              </DeviceImagePicker>

              {/* Paper Tone Selector Button */}
              <Pressable
                onPress={() => setIsPaperToneOpen(!isPaperToneOpen)}
                style={[styles.toolIconBtn, isPaperToneOpen && styles.toolIconActive]}
                hitSlop={4}
              >
                <Palette size={16} color={colors.ink.secondary} />
              </Pressable>
            </View>

            {/* Paper Tone Popover Bar */}
            {isPaperToneOpen && (
              <View style={styles.paperToneBar}>
                <Text style={styles.popoverLabel}>Paper Tone:</Text>
                <View style={styles.tonesRow}>
                  {paperTones.map((tone) => (
                    <Pressable
                      key={tone.id}
                      onPress={() => {
                        setSelectedPaperTone(tone.id);
                        setIsPaperToneOpen(false);
                      }}
                      style={[
                        styles.toneCircle,
                        { backgroundColor: tone.bg },
                        selectedPaperTone === tone.id && styles.toneCircleSelected,
                      ]}
                    >
                      {selectedPaperTone === tone.id && <Check size={11} color={colors.ink.primary} />}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Font Style Selection Chips */}
            <View style={styles.fontChipsRow}>
              {fontOptions.map((opt) => {
                const isActive = selectedFontId === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedFontId(opt.id as any)}
                    style={[styles.fontChip, isActive && styles.fontChipActive]}
                  >
                    <Text style={[styles.fontChipText, isActive && styles.fontChipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  editorContainer: {
    width: '100%',
    maxWidth: 480,
    height: '88%',
    borderRadius: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: colors.brand.purple,
  },
  saveBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleWrapper: {
    marginBottom: 12,
  },
  titleInput: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  attachedImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  attachedImagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBodyInput: {
    minHeight: 220,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  bottomControlBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconActive: {
    backgroundColor: '#EDE8FA',
  },
  paperToneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  popoverLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
  },
  tonesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toneCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneCircleSelected: {
    borderWidth: 2,
    borderColor: colors.brand.purple,
  },
  fontChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontChipActive: {
    backgroundColor: colors.brand.purple,
  },
  fontChipText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  fontChipTextActive: {
    color: '#FFFFFF',
  },
});
