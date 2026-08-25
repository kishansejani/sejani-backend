import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// 1. Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Initialize Android High-Priority Notification Channel & iOS Permissions
   * Ensures notifications ring and show heads-up banner on Lock Screen just like WhatsApp
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const perm = await window.Notification.requestPermission();
        return perm === 'granted';
      }
      return false;
    }

    try {
      // 1. Android High-Priority Channel for Lock Screen & Sound
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'PersonalInfo - રિમાઇન્ડર એલર્ટ્સ',
          description: 'પેમેન્ટ અને કામના સમયસર એલર્ટ્સ (Lock screen notification)',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 300, 200, 300],
          lightColor: '#F59E0B',
          enableLights: true,
          enableVibrate: true,
          sound: 'default',
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      // 2. Request System Permissions (Lock Screen, Sound, Banner)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Failed to get notification permission:', e);
      return false;
    }
  },

  /**
   * Send an immediate high-priority local notification
   */
  async sendInstantNotification(title: string, body: string, data?: any) {
    if (Platform.OS === 'web') {
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(title, { body, icon: '/favicon.ico' });
      }
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data || {},
          sound: true,
        },
        trigger: null, // immediate
      });
    } catch (e) {
      console.warn('Instant notification error:', e);
    }
  },

  /**
   * Schedule a real background notification for a specific Date and Time
   * Fired by OS AlarmManager / Apple APNs even if phone screen is locked or app is closed
   */
  async scheduleTaskReminder(title: string, body: string, targetDate: Date, data?: any) {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    // If target date is in the future, calculate exact trigger seconds (minimum 3 seconds)
    const triggerSeconds = diffMs > 0 ? Math.max(3, Math.floor(diffMs / 1000)) : 5;

    if (Platform.OS === 'web') {
      if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          this.sendInstantNotification(title, body, data);
        }, diffMs);
      }
      return;
    }

    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
        },
      });

      console.log(`[Notification] Scheduled "${title}" for ${targetDate.toISOString()} with ID: ${notifId}`);
      return notifId;
    } catch (e) {
      console.warn('Schedule notification error:', e);
    }
  },
};
