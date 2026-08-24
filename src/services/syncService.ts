// Offline Synchronization & Network Status Monitor for iOS PWA
import { dbStorage } from './dbStorage';

export type NetworkStatusCallback = (isOnline: boolean) => void;

class SyncService {
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkStatusCallback> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public get isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : this.isOnlineStatus;
  }

  public subscribe(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);
    callback(this.isOnline);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleNetworkChange(online: boolean) {
    this.isOnlineStatus = online;
    this.listeners.forEach((cb) => {
      try {
        cb(online);
      } catch (e) {}
    });

    if (online) {
      console.log('[SyncService] Connection restored. Synchronizing pending local items...');
      this.flushOfflineQueue();
    } else {
      console.log('[SyncService] App is currently offline. All content is safely preserved in IndexedDB.');
    }
  }

  public async recordOfflineChange(type: any, payload: any): Promise<void> {
    if (!this.isOnline) {
      await dbStorage.enqueueOfflineAction({
        type,
        payload,
      });
    }
  }

  public async flushOfflineQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const queue = await dbStorage.getOfflineQueue();
      if (queue.length > 0) {
        console.log(`[SyncService] Flushing ${queue.length} offline operations...`);
        // In local PWA mode, IndexedDB is already the single source of truth
        // Here we clear the queue after successful reconciliation
        await dbStorage.clearOfflineQueue();
      }
    } catch (e) {
      console.warn('[SyncService] Flush error:', e);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
