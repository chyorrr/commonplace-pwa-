import { Platform } from 'react-native';
import { colors } from './colors';
import { NoteFontStyle } from '../types';

export interface FontDefinition {
  id: string;
  name: string;
  category: 'editorial' | 'clean' | 'typewriter' | 'classic' | 'minimal';
  fontFamily: string;
  previewText?: string;
}

export const SAMPLE_PREVIEW_PHRASE = 'things worth keeping';

export const FONT_LIBRARY: FontDefinition[] = [
  { id: 'outfit', name: 'Outfit', category: 'editorial', fontFamily: Platform.select({ web: '"Outfit", sans-serif', default: 'sans-serif' })! },
  { id: 'jakarta', name: 'Plus Jakarta Sans', category: 'clean', fontFamily: Platform.select({ web: '"Plus Jakarta Sans", sans-serif', default: 'sans-serif' })! },
  { id: 'dm-sans', name: 'DM Sans', category: 'clean', fontFamily: Platform.select({ web: '"DM Sans", sans-serif', default: 'sans-serif' })! },
  { id: 'dm-mono', name: 'DM Mono', category: 'typewriter', fontFamily: Platform.select({ web: '"DM Mono", monospace', default: 'monospace' })! },
  { id: 'courier-prime', name: 'Courier Prime', category: 'typewriter', fontFamily: Platform.select({ web: '"Courier Prime", monospace', default: 'monospace' })! },
];

export const typography = {
  families: {
    // Primary Modern Display / Headings: Outfit
    heading: Platform.select({
      web: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),
    serif: Platform.select({
      web: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),
    editorial: Platform.select({
      web: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),
    display: Platform.select({
      web: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),
    serifHeading: Platform.select({
      web: '"Outfit", sans-serif',
      default: 'sans-serif',
    }),

    // Primary UI & Body: Plus Jakarta Sans
    body: Platform.select({
      web: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),
    sans: Platform.select({
      web: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),

    // Notes / Personal style (Clean, modern, crisp, non-cursive)
    handwritten: Platform.select({
      web: '"Plus Jakarta Sans", sans-serif',
      default: 'sans-serif',
    }),

    // Tiny labels / Mono: DM Mono
    tiny: Platform.select({
      web: '"DM Mono", monospace',
      default: 'monospace',
    }),
    mono: Platform.select({
      web: '"DM Mono", monospace',
      default: 'monospace',
    }),
    typewriter: Platform.select({
      web: '"Courier Prime", "DM Mono", monospace',
      default: 'monospace',
    }),
  },

  styles: {
    heroTitle: {
      fontFamily: Platform.select({
        web: '"Outfit", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      color: colors.ink.primary,
    },
    boardTitle: {
      fontFamily: Platform.select({
        web: '"Outfit", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 18,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      color: colors.ink.primary,
    },
    sectionHeader: {
      fontFamily: Platform.select({
        web: '"DM Mono", monospace',
        default: 'monospace',
      }),
      fontSize: 11,
      fontWeight: '600' as const,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
      color: colors.ink.tertiary,
    },
    bodySerif: {
      fontFamily: Platform.select({
        web: '"Plus Jakarta Sans", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 14.5,
      lineHeight: 22,
      color: colors.ink.secondary,
      fontWeight: '400' as const,
    },
    handwrittenCaption: {
      fontFamily: Platform.select({
        web: '"Plus Jakarta Sans", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 14,
      lineHeight: 20,
      color: colors.ink.secondary,
      fontWeight: '500' as const,
    },
    quoteText: {
      fontFamily: Platform.select({
        web: '"Outfit", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 16,
      lineHeight: 24,
      color: colors.ink.primary,
      fontWeight: '500' as const,
    },
    uiLabel: {
      fontFamily: Platform.select({
        web: '"Plus Jakarta Sans", sans-serif',
        default: 'sans-serif',
      }),
      fontSize: 12.5,
      fontWeight: '600' as const,
      color: colors.ink.primary,
    },
    typewriterStamp: {
      fontFamily: Platform.select({
        web: '"DM Mono", monospace',
        default: 'monospace',
      }),
      fontSize: 11,
      color: colors.ink.tertiary,
    },
  },
};

export const getFontFamily = (style?: NoteFontStyle): string => {
  switch (style) {
    case 'typewriter':
      return typography.families.typewriter || 'monospace';
    case 'display':
      return typography.families.display || 'sans-serif';
    case 'sans':
      return typography.families.sans || 'sans-serif';
    case 'serif':
    case 'handwriting':
    default:
      return typography.families.body || 'sans-serif';
  }
};
