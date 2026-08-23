import { colors } from './colors';

export interface AtmosphereConfig {
  id: string;
  name: string;
  subtitle: string;
  backgroundColor: string;
  gridLineColor?: string;
  isDark: boolean;
  accentColor: string;
  paperOverlay?: string;
}

export const atmospheres: Record<string, AtmosphereConfig> = {
  lavender: {
    id: 'lavender',
    name: 'Lilac Reverie',
    subtitle: 'Dreamy French lavender sunset mood',
    backgroundColor: '#F0EAFF',
    accentColor: '#8A63D2',
    isDark: false,
    paperOverlay: 'rgba(138, 99, 210, 0.04)',
  },
  butter: {
    id: 'butter',
    name: 'Golden Honey',
    subtitle: 'Sun-drenched buttercup & warm morning amber',
    backgroundColor: '#FFF7DF',
    accentColor: '#D48806',
    isDark: false,
  },
  blush: {
    id: 'blush',
    name: 'Sakura Blossom',
    subtitle: 'Sweet floral rose & soft pink petals',
    backgroundColor: '#FFF0F3',
    accentColor: '#E04A7B',
    isDark: false,
  },
  periwinkle: {
    id: 'periwinkle',
    name: 'Coastal Sky',
    subtitle: 'Airy periwinkle breeze & bright sky',
    backgroundColor: '#EBF5FF',
    accentColor: '#2B78C5',
    isDark: false,
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Garden',
    subtitle: 'Lush botanical pistachio & herbal mist',
    backgroundColor: '#EDF8EB',
    accentColor: '#4B9B47',
    isDark: false,
  },
  peach: {
    id: 'peach',
    name: 'Apricot Glow',
    subtitle: 'Warm juicy apricot & glowing peach sherbet',
    backgroundColor: '#FFF2EB',
    accentColor: '#E06D38',
    isDark: false,
  },
  vanilla: {
    id: 'vanilla',
    name: 'Vanilla Studio',
    subtitle: 'Warm clean minimalist cream studio',
    backgroundColor: '#FAF6EE',
    accentColor: '#D48806',
    isDark: false,
  },
  dark: {
    id: 'dark',
    name: 'Velvet Starlight',
    subtitle: 'Deep moody midnight & lilac glow',
    backgroundColor: '#171520',
    accentColor: '#BFA7EE',
    isDark: true,
  },
  // Backward compatibility aliases
  linen: {
    id: 'linen',
    name: 'Lilac Reverie',
    subtitle: 'Dreamy French lavender sunset mood',
    backgroundColor: '#F0EAFF',
    accentColor: '#8A63D2',
    isDark: false,
  },
  paper: {
    id: 'paper',
    name: 'Vanilla Studio',
    subtitle: 'Warm clean minimalist cream studio',
    backgroundColor: '#FAF6EE',
    accentColor: '#D48806',
    isDark: false,
  },
  notebook: {
    id: 'notebook',
    name: 'Lilac Notebook Grid',
    subtitle: 'Graph paper on vibrant lavender',
    backgroundColor: '#F0EAFF',
    gridLineColor: 'rgba(138, 99, 210, 0.1)',
    accentColor: '#8A63D2',
    isDark: false,
  },
  minimal: {
    id: 'minimal',
    name: 'Vanilla Studio',
    subtitle: 'Warm clean minimalist cream studio',
    backgroundColor: '#FAF6EE',
    accentColor: '#1E1A22',
    isDark: false,
  },
};

export type AtmosphereKey = keyof typeof atmospheres;

