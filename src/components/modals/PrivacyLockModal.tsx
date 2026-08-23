import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Lock, ScanFace, X, Delete } from 'lucide-react-native';

export const PrivacyLockModal: React.FC = () => {
  const {
    isLockModalOpen,
    lockModalTargetBoardId,
    closeLockModal,
    unlockBoardWithPasscode,
    setActiveBoardId,
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLockModalOpen || !lockModalTargetBoardId) return null;

  const handleDigitPress = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setErrorMessage('');

    if (nextPin.length === 4) {
      setTimeout(() => {
        const success = unlockBoardWithPasscode(lockModalTargetBoardId, nextPin);
        if (success) {
          setActiveBoardId(lockModalTargetBoardId);
          setEnteredPin('');
          closeLockModal();
        } else {
          setErrorMessage('incorrect passcode');
          setEnteredPin('');
        }
      }, 200);
    }
  };

  const handleDeleteDigit = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleSimulateFaceID = () => {
    const success = unlockBoardWithPasscode(lockModalTargetBoardId, '1234');
    if (success) {
      setActiveBoardId(lockModalTargetBoardId);
      setEnteredPin('');
      closeLockModal();
    }
  };

  return (
    <Modal
      visible={isLockModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeLockModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.lockCard}>
          {/* Close button */}
          <Pressable onPress={closeLockModal} style={styles.closeBtn} hitSlop={8}>
            <X size={18} color={colors.ink.secondary} />
          </Pressable>

          {/* Lock Icon */}
          <View style={styles.lockIconWrap}>
            <Lock size={22} color={colors.accents.terracotta} />
          </View>

          <Text style={styles.lockTitle}>private collection</Text>
          <Text style={styles.lockSub}>enter passcode to open this corner</Text>

          {/* PIN Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <View
                  key={idx}
                  style={[styles.pinDot, isFilled && styles.pinDotFilled]}
                />
              );
            })}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.hintText}>demo passcode: 1234</Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <Pressable
                key={digit}
                onPress={() => handleDigitPress(digit)}
                style={({ pressed }) => [styles.keyBtn, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{digit}</Text>
              </Pressable>
            ))}

            {/* Bottom Row */}
            <Pressable
              onPress={handleSimulateFaceID}
              style={({ pressed }) => [styles.keyBtn, styles.specialKey, pressed && styles.keyPressed]}
            >
              <ScanFace size={19} color={colors.ink.secondary} />
            </Pressable>

            <Pressable
              onPress={() => handleDigitPress('0')}
              style={({ pressed }) => [styles.keyBtn, pressed && styles.keyPressed]}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteDigit}
              style={({ pressed }) => [styles.keyBtn, styles.specialKey, pressed && styles.keyPressed]}
            >
              <Delete size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 16, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockCard: {
    backgroundColor: '#FBF9F5',
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  lockIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(182, 104, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lockTitle: {
    fontFamily: typography.families.serif,
    fontSize: 19,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  lockSub: {
    fontFamily: typography.families.handwritten,
    fontSize: 15,
    color: colors.ink.handwrittenFaded,
    marginTop: 2,
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.ink.tertiary,
  },
  pinDotFilled: {
    backgroundColor: colors.ink.primary,
    borderColor: colors.ink.primary,
  },
  errorText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.accents.terracotta,
    marginBottom: 12,
  },
  hintText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginBottom: 12,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    gap: 10,
    justifyContent: 'center',
  },
  keyBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialKey: {
    backgroundColor: 'transparent',
  },
  keyPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  keyText: {
    fontFamily: typography.families.sans,
    fontSize: 20,
    fontWeight: '500',
    color: colors.ink.primary,
  },
});
