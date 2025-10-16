'use server';

import { 
  getNotificationsByUserId, 
  getNotificationsByUserRole,
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  NotificationData 
} from '../dal/notifications';

async function getCurrentUserId(): Promise<number> {
  // todo: get from session/auth
  return 1;
}

export async function getUserNotifications(userRole: 'volunteer' | 'admin'): Promise<NotificationData[]> {
  try {
    const notifications = await getNotificationsByUserRole(userRole);
    return notifications.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to load notifications');
  }
}

export async function toggleNotificationReadStatus(
  notificationId: number, 
  currentStatus: boolean
): Promise<NotificationData | null> {
  try {
    const newStatus = !currentStatus;
    const updated = await updateNotificationReadStatus(notificationId, newStatus);
    
    if (!updated) {
      throw new Error('Notification not found');
    }
    
    return updated;
  } catch (error) {
    console.error('Error toggling notification status:', error);
    throw new Error('Failed to update notification');
  }
}

export async function markAllUserNotificationsAsRead(): Promise<{ success: boolean; count: number }> {
  try {
    const userId = await getCurrentUserId();
    const count = await markAllNotificationsAsRead(userId);
    return { success: true, count };
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
}

export async function removeNotification(notificationId: number): Promise<{ success: boolean }> {
  try {
    const success = await deleteNotification(notificationId);
    
    if (!success) {
      throw new Error('Notification not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }
}

export async function sendVolunteerNotification(
  volunteerId: number,
  type: NotificationData['type'],
  title: string,
  message: string,
  eventInfo?: NotificationData['eventInfo']
): Promise<NotificationData> {
  // validation outside try-catch - let these errors propagate as-is
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (!message || message.trim().length === 0) {
    throw new Error('Message is required');
  }
  
  // only catch dal/database errors
  try {
    const notification = await createNotification({
      userId: volunteerId,
      userRole: 'volunteer',
      type,
      title: title.trim(),
      message: message.trim(),
      timestamp: 'Just now',
      isRead: false,
      eventInfo
    });
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
}