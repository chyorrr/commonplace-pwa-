import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Animated, Easing } from 'react-native';
import { useApp, ScreenTab } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Home, Inbox, Heart, Search, Plus } from 'lucide-react-native';

type TabTone = 'home' | 'desk' | 'favorites' | 'search' | 'create';

interface AnimatedTabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  onPressCreate?: boolean;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tone: TabTone;
  primary?: boolean;
}

const AnimatedTabButton: React.FC<AnimatedTabButtonProps> = ({
  label,
  active,
  onPress,
  icon: Icon,
  primary = false,
}) => {
  const pressScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pressScale, {
      toValue: active ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, pressScale]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 170,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: active ? 1 : 0,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const iconScale = pressScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, primary ? 1.1 : 1.08],
  });

  const iconLift = pressScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, primary ? -1 : -2],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [styles.tabItem, active && styles.tabItemActive, pressed && styles.tabItemPressed, primary && styles.tabItemPrimary]}
      hitSlop={6}
    >
      <Animated.View style={[styles.iconBadge, primary && styles.iconBadgePrimary, { transform: [{ translateY: iconLift }, { scale: iconScale }] }]}>
        <Icon size={primary ? 16 : 14} color={active ? (primary ? '#FFF' : colors.accents.lavender) : colors.ink.tertiary} strokeWidth={primary ? 2.1 : 2} />
      </Animated.View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive, primary && styles.tabLabelPrimary]}>{label}</Text>
    </Pressable>
  );
};

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openCreateSheet, activeBoardId, setActiveBoardId } = useApp();

  const handleTabPress = (tab: ScreenTab) => {
    if (activeBoardId && tab === 'home') {
      setActiveBoardId(null);
    }
    setActiveTab(tab);
  };

  return (
    <View style={styles.navContainer} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        <AnimatedTabButton label="home" active={activeTab === 'home' && !activeBoardId} onPress={() => handleTabPress('home')} icon={Home} tone="home" />
        <AnimatedTabButton label="desk" active={activeTab === 'desk'} onPress={() => handleTabPress('desk')} icon={Inbox} tone="desk" />

        <View style={styles.centerFabContainer}>
          <Pressable
            onPress={() => openCreateSheet(activeTab === 'desk' ? 'desk' : 'board')}
            style={({ pressed }) => [styles.centerFab, pressed && styles.centerFabPressed]}
            hitSlop={8}
          >
            <View style={styles.centerFabIconWrap}>
              <Plus size={15} color="#FFF" strokeWidth={2.4} />
            </View>
            <Text style={styles.centerFabText}>create</Text>
          </Pressable>
        </View>

        <AnimatedTabButton label="favorites" active={activeTab === 'favorites'} onPress={() => handleTabPress('favorites')} icon={Heart} tone="favorites" />
        <AnimatedTabButton label="search" active={activeTab === 'search'} onPress={() => handleTabPress('search')} icon={Search} tone="search" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 22 : 14,
    alignItems: 'center',
    zIndex: 100,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(253, 251, 247, 0.94)', // Vanilla Milk translucent
    width: '100%',
    maxWidth: 420,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(35, 32, 29, 0.08)',
    shadowColor: '#2D2637',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 18,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: 'rgba(152, 132, 186, 0.15)',
  },
  tabItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  tabItemPrimary: {
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '500',
    color: colors.ink.tertiary,
    letterSpacing: 0.35,
    textTransform: 'lowercase',
  },
  tabLabelActive: {
    color: colors.accents.lavender,
    fontWeight: '600',
  },
  tabLabelPrimary: {
    color: colors.ink.primary,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(104, 86, 72, 0.04)',
  },
  iconBadgePrimary: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(104, 86, 72, 0.08)',
  },
  centerFabContainer: {
    width: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  centerFab: {
    minWidth: 82,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#3F352D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  centerFabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.94 }],
  },
  centerFabIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  centerFabText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFF',
  },
});
