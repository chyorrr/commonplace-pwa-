import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface TapeProps {
  style?: ViewStyle;
  variant?: 'top-center' | 'top-corners' | 'diagonal-left' | 'diagonal-right';
  tapeColor?: string;
  color?: string;
  width?: number;
  height?: number;
}

export const Tape: React.FC<TapeProps> = ({
  style,
  variant = 'top-center',
  tapeColor,
  color,
  width = 64,
  height = 18,
}) => {
  const resolvedTapeColor = tapeColor || color || colors.tape.lavender;

  if (variant === 'top-corners') {
    return (
      <>
        <View
          style={[
            styles.tapeBase,
            {
              backgroundColor: resolvedTapeColor,
              width: width * 0.7,
              height: height * 0.9,
              position: 'absolute',
              top: -6,
              left: 10,
              transform: [{ rotate: '-12deg' }],
            },
            style,
          ]}
        />
        <View
          style={[
            styles.tapeBase,
            {
              backgroundColor: resolvedTapeColor,
              width: width * 0.7,
              height: height * 0.9,
              position: 'absolute',
              top: -6,
              right: 10,
              transform: [{ rotate: '14deg' }],
            },
            style,
          ]}
        />
      </>
    );
  }

  if (variant === 'diagonal-left') {
    return (
      <View
        style={[
          styles.tapeBase,
          {
            backgroundColor: resolvedTapeColor,
            width,
            height,
            position: 'absolute',
            top: -6,
            left: -8,
            transform: [{ rotate: '-18deg' }],
          },
          style,
        ]}
      />
    );
  }

  if (variant === 'diagonal-right') {
    return (
      <View
        style={[
          styles.tapeBase,
          {
            backgroundColor: resolvedTapeColor,
            width,
            height,
            position: 'absolute',
            top: -6,
            right: -8,
            transform: [{ rotate: '18deg' }],
          },
          style,
        ]}
      />
    );
  }

  // default: top-center
  return (
    <View
      style={[
        styles.tapeBase,
        {
          backgroundColor: resolvedTapeColor,
          width,
          height,
          position: 'absolute',
          top: -8,
          alignSelf: 'center',
          transform: [{ rotate: '-1deg' }],
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  tapeBase: {
    zIndex: 20,
    borderRadius: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.45)',
    borderRightColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
});
