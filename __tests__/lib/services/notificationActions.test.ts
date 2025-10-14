import {
  getUserNotifications,
  toggleNotificationReadStatus,
  markAllUserNotificationsAsRead,
  removeNotification,
  sendVolunteerNotification,
} from '@/app/lib/services/notificationActions';

// Mock the DAL layer
jest.mock('@/app/lib/dal/notifications', () => ({
  getNotificationsByUserRole: jest.fn(),
  updateNotificationReadStatus: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  createNotification: jest.fn(),
}));

import * as notificationDAL from '@/app/lib/dal/notifications';

describe('Notification Actions (Service Layer)', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return notifications sorted by ID descending', async () => {
      const mockNotifications = [
        { id: 1, title: 'First', userRole: 'volunteer' },
        { id: 3, title: 'Third', userRole: 'volunteer' },
        { id: 2, title: 'Second', userRole: 'volunteer' },
      ] as any;

      (notificationDAL.getNotificationsByUserRole as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getUserNotifications('volunteer');
      
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
    });

    it('should call DAL with correct user role', async () => {
      (notificationDAL.getNotificationsByUserRole as jest.Mock).mockResolvedValue([]);

      await getUserNotifications('admin');
      
      expect(notificationDAL.getNotificationsByUserRole).toHaveBeenCalledWith('admin');
    });

    it('should throw error when DAL fails', async () => {
      (notificationDAL.getNotificationsByUserRole as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(getUserNotifications('volunteer')).rejects.toThrow('Failed to load notifications');
    });
  });

  describe('toggleNotificationReadStatus', () => {
    it('should toggle from false to true', async () => {
      const mockNotification = { id: 1, isRead: true } as any;
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockResolvedValue(mockNotification);

      const result = await toggleNotificationReadStatus(1, false);
      
      expect(notificationDAL.updateNotificationReadStatus).toHaveBeenCalledWith(1, true);
      expect(result?.isRead).toBe(true);
    });

    it('should toggle from true to false', async () => {
      const mockNotification = { id: 1, isRead: false } as any;
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockResolvedValue(mockNotification);

      const result = await toggleNotificationReadStatus(1, true);
      
      expect(notificationDAL.updateNotificationReadStatus).toHaveBeenCalledWith(1, false);
      expect(result?.isRead).toBe(false);
    });

    it('should throw error when notification not found', async () => {
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockResolvedValue(null);

      await expect(toggleNotificationReadStatus(999, false)).rejects.toThrow('Failed to update notification');
    });

    it('should throw error when DAL fails', async () => {
      (notificationDAL.updateNotificationReadStatus as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(toggleNotificationReadStatus(1, false)).rejects.toThrow('Failed to update notification');
    });
  });

  describe('markAllUserNotificationsAsRead', () => {
    it('should return success and count when marking all as read', async () => {
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(5);

      const result = await markAllUserNotificationsAsRead();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
    });

    it('should handle zero notifications marked', async () => {
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(0);

      const result = await markAllUserNotificationsAsRead();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should throw error when DAL fails', async () => {
      (notificationDAL.markAllNotificationsAsRead as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(markAllUserNotificationsAsRead()).rejects.toThrow('Failed to mark notifications as read');
    });
  });

  describe('removeNotification', () => {
    it('should successfully delete notification', async () => {
      (notificationDAL.deleteNotification as jest.Mock).mockResolvedValue(true);

      const result = await removeNotification(1);
      
      expect(result.success).toBe(true);
      expect(notificationDAL.deleteNotification).toHaveBeenCalledWith(1);
    });

    it('should throw error when notification not found', async () => {
      (notificationDAL.deleteNotification as jest.Mock).mockResolvedValue(false);

      await expect(removeNotification(999)).rejects.toThrow('Failed to delete notification');
    });

    it('should throw error when DAL fails', async () => {
      (notificationDAL.deleteNotification as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(removeNotification(1)).rejects.toThrow('Failed to delete notification');
    });
  });

  describe('sendVolunteerNotification', () => {
    it('should create notification with valid input', async () => {
      const mockCreatedNotification = {
        id: 10,
        userId: 1,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Test Title',
        message: 'Test Message',
        timestamp: 'Just now',
        isRead: false,
      } as any;

      (notificationDAL.createNotification as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await sendVolunteerNotification(
        1,
        'assignment',
        'Test Title',
        'Test Message'
      );
      
      expect(result.id).toBe(10);
      expect(result.title).toBe('Test Title');
      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          userRole: 'volunteer',
          type: 'assignment',
          title: 'Test Title',
          message: 'Test Message',
        })
      );
    });

    it('should trim whitespace from title and message', async () => {
      (notificationDAL.createNotification as jest.Mock).mockResolvedValue({ id: 1 } as any);

      await sendVolunteerNotification(1, 'assignment', '  Spaced Title  ', '  Spaced Message  ');
      
      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Spaced Title',
          message: 'Spaced Message',
        })
      );
    });

    it('should throw error for empty title', async () => {
      await expect(
        sendVolunteerNotification(1, 'assignment', '', 'Valid Message')
      ).rejects.toThrow('Title is required');
    });

    it('should throw error for whitespace-only title', async () => {
      await expect(
        sendVolunteerNotification(1, 'assignment', '   ', 'Valid Message')
      ).rejects.toThrow('Title is required');
    });

    it('should throw error for empty message', async () => {
      await expect(
        sendVolunteerNotification(1, 'assignment', 'Valid Title', '')
      ).rejects.toThrow('Message is required');
    });

    it('should include event info when provided', async () => {
      const mockCreated = { id: 1 } as any;
      (notificationDAL.createNotification as jest.Mock).mockResolvedValue(mockCreated);

      const eventInfo = {
        name: 'Test Event',
        date: 'March 25, 2024',
        location: 'Test Location',
      };

      await sendVolunteerNotification(1, 'assignment', 'Title', 'Message', eventInfo);
      
      expect(notificationDAL.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          eventInfo,
        })
      );
    });

    it('should throw error when DAL fails', async () => {
      (notificationDAL.createNotification as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        sendVolunteerNotification(1, 'assignment', 'Title', 'Message')
      ).rejects.toThrow('Failed to send notification');
    });
  });
});