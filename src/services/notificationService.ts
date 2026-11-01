import { soundEffects } from './soundEffects';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'info' | 'streak' | 'pomodoro' | 'achievement';
}

type NotificationListener = (notification: InAppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  triggerNotification(
    title: string,
    body: string,
    type: 'info' | 'streak' | 'pomodoro' | 'achievement' = 'info'
  ) {
    const id = Date.now().toString();
    const inAppNotif: InAppNotification = {
      id,
      title,
      body,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type,
    };

    // Play pleasant ping
    soundEffects.playNotificationPing();

    // Trigger Native Web Notification if permission granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Native notification failed, using in-app fallback:', e);
      }
    }

    // Broadcast to in-app listeners (for floating preview toast & notifications log)
    this.listeners.forEach((fn) => fn(inAppNotif));
  }
}

export const notificationService = new NotificationService();
