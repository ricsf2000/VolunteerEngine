import { GET, POST, PUT } from '@/app/api/volunteerHistory/route';
import * as volunteerHistoryActions from '@/app/lib/services/volunteerHistoryActions';
import { NextRequest } from 'next/server';

// Mock auth module before importing volunteerHistoryActions
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/app/lib/services/volunteerHistoryActions');

const mockGetHistory = volunteerHistoryActions.getHistory as jest.MockedFunction<any>;
const mockCreateHistoryEntry = volunteerHistoryActions.createHistoryEntry as jest.MockedFunction<any>;
const mockUpdateHistoryStatus = volunteerHistoryActions.updateHistoryStatus as jest.MockedFunction<any>;

describe('/api/volunteerHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/volunteerHistory', () => {
    it('should return user history successfully', async () => {
      const mockHistory = [
        {
          id: '1',
          userId: 'user-123',
          eventId: 'event-1',
          participantStatus: 'confirmed',
          registrationDate: '2024-12-01T00:00:00.000Z',
          createdAt: '2025-10-17T22:59:22.946Z',
          updatedAt: '2025-10-17T22:59:22.946Z'
        },
        {
          id: '2',
          userId: 'user-123',
          eventId: 'event-2',
          participantStatus: 'pending',
          registrationDate: '2024-12-05T00:00:00.000Z',
          createdAt: '2025-10-17T22:59:22.946Z',
          updatedAt: '2025-10-17T22:59:22.946Z'
        }
      ];

      mockGetHistory.mockResolvedValue({ success: true, data: mockHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockHistory);
      expect(mockGetHistory).toHaveBeenCalledWith(undefined);
    });

    it('should return history for specific user when userId provided', async () => {
      const mockHistory = [
        {
          id: '1',
          userId: 'user-123',
          eventId: 'event-1',
          participantStatus: 'confirmed',
          registrationDate: '2024-12-01T00:00:00.000Z',
          createdAt: '2025-10-17T22:59:22.946Z',
          updatedAt: '2025-10-17T22:59:22.946Z'
        }
      ];

      mockGetHistory.mockResolvedValue({ success: true, data: mockHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?userId=user-456');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockHistory);
      expect(mockGetHistory).toHaveBeenCalledWith('user-456');
    });

    it('should return empty array when no history found', async () => {
      mockGetHistory.mockResolvedValue({ success: true, data: [] });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });

    it('should return 401 for unauthenticated users', async () => {
      mockGetHistory.mockResolvedValue({ success: false, error: 'Not authenticated' });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Not authenticated');
    });

    it('should return 400 for authorization errors', async () => {
      mockGetHistory.mockResolvedValue({
        success: false,
        error: 'Unauthorized to view this history'
      });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?userId=other-user');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized to view this history');
    });

    it('should handle service errors with 500 status', async () => {
      mockGetHistory.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to fetch volunteer history');
    });

    it('should return correct content type', async () => {
      mockGetHistory.mockResolvedValue({ success: true, data: [] });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle empty userId query parameter', async () => {
      mockGetHistory.mockResolvedValue({ success: true, data: [] });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?userId=');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetHistory).toHaveBeenCalledWith(undefined);
    });
  });

  describe('POST /api/volunteerHistory', () => {
    const validHistoryData = {
      userId: 'user-123',
      eventId: 'event-456',
      participantStatus: 'pending',
      registrationDate: '2024-12-15'
    };

    it('should create history entry successfully with 201 status', async () => {
      const mockCreatedHistory = {
        id: '3',
        userId: 'user-123',
        eventId: 'event-456',
        participantStatus: 'pending',
        registrationDate: '2024-12-15T00:00:00.000Z',
        createdAt: '2025-10-17T22:59:22.948Z',
        updatedAt: '2025-10-17T22:59:22.948Z'
      };

      mockCreateHistoryEntry.mockResolvedValue({ success: true, data: mockCreatedHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(validHistoryData)
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(mockCreatedHistory);
      expect(mockCreateHistoryEntry).toHaveBeenCalledWith(validHistoryData);
    });

    it('should return validation error with 400 status', async () => {
      mockCreateHistoryEntry.mockResolvedValue({
        success: false,
        error: 'User ID is required'
      });

      const invalidData = { ...validHistoryData, userId: '' };
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('User ID is required');
    });

    it('should handle missing required fields', async () => {
      mockCreateHistoryEntry.mockResolvedValue({
        success: false,
        error: 'Event ID is required'
      });

      const invalidData = { userId: 'user-123', participantStatus: 'pending' };
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event ID is required');
    });

    it('should handle invalid participant status', async () => {
      mockCreateHistoryEntry.mockResolvedValue({
        success: false,
        error: 'Participant status must be pending, confirmed, cancelled, or no-show'
      });

      const invalidData = { ...validHistoryData, participantStatus: 'invalid' };
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Participant status must be pending, confirmed, cancelled, or no-show');
    });

    it('should handle invalid registration date', async () => {
      mockCreateHistoryEntry.mockResolvedValue({
        success: false,
        error: 'Invalid registration date format'
      });

      const invalidData = { ...validHistoryData, registrationDate: 'invalid-date' };
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid registration date format');
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to create history entry');
    });

    it('should handle service errors gracefully', async () => {
      mockCreateHistoryEntry.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(validHistoryData)
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to create history entry');
    });

    it('should return correct content type', async () => {
      const mockCreatedHistory = {
        id: '3',
        userId: 'user-123',
        eventId: 'event-456',
        participantStatus: 'pending',
        registrationDate: '2024-12-15T00:00:00.000Z',
        createdAt: '2025-10-17T22:59:22.948Z',
        updatedAt: '2025-10-17T22:59:22.948Z'
      };

      mockCreateHistoryEntry.mockResolvedValue({ success: true, data: mockCreatedHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(validHistoryData)
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle authorization errors', async () => {
      mockCreateHistoryEntry.mockResolvedValue({
        success: false,
        error: 'Unauthorized to create history for other users'
      });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'POST',
        body: JSON.stringify(validHistoryData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized to create history for other users');
    });
  });

  describe('PUT /api/volunteerHistory', () => {
    it('should update history status successfully', async () => {
      const mockUpdatedHistory = {
        id: '1',
        userId: 'user-123',
        eventId: 'event-456',
        participantStatus: 'confirmed',
        registrationDate: '2024-12-15T00:00:00.000Z',
        createdAt: '2025-10-17T22:59:22.948Z',
        updatedAt: '2025-10-17T22:59:22.948Z'
      };

      mockUpdateHistoryStatus.mockResolvedValue({ success: true, data: mockUpdatedHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockUpdatedHistory);
      expect(mockUpdateHistoryStatus).toHaveBeenCalledWith('1', 'confirmed');
    });

    it('should return 400 when id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('History ID is required in query parameter');
      expect(mockUpdateHistoryStatus).not.toHaveBeenCalled();
    });

    it('should return 400 when status is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({})
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Status is required in request body');
      expect(mockUpdateHistoryStatus).not.toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated users', async () => {
      mockUpdateHistoryStatus.mockResolvedValue({ success: false, error: 'Not authenticated' });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Not authenticated');
    });

    it('should return 404 when history entry not found', async () => {
      mockUpdateHistoryStatus.mockResolvedValue({ success: false, error: 'History entry not found' });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=999', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('History entry not found');
    });

    it('should return 400 for other errors', async () => {
      mockUpdateHistoryStatus.mockResolvedValue({ success: false, error: 'Invalid status value' });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'invalid' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid status value');
    });

    it('should handle service errors with 500 status', async () => {
      mockUpdateHistoryStatus.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to update volunteer history');
    });

    it('should return correct content type', async () => {
      const mockUpdatedHistory = {
        id: '1',
        userId: 'user-123',
        eventId: 'event-456',
        participantStatus: 'confirmed',
        registrationDate: '2024-12-15T00:00:00.000Z',
        createdAt: '2025-10-17T22:59:22.948Z',
        updatedAt: '2025-10-17T22:59:22.948Z'
      };

      mockUpdateHistoryStatus.mockResolvedValue({ success: true, data: mockUpdatedHistory });

      const request = new NextRequest('http://localhost:3000/api/volunteerHistory?id=1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      });

      const response = await PUT(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});
