import {
  getNotificationsByUserId,
  getNotificationsByUserRole,
  updateNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  NotificationData,
} from '@/app/lib/dal/notifications';
import { prisma } from '@/app/lib/db';

// Mock Prisma client
jest.mock('@/app/lib/db', () => ({
  prisma: {
    notificationData: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Notifications DAL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationsByUserRole', () => {
    it('should return only volunteer notifications when role is volunteer', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'assignment',
          title: 'Test',
          message: 'Test message',
          timestamp: '2024-03-25T09:00:00Z',
          isRead: false,
          userId: '1',
          userRole: 'volunteer',
          eventInfo: null,
          volunteerInfo: null,
          matchStats: null,
        },
        {
          id: 2,
          type: 'reminder',
          title: 'Test 2',
          message: 'Test message 2',
          timestamp: '2024-03-25T10:00:00Z',
          isRead: false,
          userId: '2',
          userRole: 'volunteer',
          eventInfo: null,
          volunteerInfo: null,
          matchStats: null,
        },
      ];

      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getNotificationsByUserRole('volunteer');

      expect(prisma.notificationData.findMany).toHaveBeenCalledWith({
        where: { userRole: 'volunteer' },
        orderBy: { timestamp: 'desc' },
      });
      expect(result.length).toBe(2);
      expect(result.every(n => n.userRole === 'volunteer')).toBe(true);
    });

    it('should return only admin notifications when role is admin', async () => {
      const mockNotifications = [
        {
          id: 3,
          type: 'matching_complete',
          title: 'Admin notification',
          message: 'Test admin message',
          timestamp: '2024-03-25T11:00:00Z',
          isRead: false,
          userId: '1',
          userRole: 'admin',
          eventInfo: null,
          volunteerInfo: null,
          matchStats: null,
        },
      ];

      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getNotificationsByUserRole('admin');

      expect(prisma.notificationData.findMany).toHaveBeenCalledWith({
        where: { userRole: 'admin' },
        orderBy: { timestamp: 'desc' },
      });
      expect(result.length).toBe(1);
      expect(result.every(n => n.userRole === 'admin')).toBe(true);
    });

    it('should return empty array if no notifications match the role', async () => {
      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getNotificationsByUserRole('admin');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array on error', async () => {
      (prisma.notificationData.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getNotificationsByUserRole('volunteer');

      expect(result).toEqual([]);
    });

    it('should handle notifications with eventInfo, volunteerInfo, and matchStats', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'matching_complete',
          title: 'Test',
          message: 'Test message',
          timestamp: '2024-03-25T09:00:00Z',
          isRead: false,
          userId: '1',
          userRole: 'admin',
          eventInfo: {
            eventName: 'Test Event',
            eventDate: new Date('2024-03-25'),
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
        },
      ];

      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getNotificationsByUserRole('admin');

      expect(result.length).toBe(1);
      expect(result[0].eventInfo).toBeDefined();
      expect(result[0].volunteerInfo).toBeDefined();
      expect(result[0].matchStats).toBeDefined();
      expect(result[0].eventInfo?.eventName).toBe('Test Event');
      expect(result[0].volunteerInfo?.fullName).toBe('John Doe');
      expect(result[0].matchStats?.volunteersMatched).toBe(5);
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should return notifications for a specific user', async () => {
      const userId = '2';
      const mockNotifications = [
        {
          id: 1,
          type: 'assignment',
          title: 'Test',
          message: 'Test message',
          timestamp: '2024-03-25T09:00:00Z',
          isRead: false,
          userId: '2',
          userRole: 'volunteer',
          eventInfo: null,
          volunteerInfo: null,
          matchStats: null,
        },
      ];

      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getNotificationsByUserId(userId);

      expect(prisma.notificationData.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      expect(result.every(n => n.userId === userId)).toBe(true);
    });

    it('should return empty array for user with no notifications', async () => {
      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getNotificationsByUserId('999');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (prisma.notificationData.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getNotificationsByUserId('999');

      expect(result).toEqual([]);
    });

    it('should handle notifications with all optional fields', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'volunteer_application',
          title: 'Test',
          message: 'Test message',
          timestamp: '2024-03-25T09:00:00Z',
          isRead: false,
          userId: '2',
          userRole: 'admin',
          eventInfo: {
            eventName: 'Test Event',
            eventDate: new Date('2024-03-25'),
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
        },
      ];

      (prisma.notificationData.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getNotificationsByUserId('2');

      expect(result[0].eventInfo).toBeDefined();
      expect(result[0].volunteerInfo).toBeDefined();
      expect(result[0].matchStats).toBeDefined();
    });
  });

  describe('updateNotificationReadStatus', () => {
    it('should update notification read status to true', async () => {
      const notificationId = 1;
      const mockNotification = {
        id: 1,
        type: 'assignment',
        title: 'Test',
        message: 'Test message',
        timestamp: '2024-03-25T09:00:00Z',
        isRead: true,
        userId: '2',
        userRole: 'volunteer',
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      };

      (prisma.notificationData.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await updateNotificationReadStatus(notificationId, true);

      expect(prisma.notificationData.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });
      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(true);
      expect(result?.id).toBe(notificationId);
    });

    it('should update notification read status to false', async () => {
      const notificationId = 1;
      const mockNotification = {
        id: 1,
        type: 'assignment',
        title: 'Test',
        message: 'Test message',
        timestamp: '2024-03-25T09:00:00Z',
        isRead: false,
        userId: '2',
        userRole: 'volunteer',
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      };

      (prisma.notificationData.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await updateNotificationReadStatus(notificationId, false);

      expect(prisma.notificationData.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: false },
      });
      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(false);
    });

    it('should return null for non-existent notification', async () => {
      (prisma.notificationData.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await updateNotificationReadStatus(999, true);

      expect(result).toBeNull();
    });

    it('should handle updating notification with all optional fields', async () => {
      const notificationId = 1;
      const mockNotification = {
        id: 1,
        type: 'assignment',
        title: 'Test',
        message: 'Test message',
        timestamp: '2024-03-25T09:00:00Z',
        isRead: true,
        userId: '2',
        userRole: 'volunteer',
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25'),
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

      (prisma.notificationData.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await updateNotificationReadStatus(notificationId, true);

      expect(result?.eventInfo).toBeDefined();
      expect(result?.volunteerInfo).toBeDefined();
      expect(result?.matchStats).toBeDefined();
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const userId = '2';
      const mockResult = { count: 3 };

      (prisma.notificationData.updateMany as jest.Mock).mockResolvedValue(mockResult);

      const count = await markAllNotificationsAsRead(userId);

      expect(prisma.notificationData.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { isRead: true },
      });
      expect(count).toBe(3);
      expect(typeof count).toBe('number');
    });

    it('should return 0 for user with no notifications', async () => {
      const mockResult = { count: 0 };

      (prisma.notificationData.updateMany as jest.Mock).mockResolvedValue(mockResult);

      const count = await markAllNotificationsAsRead('999');

      expect(count).toBe(0);
    });

    it('should return 0 on error', async () => {
      (prisma.notificationData.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const count = await markAllNotificationsAsRead('999');

      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete an existing notification', async () => {
      const notificationId = 1;

      (prisma.notificationData.delete as jest.Mock).mockResolvedValue({
        id: notificationId,
      });

      const result = await deleteNotification(notificationId);

      expect(prisma.notificationData.delete).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(result).toBe(true);
    });

    it('should return false for non-existent notification', async () => {
      (prisma.notificationData.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await deleteNotification(999);

      expect(result).toBe(false);
    });
  });

  describe('createNotification', () => {
    it('should create a new notification with generated ID', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '2',
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: 'Just now',
        isRead: false,
      };

      const mockCreatedNotification = {
        id: 1,
        type: 'reminder',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: 'Just now',
        isRead: false,
        userId: '2',
        userRole: 'volunteer',
        eventInfo: null,
        volunteerInfo: null,
        matchStats: null,
      };

      (prisma.notificationData.create as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await createNotification(newNotification);

      expect(prisma.notificationData.create).toHaveBeenCalledWith({
        data: {
          type: 'reminder',
          title: 'Test Notification',
          message: 'This is a test',
          timestamp: 'Just now',
          isRead: false,
          userId: '2',
          userRole: 'volunteer',
          eventInfo: undefined,
          volunteerInfo: undefined,
          matchStats: undefined,
        },
      });
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test Notification');
      expect(result.message).toBe('This is a test');
      expect(result.userId).toBe('2');
    });

    it('should create notification with event info', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '2',
        userRole: 'volunteer',
        type: 'assignment',
        title: 'Event Assignment',
        message: 'You have been assigned',
        timestamp: 'Just now',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25T09:00:00'),
          location: 'Test Location',
          requiredSkills: ['Food Service'],
          urgency: 'high',
        },
      };

      const mockCreatedNotification = {
        id: 2,
        type: 'assignment',
        title: 'Event Assignment',
        message: 'You have been assigned',
        timestamp: 'Just now',
        isRead: false,
        userId: '2',
        userRole: 'volunteer',
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25T09:00:00'),
          location: 'Test Location',
          requiredSkills: ['Food Service'],
          urgency: 'high',
        },
        volunteerInfo: null,
        matchStats: null,
      };

      (prisma.notificationData.create as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await createNotification(newNotification);

      expect(result.eventInfo).toBeDefined();
      expect(result.eventInfo?.eventName).toBe('Test Event');
    });

    it('should create notification with volunteerInfo', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '1',
        userRole: 'admin',
        type: 'volunteer_application',
        title: 'New Volunteer',
        message: 'A volunteer has applied',
        timestamp: 'Just now',
        isRead: false,
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
      };

      const mockCreatedNotification = {
        id: 3,
        type: 'volunteer_application',
        title: 'New Volunteer',
        message: 'A volunteer has applied',
        timestamp: 'Just now',
        isRead: false,
        userId: '1',
        userRole: 'admin',
        eventInfo: null,
        volunteerInfo: {
          fullName: 'John Doe',
          skills: ['Skill1'],
          availability: ['2024-03-25'],
        },
        matchStats: null,
      };

      (prisma.notificationData.create as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await createNotification(newNotification);

      expect(result.volunteerInfo).toBeDefined();
      expect(result.volunteerInfo?.fullName).toBe('John Doe');
    });

    it('should create notification with matchStats', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '1',
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Matching Complete',
        message: 'Volunteers have been matched',
        timestamp: 'Just now',
        isRead: false,
        matchStats: {
          volunteersMatched: 10,
          eventsCount: 5,
          efficiency: '92%',
        },
      };

      const mockCreatedNotification = {
        id: 4,
        type: 'matching_complete',
        title: 'Matching Complete',
        message: 'Volunteers have been matched',
        timestamp: 'Just now',
        isRead: false,
        userId: '1',
        userRole: 'admin',
        eventInfo: null,
        volunteerInfo: null,
        matchStats: {
          volunteersMatched: 10,
          eventsCount: 5,
          efficiency: '92%',
        },
      };

      (prisma.notificationData.create as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await createNotification(newNotification);

      expect(result.matchStats).toBeDefined();
      expect(result.matchStats?.volunteersMatched).toBe(10);
    });

    it('should create notification with all optional fields', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '1',
        userRole: 'admin',
        type: 'matching_complete',
        title: 'Complete Notification',
        message: 'All fields present',
        timestamp: 'Just now',
        isRead: false,
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25'),
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

      const mockCreatedNotification = {
        id: 5,
        type: 'matching_complete',
        title: 'Complete Notification',
        message: 'All fields present',
        timestamp: 'Just now',
        isRead: false,
        userId: '1',
        userRole: 'admin',
        eventInfo: {
          eventName: 'Test Event',
          eventDate: new Date('2024-03-25'),
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

      (prisma.notificationData.create as jest.Mock).mockResolvedValue(mockCreatedNotification);

      const result = await createNotification(newNotification);

      expect(result.eventInfo).toBeDefined();
      expect(result.volunteerInfo).toBeDefined();
      expect(result.matchStats).toBeDefined();
      expect(result.eventInfo?.eventName).toBe('Test Event');
      expect(result.volunteerInfo?.fullName).toBe('John Doe');
      expect(result.matchStats?.volunteersMatched).toBe(5);
    });

    it('should throw error when database creation fails', async () => {
      const newNotification: Omit<NotificationData, 'id'> = {
        userId: '2',
        userRole: 'volunteer',
        type: 'reminder',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: 'Just now',
        isRead: false,
      };

      (prisma.notificationData.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(createNotification(newNotification)).rejects.toThrow('Failed to create notification');
    });
  });
});