export type AtmosphereType = 
  | 'lavender' 
  | 'vanilla' 
  | 'blush' 
  | 'periwinkle' 
  | 'matcha' 
  | 'dark'
  | 'butter'
  | 'peach'
  | 'linen' 
  | 'paper' 
  | 'notebook' 
  | 'minimal';

export type PinType = 
  | 'photo' 
  | 'text' 
  | 'thought' 
  | 'checklist' 
  | 'quote' 
  | 'music' 
  | 'voicenote' 
  | 'link' 
  | 'collage' 
  | 'journal'
  | 'sticker'
  | 'page';

export type NoteFontStyle = 'serif' | 'handwriting' | 'typewriter' | 'display' | 'sans';

export interface AttachedSticker {
  id: string;
  stickerId: string;
  xPercent: number;
  yPercent: number;
  rotation?: number;
  scale?: number;
  sizePreset?: 'sm' | 'md' | 'lg' | 'xl';
  contourStyle?: 'die-cut' | 'glow' | 'stamp' | 'badge';
}

export interface BasePin {
  id: string;
  type: PinType;
  title?: string;
  createdAt: string;
  isFavorite?: boolean;
  isHidden?: boolean;
  tags?: string[];
  boardId?: string;
  rotation?: number; // subtle natural micro-rotation (-2 to +2 deg)
  tapeStyle?: 'top-center' | 'top-corners' | 'diagonal-left' | 'none';
  tapeColor?: string;
  fontStyle?: NoteFontStyle;
  stickers?: AttachedSticker[];
}

export interface PhotoPin extends BasePin {
  type: 'photo';
  imageUrl: string;
  caption?: string;
  handwrittenDate?: string;
  location?: string;
  aspectRatio?: number;
}

export interface TextPin extends BasePin {
  type: 'text';
  title?: string;
  body: string;
  imageUrl?: string;
  paperTone?: 'lilac' | 'peach' | 'butter' | 'sage' | 'sky' | 'vanilla' | 'cream' | 'linen' | 'cotton' | 'parchment' | 'kraft';
  hasDropCap?: boolean;
  authorNote?: string;
}

export interface ThoughtPin extends BasePin {
  type: 'thought';
  thought: string;
  isHandwritten?: boolean;
  fadedInk?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistPin extends BasePin {
  type: 'checklist';
  title: string;
  items: ChecklistItem[];
  paperTone?: 'cream' | 'grid' | 'parchment' | 'lilac' | 'butter';
}

export interface QuotePin extends BasePin {
  type: 'quote';
  quote: string;
  author?: string;
  source?: string;
  year?: string;
}

export interface MusicPin extends BasePin {
  type: 'music';
  songTitle: string;
  artist: string;
  album?: string;
  coverUrl: string;
  accentColor?: string;
  previewUrl?: string;
  spotifyUrl?: string;
  spotifyUri?: string;
  duration?: string;
  personalMemoryNote?: string;
}

export interface VoiceNotePin extends BasePin {
  type: 'voicenote';
  title: string;
  recordedDate: string;
  durationSeconds: number;
  waveform: number[];
  transcriptExcerpt?: string;
  audioUrl?: string;
}

export interface LinkPin extends BasePin {
  type: 'link';
  url: string;
  siteName: string;
  headline: string;
  snippet?: string;
  thumbnailUrl?: string;
}

export interface CollageItem {
  id: string;
  imageUrl: string;
  rotation: number;
  aspectRatio: number;
}

export interface CollagePin extends BasePin {
  type: 'collage';
  title?: string;
  items: CollageItem[];
  caption?: string;
}

export interface JournalPin extends BasePin {
  type: 'journal';
  dateLabel: string;
  headline: string;
  paragraphs: string[];
  photoUrls?: string[];
  weatherOrMood?: string;
}

export type Pin = 
  | PhotoPin 
  | TextPin 
  | ThoughtPin 
  | ChecklistPin 
  | QuotePin 
  | MusicPin 
  | VoiceNotePin 
  | LinkPin 
  | CollagePin 
  | JournalPin;

export interface FreeformTransform {
  x: number;
  y: number;
  zIndex: number;
  rotation: number;
  scale: number;
}

export interface Board {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  atmosphere: AtmosphereType;
  isLocked?: boolean;
  isHidden?: boolean;
  passcode?: string;
  createdAt: string;
  updatedAt?: string;
  pins: Pin[];
  freeformLayout?: Record<string, FreeformTransform>;
  accentColor?: string;
  colorHex?: string;
}

export interface DeskItem {
  id: string;
  pin: Pin;
  addedAt: string;
}

export interface CustomSticker {
  id: string;
  name: string;
  imageUrl: string;
  createdAt?: string;
  category?: string;
}

export interface MemorySnippet {
  id: string;
  timeAgoLabel: string;
  exactDate: string;
  pin: Pin;
  boardTitle: string;
  quotePrompt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime?: string; // e.g. "02:00 PM"
  status: 'upcoming' | 'running' | 'completed' | 'cancelled';
  progressPercent: number; // 0 - 100
  color: string;
  notificationEnabled: boolean;
  notified?: boolean;
  notes?: string;
  createdAt: string;
}

