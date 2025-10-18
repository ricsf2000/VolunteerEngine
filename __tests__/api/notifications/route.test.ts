import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/notifications/route';
import * as notificationActions from '@/app/lib/services/notificationActions';

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

// Mock the notification actions module
jest.mock('@/app/lib/services/notificationActions');
const mockGetUserNotifications = notificationActions.getUserNotifications as jest.MockedFunction<any>;
const mockToggleNotificationReadStatus = notificationActions.toggleNotificationReadStatus as jest.MockedFunction<any>;
const mockMarkAllUserNotificationsAsRead = notificationActions.markAllUserNotificationsAsRead as jest.MockedFunction<any>;
const mockRemoveNotification = notificationActions.removeNotification as jest.MockedFunction<any>;

// Helper to create mock request
function createMockRequest(url: string, options: { method?: string; body?: any } = {}) {
  return new NextRequest(url, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

describe('/api/notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should return all notifications for the user', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: '2',
          userRole: 'volunteer',
          type: 'assignment',
          title: 'New Event Assignment',
          message: 'You have been assigned to an event',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        {
          id: 2,
          userId: '2',
          userRole: 'volunteer',
          type: 'update',
          title: 'Event Update',
          message: 'Event details have changed',
          timestamp: new Date().toISOString(),
          isRead: true
        }
      ];

      mockGetUserNotifications.mockResolvedValue(mockNotifications);

      const request = createMockRequest('http://localhost:3000/api/notifications');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notifications).toEqual(mockNotifications);
      expect(body.notifications).toHaveLength(2);
      expect(mockGetUserNotifications).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no notifications exist', async () => {
      mockGetUserNotifications.mockResolvedValue([]);

      const request = createMockRequest('http://localhost:3000/api/notifications');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notifications).toEqual([]);
      expect(mockGetUserNotifications).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      mockGetUserNotifications.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('http://localhost:3000/api/notifications');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to fetch notifications');
    });
  });

  describe('PATCH /api/notifications', () => {
    describe('toggle-read action', () => {
      it('should toggle notification read status from false to true', async () => {
        const mockUpdatedNotification = {
          id: 1,
          userId: '2',
          userRole: 'volunteer',
          type: 'assignment',
          title: 'New Event Assignment',
          message: 'You have been assigned to an event',
          timestamp: new Date().toISOString(),
          isRead: true
        };

        mockToggleNotificationReadStatus.mockResolvedValue(mockUpdatedNotification);

        const request = createMockRequest('http://localhost:3000/api/notifications', {
          method: 'PATCH',
          body: {
            action: 'toggle-read',
            notificationId: 1,
            currentStatus: false
          }
        });
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.notification).toEqual(mockUpdatedNotification);
        expect(body.notification.isRead).toBe(true);
        expect(mockToggleNotificationReadStatus).toHaveBeenCalledWith(1, false);
      });

      it('should toggle notification read status from true to false', async () => {
        const mockUpdatedNotification = {
          id: 1,
          userId: '2',
          userRole: 'volunteer',
          type: 'assignment',
          title: 'New Event Assignment',
          message: 'You have been assigned to an event',
          timestamp: new Date().toISOString(),
          isRead: false
        };

        mockToggleNotificationReadStatus.mockResolvedValue(mockUpdatedNotification);

        const request = createMockRequest('http://localhost:3000/api/notifications', {
          method: 'PATCH',
          body: {
            action: 'toggle-read',
            notificationId: 1,
            currentStatus: true
          }
        });
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.notification.isRead).toBe(false);
        expect(mockToggleNotificationReadStatus).toHaveBeenCalledWith(1, true);
      });
    });

    describe('mark-all-read action', () => {
      it('should mark all notifications as read', async () => {
        const mockResult = { success: true, count: 5 };

        mockMarkAllUserNotificationsAsRead.mockResolvedValue(mockResult);

        const request = createMockRequest('http://localhost:3000/api/notifications', {
          method: 'PATCH',
          body: {
            action: 'mark-all-read'
          }
        });
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.count).toBe(5);
        expect(mockMarkAllUserNotificationsAsRead).toHaveBeenCalledTimes(1);
      });

      it('should handle zero notifications marked as read', async () => {
        const mockResult = { success: true, count: 0 };

        mockMarkAllUserNotificationsAsRead.mockResolvedValue(mockResult);

        const request = createMockRequest('http://localhost:3000/api/notifications', {
          method: 'PATCH',
          body: {
            action: 'mark-all-read'
          }
        });
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.count).toBe(0);
      });
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        body: {
          action: 'invalid-action'
        }
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid action');
    });

    it('should handle errors gracefully', async () => {
      mockToggleNotificationReadStatus.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        body: {
          action: 'toggle-read',
          notificationId: 1,
          currentStatus: false
        }
      });
      const response = await PATCH(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to update notification');
    });
  });

  describe('DELETE /api/notifications', () => {
    it('should successfully delete a notification', async () => {
      const mockResult = { success: true };

      mockRemoveNotification.mockResolvedValue(mockResult);

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'DELETE',
        body: {
          notificationId: 1
        }
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(mockRemoveNotification).toHaveBeenCalledWith(1);
    });

    it('should return 400 when notificationId is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'DELETE',
        body: {}
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Notification ID is required');
      expect(mockRemoveNotification).not.toHaveBeenCalled();
    });

    it('should return 400 when notificationId is null', async () => {
      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'DELETE',
        body: {
          notificationId: null
        }
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Notification ID is required');
      expect(mockRemoveNotification).not.toHaveBeenCalled();
    });

    it('should handle deletion failure', async () => {
      const mockResult = { success: false };

      mockRemoveNotification.mockResolvedValue(mockResult);

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'DELETE',
        body: {
          notificationId: 999
        }
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockRemoveNotification.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        method: 'DELETE',
        body: {
          notificationId: 1
        }
      });
      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to delete notification');
    });
  });
});
