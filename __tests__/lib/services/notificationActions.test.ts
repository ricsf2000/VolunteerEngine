import {
  getUserNotifications,
  toggleNotificationReadStatus,
  markAllUserNotificationsAsRead,
  removeNotification,
  sendNotification,
} from '@/app/lib/services/notificationActions';

// mock the auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// mock the dal layer
jest.mock('@/app/lib/dal/notifications', () => ({
  getNotificationsByUserId: jest.fn(),
  updateNotificationReadStatus: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  createNotification: jest.fn(),
}));

import * as notificationDAL from '@/app/lib/dal/notifications';
import { auth } from '@/auth';

describe('Notification Actions (Service Layer)', () => {
  
  beforeEach(() => {
    // clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return notifications sorted by ID descending', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockNotifications = [
        { id: 1, title: 'First', userId: '2' },
        { id: 3, title: 'Third', userId: '2' },
        { id: 2, title: 'Second', userId: '2' },
      ] as any;

      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getUserNotifications();

      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
      expect(notificationDAL.getNotificationsByUserId).toHaveBeenCalledWith('2');
    });

    it('should return empty array when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getUserNotifications();

      expect(result).toEqual([]);
    });

    it('should return empty array when DAL fails', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await getUserNotifications();
      expect(result).toEqual([]);
    });
  });

  describe('toggleNotificationReadStatus', () => {
    it('should toggle from false to true', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);

      const mockNotification = { id: 1, isRead: true } as any;
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockResolvedValue(mockNotification);

      const result = await toggleNotificationReadStatus(1, false);

      expect(notificationDAL.updateNotificationReadStatus).toHaveBeenCalledWith(1, true);
      expect(result?.isRead).toBe(true);
    });

    it('should toggle from true to false', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);

      const mockNotification = { id: 1, isRead: false } as any;
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockResolvedValue(mockNotification);

      const result = await toggleNotificationReadStatus(1, true);

      expect(notificationDAL.updateNotificationReadStatus).toHaveBeenCalledWith(1, false);
      expect(result?.isRead).toBe(false);
    });

    it('should return null when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await toggleNotificationReadStatus(1, false);
      expect(result).toBeNull();
    });

    it('should return null when notification not owned by user', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);

      const result = await toggleNotificationReadStatus(999, false);
      expect(result).toBeNull();
    });

    it('should return null when DAL fails', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      (notificationDAL.getNotificationsByUserId as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await toggleNotificationReadStatus(1, false);
      expect(result).toBeNull();
    });
  });

  describe('markAllUserNotificationsAsRead', () => {
    it('should return success and count when marking all as read', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(5);

      const result = await markAllUserNotificationsAsRead();

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(notificationDAL.markAllNotificationsAsRead).toHaveBeenCalledWith('2');
    });

    it('should handle zero notifications marked', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(0);

      const result = await markAllUserNotificationsAsRead();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should return failure when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await markAllUserNotificationsAsRead();
      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
    });

    it('should return failure when DAL fails', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await markAllUserNotificationsAsRead();
      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should successfully delete notification', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);
      (notificationDAL.deleteNotification as jest.Mock).mockResolvedValue(true);

      const result = await removeNotification(1);

      expect(result.success).toBe(true);
      expect(notificationDAL.deleteNotification).toHaveBeenCalledWith(1);
    });

    it('should return failure when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await removeNotification(1);
      expect(result.success).toBe(false);
    });

    it('should return failure when notification not owned by user', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);

      const result = await removeNotification(999);
      expect(result.success).toBe(false);
    });

    it('should return failure when DAL delete fails', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockUserNotifications = [{ id: 1, userId: '2' }];
      (notificationDAL.getNotificationsByUserId as jest.Mock).mockResolvedValue(mockUserNotifications);
      (notificationDAL.deleteNotification as jest.Mock).mockResolvedValue(false);

      const result = await removeNotification(1);
      expect(result.success).toBe(false);
    });

    it('should return failure when DAL throws error', async () => {
      const mockSession = { user: { id: '2' } };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      (notificationDAL.getNotificationsByUserId as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await removeNotification(1);
      expect(result.success).toBe(false);
    });
  });

  describe('sendNotification', () => {
    it('should create notification with valid input', async () => {
      const mockCreatedNotification = {
        id: 10,
        userId: '2',
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Test Title',
        message: 'Test Message',
        timestamp: expect.any(String),
        isRead: false,
      } as any;

      (notificationDAL.createNotification as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await sendNotification(
        '2',
        'volunteer',
        'assignment',
        'Test Title',
        'Test Message'
      );

      expect(result?.id).toBe(10);
      expect(result?.title).toBe('Test Title');
      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '2',
          userRole: 'volunteer',
          type: 'assignment',
          title: 'Test Title',
          message: 'Test Message',
        })
      );
    });

    it('should trim whitespace from title and message', async () => {
      (notificationDAL.createNotification as jest.Mock).mockResolvedValue({ id: 1 } as any);

      await sendNotification('2', 'volunteer', 'assignment', '  Spaced Title  ', '  Spaced Message  ');

      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Spaced Title',
          message: 'Spaced Message',
        })
      );
    });

    it('should return null for empty title', async () => {
      const result = await sendNotification('2', 'volunteer', 'assignment', '', 'Valid Message');
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only title', async () => {
      const result = await sendNotification('2', 'volunteer', 'assignment', '   ', 'Valid Message');
      expect(result).toBeNull();
    });

    it('should return null for empty message', async () => {
      const result = await sendNotification('2', 'volunteer', 'assignment', 'Valid Title', '');
      expect(result).toBeNull();
    });

    it('should include event info when provided', async () => {
      const mockCreated = { id: 1 } as any;
      (notificationDAL.createNotification as jest.Mock).mockResolvedValue(mockCreated);

      const eventInfo = {
        eventName: 'Test Event',
        eventDate: new Date('2024-03-25T09:00:00'),
        location: 'Test Location',
        requiredSkills: ['Food Service'],
        urgency: 'high' as const,
      };

      await sendNotification('2', 'volunteer', 'assignment', 'Title', 'Message', eventInfo);

      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          eventInfo,
        })
      );
    });

    it('should return null when DAL fails', async () => {
      (notificationDAL.createNotification as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await sendNotification('2', 'volunteer', 'assignment', 'Title', 'Message');
      expect(result).toBeNull();
    });
  });
});