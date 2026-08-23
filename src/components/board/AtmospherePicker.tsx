import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { AtmosphereType } from '../../types';
import { atmospheres } from '../../theme/atmospheres';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Check, X } from 'lucide-react-native';

interface AtmospherePickerProps {
  visible: boolean;
  currentAtmosphere: AtmosphereType;
  onSelect: (atmosphere: AtmosphereType) => void;
  onClose: () => void;
}

export const AtmospherePicker: React.FC<AtmospherePickerProps> = ({
  visible,
  currentAtmosphere,
  onSelect,
  onClose,
}) => {
  // All 8 vibrant studio atmospheres
  const atmosphereList = [
    atmospheres.lavender,
    atmospheres.butter,
    atmospheres.blush,
    atmospheres.periwinkle,
    atmospheres.matcha,
    atmospheres.peach,
    atmospheres.vanilla,
    atmospheres.dark,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>board atmosphere</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={colors.ink.secondary} />
            </Pressable>
          </View>

          <Text style={styles.subtext}>
            choose a rich, vibrant pastel mood for this board
          </Text>

          <View style={styles.optionsList}>
            {atmosphereList.map((atm) => {
              const isSelected = currentAtmosphere === atm.id;
              return (
                <Pressable
                  key={atm.id}
                  onPress={() => {
                    onSelect(atm.id as AtmosphereType);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.optionCard,
                    { backgroundColor: atm.backgroundColor },
                    isSelected && styles.optionSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={styles.leftMeta}>
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: atm.accentColor,
                          borderColor: atm.isDark ? '#444' : 'rgba(0,0,0,0.08)',
                        },
                      ]}
                    />
                    <View>
                      <Text
                        style={[
                          styles.atmosphereName,
                          { color: atm.isDark ? '#FFF' : colors.ink.primary },
                        ]}
                      >
                        {atm.name}
                      </Text>
                      <Text
                        style={[
                          styles.textureLabel,
                          { color: atm.isDark ? 'rgba(255,255,255,0.7)' : colors.ink.secondary },
                        ]}
                      >
                        {atm.subtitle}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View
                      style={[
                        styles.checkCircle,
                        { backgroundColor: atm.isDark ? '#FFF' : colors.ink.primary },
                      ]}
                    >
                      <Check size={12} color={atm.isDark ? colors.ink.primary : '#FFF'} strokeWidth={2.5} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 24, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#F8F6FF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    paddingBottom: 36,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: typography.families.serif,
    fontSize: 20,
    fontWeight: '500',
    color: colors.ink.primary,
  },
  closeBtn: {
    padding: 4,
  },
  subtext: {
    fontFamily: typography.families.serif,
    fontSize: 13,
    color: colors.ink.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  optionsList: {
    gap: 9,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  optionSelected: {
    borderColor: colors.accents.lavender,
    borderWidth: 1.8,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
  },
  atmosphereName: {
    fontFamily: typography.families.serif,
    fontSize: 15,
    fontWeight: '600',
  },
  textureLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    marginTop: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
