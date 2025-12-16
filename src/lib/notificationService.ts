// Notification service for handling reminders and alerts
import { apiService } from './apiService';
import { authUtils } from './auth';

class NotificationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    // Check for notifications every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkNotifications();
    }, 5 * 60 * 1000);
    
    // Initial check
    this.checkNotifications();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async checkNotifications() {
    try {
      const user = authUtils.getAuth();
      if (!user?.familyId) return;

      // Generate event notifications
      await apiService.generateEventNotifications(user.familyId);
      
      // Generate upcoming task/event notifications
      await apiService.generateUpcomingNotifications(user.familyId);
      
      // Trigger a custom event to update UI
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  }

  async createEventReminder(eventData: any, reminderMinutes: number) {
    const user = authUtils.getAuth();
    if (!user?.id || reminderMinutes <= 0) return;

    const eventDateTime = new Date(eventData.startDate);
    const reminderTime = new Date(eventDateTime.getTime() - (reminderMinutes * 60 * 1000));
    
    // Only create reminder if it's in the future
    if (reminderTime > new Date()) {
      await apiService.createNotification({
        userId: user.id,
        title: `Reminder: ${eventData.title}`,
        message: `Your event "${eventData.title}" starts in ${reminderMinutes} minutes`,
        type: 'reminder',
        actionUrl: '/calendar',
        eventId: eventData.id,
        scheduledFor: reminderTime.toISOString()
      });
    }
  }

  async showBrowserNotification(title: string, message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

export const notificationService = new NotificationService();