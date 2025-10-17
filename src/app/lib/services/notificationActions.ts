'use server';

import { auth } from '@/auth';
import {
  getNotificationsByUserId,
  getNotificationsByUserRole,
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  NotificationData
} from '../dal/notifications';

export async function getUserNotifications(): Promise<NotificationData[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    const userId = (session.user as any).id;
    const notifications = await getNotificationsByUserId(userId);
    return notifications.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function toggleNotificationReadStatus(
  notificationId: number,
  currentStatus: boolean
): Promise<NotificationData | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const userId = (session.user as any).id;

    // verify ownership before allowing operation
    const userNotifications = await getNotificationsByUserId(userId);
    if (!userNotifications.find(n => n.id === notificationId)) {
      return null;
    }

    const newStatus = !currentStatus;
    const updated = await updateNotificationReadStatus(notificationId, newStatus);

    return updated;
  } catch (error) {
    console.error('Error toggling notification status:', error);
    return null;
  }
}

export async function markAllUserNotificationsAsRead(): Promise<{ success: boolean; count: number }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, count: 0 };
    }

    const userId = (session.user as any).id;
    const count = await markAllNotificationsAsRead(userId);
    return { success: true, count };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, count: 0 };
  }
}

export async function removeNotification(notificationId: number): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false };
    }

    const userId = (session.user as any).id;

    // verify ownership before allowing operation
    const userNotifications = await getNotificationsByUserId(userId);
    if (!userNotifications.find(n => n.id === notificationId)) {
      return { success: false };
    }

    const success = await deleteNotification(notificationId);

    return { success };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false };
  }
}

export async function sendVolunteerNotification(
  volunteerId: string,
  userRole: 'volunteer' | 'admin',
  type: NotificationData['type'],
  title: string,
  message: string,
  eventInfo?: NotificationData['eventInfo']
): Promise<NotificationData | null> {
  try {
    // validation
    if (!title || title.trim().length === 0) {
      console.error('Title is required');
      return null;
    }
    if (!message || message.trim().length === 0) {
      console.error('Message is required');
      return null;
    }

    const notification = await createNotification({
      userId: volunteerId,
      userRole,
      type,
      title: title.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      eventInfo
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}