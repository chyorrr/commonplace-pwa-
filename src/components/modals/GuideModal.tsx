import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, ArrowRight, ArrowLeft, Home, Plus, Heart, Search, Mic, Type, Share2, ListTodo } from 'lucide-react-native';

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ visible, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'visual-tour' | 'quick-list'>('visual-tour');

  const totalSlides = 5;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.tabToggleRow}>
              <Pressable
                onPress={() => setViewMode('visual-tour')}
                style={[styles.tabToggleBtn, viewMode === 'visual-tour' && styles.tabToggleBtnActive]}
              >
                <Text style={[styles.tabToggleText, viewMode === 'visual-tour' && styles.tabToggleTextActive]}>
                  Visual Tour
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode('quick-list')}
                style={[styles.tabToggleBtn, viewMode === 'quick-list' && styles.tabToggleBtnActive]}
              >
                <Text style={[styles.tabToggleText, viewMode === 'quick-list' && styles.tabToggleTextActive]}>
                  App Overview
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>

          {/* MODE 1: VISUAL INTERACTIVE TOUR */}
          {viewMode === 'visual-tour' && (
            <View style={styles.tourContainer}>
              {/* SLIDE 0: Vertical Right Sidebar */}
              {currentSlide === 0 && (
                <View style={styles.slideContent}>
                  <View style={styles.mockupHeaderCard}>
                    <View style={styles.miniSidebarRow}>
                      <View style={styles.miniSidebarItem}><Home size={16} color={colors.brand.purpleDark} /><Text style={styles.miniSidebarLabel}>home</Text></View>
                      <View style={styles.miniSidebarCircle}><Plus size={16} color="#FFF" /></View>
                      <View style={styles.miniSidebarItem}><Heart size={16} color={colors.ink.secondary} /><Text style={styles.miniSidebarLabel}>favorites</Text></View>
                      <View style={styles.miniSidebarItem}><Search size={16} color={colors.ink.secondary} /><Text style={styles.miniSidebarLabel}>search</Text></View>
                    </View>
                  </View>

                  <Text style={styles.slideTitle}>Right-Side Vertical Navigation</Text>
                  <Text style={styles.slideDesc}>
                    A clean vertical dock along the right edge gives you instant access to your Home gallery, Quick Create FAB, Favorites collection, and Search.
                  </Text>
                </View>
              )}

              {/* SLIDE 1: 8 Pastel Mood Boards */}
              {currentSlide === 1 && (
                <View style={styles.slideContent}>
                  <View style={styles.boardsMockupRow}>
                    <View style={[styles.miniBoardCard, { backgroundColor: '#DDF0FB' }]}><Text style={styles.miniBoardTitle}>college</Text><Text style={styles.miniBoardSub}>42 items</Text></View>
                    <View style={[styles.miniBoardCard, { backgroundColor: '#EBE6FB' }]}><Text style={styles.miniBoardTitle}>music</Text><Text style={styles.miniBoardSub}>28 items</Text></View>
                    <View style={[styles.miniBoardCard, { backgroundColor: '#FFE8E1' }]}><Text style={styles.miniBoardTitle}>memories</Text><Text style={styles.miniBoardSub}>63 items</Text></View>
                    <View style={[styles.miniBoardCard, { backgroundColor: '#FEF3D6' }]}><Text style={styles.miniBoardTitle}>ideas</Text><Text style={styles.miniBoardSub}>31 items</Text></View>
                  </View>

                  <Text style={styles.slideTitle}>8 Curated Pastel Scrapbook Boards</Text>
                  <Text style={styles.slideDesc}>
                    Organize memories into aesthetic pastel cards: college, music, memories, ideas, travel, thoughts, and someday bucket lists.
                  </Text>
                </View>
              )}

              {/* SLIDE 2: Note Editor & Highlighters */}
              {currentSlide === 2 && (
                <View style={styles.slideContent}>
                  <View style={styles.noteMockupCard}>
                    <View style={styles.noteMockupTitleBadge}><Text style={styles.noteMockupTitleText}>late night thoughts ♡</Text></View>
                    <Text style={styles.noteMockupBody}>
                      Sometimes i just overthink things. But then I remember, <Text style={styles.yellowHighlight}>every little</Text> <Text style={styles.pinkHighlight}>step still counts.</Text>
                    </Text>
                  </View>

                  <Text style={styles.slideTitle}>Aesthetic Note Editor</Text>
                  <Text style={styles.slideDesc}>
                    Write notes with authentic handwriting fonts (Honey, Typewriter, Editorial), highlighter markers, and doodle accents.
                  </Text>
                </View>
              )}

              {/* SLIDE 3: Voice Note Recording & Transcripts */}
              {currentSlide === 3 && (
                <View style={styles.slideContent}>
                  <View style={styles.voiceMockupCard}>
                    <Text style={styles.voiceMockupTimer}>00:27.18</Text>
                    <View style={styles.miniWaveformRow}>
                      {[10, 16, 22, 30, 24, 18, 28, 20, 14, 22].map((h, i) => (
                        <View key={i} style={[styles.miniWaveBar, { height: h }]} />
                      ))}
                    </View>
                  </View>

                  <Text style={styles.slideTitle}>Voice Notes with Smart Transcripts</Text>
                  <Text style={styles.slideDesc}>
                    Record audio with real-time waveform visualization, live audio playback, and instant text transcription.
                  </Text>
                </View>
              )}

              {/* SLIDE 4: 9 Pastel Creation Tiles & Share */}
              {currentSlide === 4 && (
                <View style={styles.slideContent}>
                  <View style={styles.tilesMockupGrid}>
                    <View style={[styles.miniTile, { backgroundColor: '#FEF3D6' }]}><Type size={14} color="#D97706" /><Text style={styles.miniTileLabel}>Write</Text></View>
                    <View style={[styles.miniTile, { backgroundColor: '#EDE6FB' }]}><Mic size={14} color="#8B5CF6" /><Text style={styles.miniTileLabel}>Voice</Text></View>
                    <View style={[styles.miniTile, { backgroundColor: '#FFE2E6' }]}><ListTodo size={14} color="#E11D48" /><Text style={styles.miniTileLabel}>List</Text></View>
                    <View style={[styles.miniTile, { backgroundColor: '#DDF2D8' }]}><Share2 size={14} color="#16A34A" /><Text style={styles.miniTileLabel}>Share</Text></View>
                  </View>

                  <Text style={styles.slideTitle}>9 Creation Types & Social Sharing</Text>
                  <Text style={styles.slideDesc}>
                    Create photos, audio, playlists, lists, stickers, and collages. Share directly to Instagram Story/DM or export as Image & PDF.
                  </Text>
                </View>
              )}

              {/* Bottom Tour Controls */}
              <View style={styles.bottomControls}>
                {/* Dots indicator */}
                <View style={styles.dotsRow}>
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        currentSlide === idx && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>

                {/* Prev / Next buttons */}
                <View style={styles.navButtonsGroup}>
                  {currentSlide > 0 && (
                    <Pressable onPress={handlePrev} style={styles.prevBtn} hitSlop={8}>
                      <ArrowLeft size={16} color={colors.ink.secondary} />
                      <Text style={styles.prevBtnText}>back</Text>
                    </Pressable>
                  )}

                  <Pressable onPress={handleNext} style={styles.nextBtn} hitSlop={8}>
                    <Text style={styles.nextBtnText}>
                      {currentSlide === totalSlides - 1 ? 'got it' : 'next'}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* MODE 2: QUICK FEATURE OVERVIEW */}
          {viewMode === 'quick-list' && (
            <ScrollView style={styles.quickListScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>1. Right-Side Vertical Navigation</Text>
                <Text style={styles.featureDesc}>
                  Sleek vertical rail on the right side with profile avatar, home, quick create, favorites, and search.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>2. 8 Pastel Mood Boards</Text>
                <Text style={styles.featureDesc}>
                  College, Music, Memories, Ideas, Things to Remember, Travel, Thoughts, and Someday checklist.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>3. Note Editor with Highlighters</Text>
                <Text style={styles.featureDesc}>
                  Write handwritten notes with yellow and pink highlighters, font style pickers (Honey, Typewriter, Editorial), and doodle stars.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>4. Voice Notes with Waveform & Transcripts</Text>
                <Text style={styles.featureDesc}>
                  Record audio memos with live digital timers and convert them into editable highlighted text.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>5. Social Sharing & Card Export</Text>
                <Text style={styles.featureDesc}>
                  Share keepsake cards to Instagram Story, Instagram DM, WhatsApp, or export to Image, PDF, and Text.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 99,
    padding: 3,
  },
  tabToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
  },
  tabToggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabToggleText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    fontWeight: '500',
  },
  tabToggleTextActive: {
    color: colors.brand.purpleDark,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  tourContainer: {
    paddingTop: 14,
  },
  slideContent: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mockupHeaderCard: {
    width: '100%',
    backgroundColor: '#FBF9F6',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  miniSidebarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  miniSidebarItem: {
    alignItems: 'center',
    gap: 3,
  },
  miniSidebarLabel: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    color: colors.ink.secondary,
  },
  miniSidebarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardsMockupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  miniBoardCard: {
    width: '46%',
    borderRadius: 14,
    padding: 10,
  },
  miniBoardTitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  miniBoardSub: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  noteMockupCard: {
    width: '100%',
    backgroundColor: '#FAF8FC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  noteMockupTitleBadge: {
    backgroundColor: '#EDE8FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  noteMockupTitleText: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  noteMockupBody: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink.primary,
  },
  yellowHighlight: {
    backgroundColor: colors.highlight.yellow,
    borderRadius: 3,
  },
  pinkHighlight: {
    backgroundColor: colors.highlight.pink,
    borderRadius: 3,
  },
  voiceMockupCard: {
    width: '100%',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  voiceMockupTimer: {
    fontFamily: typography.families.mono,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  miniWaveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
  },
  miniWaveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.brand.purple,
  },
  tilesMockupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  miniTile: {
    width: '46%',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniTileLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  slideTitle: {
    fontFamily: typography.families.sans,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  slideDesc: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink.secondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.brand.purple,
  },
  navButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  prevBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.secondary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickListScroll: {
    maxHeight: 380,
    marginTop: 12,
  },
  featureItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureTitle: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  featureDesc: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink.secondary,
  },
});
