import {
  getNotificationsByUserId,
  getNotificationsByUserRole,
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from '@/app/lib/dal/notifications';
import type { NotificationData } from '@/generated/prisma';
import { prisma } from '@/app/lib/db';

describe('Notifications DAL', () => {
  let adminId: string;
  let volunteerId: string;

  // get existing user IDs from the seeded database
  beforeAll(async () => {
    const admin = await prisma.userCredentials.findFirst({
      where: { email: 'admin@test.com' },
    });
    const volunteer = await prisma.userCredentials.findFirst({
      where: { email: 'volunteer@test.com' },
    });

    if (!admin || !volunteer) {
      throw new Error('Seed data not found. Make sure database is seeded.');
    }

    adminId = admin.id;
    volunteerId = volunteer.id;
  });

  describe('createNotification', () => {
    it('should create a new notification with required fields', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: '2024-03-25T09:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      };

      const result = await createNotification(newNotification);

      expect(result).toBeTruthy();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Notification');
      expect(result.message).toBe('This is a test');
      expect(result.userId).toBe(volunteerId);
      expect(result.userRole).toBe('volunteer');
      expect(result.isRead).toBe(false);
    });

    it('should create notification with event info', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Event Assignment',
        message: 'You have been assigned',
        timestamp: '2024-03-25T10:00:00Z',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25T09:00:00').toISOString(),
          location: 'Test Location',
          requiredSkills: ['Food Service'],
          urgency: 'high',
        },
        volunteerInfo: null,
        matchStats: null,
      };

      const result = await createNotification(newNotification);

      expect(result.eventInfo).toBeDefined();
      expect(result.eventInfo).toHaveProperty('eventName', 'Test Event');
      expect(result.eventInfo).toHaveProperty('urgency', 'high');
    });

    it('should create notification with volunteerInfo', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: adminId,
        userRole: 'admin',
        type: 'volunteer_application',
        title: 'New Volunteer',
        message: 'A volunteer has applied',
        timestamp: '2024-03-25T11:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
        matchStats: null,
      };

      const result = await createNotification(newNotification);

      expect(result.volunteerInfo).toBeDefined();
      expect(result.volunteerInfo).toHaveProperty('fullName', 'John Doe');
    });

    it('should create notification with matchStats', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: adminId,
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Matching Complete',
        message: 'Volunteers have been matched',
        timestamp: '2024-03-25T12:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: {
          volunteersMatched: 10,
          eventsCount: 5,
          efficiency: '92%',
        },
      };

      const result = await createNotification(newNotification);

      expect(result.matchStats).toBeDefined();
      expect(result.matchStats).toHaveProperty('volunteersMatched', 10);
      expect(result.matchStats).toHaveProperty('eventsCount', 5);
    });

    it('should create notification with all optional fields', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: adminId,
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Complete Notification',
        message: 'All fields present',
        timestamp: '2024-03-25T13:00:00Z',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25').toISOString(),
          location: 'Test Location',
          requiredSkills: ['Skill1'],
          urgency: 'high',
        },
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
        matchStats: {
          volunteersMatched: 5,
          eventsCount: 2,
          efficiency: '95%',
        },
      };

      const result = await createNotification(newNotification);

      expect(result.eventInfo).toBeDefined();
      expect(result.volunteerInfo).toBeDefined();
      expect(result.matchStats).toBeDefined();
      expect(result.eventInfo).toHaveProperty('eventName', 'Test Event');
      expect(result.volunteerInfo).toHaveProperty('fullName', 'John Doe');
      expect(result.matchStats).toHaveProperty('volunteersMatched', 5);
    });
  });

  describe('getNotificationsByUserRole', () => {
    it('should return only volunteer notifications when role is volunteer', async () => {
      // create test notifications
      await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Volunteer Test 1',
        message: 'Test message 1',
        timestamp: '2024-03-25T14:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Volunteer Test 2',
        message: 'Test message 2',
        timestamp: '2024-03-25T15:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await getNotificationsByUserRole('volunteer');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every(n => n.userRole === 'volunteer')).toBe(true);
    });

    it('should return only admin notifications when role is admin', async () => {
      await createNotification({
        userId: adminId,
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Admin notification',
        message: 'Test admin message',
        timestamp: '2024-03-25T16:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await getNotificationsByUserRole('admin');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(n => n.userRole === 'admin')).toBe(true);
    });

    it('should return empty array on error', async () => {
      const result = await getNotificationsByUserRole('invalid' as any);

      expect(result).toEqual([]);
    });

    it('should handle notifications with eventInfo, volunteerInfo, and matchStats', async () => {
      await createNotification({
        userId: adminId,
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Test with all fields',
        message: 'Test message',
        timestamp: '2024-03-25T17:00:00Z',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25').toISOString(),
          location: 'Test Location',
          requiredSkills: ['Skill1'],
          urgency: 'high',
        },
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
        matchStats: {
          volunteersMatched: 5,
          eventsCount: 2,
          efficiency: '95%',
        },
      });

      const result = await getNotificationsByUserRole('admin');
      const testNotification = result.find(n => n.title === 'Test with all fields');

      expect(testNotification).toBeDefined();
      expect(testNotification?.eventInfo).toBeDefined();
      expect(testNotification?.volunteerInfo).toBeDefined();
      expect(testNotification?.matchStats).toBeDefined();
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should return notifications for a specific user', async () => {
      await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'User-specific notification',
        message: 'Test message',
        timestamp: '2024-03-25T18:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await getNotificationsByUserId(volunteerId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(n => n.userId === volunteerId)).toBe(true);
    });

    it('should return empty array for user with no notifications', async () => {
      const result = await getNotificationsByUserId('non-existent-user-999');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const result = await getNotificationsByUserId('');

      expect(result).toEqual([]);
    });

    it('should handle notifications with all optional fields', async () => {
      await createNotification({
        userId: adminId,
        userRole: 'admin',
        type: 'volunteer_application',
        title: 'Notification with fields',
        message: 'Test message',
        timestamp: '2024-03-25T19:00:00Z',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25').toISOString(),
          location: 'Test Location',
          requiredSkills: ['Skill1'],
          urgency: 'medium',
        },
        volunteerInfo: {
          fullName: 'Jane Smith',
          skills: ['Skill1', 'Skill2'],
          availability: ['2024-03-25'],
        },
        matchStats: {
          volunteersMatched: 10,
          eventsCount: 3,
          efficiency: '90%',
        },
      });

      const result = await getNotificationsByUserId(adminId);
      const testNotification = result.find(n => n.title === 'Notification with fields');

      expect(testNotification?.eventInfo).toBeDefined();
      expect(testNotification?.volunteerInfo).toBeDefined();
      expect(testNotification?.matchStats).toBeDefined();
    });
  });

  describe('updateNotificationReadStatus', () => {
    it('should update notification read status to true', async () => {
      const notification = await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Update Test',
        message: 'Test message',
        timestamp: '2024-03-25T20:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await updateNotificationReadStatus(notification.id, true);

      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(true);
      expect(result?.id).toBe(notification.id);
    });

    it('should update notification read status to false', async () => {
      const notification = await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Update Test 2',
        message: 'Test message',
        timestamp: '2024-03-25T21:00:00Z',
        isRead: true,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await updateNotificationReadStatus(notification.id, false);

      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(false);
    });

    it('should return null for non-existent notification', async () => {
      const result = await updateNotificationReadStatus(999999, true);

      expect(result).toBeNull();
    });

    it('should handle updating notification with all optional fields', async () => {
      const notification = await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Update Test with fields',
        message: 'Test message',
        timestamp: '2024-03-25T22:00:00Z',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25').toISOString(),
          location: 'Test Location',
          requiredSkills: ['Skill1'],
          urgency: 'high',
        },
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
        matchStats: {
          volunteersMatched: 5,
          eventsCount: 2,
          efficiency: '95%',
        },
      });

      const result = await updateNotificationReadStatus(notification.id, true);

      expect(result?.eventInfo).toBeDefined();
      expect(result?.volunteerInfo).toBeDefined();
      expect(result?.matchStats).toBeDefined();
      expect(result?.isRead).toBe(true);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Unread 1',
        message: 'Test message',
        timestamp: '2024-03-25T23:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Unread 2',
        message: 'Test message',
        timestamp: '2024-03-26T00:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const count = await markAllNotificationsAsRead(volunteerId);

      expect(count).toBeGreaterThanOrEqual(2);
      expect(typeof count).toBe('number');

      // verify all are marked as read
      const notifications = await getNotificationsByUserId(volunteerId);
      expect(notifications.every(n => n.isRead)).toBe(true);
    });

    it('should return 0 for user with no notifications', async () => {
      const count = await markAllNotificationsAsRead('user-with-no-notifications-999');

      expect(count).toBe(0);
    });

    it('should return 0 on error', async () => {
      const count = await markAllNotificationsAsRead('');

      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete an existing notification', async () => {
      const notification = await createNotification({
        userId: volunteerId,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'To be deleted',
        message: 'Test message',
        timestamp: '2024-03-26T01:00:00Z',
        isRead: false,
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      });

      const result = await deleteNotification(notification.id);

      expect(result).toBe(true);

      // verify it's deleted
      const fetchedNotification = await updateNotificationReadStatus(notification.id, true);
      expect(fetchedNotification).toBeNull();
    });

    it('should return false for non-existent notification', async () => {
      const result = await deleteNotification(999999);

      expect(result).toBe(false);
    });
  });
});
