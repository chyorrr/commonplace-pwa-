import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Image, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography, getFontFamily } from '../../theme/typography';
import { AtmosphereType, NoteFontStyle, PinType } from '../../types';
import { 
  X, 
  Check, 
  Upload, 
  FolderPlus, 
  Mic, 
  Square
} from 'lucide-react-native';
import { Tape } from '../common/Tape';
import { DeviceImagePicker } from '../common/DeviceImagePicker';
import { speechAudioService } from '../../services/speechAndAudio';

export const CreateSheet: React.FC = () => {
  const {
    isCreateSheetOpen,
    closeCreateSheet,
    createTarget,
    activeBoardId,
    activeBoard,
    boards,
    addPin,
    addToDesk,
    createBoard,
    setActiveBoardId,
    initialCreateType,
  } = useApp();

  const [selectedType, setSelectedType] = useState<PinType | 'new-board' | null>(initialCreateType);

  useEffect(() => {
    if (isCreateSheetOpen) {
      setSelectedType(initialCreateType || null);
    }
  }, [isCreateSheetOpen, initialCreateType]);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [handwrittenDate, setHandwrittenDate] = useState('');
  const [location, setLocation] = useState('');
  const [paperTone, setPaperTone] = useState<'lilac' | 'peach' | 'butter' | 'sage' | 'sky' | 'vanilla'>('lilac');
  const [fontStyle, setFontStyle] = useState<NoteFontStyle>('sans');
  
  // Checklist form state
  const [checklistItems, setChecklistItems] = useState<string[]>(['', '']);
  
  // Link form state
  const [linkUrl, setLinkUrl] = useState('');
  const [siteName, setSiteName] = useState('');

  // Quote form state
  const [quoteAuthor, setQuoteAuthor] = useState('');

  // Spotify / Music form state
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [personalMemoryNote, setPersonalMemoryNote] = useState('');

  // New Board form state
  const [boardSubtitle, setBoardSubtitle] = useState('');
  const [boardAtmosphere, setBoardAtmosphere] = useState<AtmosphereType>('blush');
  const [boardColorHex, setBoardColorHex] = useState('#FFE8E1');
  const [isLockedBoard, setIsLockedBoard] = useState(false);
  const [boardPasscode, setBoardPasscode] = useState('');

  // Target board selector
  const [selectedBoardId, setSelectedBoardId] = useState<string>(activeBoardId || (boards[0]?.id ?? ''));

  // Voice Note state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const resetForm = () => {
    setSelectedType(null);
    setTitle('');
    setBody('');
    setCaption('');
    setImageUrl('');
    setHandwrittenDate('');
    setLocation('');
    setPaperTone('lilac');
    setFontStyle('sans');
    setChecklistItems(['', '']);
    setLinkUrl('');
    setSiteName('');
    setQuoteAuthor('');
    setSongTitle('');
    setArtist('');
    setSpotifyLink('');
    setPersonalMemoryNote('');
    setBoardSubtitle('');
    setBoardPasscode('');
    setIsLockedBoard(false);
  };

  const handleClose = () => {
    resetForm();
    closeCreateSheet();
  };

  const handleSubmit = () => {
    if (selectedType === 'new-board') {
      const newId = createBoard(
        title || 'Untitled Board',
        boardSubtitle || '0 items',
        boardAtmosphere,
        isLockedBoard,
        boardPasscode,
        boardColorHex
      );
      setActiveBoardId(newId);
      handleClose();
      return;
    }

    const targetBoard = createTarget === 'desk' ? null : (selectedBoardId || activeBoardId || boards[0]?.id);

    let pinData: any = {
      title: title.trim() || undefined,
      type: selectedType || 'text',
      rotation: +(Math.random() * 2.4 - 1.2).toFixed(1),
    };

    switch (selectedType) {
      case 'photo':
        if (!imageUrl) return;
        pinData = {
          ...pinData,
          type: 'photo',
          url: imageUrl,
          caption: caption || undefined,
          date: handwrittenDate || undefined,
          location: location || undefined,
        };
        break;

      case 'text':
      case 'thought':
        if (!body.trim() && !title.trim()) return;
        pinData = {
          ...pinData,
          type: 'text',
          title: title.trim() || undefined,
          body: body.trim(),
          paperTone,
          fontStyle,
          imageUrl: imageUrl || undefined,
        };
        break;

      case 'checklist':
        const validItems = checklistItems
          .filter((t) => t.trim().length > 0)
          .map((text, idx) => ({ id: `item-${Date.now()}-${idx}`, text, completed: false }));
        if (validItems.length === 0) return;
        pinData = {
          ...pinData,
          type: 'checklist',
          title: title.trim() || 'Checklist',
          items: validItems,
          paperTone,
        };
        break;

      case 'music':
        if (!songTitle.trim() && !artist.trim()) return;
        pinData = {
          ...pinData,
          type: 'music',
          songTitle: songTitle.trim() || 'Untitled Song',
          artist: artist.trim() || 'Unknown Artist',
          spotifyUrl: spotifyLink.trim() || undefined,
          note: personalMemoryNote.trim() || undefined,
        };
        break;

      case 'quote':
        if (!body.trim()) return;
        pinData = {
          ...pinData,
          type: 'quote',
          quote: body.trim(),
          author: quoteAuthor.trim() || undefined,
          paperTone,
        };
        break;

      case 'link':
        if (!linkUrl.trim()) return;
        pinData = {
          ...pinData,
          type: 'link',
          url: linkUrl.trim(),
          siteName: siteName.trim() || undefined,
          commentary: body.trim() || undefined,
        };
        break;

      case 'voicenote':
        pinData = {
          ...pinData,
          type: 'voicenote',
          title: title.trim() || 'Voice Memo',
          durationSec: recordedDuration || 12,
          transcription: body.trim() || undefined,
          waveform: [0.3, 0.6, 0.8, 0.9, 0.6, 0.4, 0.7, 0.8, 0.5, 0.3],
        };
        break;
    }

    if (createTarget === 'desk' || !targetBoard) {
      addToDesk(pinData);
    } else {
      addPin(targetBoard, pinData);
    }

    handleClose();
  };

  const createOptions: { id: PinType | 'new-board'; title: string; subtitle: string }[] = [
    { id: 'new-board', title: 'New Board', subtitle: 'Create a mood folder' },
    { id: 'photo', title: 'Upload Photo', subtitle: 'From camera roll' },
    { id: 'text', title: 'Written Note', subtitle: 'Thoughts & reflections' },
    { id: 'checklist', title: 'Checklist', subtitle: 'To-do list or goals' },
    { id: 'music', title: 'Song & Spotify', subtitle: 'Track & memory note' },
    { id: 'quote', title: 'Quote', subtitle: 'Inspiring words' },
    { id: 'link', title: 'Web Link', subtitle: 'Save website or article' },
    { id: 'voicenote', title: 'Voice Memo', subtitle: 'Audio recording' },
  ];

  const boardAtmospheres = [
    { id: 'blush' as AtmosphereType, name: 'Blush Peach', hex: '#FFE8E1' },
    { id: 'butter' as AtmosphereType, name: 'Warm Butter', hex: '#FEF3D6' },
    { id: 'lavender' as AtmosphereType, name: 'Soft Lilac', hex: '#EBE6FB' },
    { id: 'matcha' as AtmosphereType, name: 'Matcha Mint', hex: '#DDF2EB' },
    { id: 'periwinkle' as AtmosphereType, name: 'Sky Blue', hex: '#DDF0FB' },
  ];

  const paperToneOptions = [
    { id: 'lilac', name: 'Lilac', color: '#F5EEFC' },
    { id: 'peach', name: 'Peach', color: '#FFF5ED' },
    { id: 'butter', name: 'Butter', color: '#FEF9EB' },
    { id: 'sage', name: 'Sage', color: '#F0F9F3' },
    { id: 'sky', name: 'Sky', color: '#EFF6FF' },
  ];

  return (
    <Modal visible={isCreateSheetOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Tape variant="top-center" width={52} height={12} color="rgba(245, 158, 11, 0.85)" />

          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {selectedType === 'new-board'
                  ? 'Create New Board'
                  : selectedType
                  ? `Add ${createOptions.find((o) => o.id === selectedType)?.title || 'Item'}`
                  : 'Create Something'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {selectedType
                  ? 'Fill out the details below'
                  : 'Choose what you would like to add'}
              </Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Step 1: Selection Grid */}
            {selectedType === null && (
              <View style={styles.optionsGrid}>
                {createOptions.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedType(opt.id)}
                    style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
                  >
                    <Text style={styles.optionCardTitle}>{opt.title}</Text>
                    <Text style={styles.optionCardSub}>{opt.subtitle}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Step 2: Form Views */}
            {selectedType !== null && (
              <View style={styles.formContainer}>
                {/* Back to Options Link */}
                <Pressable onPress={() => setSelectedType(null)} style={styles.backLink} hitSlop={6}>
                  <Text style={styles.backLinkText}>← Choose Different Type</Text>
                </Pressable>

                {/* --- 1. NEW BOARD FORM --- */}
                {selectedType === 'new-board' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Board Name</Text>
                      <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Memories, Travel Plans, Ideas..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Subtitle (Optional)</Text>
                      <TextInput
                        value={boardSubtitle}
                        onChangeText={setBoardSubtitle}
                        placeholder="e.g. Summer collection, recipes..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Board Color Theme</Text>
                      <View style={styles.colorPillsRow}>
                        {boardAtmospheres.map((atm) => (
                          <Pressable
                            key={atm.id}
                            onPress={() => {
                              setBoardAtmosphere(atm.id);
                              setBoardColorHex(atm.hex);
                            }}
                            style={[
                              styles.colorPill,
                              { backgroundColor: atm.hex },
                              boardColorHex === atm.hex && styles.colorPillSelected,
                            ]}
                          >
                            <Text style={styles.colorPillText}>{atm.name}</Text>
                            {boardColorHex === atm.hex && <Check size={14} color={colors.ink.primary} />}
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {/* --- 2. PHOTO PIN FORM --- */}
                {selectedType === 'photo' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Select Photo</Text>
                      {imageUrl ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                          <Pressable onPress={() => setImageUrl('')} style={styles.removeImageBtn} hitSlop={6}>
                            <X size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      ) : (
                        <View style={{ gap: 10 }}>
                          <DeviceImagePicker
                            onImageSelected={(base64) => setImageUrl(base64)}
                            buttonLabel="Choose Photo from Phone / Camera"
                          />

                          <TextInput
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            placeholder="Or paste image URL (https://...)"
                            placeholderTextColor={colors.ink.faded}
                            style={styles.textInput}
                          />

                          {/* Quick Sample Photos */}
                          <View style={{ gap: 4 }}>
                            <Text style={{ fontFamily: typography.families.sans, fontSize: 11, fontWeight: '700', color: colors.ink.tertiary, textTransform: 'uppercase' }}>
                              Or Pick a Sample Aesthetic Photo:
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {[
                                { label: '🌸 Sakura', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600' },
                                { label: '☕ Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600' },
                                { label: '🌊 Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
                                { label: '📖 Books', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
                              ].map((item, idx) => (
                                <Pressable
                                  key={idx}
                                  onPress={() => setImageUrl(item.url)}
                                  style={{
                                    backgroundColor: '#FAF5FF',
                                    paddingHorizontal: 8,
                                    paddingVertical: 5,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E9D5FF',
                                  }}
                                >
                                  <Text style={{ fontFamily: typography.families.sans, fontSize: 11, color: colors.brand.purpleDark, fontWeight: '600' }}>
                                    {item.label}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Caption (Optional)</Text>
                      <TextInput
                        value={caption}
                        onChangeText={setCaption}
                        placeholder="Write a memory or caption..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.twoColumnRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Date</Text>
                        <TextInput
                          value={handwrittenDate}
                          onChangeText={setHandwrittenDate}
                          placeholder="e.g. August 2026"
                          placeholderTextColor={colors.ink.faded}
                          style={styles.textInput}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <TextInput
                          value={location}
                          onChangeText={setLocation}
                          placeholder="e.g. Kyoto, Japan"
                          placeholderTextColor={colors.ink.faded}
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* --- 3. TEXT NOTE FORM --- */}
                {selectedType === 'text' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Title (Optional)</Text>
                      <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Note title..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Your Thoughts</Text>
                      <TextInput
                        value={body}
                        onChangeText={setBody}
                        placeholder="Write your note, thoughts, reflections..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={5}
                        style={[styles.textInput, styles.textArea]}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Paper Tone</Text>
                      <View style={styles.paperToneRow}>
                        {paperToneOptions.map((opt) => (
                          <Pressable
                            key={opt.id}
                            onPress={() => setPaperTone(opt.id as any)}
                            style={[
                              styles.paperToneCircle,
                              { backgroundColor: opt.color },
                              paperTone === opt.id && styles.paperToneCircleSelected,
                            ]}
                          >
                            {paperTone === opt.id && <Check size={12} color={colors.ink.primary} />}
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {/* --- 4. CHECKLIST FORM --- */}
                {selectedType === 'checklist' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Checklist Title</Text>
                      <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Daily Routine, Packing List..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Items</Text>
                      {checklistItems.map((item, index) => (
                        <View key={index} style={styles.checklistItemRow}>
                          <Square size={16} color={colors.ink.tertiary} />
                          <TextInput
                            value={item}
                            onChangeText={(text) => {
                              const updated = [...checklistItems];
                              updated[index] = text;
                              setChecklistItems(updated);
                            }}
                            placeholder={`Item ${index + 1}`}
                            placeholderTextColor={colors.ink.faded}
                            style={[styles.textInput, { flex: 1 }]}
                          />
                        </View>
                      ))}

                      <Pressable
                        onPress={() => setChecklistItems([...checklistItems, ''])}
                        style={styles.addItemBtn}
                      >
                        <Text style={styles.addItemBtnText}>+ Add Another Item</Text>
                      </Pressable>
                    </View>
                  </>
                )}

                {/* --- 5. SPOTIFY / MUSIC FORM --- */}
                {selectedType === 'music' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Song Title</Text>
                      <TextInput
                        value={songTitle}
                        onChangeText={setSongTitle}
                        placeholder="e.g. Golden Hour"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Artist</Text>
                      <TextInput
                        value={artist}
                        onChangeText={setArtist}
                        placeholder="e.g. JVKE"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Spotify URL (Optional)</Text>
                      <TextInput
                        value={spotifyLink}
                        onChangeText={setSpotifyLink}
                        placeholder="Paste Spotify track link"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                  </>
                )}

                {/* --- 6. QUOTE FORM --- */}
                {selectedType === 'quote' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Quote Text</Text>
                      <TextInput
                        value={body}
                        onChangeText={setBody}
                        placeholder="Enter the quote..."
                        placeholderTextColor={colors.ink.faded}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, styles.textArea]}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Author</Text>
                      <TextInput
                        value={quoteAuthor}
                        onChangeText={setQuoteAuthor}
                        placeholder="e.g. Albert Camus, Virginia Woolf"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                  </>
                )}

                {/* --- 7. WEB LINK FORM --- */}
                {selectedType === 'link' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Website URL</Text>
                      <TextInput
                        value={linkUrl}
                        onChangeText={setLinkUrl}
                        placeholder="https://..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Site Name or Title</Text>
                      <TextInput
                        value={siteName}
                        onChangeText={setSiteName}
                        placeholder="e.g. Design Inspiration"
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                      />
                    </View>
                  </>
                )}

                {/* --- 8. VOICE MEMO FORM --- */}
                {selectedType === 'voicenote' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Recording Title</Text>
                      <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Morning thoughts..."
                        placeholderTextColor={colors.ink.faded}
                        style={styles.textInput}
                        autoFocus
                      />
                    </View>

                    <View style={styles.voiceCard}>
                      <Mic size={24} color={colors.brand.purple} style={{ marginBottom: 6 }} />
                      <Text style={styles.voiceCardTitle}>
                        {isRecordingAudio ? 'Recording Voice Memo...' : 'Ready to Record'}
                      </Text>
                      <Text style={styles.voiceCardSub}>Tap below to start speaking</Text>
                      <Pressable
                        onPress={() => setIsRecordingAudio(!isRecordingAudio)}
                        style={[styles.recordBtn, isRecordingAudio && styles.recordBtnActive]}
                      >
                        <Text style={styles.recordBtnText}>
                          {isRecordingAudio ? 'Stop Recording' : 'Start Recording'}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}

                {/* Board Destination Selector if not New Board */}
                {selectedType !== 'new-board' && boards.length > 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Save To Board</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardSelectRow}>
                      {boards.map((b) => (
                        <Pressable
                          key={b.id}
                          onPress={() => setSelectedBoardId(b.id)}
                          style={[
                            styles.boardSelectChip,
                            selectedBoardId === b.id && styles.boardSelectChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.boardSelectText,
                              selectedBoardId === b.id && styles.boardSelectTextActive,
                            ]}
                          >
                            {b.title}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Primary Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
                >
                  <Text style={styles.submitBtnText}>
                    {selectedType === 'new-board' ? 'Create Board' : 'Add to Scrapbook'}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
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
  modalCard: {
    backgroundColor: '#FAF8FD',
    borderRadius: 24,
    maxWidth: 480,
    width: '100%',
    maxHeight: '88%',
    padding: 22,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  scrollBody: {
    marginTop: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  optionCardPressed: {
    backgroundColor: '#F7F3FF',
    borderColor: colors.brand.purple,
    transform: [{ scale: 0.98 }],
  },
  optionCardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 3,
  },
  optionCardSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  formContainer: {
    paddingBottom: 16,
  },
  backLink: {
    marginBottom: 14,
  },
  backLinkText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.purple,
  },
  inputGroup: {
    marginBottom: 14,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inputLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    color: colors.ink.primary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  colorPillSelected: {
    borderColor: colors.brand.purple,
  },
  colorPillText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  uploadBoxTitle: {
    fontFamily: typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  uploadBoxSub: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  paperToneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paperToneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  paperToneCircleSelected: {
    borderWidth: 2,
    borderColor: colors.brand.purple,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addItemBtn: {
    paddingVertical: 6,
  },
  addItemBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purple,
  },
  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  voiceCardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  voiceCardSub: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.tertiary,
    marginTop: 2,
    marginBottom: 12,
  },
  recordBtn: {
    backgroundColor: colors.brand.purple,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  recordBtnActive: {
    backgroundColor: colors.accents.terracotta,
  },
  recordBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boardSelectRow: {
    gap: 8,
  },
  boardSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  boardSelectChipActive: {
    backgroundColor: colors.brand.purple,
  },
  boardSelectText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  boardSelectTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: colors.brand.purple,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  submitBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
