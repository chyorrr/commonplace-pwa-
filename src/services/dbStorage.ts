// IndexedDB Persistent Storage for Commonplace iOS PWA

const DB_NAME = 'commonplace_pwa_db';
const DB_VERSION = 1;

export interface OfflineAction {
  id: string;
  type: 'CREATE_PIN' | 'UPDATE_PIN' | 'DELETE_PIN' | 'CREATE_BOARD' | 'UPDATE_BOARD' | 'DELETE_BOARD' | 'ADD_STICKER' | 'ADD_REMINDER' | 'GENERIC_SYNC';
  payload: any;
  timestamp: number;
}

class DBStorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryCache: Record<string, string> = {};
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      this.dbPromise = Promise.resolve(null);
      return;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. App State Store
          if (!db.objectStoreNames.contains('app_state')) {
            db.createObjectStore('app_state', { keyPath: 'key' });
          }

          // 2. Media Store for Photos & Audio Recordings
          if (!db.objectStoreNames.contains('media_store')) {
            db.createObjectStore('media_store', { keyPath: 'id' });
          }

          // 3. Offline Queue for Sync
          if (!db.objectStoreNames.contains('offline_queue')) {
            const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
            queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = async () => {
          const db = request.result;
          this.isInitialized = true;
          // Hydrate memory cache from IndexedDB
          await this.hydrateMemory(db);
          resolve(db);
        };

        request.onerror = (err) => {
          console.warn('[IndexedDB] Init error, using fallback storage:', err);
          resolve(null);
        };
      } catch (e) {
        console.warn('[IndexedDB] Not accessible:', e);
        resolve(null);
      }
    });
  }

  private async hydrateMemory(db: IDBDatabase): Promise<void> {
    try {
      const tx = db.transaction('app_state', 'readonly');
      const store = tx.objectStore('app_state');
      const getAllReq = store.getAll();

      getAllReq.onsuccess = () => {
        const results = getAllReq.result || [];
        results.forEach((item: { key: string; value: string }) => {
          if (item && item.key) {
            this.memoryCache[item.key] = item.value;
            // Also mirror to localStorage for instantaneous synchronous access
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(item.key, item.value);
              }
            } catch (e) {}
          }
        });
      };
    } catch (e) {
      console.warn('[IndexedDB] Hydration notice:', e);
    }
  }

  // Synchronous read (Memory -> LocalStorage fallback)
  public getItemSync(key: string): string | null {
    if (this.memoryCache[key] !== undefined) {
      return this.memoryCache[key];
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          this.memoryCache[key] = val;
          return val;
        }
      }
    } catch (e) {}
    return null;
  }

  // Asynchronous set to IndexedDB, LocalStorage, and Memory
  public async setItem(key: string, value: string): Promise<void> {
    this.memoryCache[key] = value;

    // 1. Mirror to localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // LocalStorage quota might be exceeded for large media; IndexedDB will safely handle it
    }

    // 2. Persist to IndexedDB
    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction('app_state', 'readwrite');
        const store = tx.objectStore('app_state');
        store.put({ key, value, updatedAt: Date.now() });
      }
    } catch (e) {
      console.warn('[IndexedDB] Set error:', e);
    }
  }

  // Synchronous set for immediate state updates
  public setItemSync(key: string, value: string): void {
    this.setItem(key, value).catch(() => {});
  }

  public async removeItem(key: string): Promise<void> {
    delete this.memoryCache[key];

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}

    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction('app_state', 'readwrite');
        const store = tx.objectStore('app_state');
        store.delete(key);
      }
    } catch (e) {}
  }

  // Store large media blobs / base64 without quota restrictions
  public async saveMedia(id: string, data: string, mimeType = 'image/jpeg'): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction('media_store', 'readwrite');
        const store = tx.objectStore('media_store');
        store.put({ id, data, mimeType, createdAt: Date.now() });
      }
    } catch (e) {
      console.warn('[IndexedDB] Save media error:', e);
    }
  }

  public async getMedia(id: string): Promise<string | null> {
    try {
      const db = await this.dbPromise;
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction('media_store', 'readonly');
          const store = tx.objectStore('media_store');
          const req = store.get(id);
          req.onsuccess = () => {
            resolve(req.result ? req.result.data : null);
          };
          req.onerror = () => resolve(null);
        });
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  // Offline Sync Queue Management
  public async enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (db) {
        const fullAction: OfflineAction = {
          ...action,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
        };
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.add(fullAction);
      }
    } catch (e) {
      console.warn('[IndexedDB] Enqueue error:', e);
    }
  }

  public async getOfflineQueue(): Promise<OfflineAction[]> {
    try {
      const db = await this.dbPromise;
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction('offline_queue', 'readonly');
          const store = tx.objectStore('offline_queue');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  public async clearOfflineQueue(): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (db) {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.clear();
      }
    } catch (e) {}
  }
}

export const dbStorage = new DBStorageService();
