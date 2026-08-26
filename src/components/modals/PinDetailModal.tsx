import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, Image, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { 
  X, 
  Heart, 
  Trash2, 
  FolderInput, 
  Stamp, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  MessageCircle, 
  Instagram, 
  Share2, 
  Music, 
  Eye, 
  EyeOff, 
  Pencil, 
  Check, 
  Plus, 
  Undo2,
  Play,
  Pause,
  Volume2,
  FileText,
  Mic,
  MicOff,
  Sparkles
} from 'lucide-react-native';
import { Tape } from '../common/Tape';
import { shareService } from '../../services/shareService';
import { spotifyService } from '../../services/spotifyService';
import { speechAudioService } from '../../services/speechAndAudio';
import { DeviceImagePicker } from '../common/DeviceImagePicker';
import { ChecklistItem, Pin } from '../../types';

export const PinDetailModal: React.FC = () => {
  const {
    activePinDetail,
    setActivePinDetail,
    toggleFavoritePin,
    toggleHidePin,
    deletePin,
    updatePin,
    toggleChecklistItem,
    boards,
    addPin,
    addToDesk,
    openStickerStudio,
  } = useApp();

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDictatingEdit, setIsDictatingEdit] = useState(false);
  const stopDictateRef = useRef<(() => void) | null>(null);

  const pin = activePinDetail;

  // Form edit states
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editAuthorNote, setEditAuthorNote] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editSpotifyUrl, setEditSpotifyUrl] = useState('');
  const [editMemoryNote, setEditMemoryNote] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editSiteName, setEditSiteName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editSnippet, setEditSnippet] = useState('');
  const [editPaperTone, setEditPaperTone] = useState<string>('cream');
  const [editChecklistItems, setEditChecklistItems] = useState<ChecklistItem[]>([]);

  // Sync draft state whenever pin changes or when entering edit mode
  useEffect(() => {
    if (pin) {
      setEditTitle(pin.title || '');
      setEditPaperTone((pin as any).paperTone || 'cream');
      setIsPlayingAudio(false);
      setIsDictatingEdit(false);

      if (pin.type === 'text') {
        setEditBody(pin.body || '');
        setEditAuthorNote(pin.authorNote || '');
        setEditImageUrl(pin.imageUrl || '');
      } else if (pin.type === 'thought') {
        setEditBody(pin.thought || '');
      } else if (pin.type === 'quote') {
        setEditBody(pin.quote || '');
        setEditAuthor(pin.author || '');
        setEditSource(pin.source || '');
      } else if (pin.type === 'checklist') {
        setEditChecklistItems(pin.items ? JSON.parse(JSON.stringify(pin.items)) : []);
      } else if (pin.type === 'photo') {
        setEditImageUrl(pin.imageUrl || (pin as any).url || '');
        setEditCaption(pin.caption || '');
        setEditDate(pin.handwrittenDate || (pin as any).date || '');
        setEditLocation(pin.location || '');
      } else if (pin.type === 'music') {
        setEditSongTitle(pin.songTitle || '');
        setEditArtist(pin.artist || '');
        setEditSpotifyUrl(pin.spotifyUrl || '');
        setEditMemoryNote(pin.personalMemoryNote || (pin as any).note || '');
      } else if (pin.type === 'link') {
        setEditHeadline(pin.headline || '');
        setEditSiteName(pin.siteName || '');
        setEditUrl(pin.url || '');
        setEditSnippet(pin.snippet || (pin as any).commentary || '');
      } else if (pin.type === 'journal') {
        setEditHeadline(pin.headline || '');
        setEditDate(pin.dateLabel || '');
        setEditBody(pin.paragraphs ? pin.paragraphs.join('\n\n') : '');
      } else if (pin.type === 'voicenote') {
        setEditBody(pin.transcriptExcerpt || (pin as any).transcription || '');
      }
    }
  }, [pin, isEditing]);

  const handleClose = () => {
    speechAudioService.stopAudio();
    if (stopDictateRef.current) {
      stopDictateRef.current();
      stopDictateRef.current = null;
    }
    setActivePinDetail(null);
    setIsMoveMenuOpen(false);
    setIsEditing(false);
    setIsPlayingAudio(false);
    setIsDictatingEdit(false);
  };

  const handleTogglePlayPinAudio = () => {
    if (isPlayingAudio) {
      speechAudioService.stopAudio();
      setIsPlayingAudio(false);
    } else if (pin && (pin as any).audioUrl) {
      setIsPlayingAudio(true);
      speechAudioService.playAudio((pin as any).audioUrl, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleToggleDictateEdit = () => {
    if (isDictatingEdit) {
      stopDictateRef.current?.();
      stopDictateRef.current = null;
      setIsDictatingEdit(false);
    } else {
      setIsDictatingEdit(true);
      const stopFn = speechAudioService.startDictation(
        (text) => {
          setEditBody((prev) => (prev ? prev + ' ' + text : text));
        },
        (listening) => setIsDictatingEdit(listening)
      );
      stopDictateRef.current = stopFn;
    }
  };

  const handleConvertVoiceToNote = () => {
    if (!pin || pin.type !== 'voicenote') return;
    const transcribedContent = pin.transcriptExcerpt || (pin as any).transcription || pin.title || 'Voice memo thoughts.';

    const newNote = {
      type: 'text' as const,
      title: pin.title !== 'Voice Memo' ? pin.title : 'Transcribed Note',
      body: transcribedContent,
      paperTone: 'peach' as const,
      fontStyle: 'handwriting' as const,
      tapeStyle: 'top-center' as const,
      authorNote: `Transcribed from voice memo on ${new Date().toLocaleDateString()}`,
    };

    if (pin.boardId) {
      addPin(pin.boardId, newNote as any);
    } else {
      addToDesk(newNote as any);
    }
    handleClose();
  };

  const handleMoveToBoard = (targetBoardId: string) => {
    if (!pin) return;
    deletePin(pin.id);
    const { id, createdAt, boardId, ...rest } = pin;
    addPin(targetBoardId, rest as any);
    handleClose();
  };

  const handleSaveEdit = () => {
    if (!pin) return;

    if (stopDictateRef.current) {
      stopDictateRef.current();
      stopDictateRef.current = null;
    }
    setIsDictatingEdit(false);

    let updates: Record<string, any> = {
      title: editTitle.trim() || undefined,
    };

    switch (pin.type) {
      case 'text':
        updates = {
          ...updates,
          body: editBody.trim(),
          authorNote: editAuthorNote.trim() || undefined,
          paperTone: editPaperTone,
          imageUrl: editImageUrl.trim() || undefined,
        };
        break;

      case 'thought':
        updates = {
          ...updates,
          thought: editBody.trim(),
        };
        break;

      case 'quote':
        updates = {
          ...updates,
          quote: editBody.trim(),
          author: editAuthor.trim() || undefined,
          source: editSource.trim() || undefined,
        };
        break;

      case 'checklist':
        const cleanItems = editChecklistItems
          .filter((it) => it.text.trim().length > 0)
          .map((it, idx) => ({
            id: it.id || `item-${Date.now()}-${idx}`,
            text: it.text.trim(),
            completed: Boolean(it.completed),
          }));
        updates = {
          ...updates,
          title: editTitle.trim() || 'Checklist',
          items: cleanItems.length > 0 ? cleanItems : [{ id: `item-${Date.now()}-0`, text: 'Checklist item', completed: false }],
          paperTone: editPaperTone,
        };
        break;

      case 'photo':
        updates = {
          ...updates,
          imageUrl: editImageUrl.trim() || pin.imageUrl,
          caption: editCaption.trim() || undefined,
          handwrittenDate: editDate.trim() || undefined,
          location: editLocation.trim() || undefined,
        };
        break;

      case 'music':
        updates = {
          ...updates,
          songTitle: editSongTitle.trim() || pin.songTitle,
          artist: editArtist.trim() || pin.artist,
          spotifyUrl: editSpotifyUrl.trim() || undefined,
          personalMemoryNote: editMemoryNote.trim() || undefined,
        };
        break;

      case 'link':
        updates = {
          ...updates,
          headline: editHeadline.trim() || pin.headline,
          siteName: editSiteName.trim() || pin.siteName,
          url: editUrl.trim() || pin.url,
          snippet: editSnippet.trim() || undefined,
        };
        break;

      case 'journal':
        const paragraphs = editBody
          .split('\n\n')
          .map((p) => p.trim())
          .filter(Boolean);
        updates = {
          ...updates,
          headline: editHeadline.trim() || pin.headline,
          dateLabel: editDate.trim() || pin.dateLabel,
          paragraphs: paragraphs.length > 0 ? paragraphs : [editBody.trim()],
        };
        break;

      case 'voicenote':
        updates = {
          ...updates,
          title: editTitle.trim() || pin.title,
          transcriptExcerpt: editBody.trim() || undefined,
          transcription: editBody.trim() || undefined,
        };
        break;
    }

    updatePin(pin.id, updates);
    setIsEditing(false);
  };

  const handleAddChecklistItem = () => {
    setEditChecklistItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}-${prev.length}`, text: '', completed: false },
    ]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setEditChecklistItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateChecklistItemText = (id: string, text: string) => {
    setEditChecklistItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, text } : it))
    );
  };

  const handleToggleChecklistEditItem = (id: string) => {
    setEditChecklistItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  if (!pin) {
    return (
      <Modal visible={false} transparent>
        <View />
      </Modal>
    );
  }

  const paperToneOptions = [
    { id: 'cream', name: 'Cream', color: '#FFFDF9' },
    { id: 'lilac', name: 'Lilac', color: '#F5EEFC' },
    { id: 'peach', name: 'Peach', color: '#FFF5ED' },
    { id: 'butter', name: 'Butter', color: '#FEF9EB' },
    { id: 'sage', name: 'Sage', color: '#F0F9F3' },
    { id: 'sky', name: 'Sky', color: '#EFF6FF' },
  ];

  return (
    <Modal
      visible={Boolean(activePinDetail)}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.contentCard} onPress={(e) => e.stopPropagation()}>
          {/* Tape on top */}
          <Tape variant="top-center" width={56} height={14} color="rgba(196, 184, 226, 0.85)" />

          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {isEditing
                  ? `Editing ${pin.type === 'voicenote' ? 'Voice Memo' : pin.type}`
                  : pin.type === 'voicenote'
                  ? 'Voice Memo'
                  : pin.type.charAt(0).toUpperCase() + pin.type.slice(1)}
              </Text>
            </View>

            <View style={styles.actionsGroup}>
              {/* Edit / Cancel Edit Toggle */}
              <Pressable
                onPress={() => setIsEditing(!isEditing)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  isEditing && styles.actionBtnActive,
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={6}
                accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit note'}
              >
                {isEditing ? (
                  <Undo2 size={16} color={colors.brand.purpleDark} />
                ) : (
                  <Pencil size={16} color={colors.brand.purple} />
                )}
              </Pressable>

              {/* Favorite Toggle */}
              {!isEditing && (
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
              )}

              {/* Hide / Unhide Note Toggle */}
              {!isEditing && (
                <Pressable
                  onPress={() => toggleHidePin(pin.id)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    pin.isHidden && { backgroundColor: '#F3E8FF' },
                    pressed && { opacity: 0.7 },
                  ]}
                  hitSlop={6}
                  accessibilityLabel={pin.isHidden ? 'Unhide note' : 'Hide note'}
                >
                  {pin.isHidden ? (
                    <Eye size={17} color="#7C3AED" />
                  ) : (
                    <EyeOff size={17} color={colors.ink.secondary} />
                  )}
                </Pressable>
              )}

              {/* Move to another board */}
              {!isEditing && (
                <Pressable
                  onPress={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                  hitSlop={6}
                >
                  <FolderInput size={17} color={colors.ink.secondary} />
                </Pressable>
              )}

              {/* Attach Custom Sticker */}
              {!isEditing && (
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
              )}

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

          {/* ========================================================================= */}
          {/* A. EDIT MODE VIEW                                                         */}
          {/* ========================================================================= */}
          {isEditing ? (
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              <View style={styles.editContainer}>
                {/* 1. EDIT CHECKLIST */}
                {pin.type === 'checklist' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Checklist Title</Text>
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Checklist Title"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Checklist Items ({editChecklistItems.length})</Text>
                      {editChecklistItems.map((item, idx) => (
                        <View key={item.id || idx} style={styles.editCheckItemRow}>
                          <Pressable
                            onPress={() => handleToggleChecklistEditItem(item.id)}
                            style={[styles.checkDot, item.completed && styles.checkDotDone]}
                          >
                            {item.completed && <Check size={10} color="#FFF" strokeWidth={3} />}
                          </Pressable>
                          <TextInput
                            value={item.text}
                            onChangeText={(text) => handleUpdateChecklistItemText(item.id, text)}
                            placeholder={`Item ${idx + 1}...`}
                            placeholderTextColor={colors.ink.faded}
                            style={[
                              styles.textInput,
                              { flex: 1, paddingVertical: 6 },
                              item.completed && { textDecorationLine: 'line-through', color: colors.ink.faded },
                            ]}
                          />
                          <Pressable
                            onPress={() => handleRemoveChecklistItem(item.id)}
                            style={styles.removeCheckItemBtn}
                            hitSlop={6}
                          >
                            <X size={14} color={colors.accents.terracotta} />
                          </Pressable>
                        </View>
                      ))}

                      <Pressable onPress={handleAddChecklistItem} style={styles.addItemBtn}>
                        <Plus size={14} color={colors.brand.purple} />
                        <Text style={styles.addItemBtnText}>Add Another Item</Text>
                      </Pressable>
                    </View>

                    {/* Paper Tone */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Card Color</Text>
                      <View style={styles.tonesRow}>
                        {paperToneOptions.map((opt) => (
                          <Pressable
                            key={opt.id}
                            onPress={() => setEditPaperTone(opt.id)}
                            style={[
                              styles.toneCircle,
                              { backgroundColor: opt.color },
                              editPaperTone === opt.id && styles.toneCircleSelected,
                            ]}
                          >
                            {editPaperTone === opt.id && <Check size={12} color={colors.ink.primary} />}
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* 2. EDIT TEXT NOTE */}
                {pin.type === 'text' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Note Title (Optional)</Text>
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Title..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.inputLabel}>Body Content</Text>
                        <Pressable
                          onPress={handleToggleDictateEdit}
                          style={({ pressed }) => [
                            styles.dictateEditBtn,
                            isDictatingEdit && styles.dictateEditBtnActive,
                            pressed && { opacity: 0.75 },
                          ]}
                          hitSlop={6}
                        >
                          {isDictatingEdit ? <MicOff size={12} color="#FFF" /> : <Mic size={12} color={colors.brand.purple} />}
                          <Text style={[styles.dictateEditBtnText, isDictatingEdit && { color: '#FFF' }]}>
                            {isDictatingEdit ? 'Stop Dictating' : 'Speak to Write'}
                          </Text>
                        </Pressable>
                      </View>
                      <TextInput
                        value={editBody}
                        onChangeText={setEditBody}
                        placeholder="Write your note, or tap Speak to Write..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={6}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Author Note / Footnote</Text>
                      <TextInput
                        value={editAuthorNote}
                        onChangeText={setEditAuthorNote}
                        placeholder="e.g. — Harsh, handwritten note"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    {/* Paper Tone */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Paper Tone</Text>
                      <View style={styles.tonesRow}>
                        {paperToneOptions.map((opt) => (
                          <Pressable
                            key={opt.id}
                            onPress={() => setEditPaperTone(opt.id)}
                            style={[
                              styles.toneCircle,
                              { backgroundColor: opt.color },
                              editPaperTone === opt.id && styles.toneCircleSelected,
                            ]}
                          >
                            {editPaperTone === opt.id && <Check size={12} color={colors.ink.primary} />}
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* 3. EDIT THOUGHT */}
                {pin.type === 'thought' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.inputLabel}>Thought</Text>
                        <Pressable onPress={handleToggleDictateEdit} style={styles.dictateEditBtn} hitSlop={6}>
                          <Mic size={12} color={colors.brand.purple} />
                          <Text style={styles.dictateEditBtnText}>Speak</Text>
                        </Pressable>
                      </View>
                      <TextInput
                        value={editBody}
                        onChangeText={setEditBody}
                        placeholder="Quick thought or reflection..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                  </View>
                )}

                {/* 4. EDIT QUOTE */}
                {pin.type === 'quote' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Quote</Text>
                      <TextInput
                        value={editBody}
                        onChangeText={setEditBody}
                        placeholder="Quote text..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Author</Text>
                      <TextInput
                        value={editAuthor}
                        onChangeText={setEditAuthor}
                        placeholder="Author name..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Source / Book</Text>
                      <TextInput
                        value={editSource}
                        onChangeText={setEditSource}
                        placeholder="Book or source..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                )}

                {/* 5. EDIT PHOTO */}
                {pin.type === 'photo' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Change Photo</Text>
                      {editImageUrl ? (
                        <View style={styles.editImagePreviewWrap}>
                          <Image source={{ uri: editImageUrl }} style={styles.editImagePreview} resizeMode="cover" />
                        </View>
                      ) : null}
                      <DeviceImagePicker
                        onImageSelected={(base64) => setEditImageUrl(base64)}
                        buttonLabel="Upload New Photo from Device"
                      />
                      <TextInput
                        value={editImageUrl}
                        onChangeText={setEditImageUrl}
                        placeholder="Or paste photo URL..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Caption</Text>
                      <TextInput
                        value={editCaption}
                        onChangeText={setEditCaption}
                        placeholder="Write a caption..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.twoColumnRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Date</Text>
                        <TextInput
                          value={editDate}
                          onChangeText={setEditDate}
                          placeholder="e.g. August 2026"
                          placeholderTextColor={colors.ink.faded}
                          style={styles.textInput}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <TextInput
                          value={editLocation}
                          onChangeText={setEditLocation}
                          placeholder="e.g. Tokyo, Japan"
                          placeholderTextColor={colors.ink.faded}
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* 6. EDIT MUSIC */}
                {pin.type === 'music' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Song Title</Text>
                      <TextInput
                        value={editSongTitle}
                        onChangeText={setEditSongTitle}
                        placeholder="Song Title"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Artist</Text>
                      <TextInput
                        value={editArtist}
                        onChangeText={setEditArtist}
                        placeholder="Artist"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Spotify Track Link</Text>
                      <TextInput
                        value={editSpotifyUrl}
                        onChangeText={setEditSpotifyUrl}
                        placeholder="https://open.spotify.com/track/..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Personal Memory / Song Note</Text>
                      <TextInput
                        value={editMemoryNote}
                        onChangeText={setEditMemoryNote}
                        placeholder="Why this song is special..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={3}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                  </View>
                )}

                {/* 7. EDIT LINK */}
                {pin.type === 'link' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Headline</Text>
                      <TextInput
                        value={editHeadline}
                        onChangeText={setEditHeadline}
                        placeholder="Article Headline / Title"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Site Name</Text>
                      <TextInput
                        value={editSiteName}
                        onChangeText={setEditSiteName}
                        placeholder="Site Name"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>URL</Text>
                      <TextInput
                        value={editUrl}
                        onChangeText={setEditUrl}
                        placeholder="https://..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Commentary / Snippet</Text>
                      <TextInput
                        value={editSnippet}
                        onChangeText={setEditSnippet}
                        placeholder="Summary or thoughts on this link..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={3}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                  </View>
                )}

                {/* 8. EDIT JOURNAL */}
                {pin.type === 'journal' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Headline</Text>
                      <TextInput
                        value={editHeadline}
                        onChangeText={setEditHeadline}
                        placeholder="Journal Headline"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Date Label</Text>
                      <TextInput
                        value={editDate}
                        onChangeText={setEditDate}
                        placeholder="e.g. Friday, August 26"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Journal Entry</Text>
                      <TextInput
                        value={editBody}
                        onChangeText={setEditBody}
                        placeholder="Write your journal entry..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={7}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                  </View>
                )}

                {/* 9. EDIT VOICE NOTE */}
                {pin.type === 'voicenote' && (
                  <View style={{ gap: 12 }}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Title</Text>
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Voice Memo Title"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.inputLabel}>Transcript / Spoken Text</Text>
                        <Pressable onPress={handleToggleDictateEdit} style={styles.dictateEditBtn} hitSlop={6}>
                          {isDictatingEdit ? <MicOff size={12} color="#FFF" /> : <Mic size={12} color={colors.brand.purple} />}
                          <Text style={[styles.dictateEditBtnText, isDictatingEdit && { color: '#FFF' }]}>
                            {isDictatingEdit ? 'Stop Dictating' : 'Speak to Transcribe'}
                          </Text>
                        </Pressable>
                      </View>
                      <TextInput
                        value={editBody}
                        onChangeText={setEditBody}
                        placeholder="Transcript text..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={5}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>
                  </View>
                )}

                {/* Primary Save & Cancel Actions */}
                <View style={styles.editActionsRow}>
                  <Pressable
                    onPress={() => setIsEditing(false)}
                    style={styles.cancelEditBtn}
                  >
                    <Text style={styles.cancelEditBtnText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSaveEdit}
                    style={({ pressed }) => [styles.saveEditBtn, pressed && { opacity: 0.88 }]}
                  >
                    <Check size={15} color="#FFFFFF" strokeWidth={2.6} />
                    <Text style={styles.saveEditBtnText}>Save Changes</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          ) : (
            /* ========================================================================= */
            /* B. VIEW MODE VIEW                                                         */
            /* ========================================================================= */
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
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

              {/* Checklist Pin Render with Interactive Checkbox Toggles & Quick Edit Button */}
              {pin.type === 'checklist' && (
                <View style={styles.checklistBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={styles.detailTitle}>{pin.title}</Text>
                    <Pressable
                      onPress={() => setIsEditing(true)}
                      style={styles.quickEditBtn}
                      hitSlop={6}
                    >
                      <Pencil size={13} color={colors.brand.purple} />
                      <Text style={styles.quickEditBtnText}>Edit</Text>
                    </Pressable>
                  </View>

                  <View style={styles.checklistDetailList}>
                    {pin.items.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleChecklistItem(pin.id, item.id)}
                        style={({ pressed }) => [styles.checkItemRowInteractive, pressed && { opacity: 0.7 }]}
                      >
                        <View
                          style={[
                            styles.checkboxInteractive,
                            item.completed && styles.checkboxInteractiveDone,
                          ]}
                        >
                          {item.completed && <Check size={11} color="#FFF" strokeWidth={3} />}
                        </View>
                        <Text
                          style={[
                            styles.checkItemText,
                            item.completed && styles.checkItemTextDone,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </Pressable>
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

                  {/* Spotify Embed Preview Player */}
                  {Platform.OS === 'web' && pin.spotifyUrl && spotifyService.parseSpotifyUrl(pin.spotifyUrl).trackId && (
                    <View style={{ width: '100%', marginVertical: 12, borderRadius: 12, overflow: 'hidden' }}>
                      <iframe
                        src={`https://open.spotify.com/embed/track/${spotifyService.parseSpotifyUrl(pin.spotifyUrl).trackId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ borderRadius: 12, border: 'none', width: '100%', height: 80 }}
                      />
                    </View>
                  )}

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

              {/* Voice Note Pin Render with Playback and Convert to Note */}
              {pin.type === 'voicenote' && (
                <View style={styles.voiceBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={styles.detailTitle}>{pin.title}</Text>
                    <Text style={styles.detailVoiceDate}>{pin.recordedDate}</Text>
                  </View>

                  {/* Play/Pause Audio Player Card */}
                  {(pin as any).audioUrl && (
                    <View style={styles.voiceAudioCard}>
                      <Pressable
                        onPress={handleTogglePlayPinAudio}
                        style={({ pressed }) => [styles.voicePlayBtn, pressed && { opacity: 0.8 }]}
                        hitSlop={6}
                      >
                        {isPlayingAudio ? <Pause size={16} color="#FFF" /> : <Play size={16} color="#FFF" fill="#FFF" />}
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voiceAudioLabel}>
                          {isPlayingAudio ? 'Playing voice recording...' : `Voice Memo (${(pin as any).durationSeconds || 8}s)`}
                        </Text>
                        <Text style={styles.voiceAudioSub}>Recorded Audio</Text>
                      </View>
                    </View>
                  )}

                  {/* Transcript Content */}
                  <View style={styles.voiceTranscriptWrap}>
                    <Text style={styles.voiceTranscriptHeading}>Spoken Transcription</Text>
                    <Text style={styles.detailTranscript}>
                      {pin.transcriptExcerpt || (pin as any).transcription || 'No transcription available.'}
                    </Text>
                  </View>

                  {/* Quick Action: Convert to Written Note */}
                  <Pressable
                    onPress={handleConvertVoiceToNote}
                    style={({ pressed }) => [styles.convertVoiceToNoteBtn, pressed && { opacity: 0.85 }]}
                  >
                    <FileText size={14} color={colors.brand.purple} />
                    <Text style={styles.convertVoiceToNoteBtnText}>Convert Voice Memo to Written Note</Text>
                  </Pressable>
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

              {/* Photo Pin Render */}
              {pin.type === 'photo' && (
                <View style={styles.photoBlock}>
                  {Boolean(pin.imageUrl || (pin as any).url) && (
                    <View style={styles.detailPhotoFrame}>
                      <Image
                        source={{ uri: pin.imageUrl || (pin as any).url }}
                        style={styles.detailPhotoImg}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  {Boolean(pin.caption) && (
                    <Text style={styles.detailPhotoCaption}>{pin.caption}</Text>
                  )}
                  <View style={styles.photoMetaRow}>
                    {Boolean(pin.location) && (
                      <Text style={styles.detailLocation}>{pin.location}</Text>
                    )}
                    {Boolean(pin.handwrittenDate || (pin as any).date) && (
                      <Text style={styles.detailDateText}>{pin.handwrittenDate || (pin as any).date}</Text>
                    )}
                  </View>
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
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 15, 30, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    paddingTop: (Platform.OS === 'web' ? 'max(18px, env(safe-area-inset-top, 18px))' : 18) as any,
    paddingBottom: (Platform.OS === 'web' ? 'max(18px, env(safe-area-inset-bottom, 18px))' : 18) as any,
    paddingLeft: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-left, 14px))' : 14) as any,
    paddingRight: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-right, 14px))' : 14) as any,
  },
  contentCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    maxWidth: 500,
    width: '100%',
    maxHeight: '88%',
    padding: 18,
    position: 'relative',
    ...shadows.paperLifted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontWeight: '700',
    color: colors.brand.purpleDark,
    letterSpacing: 0.6,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#EDE8FF',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  moveDropdown: {
    backgroundColor: '#F7F3EB',
    padding: 10,
    borderRadius: 12,
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
    borderRadius: 6,
  },
  moveItemText: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    color: colors.ink.primary,
  },
  scrollBody: {
    maxHeight: 520,
  },
  editContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dictateEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#EDE8FF',
  },
  dictateEditBtnActive: {
    backgroundColor: '#EF4444',
  },
  dictateEditBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  textInput: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    color: colors.ink.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tonesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  toneCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneCircleSelected: {
    borderWidth: 2.5,
    borderColor: colors.brand.purple,
  },
  editCheckItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  removeCheckItemBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EDE8FF',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addItemBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  editImagePreviewWrap: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  editImagePreview: {
    width: '100%',
    height: '100%',
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  cancelEditBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  saveEditBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.brand.purple,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  saveEditBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#EDE8FF',
  },
  quickEditBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.purpleDark,
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
    marginTop: 4,
  },
  checkItemRowInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  checkboxInteractive: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInteractiveDone: {
    backgroundColor: colors.accents.sageOlive,
    borderColor: colors.accents.sageOlive,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotDone: {
    backgroundColor: colors.accents.sageOlive,
    borderColor: colors.accents.sageOlive,
  },
  checkItemText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    color: colors.ink.secondary,
    flex: 1,
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
    borderRadius: 12,
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
    paddingVertical: 8,
  },
  detailVoiceDate: {
    fontFamily: typography.families.handwritten,
    fontSize: 13.5,
    color: colors.ink.handwrittenFaded,
  },
  voiceAudioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F2FF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
  },
  voicePlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAudioLabel: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  voiceAudioSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  voiceTranscriptWrap: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  voiceTranscriptHeading: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.ink.tertiary,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  detailTranscript: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    color: colors.ink.secondary,
    lineHeight: 22,
  },
  convertVoiceToNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDE8FF',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.18)',
  },
  convertVoiceToNoteBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  linkBlock: {
    paddingVertical: 8,
  },
  detailLinkImg: {
    width: '100%',
    height: 160,
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 10,
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
    borderRadius: 10,
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
  photoBlock: {
    paddingVertical: 6,
  },
  detailPhotoFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EAE5DC',
    marginBottom: 12,
  },
  detailPhotoImg: {
    width: '100%',
    height: '100%',
  },
  detailPhotoCaption: {
    fontFamily: typography.families.handwritten,
    fontSize: 19,
    lineHeight: 23,
    color: colors.ink.handwritten,
    marginBottom: 6,
  },
  photoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailLocation: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    textTransform: 'lowercase',
  },
  detailDateText: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.handwrittenFaded,
    marginLeft: 'auto',
  },
});
