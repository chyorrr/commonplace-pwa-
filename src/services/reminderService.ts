import { Platform } from 'react-native';
import { ReminderItem } from '../types';

// Safely lazy-load expo-notifications to prevent Expo Go SDK 53+ Android red-screen error
let ExpoNotifications: any = null;
try {
  // On web or in Expo Go Android without native push module, require won't crash the bundle
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
  // Expo Go notice safely caught
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
      if (typeof window !== 'undefined' && (window as any).AudioContext) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

    // 1. Native iOS / Android Notification via Expo Notifications (if available)
    if (Platform.OS !== 'web' && ExpoNotifications?.scheduleNotificationAsync) {
      try {
        await ExpoNotifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            badge: 1,
          },
          trigger: null, // deliver immediately
        });
        return true;
      } catch (err) {
        console.warn('Native Expo notification notice:', err);
      }
    }

    // 2. Web Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=100',
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
      'commonplace ♡ reminder',
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
        // Parse time like "10:00 AM" or "02:30 PM"
        const [timePart, meridiem] = r.startTime.split(' ');
        if (timePart) {
          const [hoursStr, minsStr] = timePart.split(':');
          let hours = parseInt(hoursStr || '0', 10);
          const mins = parseInt(minsStr || '0', 10);
          if (meridiem?.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (meridiem?.toUpperCase() === 'AM' && hours === 12) hours = 0;

          const reminderTime = new Date();
          reminderTime.setHours(hours, mins, 0, 0);

          // If within 5 minutes of now
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
