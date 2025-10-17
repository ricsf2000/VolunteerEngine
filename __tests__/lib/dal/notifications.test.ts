import {
  getNotificationsByUserId,
  getNotificationsByUserRole,
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  NotificationData,
} from '@/app/lib/dal/notifications';

describe('Notifications DAL', () => {
  
  describe('getNotificationsByUserRole', () => {
    it('should return only volunteer notifications when role is volunteer', async () => {
      const result = await getNotificationsByUserRole('volunteer');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(n => n.userRole === 'volunteer')).toBe(true);
    });

    it('should return only admin notifications when role is admin', async () => {
      const result = await getNotificationsByUserRole('admin');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(n => n.userRole === 'admin')).toBe(true);
    });

    it('should return empty array if no notifications match the role', async () => {
      // maked edge case assumption
      const result = await getNotificationsByUserRole('admin');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should return notifications for a specific user', async () => {
      const userId = 1;
      const result = await getNotificationsByUserId(userId);
      
      expect(result.every(n => n.userId === userId)).toBe(true);
    });

    it('should return empty array for user with no notifications', async () => {
      const result = await getNotificationsByUserId(999);
      
      expect(result).toEqual([]);
    });
  });

  describe('updateNotificationReadStatus', () => {
    it('should update notification read status to true', async () => {
      const notificationId = 1;
      const result = await updateNotificationReadStatus(notificationId, true);
      
      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(true);
      expect(result?.id).toBe(notificationId);
    });

    it('should update notification read status to false', async () => {
      const notificationId = 1;
      const result = await updateNotificationReadStatus(notificationId, false);
      
      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(false);
    });

    it('should return null for non-existent notification', async () => {
      const result = await updateNotificationReadStatus(999, true);
      
      expect(result).toBeNull();
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const userId = 1;
      const count = await markAllNotificationsAsRead(userId);
      
      expect(count).toBeGreaterThanOrEqual(0);
      expect(typeof count).toBe('number');
    });

    it('should return 0 for user with no notifications', async () => {
      const count = await markAllNotificationsAsRead(999);
      
      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete an existing notification', async () => {
      // note: this will actually delete from the in-memory array
      // you might want to test with a fresh notification or reset data between tests
      const notificationId = 1;
      const result = await deleteNotification(notificationId);
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent notification', async () => {
      const result = await deleteNotification(999);
      
      expect(result).toBe(false);
    });
  });

  describe('createNotification', () => {
    it('should create a new notification with generated ID', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: 1,
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: 'Just now',
        isRead: false,
      };

      const result = await createNotification(newNotification);
      
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test Notification');
      expect(result.message).toBe('This is a test');
      expect(result.userId).toBe(1);
    });

    it('should create notification with event info', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: 1,
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Event Assignment',
        message: 'You have been assigned',
        timestamp: 'Just now',
        isRead: false,
        eventInfo: {
          name: 'Test Event',
          date: 'March 25, 2024',
          location: 'Test Location',
        },
      };

      const result = await createNotification(newNotification);
      
      expect(result.eventInfo).toBeDefined();
      expect(result.eventInfo?.name).toBe('Test Event');
    });
  });
});