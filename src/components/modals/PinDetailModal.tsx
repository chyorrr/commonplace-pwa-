import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Image } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { X, Heart, Trash2, FolderInput, Stamp, MapPin, Calendar, Clock, ExternalLink, MessageCircle, Instagram, Share2, Music } from 'lucide-react-native';
import { Tape } from '../common/Tape';
import { shareService } from '../../services/shareService';
import { spotifyService } from '../../services/spotifyService';
import { getFontFamily } from '../../theme/typography';

export const PinDetailModal: React.FC = () => {
  const {
    activePinDetail,
    setActivePinDetail,
    toggleFavoritePin,
    deletePin,
    boards,
    addPin,
    openStickerStudio,
  } = useApp();

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  if (!activePinDetail) return null;

  const pin = activePinDetail;

  const handleClose = () => {
    setActivePinDetail(null);
    setIsMoveMenuOpen(false);
  };

  const handleMoveToBoard = (targetBoardId: string) => {
    const { id, createdAt, ...pinRest } = pin;
    addPin(targetBoardId, pinRest);
    deletePin(pin.id);
    handleClose();
  };

  return (
    <Modal
      visible={!!activePinDetail}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.contentCard} onPress={(e) => e.stopPropagation()}>
          {/* Tape on top */}
          <Tape variant="top-center" width={60} height={16} />

          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {pin.type === 'voicenote' ? 'Voice Memo' : pin.type.charAt(0).toUpperCase() + pin.type.slice(1)}
              </Text>
            </View>

            <View style={styles.actionsGroup}>
              {/* Favorite Toggle */}
              <Pressable
                onPress={() => toggleFavoritePin(pin.id)}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                hitSlop={6}
              >
                <Heart
                  size={17}
                  color={pin.isFavorite ? colors.accents.terracotta : colors.ink.secondary}
                  fill={pin.isFavorite ? colors.accents.terracotta : 'transparent'}
                  strokeWidth={1.8}
                />
              </Pressable>

              {/* Move to another board */}
              <Pressable
                onPress={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                hitSlop={6}
              >
                <FolderInput size={17} color={colors.ink.secondary} />
              </Pressable>

              {/* Attach Custom Sticker */}
              <Pressable
                onPress={() => {
                  handleClose();
                  openStickerStudio();
                }}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                hitSlop={6}
              >
                <Stamp size={17} color={colors.accents.ochre} />
              </Pressable>

              {/* Delete Pin */}
              <Pressable
                onPress={() => {
                  deletePin(pin.id);
                  handleClose();
                }}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                hitSlop={6}
              >
                <Trash2 size={16} color={colors.accents.terracotta} />
              </Pressable>

              {/* Close */}
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                hitSlop={6}
              >
                <X size={18} color={colors.ink.primary} />
              </Pressable>
            </View>
          </View>

          {/* Move Menu Dropdown */}
          {isMoveMenuOpen && (
            <View style={styles.moveDropdown}>
              <Text style={styles.moveHeading}>Move to Board:</Text>
              {boards.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => handleMoveToBoard(b.id)}
                  style={({ pressed }) => [
                    styles.moveItem,
                    pressed && { backgroundColor: 'rgba(0,0,0,0.04)' },
                  ]}
                >
                  <Text style={styles.moveItemText}>{b.title}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Detail Scroll Content */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Photo Render */}
            {pin.type === 'photo' && (
              <View style={styles.photoBlock}>
                <Image
                  source={{ uri: pin.imageUrl }}
                  style={styles.fullPhoto}
                  resizeMode="contain"
                />
                {!!pin.caption && (
                  <Text style={styles.detailCaption}>"{pin.caption}"</Text>
                )}
                <View style={styles.photoMetaRow}>
                  {!!pin.location && (
                    <View style={styles.metaBadge}>
                      <MapPin size={11} color={colors.ink.tertiary} />
                      <Text style={styles.metaBadgeText}>{pin.location}</Text>
                    </View>
                  )}
                  {!!pin.handwrittenDate && (
                    <View style={styles.metaBadge}>
                      <Calendar size={11} color={colors.ink.tertiary} />
                      <Text style={styles.metaBadgeText}>{pin.handwrittenDate}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Text Pin Render */}
            {pin.type === 'text' && (
              <View style={styles.textBlock}>
                {!!pin.title && <Text style={styles.detailTitle}>{pin.title}</Text>}
                <Text style={styles.detailBody}>{pin.body}</Text>
                {!!pin.authorNote && (
                  <Text style={styles.detailAuthorNote}>— {pin.authorNote}</Text>
                )}
              </View>
            )}

            {/* Thought Pin Render */}
            {pin.type === 'thought' && (
              <View style={styles.thoughtBlock}>
                <Text style={styles.detailThoughtText}>"{pin.thought}"</Text>
              </View>
            )}

            {/* Checklist Pin Render */}
            {pin.type === 'checklist' && (
              <View style={styles.checklistBlock}>
                <Text style={styles.detailTitle}>{pin.title}</Text>
                <View style={styles.checklistDetailList}>
                  {pin.items.map((item) => (
                    <View key={item.id} style={styles.checkItemRow}>
                      <View
                        style={[
                          styles.checkDot,
                          item.completed && styles.checkDotDone,
                        ]}
                      />
                      <Text
                        style={[
                          styles.checkItemText,
                          item.completed && styles.checkItemTextDone,
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Quote Pin Render */}
            {pin.type === 'quote' && (
              <View style={styles.quoteBlock}>
                <Text style={styles.detailQuoteText}>"{pin.quote}"</Text>
                {!!pin.author && (
                  <Text style={styles.detailAuthor}>— {pin.author}</Text>
                )}
                {!!pin.source && (
                  <Text style={styles.detailSource}>{pin.source}</Text>
                )}
              </View>
            )}

            {/* Music Pin Render */}
            {pin.type === 'music' && (
              <View style={styles.musicBlock}>
                <Image
                  source={{ uri: pin.coverUrl }}
                  style={styles.detailMusicCover}
                  resizeMode="cover"
                />
                <Text style={styles.detailMusicTitle}>{pin.songTitle}</Text>
                <Text style={styles.detailMusicArtist}>{pin.artist}</Text>
                {!!pin.personalMemoryNote && (
                  <Text style={styles.detailMusicNote}>
                    "{pin.personalMemoryNote}"
                  </Text>
                )}

                <Pressable
                  onPress={() => spotifyService.openInSpotify(pin.spotifyUrl, pin.spotifyUri)}
                  style={styles.spotifyOpenBtn}
                >
                  <Music size={14} color="#1DB954" />
                  <Text style={styles.spotifyOpenBtnText}>Open track on Spotify</Text>
                </Pressable>
              </View>
            )}

            {/* Voice Note Pin Render */}
            {pin.type === 'voicenote' && (
              <View style={styles.voiceBlock}>
                <Text style={styles.detailTitle}>{pin.title}</Text>
                <Text style={styles.detailVoiceDate}>{pin.recordedDate}</Text>
                {!!pin.transcriptExcerpt && (
                  <Text style={styles.detailTranscript}>
                    {pin.transcriptExcerpt}
                  </Text>
                )}
              </View>
            )}

            {/* Link Pin Render */}
            {pin.type === 'link' && (
              <View style={styles.linkBlock}>
                {!!pin.thumbnailUrl && (
                  <Image
                    source={{ uri: pin.thumbnailUrl }}
                    style={styles.detailLinkImg}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.detailTitle}>{pin.headline}</Text>
                <Text style={styles.detailLinkSite}>{pin.siteName}</Text>
                {!!pin.snippet && (
                  <Text style={styles.detailLinkSnippet}>{pin.snippet}</Text>
                )}
              </View>
            )}

            {/* Journal Pin Render */}
            {pin.type === 'journal' && (
              <View style={styles.journalBlock}>
                <Text style={styles.detailDate}>{pin.dateLabel}</Text>
                <Text style={styles.detailTitle}>{pin.headline}</Text>
                {Boolean(pin.photoUrls && pin.photoUrls.length > 0) && (
                  <Image
                    source={{ uri: pin.photoUrls[0] }}
                    style={styles.detailJournalImg}
                    resizeMode="cover"
                  />
                )}
                {pin.paragraphs.map((p, i) => (
                  <Text key={i} style={styles.detailJournalP}>
                    {p}
                  </Text>
                ))}
              </View>
            )}

            {/* Share to WhatsApp & Instagram & Universal Share */}
            <View style={styles.shareSection}>
              <Text style={styles.shareHeading}>share this note</Text>
              <View style={styles.shareRow}>
                <Pressable
                  onPress={() => shareService.shareToWhatsApp(pin)}
                  style={({ pressed }) => [styles.shareBtn, styles.whatsappBtn, pressed && { opacity: 0.8 }]}
                >
                  <MessageCircle size={13} color="#25D366" />
                  <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                </Pressable>

                <Pressable
                  onPress={() => shareService.shareToInstagram(pin)}
                  style={({ pressed }) => [styles.shareBtn, styles.instagramBtn, pressed && { opacity: 0.8 }]}
                >
                  <Instagram size={13} color="#E1306C" />
                  <Text style={styles.instagramBtnText}>Instagram Story</Text>
                </Pressable>

                <Pressable
                  onPress={() => shareService.shareNative({ message: shareService.formatPinText(pin) })}
                  style={({ pressed }) => [styles.shareBtn, styles.nativeShareBtn, pressed && { opacity: 0.8 }]}
                >
                  <Share2 size={13} color={colors.ink.primary} />
                  <Text style={styles.nativeShareBtnText}>More</Text>
                </Pressable>
              </View>
            </View>

            {/* Tags & Time footer */}
            <View style={styles.cardFooter}>
              {Boolean(pin.tags && pin.tags.length > 0) && (
                <View style={styles.tagsRow}>
                  {pin.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.createdDateText}>
                pinned {new Date(pin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    maxWidth: 520,
    width: '100%',
    maxHeight: '90%',
    padding: 18,
    position: 'relative',
    ...shadows.paperLifted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  typeBadgeText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: colors.ink.tertiary,
    letterSpacing: 0.6,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  moveDropdown: {
    backgroundColor: '#F7F3EB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  moveHeading: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.ink.tertiary,
    marginBottom: 6,
  },
  moveItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  moveItemText: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    color: colors.ink.primary,
  },
  scrollBody: {
    maxHeight: 520,
  },
  photoBlock: {
    alignItems: 'center',
  },
  fullPhoto: {
    width: '100%',
    height: 280,
    borderRadius: 4,
    backgroundColor: '#EBE5DC',
  },
  detailCaption: {
    fontFamily: typography.families.handwritten,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink.handwritten,
    textAlign: 'center',
    marginTop: 12,
  },
  photoMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBadgeText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  textBlock: {
    paddingVertical: 8,
  },
  detailTitle: {
    fontFamily: typography.families.serif,
    fontSize: 21,
    fontWeight: '600',
    color: colors.ink.primary,
    marginBottom: 10,
  },
  detailBody: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    lineHeight: 25,
    color: colors.ink.secondary,
  },
  detailAuthorNote: {
    fontFamily: typography.families.handwritten,
    fontSize: 16,
    color: colors.ink.handwrittenFaded,
    marginTop: 14,
  },
  thoughtBlock: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailThoughtText: {
    fontFamily: typography.families.handwritten,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink.primary,
    textAlign: 'center',
  },
  checklistBlock: {
    paddingVertical: 8,
  },
  checklistDetailList: {
    gap: 8,
    marginTop: 8,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.ink.tertiary,
  },
  checkDotDone: {
    backgroundColor: colors.accents.sageOlive,
    borderColor: colors.accents.sageOlive,
  },
  checkItemText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    color: colors.ink.secondary,
  },
  checkItemTextDone: {
    color: colors.ink.faded,
    textDecorationLine: 'line-through',
  },
  quoteBlock: {
    paddingVertical: 12,
  },
  detailQuoteText: {
    fontFamily: typography.families.serif,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink.primary,
  },
  detailAuthor: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink.secondary,
    marginTop: 10,
    textAlign: 'right',
  },
  detailSource: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
    textAlign: 'right',
  },
  musicBlock: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailMusicCover: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailMusicTitle: {
    fontFamily: typography.families.serif,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  detailMusicArtist: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  detailMusicNote: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.handwrittenFaded,
    marginTop: 10,
  },
  voiceBlock: {
    paddingVertical: 10,
  },
  detailVoiceDate: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
    marginBottom: 8,
  },
  detailTranscript: {
    fontFamily: typography.families.sans,
    fontSize: 15,
    color: colors.ink.secondary,
    lineHeight: 21,
  },
  linkBlock: {
    paddingVertical: 8,
  },
  detailLinkImg: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    marginBottom: 10,
  },
  detailLinkSite: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.tertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailLinkSnippet: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink.secondary,
  },
  journalBlock: {
    paddingVertical: 8,
  },
  detailDate: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    color: colors.ink.handwrittenFaded,
    marginBottom: 6,
  },
  detailJournalImg: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    marginBottom: 12,
  },
  detailJournalP: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink.secondary,
    marginBottom: 10,
  },
  spotifyOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1DB954',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  spotifyOpenBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFF',
  },
  shareSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  shareHeading: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.ink.tertiary,
    marginBottom: 8,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  whatsappBtn: {
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    borderColor: 'rgba(37, 211, 102, 0.25)',
  },
  whatsappBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#128C7E',
  },
  instagramBtn: {
    backgroundColor: 'rgba(225, 48, 108, 0.08)',
    borderColor: 'rgba(225, 48, 108, 0.25)',
  },
  instagramBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C13584',
  },
  nativeShareBtn: {
    backgroundColor: '#FFFFFF',
  },
  nativeShareBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  tagText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  createdDateText: {
    fontFamily: typography.families.handwritten,
    fontSize: 13,
    color: colors.ink.faded,
  },
});
