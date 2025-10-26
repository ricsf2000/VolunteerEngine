import { prisma } from '@/app/lib/db';
import { UserProfile } from './userProfile';
import { EventDetails } from './eventDetails';

// type definitions (moved from component)
// uses only fields from event details interface
export type EventInfo = Pick<EventDetails, 'eventName' | 'eventDate' | 'location' | 'requiredSkills' | 'urgency'>;

// reusing user profile fields for volunteer info in notifications
export type VolunteerInfo = Pick<UserProfile, 'fullName' | 'skills' | 'availability'>;

export interface MatchStats {
  volunteersMatched: number;
  eventsCount: number;
  efficiency: string;
}

export interface NotificationData {
  id: number;
  type: 'assignment' | 'update' | 'reminder' | 'confirmation' | 'volunteer_application' | 'event_full' | 'matching_complete' | 'volunteer_dropout' | 'cancellation';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId: string;
  userRole: 'volunteer' | 'admin';
  eventInfo?: EventInfo;
  volunteerInfo?: VolunteerInfo;
  matchStats?: MatchStats;
}

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

    // Convert Prisma result to NotificationData format
    return notifications.map(n => ({
      ...n,
      type: n.type as NotificationData['type'],
      userRole: n.userRole as NotificationData['userRole'],
      eventInfo: n.eventInfo ? (n.eventInfo as unknown as EventInfo) : undefined,
      volunteerInfo: n.volunteerInfo ? (n.volunteerInfo as unknown as VolunteerInfo) : undefined,
      matchStats: n.matchStats ? (n.matchStats as unknown as MatchStats) : undefined,
    }));
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

    return notifications.map(n => ({
      ...n,
      type: n.type as NotificationData['type'],
      userRole: n.userRole as NotificationData['userRole'],
      eventInfo: n.eventInfo ? (n.eventInfo as unknown as EventInfo) : undefined,
      volunteerInfo: n.volunteerInfo ? (n.volunteerInfo as unknown as VolunteerInfo) : undefined,
      matchStats: n.matchStats ? (n.matchStats as unknown as MatchStats) : undefined,
    }));
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

    return {
      ...notification,
      type: notification.type as NotificationData['type'],
      userRole: notification.userRole as NotificationData['userRole'],
      eventInfo: notification.eventInfo ? (notification.eventInfo as unknown as EventInfo) : undefined,
      volunteerInfo: notification.volunteerInfo ? (notification.volunteerInfo as unknown as VolunteerInfo) : undefined,
      matchStats: notification.matchStats ? (notification.matchStats as unknown as MatchStats) : undefined,
    };
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
        eventInfo: data.eventInfo ? (data.eventInfo as any) : undefined,
        volunteerInfo: data.volunteerInfo ? (data.volunteerInfo as any) : undefined,
        matchStats: data.matchStats ? (data.matchStats as any) : undefined,
      },
    });

    return {
      ...newNotification,
      type: newNotification.type as NotificationData['type'],
      userRole: newNotification.userRole as NotificationData['userRole'],
      eventInfo: newNotification.eventInfo ? (newNotification.eventInfo as unknown as EventInfo) : undefined,
      volunteerInfo: newNotification.volunteerInfo ? (newNotification.volunteerInfo as unknown as VolunteerInfo) : undefined,
      matchStats: newNotification.matchStats ? (newNotification.matchStats as unknown as MatchStats) : undefined,
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}