import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChecklistPin as ChecklistPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';
import { useApp } from '../../context/AppContext';

interface ChecklistPinProps {
  pin: ChecklistPinType;
  onPress?: () => void;
}

export const ChecklistPin: React.FC<ChecklistPinProps> = ({ pin, onPress }) => {
  const { toggleChecklistItem } = useApp();

  return (
    <PaperCard
      rotation={pin.rotation}
      paperTone={pin.paperTone === 'butter' ? 'butter' : pin.paperTone === 'lilac' ? 'lilac' : 'cream'}
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.checklistContainer}
    >
      <Text style={styles.titleText}>{pin.title}</Text>

      <View style={styles.itemsList}>
        {pin.items.map((item) => (
          <Pressable
            key={item.id}
            onPress={(e) => {
              e.stopPropagation();
              toggleChecklistItem(pin.id, item.id);
            }}
            style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
          >
            <View
              style={[
                styles.checkboxBox,
                item.completed && styles.checkboxCompleted,
              ]}
            >
              {item.completed && <View style={styles.dotMark} />}
            </View>
            <Text
              style={[
                styles.itemText,
                item.completed && styles.itemTextCompleted,
              ]}
            >
              {item.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  checklistContainer: {
    padding: 16,
  },
  titleText: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink.primary,
    marginBottom: 12,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: colors.ink.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.accents.sageOlive,
    borderColor: colors.accents.sageOlive,
  },
  dotMark: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFF',
  },
  itemText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.ink.secondary,
    flex: 1,
  },
  itemTextCompleted: {
    color: colors.ink.faded,
    textDecorationLine: 'line-through',
  },
});
