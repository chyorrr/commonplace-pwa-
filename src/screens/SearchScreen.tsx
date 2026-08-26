import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { MasonryGrid } from '../components/board/MasonryGrid';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Search as SearchIcon, X, Tag } from 'lucide-react-native';
import { Board, DeskItem, Pin, PinType } from '../types';

export const SearchScreen: React.FC = () => {
  const { boards, deskItems, setActivePinDetail } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PinType | null>(null);

  const allPins = useMemo(() => {
    const list: Pin[] = [];
    boards.forEach((board: Board) => {
      list.push(...board.pins);
    });
    deskItems.forEach((deskItem: DeskItem) => {
      list.push(deskItem.pin);
    });
    return list;
  }, [boards, deskItems]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allPins.forEach((pin: Pin) => {
      pin.tags?.forEach((tag: string) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [allPins]);

  const filteredPins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allPins.filter((pin: Pin) => {
      if (selectedTag && !pin.tags?.includes(selectedTag)) {
        return false;
      }

      if (selectedType && pin.type !== selectedType) {
        return false;
      }

      if (!q) {
        return true;
      }

      const titleMatch = pin.title?.toLowerCase().includes(q);
      const tagMatch = pin.tags?.some((tag: string) => tag.toLowerCase().includes(q));

      if (titleMatch || tagMatch) {
        return true;
      }

      if (pin.type === 'text') {
        return pin.body.toLowerCase().includes(q);
      }
      if (pin.type === 'quote') {
        return pin.quote.toLowerCase().includes(q) || (pin.author ? pin.author.toLowerCase().includes(q) : false);
      }
      if (pin.type === 'photo') {
        return (pin.caption ? pin.caption.toLowerCase().includes(q) : false) || (pin.location ? pin.location.toLowerCase().includes(q) : false);
      }
      if (pin.type === 'music') {
        return pin.songTitle.toLowerCase().includes(q) || pin.artist.toLowerCase().includes(q);
      }
      if (pin.type === 'checklist') {
        return pin.items.some((item) => item.text.toLowerCase().includes(q));
      }

      return false;
    });
  }, [allPins, searchQuery, selectedTag, selectedType]);

  const pinTypeOptions: { type: PinType; label: string }[] = [
    { type: 'photo', label: 'Photos' },
    { type: 'text', label: 'Notes' },
    { type: 'music', label: 'Music' },
    { type: 'voicenote', label: 'Audio' },
    { type: 'quote', label: 'Quotes' },
    { type: 'checklist', label: 'Lists' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Search the Archive</Text>
        <Text style={styles.title}>Find Notes, Memories & Photos</Text>
        <Text style={styles.subtitle}>
          Search across every board and the desk, then filter by category or tags.
        </Text>

        <View style={styles.searchInputContainer}>
          <SearchIcon size={16} color={colors.ink.tertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search memories, words, places..."
            placeholderTextColor={colors.ink.faded}
            style={styles.textInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <X size={16} color={colors.ink.tertiary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{allPins.length}</Text>
            <Text style={styles.heroStatLabel}>Total Items</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{allTags.length}</Text>
            <Text style={styles.heroStatLabel}>Tags</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{filteredPins.length}</Text>
            <Text style={styles.heroStatLabel}>Results</Text>
          </View>
        </View>
      </View>

      {allTags.length > 0 && (
        <View style={styles.filterCard}>
          <Text style={styles.sectionHeading}>Tags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <Pressable
                  key={tag}
                  onPress={() => setSelectedTag(isSelected ? null : tag)}
                  style={[styles.tagChip, isSelected && styles.tagChipActive]}
                >
                  <Tag size={10} color={isSelected ? '#FFF' : colors.ink.tertiary} />
                  <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>#{tag}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.filterCard}>
        <Text style={styles.sectionHeading}>Item Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {pinTypeOptions.map((option) => {
            const isSelected = selectedType === option.type;
            return (
              <Pressable
                key={option.type}
                onPress={() => setSelectedType(isSelected ? null : option.type)}
                style={[styles.typeChip, isSelected && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredPins.length} {filteredPins.length === 1 ? 'result' : 'results'}
        </Text>
        {(selectedTag || selectedType || searchQuery) ? (
          <Pressable
            onPress={() => {
              setSearchQuery('');
              setSelectedTag(null);
              setSelectedType(null);
            }}
          >
            <Text style={styles.clearFiltersText}>Reset Filters</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.resultsShell}>
        <MasonryGrid
          pins={filteredPins}
          onPinPress={(pin: Pin) => setActivePinDetail(pin)}
          emptyMessage="No memories found matching your search. Try another query or reset filters."
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    padding: 18,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brand.purple,
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    color: colors.ink.primary,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#FDFBF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  heroStatValue: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  heroStatLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.tertiary,
    marginTop: 1,
  },
  filterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    padding: 14,
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsScroll: {
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  tagChipActive: {
    backgroundColor: colors.brand.purple,
  },
  tagChipText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
  },
  tagChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  typeChipActive: {
    backgroundColor: colors.brand.purple,
  },
  typeChipText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  typeChipTextActive: {
    color: '#FFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  resultsCount: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink.tertiary,
  },
  clearFiltersText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.brand.purple,
    fontWeight: '700',
  },
  resultsShell: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
