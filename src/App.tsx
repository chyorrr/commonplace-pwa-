import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Platform, Pressable, Animated } from 'react-native';
import { AppProvider, useApp, ThemeMode } from './context/AppContext';
import { VerticalNav } from './components/common/VerticalNav';
import { HomeScreen } from './screens/HomeScreen';
import { BoardDetailScreen } from './screens/BoardDetailScreen';
import { DeskScreen } from './screens/DeskScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { AuthScreen } from './screens/AuthScreen';
import { CreateSheet } from './components/modals/CreateSheet';
import { PinDetailModal } from './components/modals/PinDetailModal';
import { StickerStudioModal } from './components/modals/StickerStudioModal';
import { PrivacyLockModal } from './components/modals/PrivacyLockModal';
import { GuideModal } from './components/modals/GuideModal';
import { NoteEditorModal } from './components/modals/NoteEditorModal';
import { VoiceNoteModal } from './components/modals/VoiceNoteModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AddToHomeScreenModal } from './components/common/AddToHomeScreenModal';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { colors } from './theme/colors';
import { typography } from './theme/typography';
import { reminderService, InAppToastPayload } from './services/reminderService';
import { BellRing, X } from 'lucide-react-native';

const MainNavigator: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeBoardId,
    setActiveBoardId,
    isGuideOpen,
    closeGuide,
    isSettingsOpen,
    closeSettings,
    isNoteEditorOpen,
    closeNoteEditor,
    isVoiceNoteOpen,
    closeVoiceNote,
    isInstallModalOpen,
    closeInstallModal,
  } = useApp();

  const [activeToast, setActiveToast] = useState<InAppToastPayload | null>(null);

  useEffect(() => {
    const unsubscribe = reminderService.subscribeToast((toast) => {
      setActiveToast(toast);
      setTimeout(() => {
        setActiveToast((current) => (current?.id === toast.id ? null : current));
      }, 7000);
    });
    return () => unsubscribe();
  }, []);

  const renderActiveScreen = () => {
    if (activeBoardId) {
      return <BoardDetailScreen />;
    }

    switch (activeTab) {
      case 'schedule':
        return <ScheduleScreen />;
      case 'desk':
        return <DeskScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'search':
        return <SearchScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.appViewport}>
      {/* Main Content Area */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Floating Action Rail & Bottom-Left Profile Widget */}
      <VerticalNav />

      {/* Real-time In-App Reminder Alert Toast */}
      {Boolean(activeToast) && (
        <Pressable
          style={styles.toastBanner}
          onPress={() => {
            setActiveToast(null);
            if (activeBoardId) setActiveBoardId(null);
            setActiveTab('schedule');
          }}
        >
          <View style={styles.toastBellCircle}>
            <BellRing size={16} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <View style={styles.toastTextCol}>
            <Text style={styles.toastTitle}>{activeToast?.title}</Text>
            <Text style={styles.toastBody} numberOfLines={1}>{activeToast?.body}</Text>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              setActiveToast(null);
            }}
            style={styles.toastCloseBtn}
            hitSlop={8}
          >
            <X size={14} color={colors.ink.secondary} />
          </Pressable>
        </Pressable>
      )}

      {/* Modals & Overlays */}
      <CreateSheet />
      <NoteEditorModal visible={isNoteEditorOpen} onClose={closeNoteEditor} />
      <VoiceNoteModal visible={isVoiceNoteOpen} onClose={closeVoiceNote} />
      <PinDetailModal />
      <StickerStudioModal />
      <PrivacyLockModal />

      {/* Interactive Guide, Settings & iOS/Android Add To Home Screen Helper */}
      <GuideModal visible={isGuideOpen} onClose={closeGuide} />
      <SettingsModal visible={isSettingsOpen} onClose={closeSettings} />
      <AddToHomeScreenModal visible={isInstallModalOpen} onClose={closeInstallModal} />
      <PWAInstallBanner />
    </View>
  );
};

