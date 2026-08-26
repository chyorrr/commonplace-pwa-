import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, Platform } from 'react-native';
import { useApp, ScreenTab } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  Home, 
  Inbox, 
  Heart, 
  Search, 
  Plus, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  Settings as SettingsIcon,
  Stamp,
  X
} from 'lucide-react-native';
import { UserAvatar } from './UserAvatar';

export const VerticalNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openCreateSheet,
    activeBoardId,
    setActiveBoardId,
    openSettings,
    openStickerStudio,
    deskItems,
    boards,
    reminders,
    user,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Gentle invitation pulse on side handle
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const toggleNav = (open: boolean) => {
    setIsOpen(open);
    Animated.spring(slideAnim, {
      toValue: open ? 1 : 0,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleTabPress = (tab: ScreenTab) => {
    if (activeBoardId && tab === 'home') {
      setActiveBoardId(null);
    }
    setActiveTab(tab);
    toggleNav(false);
  };

  const handleCreatePress = () => {
    openCreateSheet(activeTab === 'desk' ? 'desk' : 'board');
    toggleNav(false);
  };

  const isHomeActive = activeTab === 'home' && !activeBoardId;
  const isScheduleActive = activeTab === 'schedule';
  const isDeskActive = activeTab === 'desk';
  const isFavoritesActive = activeTab === 'favorites';
  const isSearchActive = activeTab === 'search';

  // Count favorites & upcoming reminders
  let favoritesCount = 0;
  boards.forEach((b) => b.pins.forEach((p) => { if (p.isFavorite) favoritesCount++; }));
  deskItems.forEach((d) => { if (d.pin.isFavorite) favoritesCount++; });

  const upcomingRemindersCount = reminders.filter((r) => r.status !== 'completed').length;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacityAnim = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* 1. Side Tab Handle with Arrow Only on Right Border */}
      {!isOpen && (
        <Animated.View style={[styles.handleAnchor, { transform: [{ scale: pulseAnim }] }]}>
          <Pressable
            onPress={() => toggleNav(true)}
            style={({ pressed }) => [styles.sideHandlePill, pressed && styles.handlePressed]}
            hitSlop={14}
            accessibilityLabel="Open Navigation Menu"
          >
            <ChevronLeft size={16} color="#FFFFFF" strokeWidth={2.8} />
          </Pressable>
        </Animated.View>
      )}

      {/* 2. Backdrop Overlay when Navigation is Open */}
      {isOpen && (
        <Animated.View style={[styles.backdropOverlay, { opacity: opacityAnim }]}>
          <Pressable style={styles.backdropPressable} onPress={() => toggleNav(false)} />
        </Animated.View>
      )}

      {/* 3. Floating Rounded Action Rail (Gaps above and below) */}
      <Animated.View
        style={[
          styles.floatingNavCapsule,
          {
            transform: [{ translateX }],
            pointerEvents: isOpen ? 'auto' : 'none',
          },
        ]}
      >
        {/* Top Close Button */}
        <Pressable onPress={() => toggleNav(false)} style={styles.closeBtn} hitSlop={8}>
          <X size={16} color={colors.ink.secondary} />
        </Pressable>

        {/* 1. Home */}
        <Pressable onPress={() => handleTabPress('home')} style={styles.navItem} hitSlop={6}>
          <View style={[styles.iconContainer, isHomeActive && styles.iconActiveBg]}>
            <Home
              size={19}
              color={isHomeActive ? colors.brand.purpleDark : colors.ink.secondary}
              strokeWidth={isHomeActive ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.navLabel, isHomeActive && styles.navLabelActive]}>Home</Text>
        </Pressable>

        {/* 2. Schedule / Reminders */}
        <Pressable onPress={() => handleTabPress('schedule')} style={styles.navItem} hitSlop={6}>
          <View style={[styles.iconContainer, isScheduleActive && styles.iconActiveBg]}>
            <Calendar
              size={19}
              color={isScheduleActive ? colors.brand.purpleDark : colors.ink.secondary}
              strokeWidth={isScheduleActive ? 2.4 : 1.8}
            />
            {upcomingRemindersCount > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{upcomingRemindersCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, isScheduleActive && styles.navLabelActive]}>Tasks</Text>
        </Pressable>

        {/* 3. The Desk */}
        <Pressable onPress={() => handleTabPress('desk')} style={styles.navItem} hitSlop={6}>
          <View style={[styles.iconContainer, isDeskActive && styles.iconActiveBg]}>
            <Inbox
              size={19}
              color={isDeskActive ? colors.brand.purpleDark : colors.ink.secondary}
              strokeWidth={isDeskActive ? 2.4 : 1.8}
            />
            {deskItems.length > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{deskItems.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, isDeskActive && styles.navLabelActive]}>Desk</Text>
        </Pressable>

        {/* 4. CENTER CREATE FAB */}
        <Pressable onPress={handleCreatePress} style={styles.navItem} hitSlop={6}>
          <View style={styles.createCircle}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <Text style={[styles.navLabel, styles.createLabel]}>Create</Text>
        </Pressable>

        {/* 5. Favorites */}
        <Pressable onPress={() => handleTabPress('favorites')} style={styles.navItem} hitSlop={6}>
          <View style={[styles.iconContainer, isFavoritesActive && styles.iconActiveBg]}>
            <Heart
              size={19}
              color={isFavoritesActive ? colors.brand.purpleDark : colors.ink.secondary}
              strokeWidth={isFavoritesActive ? 2.4 : 1.8}
              fill={isFavoritesActive ? colors.brand.purpleDark : 'none'}
            />
            {favoritesCount > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, isFavoritesActive && styles.navLabelActive]}>Saved</Text>
        </Pressable>

        {/* 6. Search */}
        <Pressable onPress={() => handleTabPress('search')} style={styles.navItem} hitSlop={6}>
          <View style={[styles.iconContainer, isSearchActive && styles.iconActiveBg]}>
            <Search
              size={19}
              color={isSearchActive ? colors.brand.purpleDark : colors.ink.secondary}
              strokeWidth={isSearchActive ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.navLabel, isSearchActive && styles.navLabelActive]}>Search</Text>
        </Pressable>

        {/* 7. Stickers */}
        <Pressable
          onPress={() => {
            openStickerStudio();
            toggleNav(false);
          }}
          style={styles.navItem}
          hitSlop={6}
        >
          <View style={styles.iconContainer}>
            <Stamp size={19} color={colors.ink.secondary} strokeWidth={1.8} />
          </View>
          <Text style={styles.navLabel}>Stickers</Text>
        </Pressable>
      </Animated.View>

      {/* 4. Separate Small Rounded-Edge Rectangle in Bottom-Left for Profile & Settings */}
      {isOpen && (
        <Animated.View style={[styles.bottomLeftWidget, { opacity: opacityAnim }]}>
          <View style={styles.profileAvatarWrap}>
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              name={user?.name || 'User'}
              size={36}
            />
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.profileTextInfo}>
            <Text style={styles.profileNameText} numberOfLines={1}>{user?.name || 'User'}</Text>
            <Text style={styles.profileStatusText}>Active</Text>
          </View>

          <Pressable
            onPress={() => {
              openSettings();
              toggleNav(false);
            }}
            style={styles.settingsIconBtn}
            hitSlop={8}
          >
            <SettingsIcon size={18} color={colors.ink.primary} />
          </Pressable>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  handleAnchor: {
    position: 'absolute',
    right: 0,
    top: '42%',
    zIndex: 95,
  },
  sideHandlePill: {
    width: 22,
    height: 52,
    backgroundColor: colors.brand.purple,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  handlePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 16, 28, 0.4)',
    zIndex: 90,
  },
  backdropPressable: {
    width: '100%',
    height: '100%',
  },
  floatingNavCapsule: {
    position: 'absolute',
    right: 12,
    top: 20,
    bottom: 20,
    width: 66,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconActiveBg: {
    backgroundColor: '#EDE8FA',
  },
  badgePill: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accents.sakura,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: typography.families.sans,
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  navLabel: {
    fontFamily: typography.families.sans,
    fontSize: 9,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  navLabelActive: {
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  createLabel: {
    color: colors.brand.purple,
    fontWeight: '700',
  },
  bottomLeftWidget: {
    position: 'absolute',
    left: 14,
    bottom: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-bottom, 20px))' : 20) as any,
    width: 175,
    height: 54,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 99,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 8,
  },
  profileAvatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    position: 'relative',
  },
  profileImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accents.onlineGreen,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTextInfo: {
    flex: 1,
  },
  profileNameText: {
    fontFamily: typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  profileStatusText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  settingsIconBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
