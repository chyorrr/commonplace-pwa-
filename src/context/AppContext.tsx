import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AtmosphereType, Board, CustomSticker, DeskItem, FreeformTransform, MemorySnippet, Pin, PinType, ReminderItem } from '../types';
import { initialBoards, initialDeskItems, initialMemory, initialStickers } from '../data/initialData';
import { reminderService } from '../services/reminderService';

export type ScreenTab = 'home' | 'schedule' | 'desk' | 'favorites' | 'search';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export type ThemeMode = 'sakura' | 'lilac' | 'matcha' | 'butter' | 'peach' | 'sky' | 'dark';

export interface AppContextType {
  // Auth state
  user: UserProfile | null;
  savedAccounts: UserProfile[];
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUserProfile: (name: string, email: string, avatarUrl?: string, bio?: string) => void;
  switchAccount: (accountId: string) => void;

  // Theme
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;

  // Navigation
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
  activePinDetail: Pin | null;
  setActivePinDetail: (pin: Pin | null) => void;
  isFreeformMode: boolean;
  setIsFreeformMode: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Boards
  boards: Board[];
  activeBoard: Board | null;
  createBoard: (
    title: string,
    subtitle?: string,
    atmosphere?: AtmosphereType,
    isLocked?: boolean,
    passcode?: string,
    colorHex?: string
  ) => string;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  changeBoardAtmosphere: (boardId: string, atmosphere: AtmosphereType) => void;

  // Pins
  addPin: (boardId: string, pinData: Omit<Pin, 'id' | 'createdAt'>) => Pin;
  updatePin: (arg1: string, arg2: string | Partial<Pin>, arg3?: Partial<Pin>) => void;
  deletePin: (arg1: string, arg2?: string) => void;
  togglePinFavorite: (arg1: string, arg2?: string) => void;
  toggleFavoritePin: (arg1: string, arg2?: string) => void;
  toggleChecklistItem: (arg1: string, arg2: string, arg3?: string) => void;
  updatePinFreeformTransform: (boardId: string, pinId: string, transform: Partial<FreeformTransform>) => void;
  updatePinPosition: (boardId: string, pinId: string, transform: Partial<FreeformTransform>) => void;

  // The Desk (Unfiled Items)
  deskItems: DeskItem[];
  addToDesk: (pinData: Omit<Pin, 'id' | 'createdAt'>) => void;
  moveDeskItemToBoard: (deskItemId: string, targetBoardId: string) => void;
  removeDeskItem: (deskItemId: string) => void;

  // Sticker Studio
  stickers: CustomSticker[];
  addCustomSticker: (name: string, imageUrl: string, category?: string) => void;
  deleteCustomSticker: (id: string) => void;
  addStickerToPin: (arg1: string, arg2: string, arg3?: any, arg4?: any, options?: any) => void;
  attachStickerToPin: (arg1: string, arg2: string, arg3?: any, arg4?: any, options?: any) => void;

  // Reminders & Schedule
  reminders: ReminderItem[];
  addReminder: (item: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderStatus: (id: string) => void;

  // Memory prompt snippet
  memorySnippet: MemorySnippet | null;

  // Audio Playback
  currentlyPlayingAudioId: string | null;
  audioProgress: number;
  togglePlayAudio: (id: string, durationSec?: number) => void;

  // Privacy & Passcode
  unlockedBoards: Set<string>;
  unlockBoardWithPasscode: (boardId: string, passcode: string) => boolean;
  lockBoard: (boardId: string) => void;

  // Modals & User Guides
  isCreateSheetOpen: boolean;
  openCreateSheet: (target?: 'board' | 'desk', initialType?: PinType | 'new-board') => void;
  closeCreateSheet: () => void;
  createTarget: 'board' | 'desk';
  initialCreateType: PinType | 'new-board' | null;
  
  isNoteEditorOpen: boolean;
  openNoteEditor: () => void;
  closeNoteEditor: () => void;

  isVoiceNoteOpen: boolean;
  openVoiceNote: () => void;
  closeVoiceNote: () => void;

  isStickerStudioOpen: boolean;
  openStickerStudio: () => void;
  closeStickerStudio: () => void;

  isLockModalOpen: boolean;
  lockModalTargetBoardId: string | null;
  openLockModal: (boardId: string) => void;
  closeLockModal: () => void;

  // Help Guide & Settings
  isGuideOpen: boolean;
  openGuide: () => void;
  closeGuide: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'commonplace_user_v6',
  BOARDS: 'commonplace_boards_v6',
  DESK: 'commonplace_desk_v6',
  STICKERS: 'commonplace_stickers_v6',
  REMINDERS: 'commonplace_reminders_v6',
  THEME: 'commonplace_theme_v6',
  ONBOARDING_SEEN: 'commonplace_onboarding_v6',
};

const memoryStore: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return memoryStore[key] || null;
    } catch (e) {
      return memoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
    } catch (e) {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem(key);
      } else {
        delete memoryStore[key];
      }
    } catch (e) {
      delete memoryStore[key];
    }
  },
};

const defaultReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Web Design',
    category: 'Client project',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    status: 'completed',
    progressPercent: 100,
    color: '#D4F5C9', // pastel matcha
    notificationEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Family Program',
    category: 'Family task',
    date: new Date().toISOString().split('T')[0],
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    status: 'upcoming',
    progressPercent: 0,
    color: '#CBEBFB', // pastel cyan
    notificationEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Market Research',
    category: 'Company task',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    status: 'running',
    progressPercent: 72,
    color: '#E5DCFC', // pastel lilac
    notificationEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Auth & Accounts State
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>(() => {
    const raw = safeStorage.getItem('commonplace_accounts_v6');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [
      {
        id: 'usr-1',
        email: 'harsh@commonplace.app',
        name: 'Harsh Naik',
        bio: 'Cozy Scrapbooker ♡',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
    ];
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null; // Show Sign In / Create Account screen first!
  });

  const login = (newUser: UserProfile) => {
    setUser(newUser);
    safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setSavedAccounts((prev) => {
      const exists = prev.find((a) => a.id === newUser.id || a.email === newUser.email);
      const updated = exists
        ? prev.map((a) => (a.id === newUser.id || a.email === newUser.email ? newUser : a))
        : [newUser, ...prev];
      safeStorage.setItem('commonplace_accounts_v6', JSON.stringify(updated));
      return updated;
    });

    // Automatically show the User Guide modal the first time any user signs in
    const hasSeenGuide = safeStorage.getItem('commonplace_guide_shown_v3');
    if (!hasSeenGuide) {
      setTimeout(() => {
        setIsGuideOpen(true);
      }, 400);
      safeStorage.setItem('commonplace_guide_shown_v3', 'true');
    }
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem(STORAGE_KEYS.USER);
  };

  const switchAccount = (accountId: string) => {
    const acc = savedAccounts.find((a) => a.id === accountId);
    if (acc) {
      setUser(acc);
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(acc));
    }
  };

  const updateUserProfile = (name: string, email: string, avatarUrl?: string, bio?: string) => {
    setUser((prev) => {
      const updated: UserProfile = {
        id: prev?.id || `usr-${Date.now()}`,
        name: name.trim() || 'Harsh Naik',
        email: email.trim() || 'harsh@commonplace.app',
        avatarUrl: avatarUrl || prev?.avatarUrl,
        bio: bio !== undefined ? bio : prev?.bio,
      };
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      setSavedAccounts((all) => {
        const next = all.map((a) => (a.id === updated.id ? updated : a));
        safeStorage.setItem('commonplace_accounts_v6', JSON.stringify(next));
        return next;
      });
      return updated;
    });
  };

  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.THEME);
    return (raw as ThemeMode) || 'sakura';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    safeStorage.setItem(STORAGE_KEYS.THEME, mode);
  };

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<ScreenTab>('home');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [activePinDetail, setActivePinDetail] = useState<Pin | null>(null);
  const [isFreeformMode, setIsFreeformMode] = useState<boolean>(false);

  // 3. Boards State (Empty by default per user request)
  const [boards, setBoards] = useState<Board[]>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.BOARDS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return initialBoards;
      }
    }
    return initialBoards;
  });

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  }, [boards]);

  // 4. Desk State
  const [deskItems, setDeskItems] = useState<DeskItem[]>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.DESK);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return initialDeskItems;
      }
    }
    return initialDeskItems;
  });

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.DESK, JSON.stringify(deskItems));
  }, [deskItems]);

  // 5. Sticker Studio State
  const [stickers, setStickers] = useState<CustomSticker[]>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.STICKERS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return initialStickers;
      }
    }
    return initialStickers;
  });

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(stickers));
  }, [stickers]);

  // 6. Reminders State
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const raw = safeStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return defaultReminders;
      }
    }
    return defaultReminders;
  });

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    // Start background monitor for due reminders
    reminderService.startMonitoring(reminders, (dueReminder) => {
      setReminders((prev) =>
        prev.map((r) => (r.id === dueReminder.id ? { ...r, notified: true } : r))
      );
    });
  }, [reminders]);

  const addReminder = (item: Omit<ReminderItem, 'id' | 'createdAt'>) => {
    const newReminder: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const updateReminder = (id: string, updates: Partial<ReminderItem>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleReminderStatus = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'completed' ? 'upcoming' : 'completed';
          return {
            ...r,
            status: nextStatus,
            progressPercent: nextStatus === 'completed' ? 100 : 0,
          };
        }
        return r;
      })
    );
  };

  // 7. Modals
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [createTarget, setCreateTarget] = useState<'board' | 'desk'>('board');
  const [initialCreateType, setInitialCreateType] = useState<PinType | 'new-board' | null>(null);

  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [isVoiceNoteOpen, setIsVoiceNoteOpen] = useState(false);
  const [isStickerStudioOpen, setIsStickerStudioOpen] = useState(false);

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockModalTargetBoardId, setLockModalTargetBoardId] = useState<string | null>(null);
  const [unlockedBoards, setUnlockedBoards] = useState<Set<string>>(new Set());

  // 8. Audio Playback
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (currentlyPlayingAudioId) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 1) {
            setCurrentlyPlayingAudioId(null);
            return 0;
          }
          return +(prev + 0.04).toFixed(2);
        });
      }, 250);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [currentlyPlayingAudioId]);

  const togglePlayAudio = (id: string) => {
    if (currentlyPlayingAudioId === id) {
      setCurrentlyPlayingAudioId(null);
      setAudioProgress(0);
    } else {
      setCurrentlyPlayingAudioId(id);
      setAudioProgress(0.05);
    }
  };

  // Active Board Helper
  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  // Board CRUD
  const createBoard = (
    title: string,
    subtitle?: string,
    atmosphere?: AtmosphereType,
    isLocked?: boolean,
    passcode?: string,
    colorHex?: string
  ): string => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      title: title.trim() || 'untitled board',
      subtitle: subtitle?.trim() || '0 items',
      atmosphere: atmosphere || 'blush',
      isLocked: Boolean(isLocked),
      passcode: isLocked ? passcode : undefined,
      colorHex: colorHex || '#FFF5ED',
      createdAt: new Date().toISOString(),
      pins: [],
    };

    setBoards((prev) => [newBoard, ...prev]);
    if (isLocked) {
      setUnlockedBoards((prev) => new Set(prev).add(newBoardId));
    }
    return newBoardId;
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  };

  const deleteBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (activeBoardId === boardId) {
      setActiveBoardId(null);
    }
  };

  const changeBoardAtmosphere = (boardId: string, atmosphere: AtmosphereType) => {
    updateBoard(boardId, { atmosphere });
  };

  // Pin CRUD
  const addPin = (boardId: string, pinData: Omit<Pin, 'id' | 'createdAt'>): Pin => {
    const microRotation = +(Math.random() * 2.8 - 1.4).toFixed(1);
    const newPin: Pin = {
      ...pinData,
      id: `pin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      boardId,
      rotation: pinData.rotation ?? microRotation,
    } as Pin;

    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          pins: [newPin, ...board.pins],
        };
      })
    );

    return newPin;
  };

  const updatePin = (arg1: string, arg2: string | Partial<Pin>, arg3?: Partial<Pin>) => {
    const pinId = typeof arg2 === 'string' ? arg2 : arg1;
    const updates = (typeof arg2 === 'object' ? arg2 : arg3) || {};
    setBoards((prev) =>
      prev.map((board) => ({
        ...board,
        pins: board.pins.map((p) => (p.id === pinId ? ({ ...p, ...updates } as Pin) : p)),
      }))
    );
    setDeskItems((prev) =>
      prev.map((item) => (item.pin.id === pinId ? { ...item, pin: { ...item.pin, ...updates } as Pin } : item))
    );
    if (activePinDetail?.id === pinId) {
      setActivePinDetail((prev) => (prev ? ({ ...prev, ...updates } as Pin) : null));
    }
  };

  const deletePin = (arg1: string, arg2?: string) => {
    const pinId = arg2 || arg1;
    setBoards((prev) =>
      prev.map((board) => ({
        ...board,
        pins: board.pins.filter((p) => p.id !== pinId),
      }))
    );
    setDeskItems((prev) => prev.filter((item) => item.pin.id !== pinId));
    if (activePinDetail?.id === pinId) {
      setActivePinDetail(null);
    }
  };

  const toggleFavoritePin = (arg1: string, arg2?: string) => {
    const pinId = arg2 || arg1;
    setBoards((prev) =>
      prev.map((board) => ({
        ...board,
        pins: board.pins.map((p) => (p.id === pinId ? ({ ...p, isFavorite: !p.isFavorite } as Pin) : p)),
      }))
    );
    setDeskItems((prev) =>
      prev.map((item) =>
        item.pin.id === pinId ? { ...item, pin: { ...item.pin, isFavorite: !item.pin.isFavorite } as Pin } : item
      )
    );
    if (activePinDetail?.id === pinId) {
      setActivePinDetail((prev) => (prev ? ({ ...prev, isFavorite: !prev.isFavorite } as Pin) : null));
    }
  };

  const toggleChecklistItem = (arg1: string, arg2: string, arg3?: string) => {
    const pinId = arg3 ? arg2 : arg1;
    const itemId = arg3 || arg2;
    setBoards((prev) =>
      prev.map((board) => ({
        ...board,
        pins: board.pins.map((p) => {
          if (p.id === pinId && p.type === 'checklist') {
            return {
              ...p,
              items: p.items.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it)),
            };
          }
          return p;
        }),
      }))
    );
  };

  const attachStickerToPin = (
    arg1: string,
    arg2: string,
    arg3?: any,
    arg4?: any,
    options?: { scale?: number; sizePreset?: 'sm' | 'md' | 'lg' | 'xl'; contourStyle?: 'die-cut' | 'glow' | 'stamp' | 'badge'; rotation?: number }
  ) => {
    const pinId = typeof arg3 === 'string' ? arg2 : arg1;
    const stickerId = typeof arg3 === 'string' ? arg3 : arg2;
    const x = typeof arg3 === 'number' ? arg3 : (typeof arg4 === 'number' ? arg4 : 45);
    const y = typeof arg4 === 'number' ? arg4 : 45;
    const opt = (typeof arg3 === 'object' ? arg3 : (typeof arg4 === 'object' ? arg4 : options)) || {};

    const newStickerAttachment = {
      id: `st-attach-${Date.now()}`,
      stickerId,
      xPercent: x,
      yPercent: y,
      rotation: opt.rotation ?? +(Math.random() * 12 - 6).toFixed(1),
      scale: opt.scale ?? 1,
      sizePreset: opt.sizePreset ?? 'md',
      contourStyle: opt.contourStyle ?? 'die-cut',
    };

    setBoards((prev) =>
      prev.map((board) => ({
        ...board,
        pins: board.pins.map((p) => {
          if (p.id === pinId) {
            return {
              ...p,
              stickers: [...(p.stickers || []), newStickerAttachment],
            };
          }
          return p;
        }),
      }))
    );
  };

  const updatePinPosition = (boardId: string, pinId: string, transform: Partial<FreeformTransform>) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== boardId) return b;
        const currentTransform = b.freeformLayout?.[pinId] || { x: 40, y: 40, zIndex: 1, rotation: 0, scale: 1 };
        return {
          ...b,
          freeformLayout: {
            ...b.freeformLayout,
            [pinId]: {
              ...currentTransform,
              ...transform,
            },
          },
        };
      })
    );
  };

  // Desk operations
  const addToDesk = (pinData: Omit<Pin, 'id' | 'createdAt'>) => {
    const microRotation = +(Math.random() * 2.8 - 1.4).toFixed(1);
    const newPin: Pin = {
      ...pinData,
      id: `pin-desk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rotation: pinData.rotation ?? microRotation,
    } as Pin;

    const newDeskItem: DeskItem = {
      id: `desk-${Date.now()}`,
      pin: newPin,
      addedAt: new Date().toISOString(),
    };

    setDeskItems((prev) => [newDeskItem, ...prev]);
  };

  const moveDeskItemToBoard = (deskItemId: string, targetBoardId: string) => {
    const item = deskItems.find((d) => d.id === deskItemId);
    if (!item) return;

    const { id, ...pinContent } = item.pin;
    addPin(targetBoardId, pinContent);
    removeDeskItem(deskItemId);
  };

  const removeDeskItem = (deskItemId: string) => {
    setDeskItems((prev) => prev.filter((d) => d.id !== deskItemId));
  };

  // Sticker Studio
  const addCustomSticker = (name: string, imageUrl: string) => {
    const newSticker: CustomSticker = {
      id: `st-${Date.now()}`,
      name: name.trim() || 'my sticker',
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    setStickers((prev) => [newSticker, ...prev]);
  };

  // Privacy & Passcode
  const unlockBoardWithPasscode = (boardId: string, passcode: string): boolean => {
    const board = boards.find((b) => b.id === boardId);
    if (!board || !board.isLocked) return true;
    if (board.passcode === passcode) {
      setUnlockedBoards((prev) => new Set(prev).add(boardId));
      return true;
    }
    return false;
  };

  const lockBoard = (boardId: string) => {
    setUnlockedBoards((prev) => {
      const next = new Set(prev);
      next.delete(boardId);
      return next;
    });
  };

  // Modal Triggers
  const openCreateSheet = (target: 'board' | 'desk' = 'board', initialType?: PinType | 'new-board') => {
    setCreateTarget(target);
    setInitialCreateType(initialType || null);
    setIsCreateSheetOpen(true);
  };
  const closeCreateSheet = () => {
    setIsCreateSheetOpen(false);
    setInitialCreateType(null);
  };

  const openNoteEditor = () => setIsNoteEditorOpen(true);
  const closeNoteEditor = () => setIsNoteEditorOpen(false);

  const openVoiceNote = () => setIsVoiceNoteOpen(true);
  const closeVoiceNote = () => setIsVoiceNoteOpen(false);

  const openStickerStudio = () => setIsStickerStudioOpen(true);
  const closeStickerStudio = () => setIsStickerStudioOpen(false);

  const openLockModal = (boardId: string) => {
    setLockModalTargetBoardId(boardId);
    setIsLockModalOpen(true);
  };
  const closeLockModal = () => {
    setIsLockModalOpen(false);
    setLockModalTargetBoardId(null);
  };

  const openGuide = () => setIsGuideOpen(true);
  const closeGuide = () => setIsGuideOpen(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const clearAllData = () => {
    setBoards([]);
    setDeskItems([]);
    setStickers([]);
    setReminders([]);
    safeStorage.removeItem(STORAGE_KEYS.BOARDS);
    safeStorage.removeItem(STORAGE_KEYS.DESK);
    safeStorage.removeItem(STORAGE_KEYS.STICKERS);
    safeStorage.removeItem(STORAGE_KEYS.REMINDERS);
    setActiveBoardId(null);
    setActivePinDetail(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        savedAccounts,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUserProfile,
        switchAccount,
        themeMode,
        setThemeMode,
        activeTab,
        setActiveTab,
        activeBoardId,
        setActiveBoardId,
        activeBoard,
        activePinDetail,
        setActivePinDetail,
        boards,
        createBoard,
        updateBoard,
        deleteBoard,
        changeBoardAtmosphere,
        isFreeformMode,
        setIsFreeformMode,
        updatePinFreeformTransform: updatePinPosition,
        updatePinPosition,
        addPin,
        updatePin,
        deletePin,
        togglePinFavorite: toggleFavoritePin,
        toggleFavoritePin,
        toggleChecklistItem,
        deskItems,
        addToDesk,
        moveDeskItemToBoard,
        removeDeskItem,
        stickers,
        addCustomSticker,
        deleteCustomSticker: (id: string) => setStickers((prev) => prev.filter((s) => s.id !== id)),
        addStickerToPin: attachStickerToPin,
        attachStickerToPin,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminderStatus,
        memorySnippet: initialMemory,
        currentlyPlayingAudioId,
        audioProgress,
        togglePlayAudio,
        unlockedBoards,
        unlockBoardWithPasscode,
        lockBoard,
        isCreateSheetOpen,
        openCreateSheet,
        closeCreateSheet,
        createTarget,
        initialCreateType,
        isNoteEditorOpen,
        openNoteEditor,
        closeNoteEditor,
        isVoiceNoteOpen,
        openVoiceNote,
        closeVoiceNote,
        isStickerStudioOpen,
        openStickerStudio,
        closeStickerStudio,
        isLockModalOpen,
        lockModalTargetBoardId,
        openLockModal,
        closeLockModal,
        isGuideOpen,
        openGuide,
        closeGuide,
        isSettingsOpen,
        openSettings,
        closeSettings,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
