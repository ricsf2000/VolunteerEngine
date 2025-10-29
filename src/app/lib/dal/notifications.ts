import { prisma } from '@/app/lib/db';
import type { NotificationData, UserProfile, EventDetails } from '@/generated/prisma';
import type { InputJsonValue } from '@/generated/prisma/runtime/library';

// re-export NotificationData for use in other modules
export type { NotificationData };

// type definitions (moved from component)
// uses only fields from event details interface
export type EventInfo = Pick<EventDetails, 'eventName' | 'eventDate' | 'location' | 'requiredSkills' | 'urgency'>;

// reusing user profile fields for volunteer info in notifications
export type VolunteerInfo = Pick<UserProfile, 'fullName' | 'skills' | 'availability'>;

// dal functions - pure database operations (no business logic!)

export async function getNotificationsByUserId(userId: string): Promise<NotificationData[]> {
  try {
    const notifications = await prisma.notificationData.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications by user ID:', error);
    return [];
  }
}

export async function getNotificationsByUserRole(userRole: 'volunteer' | 'admin'): Promise<NotificationData[]> {
  try {
    const notifications = await prisma.notificationData.findMany({
      where: {
        userRole,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications by user role:', error);
    return [];
  }
}

export async function updateNotificationReadStatus(
  notificationId: number,
  isRead: boolean
): Promise<NotificationData | null> {
  try {
    const notification = await prisma.notificationData.update({
      where: { id: notificationId },
      data: { isRead },
    });

    return notification;
  } catch (error) {
    console.error('Error updating notification read status:', error);
    return null;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const result = await prisma.notificationData.updateMany({
      where: { userId },
      data: { isRead: true },
    });

    return result.count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    await prisma.notificationData.delete({
      where: { id: notificationId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

export async function createNotification(data: Omit<NotificationData, 'id'>): Promise<NotificationData> {
  try {
    const newNotification = await prisma.notificationData.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: data.timestamp,
        isRead: data.isRead,
        userId: data.userId,
        userRole: data.userRole,
        eventInfo: data.eventInfo as InputJsonValue | undefined,
        volunteerInfo: data.volunteerInfo as InputJsonValue | undefined,
        matchStats: data.matchStats as InputJsonValue | undefined,
      },
    });

    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}