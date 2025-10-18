import { GET, POST, PUT, DELETE } from '@/app/api/events/route';
import * as eventActions from '@/app/lib/services/eventActions';
import { NextRequest } from 'next/server';

jest.mock('@/app/lib/services/eventActions');

const mockGetEvents = eventActions.getEvents as jest.MockedFunction<any>;
const mockCreateNewEvent = eventActions.createNewEvent as jest.MockedFunction<any>;
const mockUpdateEventDetails = eventActions.updateEventDetails as jest.MockedFunction<any>;
const mockDeleteEventById = eventActions.deleteEventById as jest.MockedFunction<any>;

describe('/api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return all events successfully', async () => {
      const mockEvents = [
        {
          id: '1',
          eventName: 'Community Food Drive',
          description: 'Help organize and distribute food',
          location: 'Houston Community Center',
          requiredSkills: ['Food Service'],
          urgency: 'high',
          eventDate: '2024-12-15T00:00:00.000Z'
        },
        {
          id: '2',
          eventName: 'Youth Mentoring Workshop',
          description: 'Mentor local youth',
          location: 'Lincoln High School',
          requiredSkills: ['Youth Mentoring'],
          urgency: 'medium',
          eventDate: '2024-12-20T00:00:00.000Z'
        }
      ];

      mockGetEvents.mockResolvedValue({ success: true, data: mockEvents });

      const response = await GET();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockEvents);
      expect(mockGetEvents).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no events found', async () => {
      mockGetEvents.mockResolvedValue({ success: true, data: [] });

      const response = await GET();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });

    it('should handle service errors with 500 status', async () => {
      mockGetEvents.mockResolvedValue({ success: false, error: 'Database error' });

      const response = await GET();

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Database error');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockGetEvents.mockRejectedValue(new Error('Unexpected error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to fetch events');
    });

    it('should return correct content type', async () => {
      mockGetEvents.mockResolvedValue({ success: true, data: [] });

      const response = await GET();

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('POST /api/events', () => {
    const validEventData = {
      eventName: 'New Community Event',
      description: 'A brand new community event for volunteers',
      location: 'Downtown Center, 123 Main St',
      requiredSkills: ['Communication', 'Teamwork'],
      urgency: 'medium',
      eventDate: '2025-12-01T10:00:00'
    };

    it('should create event successfully with 201 status', async () => {
      const mockCreatedEvent = {
        id: '3',
        eventName: 'New Community Event',
        description: 'A brand new community event for volunteers',
        location: 'Downtown Center, 123 Main St',
        requiredSkills: ['Communication', 'Teamwork'],
        urgency: 'medium',
        eventDate: '2025-12-01T10:00:00.000Z',
        createdAt: '2025-10-17T22:53:24.754Z',
        updatedAt: '2025-10-17T22:53:24.754Z'
      };

      mockCreateNewEvent.mockResolvedValue({ success: true, data: mockCreatedEvent });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(validEventData)
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(mockCreatedEvent);
      expect(mockCreateNewEvent).toHaveBeenCalledWith(validEventData);
    });

    it('should return validation error with 400 status', async () => {
      mockCreateNewEvent.mockResolvedValue({
        success: false,
        error: 'Event name is required'
      });

      const invalidData = { ...validEventData, eventName: '' };
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event name is required');
    });

    it('should handle missing required fields', async () => {
      mockCreateNewEvent.mockResolvedValue({
        success: false,
        error: 'Event date is required'
      });

      const invalidData = { eventName: 'Test Event' };
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event date is required');
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to create event');
    });

    it('should handle service errors gracefully', async () => {
      mockCreateNewEvent.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(validEventData)
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to create event');
    });

    it('should return correct content type', async () => {
      const mockCreatedEvent = {
        id: '3',
        ...validEventData,
        createdAt: '2025-10-17T22:53:24.754Z',
        updatedAt: '2025-10-17T22:53:24.754Z'
      };

      mockCreateNewEvent.mockResolvedValue({ success: true, data: mockCreatedEvent });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(validEventData)
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('PUT /api/events', () => {
    const validUpdateData = {
      id: '1',
      eventName: 'Updated Community Event',
      description: 'An updated description for the event',
      location: 'New Location, 456 Oak St',
      requiredSkills: ['Leadership', 'Organization'],
      urgency: 'high',
      eventDate: '2025-12-15T14:00:00'
    };

    it('should update event successfully with 200 status', async () => {
      const mockUpdatedEvent = {
        id: '1',
        eventName: 'Updated Community Event',
        description: 'An updated description for the event',
        location: 'New Location, 456 Oak St',
        requiredSkills: ['Leadership', 'Organization'],
        urgency: 'high',
        eventDate: '2025-12-15T14:00:00.000Z',
        createdAt: '2025-10-17T22:53:24.754Z',
        updatedAt: '2025-10-17T23:15:30.123Z'
      };

      mockUpdateEventDetails.mockResolvedValue({ success: true, data: mockUpdatedEvent });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockUpdatedEvent);
      expect(mockUpdateEventDetails).toHaveBeenCalledWith('1', {
        eventName: 'Updated Community Event',
        description: 'An updated description for the event',
        location: 'New Location, 456 Oak St',
        requiredSkills: ['Leadership', 'Organization'],
        urgency: 'high',
        eventDate: '2025-12-15T14:00:00'
      });
    });

    it('should return 400 when event ID is missing', async () => {
      const { id, ...invalidData } = validUpdateData;

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event ID is required');
      expect(mockUpdateEventDetails).not.toHaveBeenCalled();
    });

    it('should return 400 when event is not found', async () => {
      mockUpdateEventDetails.mockResolvedValue({
        success: false,
        error: 'Event not found'
      });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event not found');
    });

    it('should return validation error with 400 status', async () => {
      mockUpdateEventDetails.mockResolvedValue({
        success: false,
        error: 'Event name must be at least 3 characters'
      });

      const invalidData = { ...validUpdateData, eventName: 'AB' };
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event name must be at least 3 characters');
    });

    it('should handle partial updates (only some fields)', async () => {
      const partialUpdateData = {
        id: '1',
        eventName: 'Partially Updated Event'
      };

      const mockUpdatedEvent = {
        id: '1',
        eventName: 'Partially Updated Event',
        description: 'Original description',
        location: 'Original location',
        requiredSkills: ['Original Skill'],
        urgency: 'medium',
        eventDate: '2025-12-01T10:00:00.000Z',
        createdAt: '2025-10-17T22:53:24.754Z',
        updatedAt: '2025-10-17T23:20:00.000Z'
      };

      mockUpdateEventDetails.mockResolvedValue({ success: true, data: mockUpdatedEvent });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(partialUpdateData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockUpdatedEvent);
      expect(mockUpdateEventDetails).toHaveBeenCalledWith('1', {
        eventName: 'Partially Updated Event'
      });
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: 'invalid json'
      });

      const response = await PUT(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to update event');
    });

    it('should handle service errors gracefully', async () => {
      mockUpdateEventDetails.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to update event');
    });

    it('should return correct content type', async () => {
      const mockUpdatedEvent = {
        ...validUpdateData,
        createdAt: '2025-10-17T22:53:24.754Z',
        updatedAt: '2025-10-17T23:15:30.123Z'
      };

      mockUpdateEventDetails.mockResolvedValue({ success: true, data: mockUpdatedEvent });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('DELETE /api/events', () => {
    it('should delete event successfully with 200 status', async () => {
      mockDeleteEventById.mockResolvedValue({
        success: true,
        message: 'Event deleted successfully'
      });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' })
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe('Event deleted successfully');
      expect(mockDeleteEventById).toHaveBeenCalledWith('1');
    });

    it('should return 400 when event ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: JSON.stringify({})
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event ID is required');
      expect(mockDeleteEventById).not.toHaveBeenCalled();
    });

    it('should return 400 when event is not found', async () => {
      mockDeleteEventById.mockResolvedValue({
        success: false,
        error: 'Event not found'
      });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: JSON.stringify({ id: '999' })
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Event not found');
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: 'invalid json'
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to delete event');
    });

    it('should handle service errors gracefully', async () => {
      mockDeleteEventById.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' })
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to delete event');
    });

    it('should return correct content type', async () => {
      mockDeleteEventById.mockResolvedValue({
        success: true,
        message: 'Event deleted successfully'
      });

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
        body: JSON.stringify({ id: '1' })
      });

      const response = await DELETE(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});
