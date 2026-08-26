import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, TextInput, ScrollView, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, Upload, Check, Trash2, Stamp, Palette, Scissors, CircleDot, Maximize2 } from 'lucide-react-native';
import { Board, CustomSticker, Pin } from '../../types';
import { DeviceImagePicker } from '../common/DeviceImagePicker';
import { Tape } from '../common/Tape';

export const StickerStudioModal: React.FC = () => {
  const {
    isStickerStudioOpen,
    closeStickerStudio,
    stickers,
    addCustomSticker,
    deleteCustomSticker,
    boards,
    attachStickerToPin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'library' | 'create' | 'place'>('library');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(stickers[0]?.id || null);

  // Create Sticker Form State
  const [stickerName, setStickerName] = useState('');
  const [stickerImgUrl, setStickerImgUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [stickerStyle, setStickerStyle] = useState<'die-cut' | 'glow' | 'stamp' | 'badge'>('die-cut');
  const [successBanner, setSuccessBanner] = useState('');

  // Place Sticker Form State
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
  const [selectedPinId, setSelectedPinId] = useState<string>('');
  const [placeSize, setPlaceSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [placeContour, setPlaceContour] = useState<'die-cut' | 'glow' | 'stamp' | 'badge'>('die-cut');
  const [placeTilt, setPlaceTilt] = useState<number | 'random'>('random');

  // Curated Cute Starter Stickers
  const cuteStarters = [
    { name: 'Cherry Blossom', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=200&auto=format&fit=crop&q=80' },
    { name: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80' },
    { name: 'Sweet Strawberry', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&auto=format&fit=crop&q=80' },
    { name: 'Vinyl Record', url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=200&auto=format&fit=crop&q=80' },
    { name: 'Floral Bouquet', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Cozy Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80' },
  ];

  const handleCreateSticker = () => {
    const chosenUrl = (stickerImgUrl || imageUrlInput).trim();
    if (!chosenUrl) return;
    const name = stickerName.trim() || 'Custom Sticker';
    addCustomSticker(name, chosenUrl);
    setStickerName('');
    setStickerImgUrl('');
    setImageUrlInput('');
    setSuccessBanner(`✓ "${name}" created with auto-crop & contour cut!`);
    setActiveTab('library');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleSelectStarter = (starter: { name: string; url: string }) => {
    addCustomSticker(starter.name, starter.url);
    setSuccessBanner(`✓ Added "${starter.name}" sticker!`);
    setActiveTab('library');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handlePlaceSticker = () => {
    if (!selectedStickerId || !selectedPinId) return;
    const randomX = Math.floor(Math.random() * 45 + 20);
    const randomY = Math.floor(Math.random() * 45 + 20);
    const rotation = placeTilt === 'random' ? +(Math.random() * 14 - 7).toFixed(1) : placeTilt;

    attachStickerToPin(selectedPinId, selectedStickerId, randomX, randomY, {
      sizePreset: placeSize,
      contourStyle: placeContour,
      rotation,
    });
    closeStickerStudio();
  };

  const currentBoard = boards.find((b: Board) => b.id === selectedBoardId);

  return (
    <Modal visible={isStickerStudioOpen} transparent animationType="fade" onRequestClose={closeStickerStudio}>
      <Pressable style={styles.modalOverlay} onPress={closeStickerStudio}>
        <Pressable style={styles.sheetContainer} onPress={(e: any) => e.stopPropagation?.()}>
          <Tape variant="top-center" width={56} height={14} color="rgba(251, 113, 133, 0.85)" />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Sticker Studio</Text>
              <Text style={styles.subtitle}>Auto-cropped, contour-cut stickers you can scale & stamp</Text>
            </View>
            <Pressable onPress={closeStickerStudio} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>

          {/* Success Banner */}
          {Boolean(successBanner) && (
            <View style={styles.bannerContainer}>
              <Check size={14} color="#15803D" />
              <Text style={styles.bannerText}>{successBanner}</Text>
            </View>
          )}

          {/* Navigation Tabs */}
          <View style={styles.tabNavRow}>
            <Pressable
              onPress={() => setActiveTab('library')}
              style={[styles.subTab, activeTab === 'library' && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, activeTab === 'library' && styles.subTabTextActive]}>
                My Stickers ({stickers.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('create')}
              style={[styles.subTab, activeTab === 'create' && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, activeTab === 'create' && styles.subTabTextActive]}>
                + Make Sticker
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('place')}
              style={[styles.subTab, activeTab === 'place' && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, activeTab === 'place' && styles.subTabTextActive]}>
                Stamp on Note
              </Text>
            </Pressable>
          </View>

          {/* TAB 1: Sticker Library */}
          {activeTab === 'library' && (
            <View style={styles.tabBody}>
              {stickers.length === 0 ? (
                <View style={styles.emptyStateWrap}>
                  <Text style={styles.emptyStateTitle}>No Custom Stickers Yet</Text>
                  <Text style={styles.emptyStateSub}>
                    Upload any image from your phone or choose a starter to create a reusable contour-cut sticker!
                  </Text>
                  <Pressable
                    onPress={() => setActiveTab('create')}
                    style={styles.emptyActionBtn}
                  >
                    <Upload size={16} color="#FFFFFF" />
                    <Text style={styles.emptyActionText}>Upload from Phone</Text>
                  </Pressable>

                  {/* Starter Suggestions */}
                  <View style={styles.startersSection}>
                    <Text style={styles.startersTitle}>Or Pick a Cute Starter:</Text>
                    <View style={styles.startersGrid}>
                      {cuteStarters.map((starter, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => handleSelectStarter(starter)}
                          style={styles.starterChip}
                        >
                          <Image source={{ uri: starter.url }} style={styles.starterThumb} />
                          <Text style={styles.starterText} numberOfLines={1}>{starter.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <ScrollView style={styles.libraryScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.stickerGrid}>
                    {stickers.map((st: CustomSticker) => {
                      const isSelected = selectedStickerId === st.id;
                      return (
                        <Pressable
                          key={st.id}
                          onPress={() => setSelectedStickerId(st.id)}
                          style={[
                            styles.stickerCard,
                            isSelected && styles.stickerCardSelected,
                          ]}
                        >
                          {/* Die-Cut Sticker Effect */}
                          <View style={styles.dieCutContainer}>
                            <Image source={{ uri: st.imageUrl }} style={styles.stickerThumb} resizeMode="cover" />
                          </View>
                          <Text style={styles.stickerName} numberOfLines={1}>
                            {st.name}
                          </Text>
                          <Pressable
                            onPress={() => deleteCustomSticker(st.id)}
                            style={styles.deleteStickerBtn}
                            hitSlop={6}
                          >
                            <Trash2 size={12} color={colors.ink.faded} />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.libraryActionsRow}>
                    <Pressable
                      onPress={() => setActiveTab('create')}
                      style={styles.uploadMoreBtn}
                    >
                      <Upload size={14} color={colors.brand.purple} />
                      <Text style={styles.uploadMoreText}>+ Make New Sticker</Text>
                    </Pressable>

                    {stickers.length > 0 && (
                      <Pressable
                        onPress={() => setActiveTab('place')}
                        style={styles.stampNowBtn}
                      >
                        <Stamp size={14} color="#FFFFFF" />
                        <Text style={styles.stampNowBtnText}>Stamp on Note</Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 2: Upload / Make Sticker */}
          {activeTab === 'create' && (
            <ScrollView style={styles.tabBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>1. Select Image (Auto-Cropped Centered)</Text>
                {stickerImgUrl ? (
                  <View style={styles.stickerPreviewCard}>
                    <View
                      style={[
                        styles.dieCutPreviewWrap,
                        stickerStyle === 'glow' && styles.styleGlow,
                        stickerStyle === 'stamp' && styles.styleStamp,
                        stickerStyle === 'badge' && styles.styleBadge,
                      ]}
                    >
                      <Image source={{ uri: stickerImgUrl }} style={styles.previewImage} resizeMode="cover" />
                    </View>
                    <Pressable onPress={() => setStickerImgUrl('')} style={styles.removeImageBtn} hitSlop={6}>
                      <X size={14} color="#FFF" />
                    </Pressable>
                    <Text style={styles.previewCaption}>Auto-Cropped Contour Preview</Text>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    <DeviceImagePicker
                      onImageSelected={(base64, fileName) => {
                        setStickerImgUrl(base64);
                        if (!stickerName && fileName) {
                          setStickerName(fileName.split('.')[0]);
                        }
                      }}
                      buttonLabel="Choose Photo from Phone / Camera"
                    />

                    <TextInput
                      value={imageUrlInput}
                      onChangeText={(val) => {
                        setImageUrlInput(val);
                        if (val && !stickerImgUrl) {
                          setStickerImgUrl(val);
                        }
                      }}
                      placeholder="Or paste image URL (https://...)"
                      placeholderTextColor={colors.ink.faded}
                      style={styles.textInput}
                    />
                  </View>
                )}
              </View>

              {/* Sticker Contour Style Chooser */}
              {Boolean(stickerImgUrl) && (
                <View style={styles.formSection}>
                  <Text style={styles.fieldLabel}>2. Choose Contour Cut Edge</Text>
                  <View style={styles.styleOptionsRow}>
                    <Pressable
                      onPress={() => setStickerStyle('die-cut')}
                      style={[styles.stylePill, stickerStyle === 'die-cut' && styles.stylePillActive]}
                    >
                      <Text style={[styles.stylePillText, stickerStyle === 'die-cut' && styles.stylePillTextActive]}>
                        Die-Cut Border
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStickerStyle('glow')}
                      style={[styles.stylePill, stickerStyle === 'glow' && styles.stylePillActive]}
                    >
                      <Text style={[styles.stylePillText, stickerStyle === 'glow' && styles.stylePillTextActive]}>
                        Pastel Glow
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStickerStyle('stamp')}
                      style={[styles.stylePill, stickerStyle === 'stamp' && styles.stylePillActive]}
                    >
                      <Text style={[styles.stylePillText, stickerStyle === 'stamp' && styles.stylePillTextActive]}>
                        Postage Stamp
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStickerStyle('badge')}
                      style={[styles.stylePill, stickerStyle === 'badge' && styles.stylePillActive]}
                    >
                      <Text style={[styles.stylePillText, stickerStyle === 'badge' && styles.stylePillTextActive]}>
                        Circular Badge
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Sticker Name</Text>
                <TextInput
                  value={stickerName}
                  onChangeText={setStickerName}
                  placeholder="e.g. Cherry blossom, Matcha cup, Cozy cat..."
                  placeholderTextColor={colors.ink.faded}
                  style={styles.textInput}
                />
              </View>

              <Pressable
                onPress={handleCreateSticker}
                disabled={!stickerImgUrl && !imageUrlInput}
                style={[
                  styles.primaryActionBtn,
                  (!stickerImgUrl && !imageUrlInput) && styles.actionBtnDisabled,
                ]}
              >
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Save Sticker to Library</Text>
              </Pressable>
            </ScrollView>
          )}

          {/* TAB 3: Place Sticker on Note */}
          {activeTab === 'place' && (
            <ScrollView style={styles.tabBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>1. Select Destination Board</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {boards.map((b) => (
                    <Pressable
                      key={b.id}
                      onPress={() => {
                        setSelectedBoardId(b.id);
                        setSelectedPinId('');
                      }}
                      style={[styles.chip, selectedBoardId === b.id && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedBoardId === b.id && styles.chipTextActive]}>
                        {b.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>2. Choose Note / Memory to Decorate</Text>
                {currentBoard && currentBoard.pins.length > 0 ? (
                  <View style={styles.pinsChoiceGrid}>
                    {currentBoard.pins.map((pin: Pin) => (
                      <Pressable
                        key={pin.id}
                        onPress={() => setSelectedPinId(pin.id)}
                        style={[
                          styles.pinChoiceCard,
                          selectedPinId === pin.id && styles.pinChoiceCardSelected,
                        ]}
                      >
                        <Text style={styles.pinChoiceTitle} numberOfLines={2}>
                          {pin.title || (pin as any).caption || (pin as any).songTitle || 'Memory Note'}
                        </Text>
                        {selectedPinId === pin.id && (
                          <View style={styles.selectedBadge}>
                            <Check size={12} color="#FFF" />
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noPinsText}>No notes on this board yet. Create a note or photo first!</Text>
                )}
              </View>

              {/* 3. Sticker Size Adjuster */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>3. Adjust Stamped Sticker Size</Text>
                <View style={styles.sizeSelectorRow}>
                  {[
                    { id: 'sm', label: 'S (32px)' },
                    { id: 'md', label: 'M (48px)' },
                    { id: 'lg', label: 'L (64px)' },
                    { id: 'xl', label: 'XL (84px)' },
                  ].map((sz) => (
                    <Pressable
                      key={sz.id}
                      onPress={() => setPlaceSize(sz.id as any)}
                      style={[styles.sizePill, placeSize === sz.id && styles.sizePillActive]}
                    >
                      <Text style={[styles.sizePillText, placeSize === sz.id && styles.sizePillTextActive]}>
                        {sz.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 4. Sticker Contour Cut Style */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>4. Contour Cut Outline</Text>
                <View style={styles.sizeSelectorRow}>
                  {[
                    { id: 'die-cut', label: 'Die-Cut' },
                    { id: 'glow', label: 'Pastel Glow' },
                    { id: 'stamp', label: 'Stamp' },
                    { id: 'badge', label: 'Badge' },
                  ].map((cnt) => (
                    <Pressable
                      key={cnt.id}
                      onPress={() => setPlaceContour(cnt.id as any)}
                      style={[styles.sizePill, placeContour === cnt.id && styles.sizePillActive]}
                    >
                      <Text style={[styles.sizePillText, placeContour === cnt.id && styles.sizePillTextActive]}>
                        {cnt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 5. Sticker Rotation / Tilt */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>5. Sticker Tilt / Angle</Text>
                <View style={styles.sizeSelectorRow}>
                  {[
                    { id: -15, label: '-15°' },
                    { id: 0, label: '0° (Flat)' },
                    { id: 15, label: '+15°' },
                    { id: 'random', label: '🎲 Tilt' },
                  ].map((t, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setPlaceTilt(t.id as any)}
                      style={[styles.sizePill, placeTilt === t.id && styles.sizePillActive]}
                    >
                      <Text style={[styles.sizePillText, placeTilt === t.id && styles.sizePillTextActive]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={handlePlaceSticker}
                disabled={!selectedStickerId || !selectedPinId}
                style={[
                  styles.primaryActionBtn,
                  (!selectedStickerId || !selectedPinId) && styles.actionBtnDisabled,
                ]}
              >
                <Stamp size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Stamp Sticker onto Note</Text>
              </Pressable>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 45, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    paddingTop: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-top, 20px))' : 20) as any,
    paddingBottom: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-bottom, 20px))' : 20) as any,
    paddingLeft: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-left, 14px))' : 14) as any,
    paddingRight: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-right, 14px))' : 14) as any,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    paddingTop: 24,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    maxHeight: '86%',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  subtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  bannerText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  subTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  subTabText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  subTabTextActive: {
    color: colors.brand.purpleDark,
    fontWeight: '700',
  },
  tabBody: {
    maxHeight: 460,
  },
  emptyStateWrap: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyStateTitle: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 18,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 18,
  },
  emptyActionText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  startersSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingTop: 12,
  },
  startersTitle: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  startersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  starterThumb: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  starterText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand.purpleDark,
  },
  libraryScroll: {
    paddingVertical: 4,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stickerCard: {
    width: '30%',
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  stickerCardSelected: {
    borderColor: colors.brand.purple,
    backgroundColor: '#F3E8FF',
  },
  dieCutContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  stickerThumb: {
    width: '100%',
    height: '100%',
  },
  stickerName: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.primary,
    fontWeight: '600',
  },
  deleteStickerBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  libraryActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  uploadMoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brand.purple,
  },
  uploadMoreText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.brand.purple,
  },
  stampNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.brand.purple,
    borderRadius: 12,
  },
  stampNowBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 6,
  },
  stickerPreviewCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dieCutPreviewWrap: {
    width: 100,
    height: 100,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  styleGlow: {
    borderColor: '#F472B6',
    borderWidth: 3,
  },
  styleStamp: {
    borderColor: '#D97706',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  styleBadge: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCaption: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.brand.purpleDark,
    fontWeight: '600',
  },
  styleOptionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stylePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
  },
  stylePillActive: {
    backgroundColor: colors.brand.purple,
    borderColor: colors.brand.purple,
  },
  stylePillText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  stylePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sizeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizePillActive: {
    backgroundColor: colors.brand.purple,
    borderColor: colors.brand.purple,
  },
  sizePillText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  sizePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#FDFBF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.primary,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  primaryActionText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFF',
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  chipActive: {
    backgroundColor: colors.brand.purple,
  },
  chipText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  pinsChoiceGrid: {
    gap: 8,
  },
  pinChoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FDFBF9',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  pinChoiceCardSelected: {
    borderColor: colors.brand.purple,
    backgroundColor: '#F3E8FF',
  },
  pinChoiceTitle: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.primary,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPinsText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});
