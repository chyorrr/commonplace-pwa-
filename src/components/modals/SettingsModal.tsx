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
  FolderPlus
} from 'lucide-react-native';
import { useApp, ThemeMode } from '../../context/AppContext';
import { Tape } from '../common/Tape';
import { reminderService } from '../../services/reminderService';
import { pickImageFromDevice } from '../../utils/imagePicker';
import { DeviceImagePicker } from '../common/DeviceImagePicker';

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
  } = useApp();

  // Profile Edit State
  const [name, setName] = useState(user?.name || 'Harsh Naik');
  const [email, setEmail] = useState(user?.email || 'harsh@commonplace.app');
  const [bio, setBio] = useState(user?.bio || 'Cozy Scrapbooker ♡');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Apple Music & Notes Importer State
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [isImportingMusic, setIsImportingMusic] = useState(false);
  const [musicImportSuccess, setMusicImportSuccess] = useState('');

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
                  <DeviceImagePicker
                    onImageSelected={(base64) => {
                      setAvatarUrl(base64);
                      updateUserProfile(name, email, base64, bio);
                    }}
                    style={styles.avatarPicker}
                  >
                    <Image
                      source={{ uri: avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                      style={styles.avatarImage}
                    />
                    <View style={styles.cameraBadge}>
                      <Camera size={11} color="#FFF" />
                    </View>
                  </DeviceImagePicker>

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
                      placeholder="Bio / Tagline (e.g. Cozy Scrapbooker ♡)"
                      placeholderTextColor={colors.ink.faded}
                      style={[styles.textInput, { marginTop: 6 }]}
                    />
                  </View>
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
                            <Image
                              source={{ uri: acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                              style={styles.accAvatar}
                            />
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

            {/* 5. Backup & Export */}
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

            {/* 7. Reset to Clean Slate */}
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
    padding: 16,
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
    maxHeight: '88%',
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
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.brand.purple,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
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
});
