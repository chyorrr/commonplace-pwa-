export type AvatarIconType = 'camera' | 'quill' | 'leaf' | 'coffee' | 'moon' | 'palette' | 'book' | 'compass' | 'heart' | 'sun';

export interface AvatarPreset {
  id: string;
  name: string;
  icon: AvatarIconType;
  bg: string;
  border: string;
  color: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'avatar:camera', name: 'Polaroid', icon: 'camera', bg: '#EDE8FA', border: '#DDD6FE', color: '#7C3AED' },
  { id: 'avatar:quill', name: 'Quill', icon: 'quill', bg: '#F3E8FF', border: '#E9D5FF', color: '#6D28D9' },
  { id: 'avatar:leaf', name: 'Botanical', icon: 'leaf', bg: '#DCFCE7', border: '#86EFAC', color: '#15803D' },
  { id: 'avatar:coffee', name: 'Coffee', icon: 'coffee', bg: '#FEF3C7', border: '#FDE68A', color: '#B45309' },
  { id: 'avatar:book', name: 'Journal', icon: 'book', bg: '#FFE4EE', border: '#FECDD3', color: '#BE123C' },
  { id: 'avatar:moon', name: 'Midnight', icon: 'moon', bg: '#2E1E3F', border: '#581C87', color: '#E9D5FF' },
  { id: 'avatar:palette', name: 'Palette', icon: 'palette', bg: '#E0F2FE', border: '#BAE6FD', color: '#0369A1' },
  { id: 'avatar:compass', name: 'Compass', icon: 'compass', bg: '#FFEDD5', border: '#FED7AA', color: '#C2410C' },
  { id: 'avatar:sun', name: 'Solstice', icon: 'sun', bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
  { id: 'avatar:heart', name: 'Keepsake', icon: 'heart', bg: '#FFE8E1', border: '#FFCDD2', color: '#E11D48' },
];
