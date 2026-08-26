import { Platform } from 'react-native';
import { ReminderItem } from '../types';
import { getServiceWorkerRegistration } from '../serviceWorkerRegistration';

// Safely lazy-load expo-notifications if running in native shell
let ExpoNotifications: any = null;
try {
  if (Platform.OS !== 'web') {
    ExpoNotifications = require('expo-notifications');
    if (ExpoNotifications?.setNotificationHandler) {
      ExpoNotifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  }
} catch (e) {
  // Web fallback active
}

export interface InAppToastPayload {
  id: string;
  title: string;
  body: string;
  category?: string;
  time?: string;
}

class ReminderService {
  private hasPermission: boolean = false;
  private checkInterval: any = null;
  private scheduledTimeouts: Map<string, any> = new Map();
  private onTriggerCallback: ((reminder: ReminderItem) => void) | null = null;
  private toastSubscribers: Set<(toast: InAppToastPayload) => void> = new Set();
  private monitoredReminders: ReminderItem[] = [];

  constructor() {
    this.refreshPermissionState();

    // Listen for tab focus / screen wake to check due reminders immediately
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkDueReminders();
        }
      });
    }
  }

  public refreshPermissionState(): boolean {
    if (Platform.OS !== 'web') {
      if (ExpoNotifications?.getPermissionsAsync) {
        ExpoNotifications.getPermissionsAsync()
          .then(({ status }: any) => {
            this.hasPermission = status === 'granted';
          })
          .catch(() => {});
      }
      return this.hasPermission;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
      return this.hasPermission;
    }
    return false;
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      if (ExpoNotifications?.requestPermissionsAsync) {
        try {
          const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await ExpoNotifications.requestPermissionsAsync();
            finalStatus = status;
          }
          this.hasPermission = finalStatus === 'granted';
          return this.hasPermission;
        } catch (err) {
          console.warn('Expo Notifications permission request error:', err);
          return false;
        }
      }
      return true;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (e) {
      console.warn('Web notification permission request error:', e);
      return false;
    }
  }

  public isPermissionGranted(): boolean {
    this.refreshPermissionState();
    return this.hasPermission;
  }

  public subscribeToast(callback: (toast: InAppToastPayload) => void): () => void {
    this.toastSubscribers.add(callback);
    return () => {
      this.toastSubscribers.delete(callback);
    };
  }

  public playChimeSound() {
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          // Pleasant two-tone chime (D5 -> A5)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          
          gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);

          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + 0.7);
        }
      }
    } catch (e) {
      // AudioContext might require user gesture
    }
  }

  public async sendNotification(title: string, body: string, icon?: string): Promise<boolean> {
    this.playChimeSound();

    // 1. In-App Visual Toast Banner
    const toastPayload: InAppToastPayload = {
      id: `toast-${Date.now()}`,
      title,
      body,
    };
    this.toastSubscribers.forEach((fn) => {
      try {
        fn(toastPayload);
      } catch (e) {}
    });

    // 2. Native iOS / Android Notification via Expo Notifications
    if (Platform.OS !== 'web' && ExpoNotifications?.scheduleNotificationAsync) {
      try {
        await ExpoNotifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            badge: 1,
          },
          trigger: null,
        });
        return true;
      } catch (err) {
        console.warn('Native notification error:', err);
      }
    }

    // 3. Service Worker Web Push Notification (iOS 16.4+ standalone PWA & Android)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await getServiceWorkerRegistration();
        if (registration && registration.showNotification && Notification.permission === 'granted') {
          await registration.showNotification(title, {
            body,
            icon: icon || '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: `reminder-${Date.now()}`,
            data: { url: '/' },
          });
          return true;
        }
      } catch (e) {
        console.warn('[PWA] Service worker showNotification error:', e);
      }
    }

    // 4. Standard Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/icons/icon-192.png',
        });
        return true;
      } catch (e) {
        console.warn('Web notification constructor error:', e);
      }
    }
    return true;
  }

  public async sendTestNotification(): Promise<boolean> {
    const granted = await this.requestNotificationPermission();
    return this.sendNotification(
      'Commonplace ♡ Reminder Alert',
      granted 
        ? 'Your schedule reminders and notifications are working on your device!'
        : 'Reminder alert chime is active! (Allow system notifications in browser settings for background push)'
    );
  }

  public startMonitoring(reminders: ReminderItem[], onTrigger: (reminder: ReminderItem) => void) {
    this.monitoredReminders = reminders;
    this.onTriggerCallback = onTrigger;

    // Clear previous scheduled timeouts
    this.scheduledTimeouts.forEach((t) => clearTimeout(t));
    this.scheduledTimeouts.clear();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const now = new Date();

    // Schedule exact timers for all future reminders today
    reminders.forEach((r) => {
      if (!r.notificationEnabled || r.notified || r.status === 'completed') return;

      const reminderDate = this.parseReminderDateTime(r.date, r.startTime);
      if (!reminderDate) return;

      const isSameDay =
        reminderDate.getFullYear() === now.getFullYear() &&
        reminderDate.getMonth() === now.getMonth() &&
        reminderDate.getDate() === now.getDate();

      if (!isSameDay) return;

      const msUntilDue = reminderDate.getTime() - now.getTime();
      // If due in the future today (within next 24 hours)
      if (msUntilDue > 0 && msUntilDue <= 24 * 60 * 60 * 1000) {
        const timeoutId = setTimeout(() => {
          this.sendNotification(
            `🔔 ${r.title}`,
            `${r.category ? `${r.category} · ` : ''}${r.startTime || 'Scheduled Time'}`
          );
          if (this.onTriggerCallback) {
            this.onTriggerCallback(r);
          }
        }, msUntilDue);

        this.scheduledTimeouts.set(r.id, timeoutId);
      }
    });

    // Also check every 5 seconds as a safety net
    this.checkInterval = setInterval(() => {
      this.checkDueReminders();
    }, 5000);

    // Run immediate check
    this.checkDueReminders();
  }

  public stopMonitoring() {
    this.scheduledTimeouts.forEach((t) => clearTimeout(t));
    this.scheduledTimeouts.clear();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Parse reminder date and time string into a local Date object
   */
  private parseReminderDateTime(dateStr?: string, timeStr?: string): Date | null {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
          d.setFullYear(y, m, day);
        }
      }
    }

    if (timeStr) {
      const cleanTime = timeStr.trim().toUpperCase();
      const isPM = cleanTime.includes('PM');
      const isAM = cleanTime.includes('AM');
      const timeOnly = cleanTime.replace('AM', '').replace('PM', '').trim();
      const [hStr, mStr] = timeOnly.split(':');
      let hours = parseInt(hStr || '0', 10);
      const mins = parseInt(mStr || '0', 10);

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      d.setHours(hours, isNaN(mins) ? 0 : mins, 0, 0);
      return d;
    }

    return d;
  }

  private checkDueReminders() {
    const reminders = this.monitoredReminders;
    if (!reminders || reminders.length === 0) return;

    const now = new Date();

    reminders.forEach((r) => {
      // Must have notifications enabled, not already notified, and not marked completed
      if (!r.notificationEnabled || r.notified || r.status === 'completed') {
        return;
      }

      const reminderDate = this.parseReminderDateTime(r.date, r.startTime);
      if (!reminderDate) return;

      // Check if reminder is scheduled for today
      const isSameDay =
        reminderDate.getFullYear() === now.getFullYear() &&
        reminderDate.getMonth() === now.getMonth() &&
        reminderDate.getDate() === now.getDate();

      if (!isSameDay) return;

      // Due if current time is at or past scheduled time within the last 2 hours
      const diffMs = now.getTime() - reminderDate.getTime();
      const isDue = diffMs >= -30000 && diffMs <= 2 * 60 * 60 * 1000;

      if (isDue) {
        this.sendNotification(
          `🔔 ${r.title}`,
          `${r.category ? `${r.category} · ` : ''}${r.startTime || 'Scheduled Time'}`
        );

        if (this.onTriggerCallback) {
          this.onTriggerCallback(r);
        }
      }
    });
  }
}

export const reminderService = new ReminderService();