const RootNavigator: React.FC = () => {
  const { isAuthenticated, themeMode } = useApp();

  const themeAtmospheres: Record<ThemeMode, { bg: string; orb1: string; orb2: string; orb3: string; orb4: string; isDark?: boolean }> = {
    sakura: {
      bg: '#FFF2F6',
      orb1: '#FFD1E0',
      orb2: '#F3D2FF',
      orb3: '#FFF3C4',
      orb4: '#FFE0EB',
    },
    lilac: {
      bg: '#F7F2FF',
      orb1: '#EAD9FF',
      orb2: '#D9E8FF',
      orb3: '#FFF0D4',
      orb4: '#E6DCFF',
    },
    matcha: {
      bg: '#F2F8F4',
      orb1: '#D6F5E3',
      orb2: '#E0F8EE',
      orb3: '#FEFAD4',
      orb4: '#DCF5EC',
    },
    butter: {
      bg: '#FFFDF0',
      orb1: '#FFE8CC',
      orb2: '#FFF0B8',
      orb3: '#F3E5FF',
      orb4: '#E2F4FF',
    },
    peach: {
      bg: '#FFF4EF',
      orb1: '#FFD6C4',
      orb2: '#FFE4EE',
      orb3: '#FFF0CB',
      orb4: '#E2F2FF',
    },
    sky: {
      bg: '#F0F7FF',
      orb1: '#D6ECFF',
      orb2: '#E6DEFF',
      orb3: '#FEF8D6',
      orb4: '#C2E8FF',
    },
    dark: {
      bg: '#16131D',
      orb1: '#2F1A2A',
      orb2: '#2B1D42',
      orb3: '#30281D',
      orb4: '#1B2A3B',
      isDark: true,
    },
  };

  const currentTheme = themeAtmospheres[themeMode] || themeAtmospheres.sakura;

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = currentTheme.bg;
      document.documentElement.style.backgroundColor = currentTheme.bg;
      const rootDiv = document.getElementById('root');
      if (rootDiv) rootDiv.style.backgroundColor = currentTheme.bg;
    }
  }, [currentTheme]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: currentTheme.bg }]}>
      {/* Dreamy Ambient Watercolor Blooms */}
      <View style={[styles.ambientOrb, styles.orb1, { backgroundColor: currentTheme.orb1 }, currentTheme.isDark && { opacity: 0.18 }]} pointerEvents="none" />
      <View style={[styles.ambientOrb, styles.orb2, { backgroundColor: currentTheme.orb2 }, currentTheme.isDark && { opacity: 0.18 }]} pointerEvents="none" />
      <View style={[styles.ambientOrb, styles.orb3, { backgroundColor: currentTheme.orb3 }, currentTheme.isDark && { opacity: 0.18 }]} pointerEvents="none" />
      <View style={[styles.ambientOrb, styles.orb4, { backgroundColor: currentTheme.orb4 }, currentTheme.isDark && { opacity: 0.18 }]} pointerEvents="none" />

      <StatusBar barStyle={currentTheme.isDark ? 'light-content' : 'dark-content'} backgroundColor={currentTheme.bg} />
      <SafeAreaView style={styles.safeArea}>
        <MainNavigator />
      </SafeAreaView>
    </View>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 500, // Max width for crisp phone aesthetic on web
    height: '100%',
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  appViewport: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  screenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  toastBanner: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
  },
  toastBellCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastTextCol: {
    flex: 1,
  },
  toastTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  toastBody: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
    marginTop: 1,
  },
  toastCloseBtn: {
    padding: 6,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  orb1: {
    width: 340,
    height: 340,
    top: -60,
    left: -60,
  },
  orb2: {
    width: 320,
    height: 320,
    top: '28%',
    right: -70,
  },
  orb3: {
    width: 280,
    height: 280,
    bottom: '12%',
    left: -50,
  },
  orb4: {
    width: 300,
    height: 300,
    bottom: -70,
    right: -50,
  },
});

export default App;
