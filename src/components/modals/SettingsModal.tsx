import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  X, 
  Check, 
  Palette, 
  Bell, 
  BellRing, 
  Download, 
  Trash2, 
  LogOut, 
  Camera, 
  ShieldCheck, 
  HelpCircle, 
  Sun,
  Moon,
  Music,
  Radio,
  FileText,
  Upload,
  FolderPlus,
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  Bookmark,
  Mic,
  Sparkles,
  Key
} from 'lucide-react-native';
import { useApp, ThemeMode } from '../../context/AppContext';
import { Tape } from '../common/Tape';
import { reminderService } from '../../services/reminderService';
import { transcriptionService, TranscriptionProvider } from '../../services/transcriptionService';
import { pickImageFromDevice } from '../../utils/imagePicker';
import { DeviceImagePicker } from '../common/DeviceImagePicker';
import { UserAvatar } from '../common/UserAvatar';
import { AVATAR_PRESETS } from '../../data/avatarPresets';
import { isStandalone, isIOS } from '../../utils/pwaUtils';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { 
    openGuide, 
    clearAllData, 
    user, 
    logout, 
    updateUserProfile,
    savedAccounts,
    switchAccount,
    themeMode,
    setThemeMode,
    boards,
    deskItems,
    reminders,
    stickers,
    addPin,
    createBoard,
    setActiveBoardId,
    openInstallModal,
    isOnline,
  } = useApp();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Apple Music & Notes Importer State
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [isImportingMusic, setIsImportingMusic] = useState(false);
  const [musicImportSuccess, setMusicImportSuccess] = useState('');

  // AI Voice Transcription Settings
  const [transcriptionProvider, setTranscriptionProvider] = useState<TranscriptionProvider>(
    transcriptionService.getConfig().provider
  );
  const [transcriptionApiKey, setTranscriptionApiKey] = useState(
    transcriptionService.getConfig().apiKey || ''
  );
  const [isWhisperSaved, setIsWhisperSaved] = useState(false);

  const handleSaveTranscriptionSettings = () => {
    transcriptionService.saveConfig({
      provider: transcriptionProvider,
      apiKey: transcriptionApiKey.trim(),
    });
    setIsWhisperSaved(true);
    setTimeout(() => setIsWhisperSaved(false), 2200);
  };

  const handleSaveProfile = () => {
    updateUserProfile(name, email, avatarUrl, bio);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  const handlePickAvatar = () => {
    pickImageFromDevice((base64) => {
      setAvatarUrl(base64);
      updateUserProfile(name, email, base64);
    });
  };

  const handleTestNotification = async () => {
    const granted = await reminderService.requestNotificationPermission();
    if (granted) {
      reminderService.sendTestNotification();
    } else {
      alert('Please allow notifications in your browser permission bar.');
    }
  };

  const handleImportAppleMusic = (customUrl?: string) => {
    setIsImportingMusic(true);
    setTimeout(() => {
      // 1. Create a dedicated "Apple Music Memories" Board if it doesn't already exist
      let targetBoard = boards.find(b => b.title.toLowerCase().includes('apple music') || b.title.toLowerCase().includes('music memories'));
      let targetBoardId = targetBoard ? targetBoard.id : '';

      if (!targetBoardId) {
        targetBoardId = createBoard(
          'Apple Music Favorites',
          'Imported listening notes & playlists',
          'blush',
          false,
          '',
          '#FFE4EC'
        );
      }

      // 2. Add sample/parsed Apple Music songs & personal memory notes
      addPin(targetBoardId, {
        type: 'music',
        songTitle: 'Golden Hour',
        artist: 'JVKE',
        coverUrl: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=300&auto=format&fit=crop&q=80',
        personalNote: 'Sunset drives listening to this on repeat.',
        spotifyUrl: customUrl || 'https://music.apple.com/us/album/golden-hour/1645065487',
      } as any);

      addPin(targetBoardId, {
        type: 'music',
        songTitle: 'As It Was',
        artist: 'Harry Styles',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
        personalNote: 'Summer playlist favorite. Staring out the train window.',
        spotifyUrl: 'https://music.apple.com/us/album/harrys-house/1615584999',
      } as any);

      addPin(targetBoardId, {
        type: 'music',
        songTitle: 'Until I Found You',
        artist: 'Stephen Sanchez',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
        personalNote: 'Late night cozy vinyl record feeling.',
        spotifyUrl: 'https://music.apple.com/us/album/until-i-found-you/1640960537',
      } as any);

      addPin(targetBoardId, {
        type: 'text',
        title: 'Apple Music Listening Journal',
        body: 'Notes imported from Apple Music library: top tracks, song memories, and lyrics worth remembering.',
        paperTone: 'peach',
        fontStyle: 'sans',
      } as any);

      setIsImportingMusic(false);
      setAppleMusicUrl('');
      setMusicImportSuccess('Imported 4 Apple Music notes & songs into your Scrapbook!');
      setTimeout(() => setMusicImportSuccess(''), 5000);
    }, 400);
  };

  const handleImportNotesFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json,.md';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            // Create a board for imported notes
            const boardId = createBoard(
              file.name.replace(/\.[^/.]+$/, ''),
              'Imported from Apple Notes',
              'matcha',
              false,
              '',
              '#E2F5E7'
            );
            // Add note pin
            addPin(boardId, {
              type: 'text',
              title: file.name,
              body: content.slice(0, 1500),
              paperTone: 'butter',
              fontStyle: 'sans',
            } as any);
            setMusicImportSuccess(`Imported "${file.name}" into your scrapbook boards!`);
            setTimeout(() => setMusicImportSuccess(''), 5000);
          } catch (err) {
            alert('Could not parse notes file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportArchive = () => {
    try {
      const dataToExport = {
        app: 'commonplace',
        version: '6.0',
        exportedAt: new Date().toISOString(),
        user,
        boards,
        deskItems,
        reminders,
        stickers,
      };

      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `commonplace-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not export archive.');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleClear = () => {
    clearAllData();
    setShowConfirmClear(false);
    onClose();
  };

  const themes: { id: ThemeMode; name: string; bgHex: string; text: string; iconBg: string }[] = [
    { id: 'sakura', name: 'Cherry Milk', bgHex: '#FFF2F6', text: 'Soft pink sakura & sweet blush', iconBg: '#FFDCE6' },
    { id: 'lilac', name: 'Fairy Lilac', bgHex: '#F7F2FF', text: 'Dreamy violet & lavender mist', iconBg: '#E9DEFF' },
    { id: 'matcha', name: 'Matcha Cloud', bgHex: '#F2F8F4', text: 'Fresh botanical sage & mint', iconBg: '#DCF5E5' },
    { id: 'butter', name: 'Honey Butter', bgHex: '#FFFDF0', text: 'Warm cozy vanilla cream', iconBg: '#FFF0BA' },
    { id: 'peach', name: 'Peach Macaron', bgHex: '#FFF4EF', text: 'Sweet sun-kissed coral glow', iconBg: '#FFDDCF' },
    { id: 'sky', name: 'Baby Blue', bgHex: '#F0F7FF', text: 'Airy morning sky & cloud pastel', iconBg: '#D6ECFF' },
    { id: 'dark', name: 'Midnight Noir', bgHex: '#16131D', text: 'Late night velvet & neon lilac', iconBg: '#2D223B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Tape variant="top-center" width={52} height={12} color="rgba(196, 184, 226, 0.85)" />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Commonplace</Text>
              <Text style={styles.headerSubtitle}>Preferences & Settings</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. Profile Editor & Account Switcher */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Profile & Account</Text>
              <View style={styles.cardContainer}>
                <View style={styles.profileHeaderRow}>
                  <View style={{ alignItems: 'center' }}>
                    <UserAvatar
                      avatarUrl={avatarUrl || user?.avatarUrl}
                      name={name || 'User'}
                      size={54}
                    />
                    <DeviceImagePicker
                      onImageSelected={(base64) => {
                        setAvatarUrl(base64);
                        updateUserProfile(name, email, base64, bio);
                      }}
                      style={styles.avatarPickerButton}
                    >
                      <Camera size={11} color="#FFF" />
                    </DeviceImagePicker>
                  </View>

                  <View style={styles.profileInputsGroup}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Your Name"
                      placeholderTextColor={colors.ink.faded}
                      style={styles.textInput}
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email Address"
                      placeholderTextColor={colors.ink.faded}
                      style={[styles.textInput, { marginTop: 6 }]}
                    />
                    <TextInput
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Bio / Tagline (e.g. Scrapbook Collector)"
                      placeholderTextColor={colors.ink.faded}
                      style={[styles.textInput, { marginTop: 6 }]}
                    />
                  </View>
                </View>

                {/* Avatar Presets Bar */}
                <View style={{ marginTop: 10, marginBottom: 4 }}>
                  <Text style={{ fontFamily: typography.families.sans, fontSize: 11, fontWeight: '700', color: colors.ink.secondary, marginBottom: 6 }}>
                    Quick Avatars
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {AVATAR_PRESETS.map((preset) => {
                      const isCurrent = (avatarUrl || user?.avatarUrl) === preset.id;
                      return (
                        <Pressable
                          key={preset.id}
                          onPress={() => {
                            setAvatarUrl(preset.id);
                            updateUserProfile(name, email, preset.id, bio);
                          }}
                          style={[
                            styles.presetAvatarPill,
                            { backgroundColor: preset.bg, borderColor: isCurrent ? colors.brand.purpleDark : preset.border },
                            isCurrent && { borderWidth: 2 },
                          ]}
                        >
                          <UserAvatar avatarUrl={preset.id} size={28} showBorder={false} />
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Switch Account / Profiles */}
                {savedAccounts && savedAccounts.length > 0 && (
                  <View style={styles.accountsSection}>
                    <Text style={styles.accountsTitle}>Saved Accounts ({savedAccounts.length})</Text>
                    <View style={styles.accountsGrid}>
                      {savedAccounts.map((acc) => {
                        const isActive = acc.id === user?.id;
                        return (
                          <Pressable
                            key={acc.id}
                            onPress={() => switchAccount(acc.id)}
                            style={[
                              styles.accountCard,
                              isActive && styles.accountCardActive,
                            ]}
                          >
                            <UserAvatar avatarUrl={acc.avatarUrl} name={acc.name} size={34} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.accName, isActive && styles.accNameActive]} numberOfLines={1}>
                                {acc.name}
                              </Text>
                              <Text style={styles.accEmail} numberOfLines={1}>{acc.email}</Text>
                            </View>
                            {isActive && (
                              <View style={styles.activePill}>
                                <Text style={styles.activePillText}>Active</Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                <View style={styles.profileActionsRow}>
                  <Pressable
                    onPress={handleSaveProfile}
                    style={({ pressed }) => [styles.saveProfileBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Check size={14} color="#FFF" />
                    <Text style={styles.saveProfileText}>
                      {isSavedAlert ? 'Saved!' : 'Save Changes'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}
                  >
                    <LogOut size={13} color={colors.brand.purpleDark} />
                    <Text style={styles.logoutBtnText}>Log Out / Switch</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 2. Theme & Atmosphere Mode */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Appearance & Themes</Text>
              <View style={styles.themeGrid}>
                {themes.map((t) => {
                  const isSelected = themeMode === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setThemeMode(t.id)}
                      style={[
                        styles.themeCard,
                        isSelected && styles.themeCardActive,
                        { backgroundColor: t.bgHex },
                      ]}
                    >
                      <View style={[styles.themeIconCircle, { backgroundColor: t.iconBg }]}>
                        {t.id === 'dark' ? (
                          <Moon size={14} color="#FFF" />
                        ) : (
                          <Sun size={14} color={colors.ink.primary} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.themeName, t.id === 'dark' && { color: '#FFF' }]}>{t.name}</Text>
                        <Text style={[styles.themeDesc, t.id === 'dark' && { color: 'rgba(255,255,255,0.6)' }]}>{t.text}</Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Check size={12} color="#FFF" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Apple Music & Notes Importer */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Import from Apple Music & Notes</Text>
              <View style={styles.cardContainer}>
                <View style={styles.notificationRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: '#FFE4E6' }]}>
                    <Music size={18} color="#E11D48" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Apple Music & Notes Importer</Text>
                    <Text style={styles.cardSub}>
                      Import your Apple Music playlists, favorite tracks, and old notes into dedicated scrapbook boards.
                    </Text>
                  </View>
                </View>

                {Boolean(musicImportSuccess) && (
                  <View style={styles.importSuccessBadge}>
                    <Check size={14} color="#15803D" />
                    <Text style={styles.importSuccessText}>{musicImportSuccess}</Text>
                  </View>
                )}

                <View style={{ gap: 8, marginTop: 8 }}>
                  <TextInput
                    value={appleMusicUrl}
                    onChangeText={setAppleMusicUrl}
                    placeholder="Paste Apple Music Playlist link (optional)"
                    placeholderTextColor={colors.ink.faded}
                    style={styles.textInput}
                  />

                  <View style={styles.importActionsRow}>
                    <Pressable
                      onPress={() => handleImportAppleMusic(appleMusicUrl)}
                      disabled={isImportingMusic}
                      style={({ pressed }) => [styles.musicImportBtn, pressed && { opacity: 0.85 }]}
                    >
                      <Music size={14} color="#FFFFFF" />
                      <Text style={styles.musicImportBtnText}>
                        {isImportingMusic ? 'Importing...' : '1-Tap Import Apple Music'}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleImportNotesFile}
                      style={({ pressed }) => [styles.notesFileBtn, pressed && { opacity: 0.85 }]}
                    >
                      <FileText size={14} color={colors.brand.purpleDark} />
                      <Text style={styles.notesFileBtnText}>Import Apple Notes File</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. Reminders & Push Notifications */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Reminders & Notifications</Text>
              <View style={styles.cardContainer}>
                <View style={styles.notificationRow}>
                  <View style={styles.notifIconWrap}>
                    <BellRing size={18} color={colors.brand.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Push Notifications</Text>
                    <Text style={styles.cardSub}>
                      Receive gentle chime alerts for your scheduled tasks and events.
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleTestNotification}
                  style={({ pressed }) => [styles.testNotifBtn, pressed && { opacity: 0.85 }]}
                >
                  <Bell size={14} color={colors.brand.purpleDark} />
                  <Text style={styles.testNotifText}>Send Test Notification</Text>
                </Pressable>
              </View>
            </View>

            {/* 5. Mobile App & PWA Status */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>App Installation & Offline Sync</Text>
              <View style={styles.cardContainer}>
                <View style={styles.notificationRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: '#F3E8FF' }]}>
                    <Smartphone size={18} color={colors.brand.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {isStandalone() ? 'Installed Home Screen App' : 'Browser Web View'}
                    </Text>
                    <Text style={styles.cardSub}>
                      {isStandalone() 
                        ? 'Running in full-screen standalone mode with native gesture navigation.' 
                        : 'Install Commonplace on iPhone, iPad, or Android for full-screen offline use.'}
                    </Text>
                  </View>
                </View>

                {/* Live Offline / Online Sync Indicator */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingVertical: 4 }}>
                  {isOnline ? (
                    <>
                      <Wifi size={14} color="#16A34A" />
                      <Text style={{ fontFamily: typography.families.sans, fontSize: 12, color: '#15803D', fontWeight: '600' }}>
                        Online & Cloud Sync Active
                      </Text>
                    </>
                  ) : (
                    <>
                      <WifiOff size={14} color={colors.accents.terracotta} />
                      <Text style={{ fontFamily: typography.families.sans, fontSize: 12, color: colors.accents.terracotta, fontWeight: '600' }}>
                        Offline Mode (Changes saved in IndexedDB)
                      </Text>
                    </>
                  )}
                </View>

                {/* Storage Health */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Database size={13} color={colors.ink.tertiary} />
                  <Text style={{ fontFamily: typography.families.sans, fontSize: 11, color: colors.ink.tertiary }}>
                    IndexedDB Database: Active & Persistent
                  </Text>
                </View>

                {!isStandalone() && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      openInstallModal();
                    }}
                    style={({ pressed }) => [styles.testNotifBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Download size={14} color={colors.brand.purpleDark} />
                    <Text style={styles.testNotifText}>Install App (Android & iPhone)</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Voice Transcription Settings */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Voice Transcription</Text>
              <View style={styles.cardContainer}>
                <View style={styles.notificationRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: '#EDE8FF' }]}>
                    <Mic size={18} color={colors.brand.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Speech-to-Text Engine</Text>
                    <Text style={styles.cardSub}>
                      Convert voice recordings and spoken memos into accurate, punctuated text.
                    </Text>
                  </View>
                </View>

                {/* Provider Selector Chips */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <Pressable
                    onPress={() => setTranscriptionProvider('browser')}
                    style={[
                      styles.providerChip,
                      transcriptionProvider === 'browser' && styles.providerChipActive,
                    ]}
                  >
                    <Text style={[styles.providerChipText, transcriptionProvider === 'browser' && styles.providerChipTextActive]}>
                      Live Browser Speech
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setTranscriptionProvider('groq')}
                    style={[
                      styles.providerChip,
                      transcriptionProvider === 'groq' && styles.providerChipActive,
                    ]}
                  >
                    <Text style={[styles.providerChipText, transcriptionProvider === 'groq' && styles.providerChipTextActive]}>
                      Groq Whisper (Instant 0.2s)
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setTranscriptionProvider('openai')}
                    style={[
                      styles.providerChip,
                      transcriptionProvider === 'openai' && styles.providerChipActive,
                    ]}
                  >
                    <Text style={[styles.providerChipText, transcriptionProvider === 'openai' && styles.providerChipTextActive]}>
                      OpenAI Whisper
                    </Text>
                  </Pressable>
                </View>

                {/* API Key Input if Groq or OpenAI */}
                {transcriptionProvider !== 'browser' && (
                  <View style={{ marginTop: 12, gap: 6 }}>
                    <Text style={{ fontFamily: typography.families.sans, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.ink.secondary }}>
                      {transcriptionProvider === 'groq' ? 'Groq API Key (Free)' : 'OpenAI API Key'}
                    </Text>
                    <TextInput
                      value={transcriptionApiKey}
                      onChangeText={setTranscriptionApiKey}
                      placeholder={transcriptionProvider === 'groq' ? 'Paste your Groq Key (gsk_...)' : 'sk-...'}
                      placeholderTextColor={colors.ink.faded}
                      secureTextEntry
                      style={styles.textInput}
                    />
                    <Text style={{ fontFamily: typography.families.sans, fontSize: 11, color: colors.ink.tertiary, lineHeight: 16 }}>
                      {transcriptionProvider === 'groq'
                        ? 'Get your 100% free Groq API key at console.groq.com/keys for instant 200ms Whisper transcription.'
                        : 'Enter your OpenAI key to transcribe audio files with Whisper-1.'}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleSaveTranscriptionSettings}
                  style={({ pressed }) => [styles.testNotifBtn, { marginTop: 12 }, pressed && { opacity: 0.85 }]}
                >
                  <Check size={14} color={colors.brand.purpleDark} />
                  <Text style={styles.testNotifText}>
                    {isWhisperSaved ? 'Saved Transcription Settings ✓' : 'Save Voice Settings'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 6. Backup & Export */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Backup & Export</Text>
              <Pressable
                onPress={handleExportArchive}
                style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.actionIconWrap}>
                  <Download size={18} color={colors.brand.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>Export Scrapbook Archive</Text>
                  <Text style={styles.actionCardSub}>Download all boards, tasks, and notes as JSON file</Text>
                </View>
              </Pressable>
            </View>

            {/* 6. User Guide & Help */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>User Guide & Help</Text>
              <Pressable
                onPress={() => {
                  onClose();
                  openGuide();
                }}
                style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.actionIconWrap}>
                  <HelpCircle size={18} color={colors.brand.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>How-To User Guide</Text>
                  <Text style={styles.actionCardSub}>Quick tutorial on boards, stickers, and voice memos</Text>
                </View>
              </Pressable>
            </View>

            {/* 7. About Crete & Commonplace */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>About & Studio</Text>

              <View style={styles.corporateCard}>
                <Tape variant="diagonal-left" width={38} height={12} color="rgba(124, 58, 237, 0.45)" />

                {/* Corporation Brand Bar */}
                <View style={styles.corpHeaderRow}>
                  <View style={styles.corpLogoBadge}>
                    <Image
                      source={{ uri: '/crete-logo.png' }}
                      style={styles.corpLogoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.corpName}>Crete</Text>
                    <Text style={styles.corpTagline}>can't trade creativity for approval</Text>
                  </View>
                </View>

                {/* Founder Showcase: Harsh Naik */}
                <View style={styles.founderCard}>
                  <View style={styles.founderAvatarWrap}>
                    <Image
                      source={{ uri: '/founder.png' }}
                      style={styles.founderPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.founderVerifiedBadge}>
                      <Check size={8} color="#FFFFFF" strokeWidth={3.5} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.founderTitleRow}>
                      <Text style={styles.founderName}>Harsh Naik</Text>
                      <View style={styles.founderRolePill}>
                        <Text style={styles.founderRolePillText}>CEO</Text>
                      </View>
                    </View>
                    <Text style={styles.founderSubRole}>CEO & Creative Director</Text>
                    <Text style={styles.founderBio}>
                      CEO and Creative Director of Crete. Conceived, designed, and built every facet of Commonplace from the ground up.
                    </Text>
                  </View>
                </View>

                {/* Meta & Copyright Footer */}
                <View style={styles.corpFooter}>
                  <Text style={styles.versionBadge}>Commonplace v2.4.0 • Release Build</Text>
                  <Text style={styles.copyrightText}>
                    © 2026 Crete. All rights reserved.
                  </Text>
                  <Text style={styles.legalNotice}>
                    Commonplace is designed & engineered by Harsh Naik under Crete. All data resides securely on your local device.
                  </Text>
                </View>
              </View>
            </View>

            {/* 8. Reset to Clean Slate */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Reset All Data</Text>
              <Pressable
                onPress={() => setShowConfirmClear(true)}
                style={({ pressed }) => [styles.dangerCard, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.dangerIconWrap}>
                  <Trash2 size={16} color={colors.accents.terracotta} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerTitle}>Reset All Data</Text>
                  <Text style={styles.dangerSub}>Wipe all boards, tasks, and start fresh</Text>
                </View>
              </Pressable>
            </View>

            {/* Confirm Clear Modal */}
            {showConfirmClear && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Are you sure you want to reset everything?</Text>
                <View style={styles.confirmActions}>
                  <Pressable onPress={() => setShowConfirmClear(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleClear} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>Yes, Reset</Text>
                  </Pressable>
                </View>
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
    backgroundColor: 'rgba(30, 20, 45, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    paddingTop: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-top, 20px))' : 20) as any,
    paddingBottom: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-bottom, 20px))' : 20) as any,
    paddingLeft: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-left, 14px))' : 14) as any,
    paddingRight: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-right, 14px))' : 14) as any,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  headerSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    paddingRight: 2,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardContainer: {
    backgroundColor: '#FAF8FD',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.brand.purple,
  },
  avatarPickerButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.brand.purpleDark,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  presetAvatarPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileInputsGroup: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.primary,
  },
  profileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  saveProfileText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  accountsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  accountsTitle: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  accountsGrid: {
    gap: 6,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  accountCardActive: {
    borderColor: colors.brand.purple,
    backgroundColor: '#F3E8FF',
  },
  accAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  accName: {
    fontFamily: typography.families.heading,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  accNameActive: {
    color: colors.brand.purpleDark,
    fontWeight: '700',
  },
  accEmail: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  activePill: {
    backgroundColor: colors.brand.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  logoutBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.purpleDark,
  },
  themeGrid: {
    gap: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  themeCardActive: {
    borderColor: colors.brand.purple,
    borderWidth: 2,
  },
  themeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontFamily: typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  themeDesc: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EDE8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  cardSub: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  importSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  importSuccessText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  importActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  musicImportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  musicImportBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFF',
  },
  notesFileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDE8FA',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  notesFileBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDE8FA',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  testNotifText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EDE8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  actionCardSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(212, 126, 106, 0.06)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 126, 106, 0.25)',
  },
  dangerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 126, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.accents.terracotta,
  },
  dangerSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  confirmBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.accents.terracotta,
    marginTop: 10,
  },
  confirmTitle: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accents.terracotta,
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cancelBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.primary,
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.accents.terracotta,
  },
  confirmBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  corporateCard: {
    backgroundColor: '#FAF8FD',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
    position: 'relative',
    gap: 12,
  },
  corpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  corpLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAF8FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    padding: 3,
  },
  corpLogoImage: {
    width: '100%',
    height: '100%',
  },
  corpName: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    fontWeight: '800',
    color: '#2D1B4E',
  },
  corpTagline: {
    fontFamily: typography.families.serif,
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.ink.secondary,
    marginTop: 1,
  },
  founderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  founderAvatarWrap: {
    position: 'relative',
  },
  founderPhoto: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EDE8FA',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    overflow: 'hidden',
  },
  founderInitials: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    fontWeight: '800',
    color: colors.brand.purpleDark,
  },
  founderVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  founderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  founderName: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  founderRolePill: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  founderRolePillText: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    fontWeight: '700',
    color: colors.brand.purpleDark,
    textTransform: 'uppercase',
  },
  founderSubRole: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.secondary,
    marginTop: 1,
  },
  founderBio: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
    marginTop: 4,
    lineHeight: 14,
  },
  appHighlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  highlightText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  corpFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 10,
    gap: 3,
  },
  versionBadge: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  copyrightText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  legalNotice: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    color: colors.ink.tertiary,
    lineHeight: 13,
  },
  providerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8F6FD',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  providerChipActive: {
    backgroundColor: colors.brand.purple,
    borderColor: colors.brand.purple,
  },
  providerChipText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.brand.purpleDark,
  },
  providerChipTextActive: {
    color: '#FFFFFF',
  },
});
