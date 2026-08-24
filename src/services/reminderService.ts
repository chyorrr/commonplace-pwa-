import { Platform } from 'react-native';
import { ReminderItem } from '../types';
import { getServiceWorkerRegistration } from '../serviceWorkerRegistration';

// Safely lazy-load expo-notifications to prevent Expo Go SDK 53+ Android red-screen error
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
  console.log('Expo Go notification fallback active');
}

class ReminderService {
  private hasPermission: boolean = false;
  private checkInterval: any = null;
  private onTriggerCallback: ((reminder: ReminderItem) => void) | null = null;

  constructor() {
    if (Platform.OS !== 'web' && ExpoNotifications?.getPermissionsAsync) {
      try {
        ExpoNotifications.getPermissionsAsync()
          .then(({ status }: any) => {
            this.hasPermission = status === 'granted';
          })
          .catch(() => {});
      } catch (e) {}
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
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
    if (Platform.OS !== 'web') {
      return this.hasPermission;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  public playChimeSound() {
    try {
      if (typeof window !== 'undefined' && ((window as any).AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  public async sendNotification(title: string, body: string, icon?: string): Promise<boolean> {
    this.playChimeSound();

    // 1. Native iOS / Android Notification via Expo Notifications (if in native shell)
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
        console.warn('Native Expo notification notice:', err);
      }
    }

    // 2. iOS 16.4+ Standalone PWA / Service Worker Web Push Notification
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await getServiceWorkerRegistration();
        if (registration && registration.showNotification && Notification.permission === 'granted') {
          await registration.showNotification(title, {
            body,
            icon: icon || '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'commonplace-reminder',
            data: { url: '/' },
          });
          return true;
        }
      } catch (e) {
        console.warn('[PWA] Service worker notification notice:', e);
      }
    }

    // 3. Standard Web Browser Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/icons/icon-192.png',
        });
        return true;
      } catch (e) {
        console.warn('Web notification notice:', e);
      }
    }
    return true;
  }

  public async sendTestNotification(): Promise<boolean> {
    return this.sendNotification(
      'Commonplace ♡ Reminder',
      'Your schedule reminders and notifications are working on your device!'
    );
  }

  public startMonitoring(reminders: ReminderItem[], onTrigger: (reminder: ReminderItem) => void) {
    this.onTriggerCallback = onTrigger;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkDueReminders(reminders);
    }, 30000); // check every 30s

    // Run immediate check
    this.checkDueReminders(reminders);
  }

  public stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkDueReminders(reminders: ReminderItem[]) {
    if (!reminders || reminders.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    reminders.forEach((r) => {
      if (r.notificationEnabled && !r.notified && r.date === todayStr) {
        const [timePart, meridiem] = r.startTime.split(' ');
        if (timePart) {
          const [hoursStr, minsStr] = timePart.split(':');
          let hours = parseInt(hoursStr || '0', 10);
          const mins = parseInt(minsStr || '0', 10);
          if (meridiem?.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (meridiem?.toUpperCase() === 'AM' && hours === 12) hours = 0;

          const reminderTime = new Date();
          reminderTime.setHours(hours, mins, 0, 0);

          const diffMs = Math.abs(now.getTime() - reminderTime.getTime());
          if (diffMs <= 5 * 60 * 1000) {
            this.sendNotification(
              `🔔 Reminder: ${r.title}`,
              `Time for ${r.category}: ${r.title} (${r.startTime})`
            );
            if (this.onTriggerCallback) {
              this.onTriggerCallback(r);
            }
          }
        }
      }
    });
  }
}

export const reminderService = new ReminderService();
