import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Wifi, Battery } from 'lucide-react-native';

export const PhoneStatusBar: React.FC = () => {
  return (
    <View style={styles.statusBarContainer}>
      {/* Time */}
      <Text style={styles.timeText}>9:41</Text>

      {/* Dynamic Notch / Speaker Pill */}
      <View style={styles.dynamicPill} />

      {/* Signal / Wifi / Battery */}
      <View style={styles.iconsGroup}>
        {/* Cellular signal bars */}
        <View style={styles.signalBars}>
          <View style={[styles.bar, { height: 4 }]} />
          <View style={[styles.bar, { height: 6 }]} />
          <View style={[styles.bar, { height: 8 }]} />
          <View style={[styles.bar, { height: 10 }]} />
        </View>

        {/* Wifi */}
        <Wifi size={13} color={colors.ink.primary} strokeWidth={2.4} />

        {/* Battery */}
        <View style={styles.batteryContainer}>
          <View style={styles.batteryBody}>
            <View style={styles.batteryLevel} />
          </View>
          <View style={styles.batteryNip} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBarContainer: {
    height: 38,
    width: '100%',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  timeText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink.primary,
    letterSpacing: -0.2,
  },
  dynamicPill: {
    width: 90,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    opacity: 0.85,
  },
  iconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 10,
  },
  bar: {
    width: 2.2,
    backgroundColor: colors.ink.primary,
    borderRadius: 0.8,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  batteryBody: {
    width: 19,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.ink.primary,
    padding: 1.2,
  },
  batteryLevel: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.ink.primary,
    borderRadius: 1.5,
  },
  batteryNip: {
    width: 1.5,
    height: 4,
    backgroundColor: colors.ink.primary,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
});
