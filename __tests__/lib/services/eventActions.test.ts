import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import {
  getEvents,
  getEvent,
  createNewEvent,
  updateEventDetails,
  deleteEventById
} from '@/app/lib/services/eventActions';

jest.mock('@/app/lib/dal/eventDetails', () => ({
  getAllEvents: jest.fn(),
  getEventById: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn()
}));

const mockGetAllEvents = eventDetailsDAL.getAllEvents as jest.MockedFunction<any>;
const mockGetEventById = eventDetailsDAL.getEventById as jest.MockedFunction<any>;
const mockCreateEvent = eventDetailsDAL.createEvent as jest.MockedFunction<any>;
const mockUpdateEvent = eventDetailsDAL.updateEvent as jest.MockedFunction<any>;
const mockDeleteEvent = eventDetailsDAL.deleteEvent as jest.MockedFunction<any>;

describe('Event Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return all events successfully', async () => {
      const mockEvents = [
        { id: '1', eventName: 'Event 1', description: 'Description 1', location: 'Location 1', requiredSkills: ['Skill 1'], urgency: 'medium', eventDate: new Date() },
        { id: '2', eventName: 'Event 2', description: 'Description 2', location: 'Location 2', requiredSkills: ['Skill 2'], urgency: 'high', eventDate: new Date() }
      ];
      mockGetAllEvents.mockResolvedValue(mockEvents);

      const result = await getEvents();

      expect(result).toEqual({ success: true, data: mockEvents });
      expect(mockGetAllEvents).toHaveBeenCalled();
    });

    it('should handle DAL errors gracefully', async () => {
      mockGetAllEvents.mockRejectedValue(new Error('Database error'));
      const result = await getEvents();
      expect(result).toEqual({ success: false, error: 'Failed to fetch events' });
    });
  });

  describe('getEvent', () => {
    const mockEvent = {
      id: '1',
      eventName: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      urgency: 'medium',
      eventDate: new Date()
    };

    it('should return event for valid ID', async () => {
      mockGetEventById.mockResolvedValue(mockEvent);
      const result = await getEvent('1');
      expect(result).toEqual({ success: true, data: mockEvent });
      expect(mockGetEventById).toHaveBeenCalledWith('1');
    });

    it.each(['', '   '])('should return error for invalid ID: "%s"', async (id) => {
      const result = await getEvent(id);
      expect(result).toEqual({ success: false, error: 'Event ID is required' });
      expect(mockGetEventById).not.toHaveBeenCalled();
    });

    it('should return error when event not found', async () => {
      mockGetEventById.mockResolvedValue(null);
      const result = await getEvent('999');
      expect(result).toEqual({ success: false, error: 'Event not found' });
    });

    it('should handle DAL errors gracefully', async () => {
      mockGetEventById.mockRejectedValue(new Error('Database error'));
      const result = await getEvent('1');
      expect(result).toEqual({ success: false, error: 'Failed to fetch event' });
    });
  });

  describe('createNewEvent', () => {
    const validEventData = {
      eventName: 'Community Cleanup',
      description: 'Help clean up the community park and surrounding areas',
      location: 'Central Park, 123 Main St',
      requiredSkills: ['Physical Labor', 'Teamwork'],
      urgency: 'medium',
      eventDate: new Date('2025-12-01T10:00:00')
    };

    describe('Validation', () => {
      it.each([
        ['empty eventName', { ...validEventData, eventName: '' }, 'Event name is required'],
        ['whitespace eventName', { ...validEventData, eventName: '   ' }, 'Event name is required'],
        ['short eventName', { ...validEventData, eventName: 'AB' }, 'Event name must be at least 3 characters'],
        ['long eventName', { ...validEventData, eventName: 'A'.repeat(101) }, 'Event name cannot exceed 100 characters'],
        ['empty description', { ...validEventData, description: '' }, 'Description is required'],
        ['whitespace description', { ...validEventData, description: '   ' }, 'Description is required'],
        ['short description', { ...validEventData, description: 'Short' }, 'Description must be at least 10 characters'],
        ['long description', { ...validEventData, description: 'A'.repeat(1001) }, 'Description cannot exceed 1000 characters'],
        ['empty location', { ...validEventData, location: '' }, 'Location is required'],
        ['whitespace location', { ...validEventData, location: '   ' }, 'Location is required'],
        ['short location', { ...validEventData, location: 'NYC' }, 'Location must be at least 5 characters'],
        ['long location', { ...validEventData, location: 'A'.repeat(201) }, 'Location cannot exceed 200 characters'],
        ['skills not array', { ...validEventData, requiredSkills: 'Not an array' as any }, 'Required skills must be an array'],
        ['no skills', { ...validEventData, requiredSkills: [] }, 'At least one skill is required'],
        ['too many skills', { ...validEventData, requiredSkills: Array(11).fill('Skill') }, 'Cannot require more than 10 skills'],
        ['empty skill', { ...validEventData, requiredSkills: ['Valid', ''] }, 'All skills must be non-empty strings'],
        ['whitespace skill', { ...validEventData, requiredSkills: ['Valid', '   '] }, 'All skills must be non-empty strings'],
        ['non-string skill', { ...validEventData, requiredSkills: ['Valid', 123 as any] }, 'All skills must be non-empty strings'],
        ['empty urgency', { ...validEventData, urgency: '' as any }, 'Urgency is required'],
        ['invalid urgency', { ...validEventData, urgency: 'super-urgent' as any }, 'Urgency must be low, medium, high, or urgent'],
        ['null eventDate', { ...validEventData, eventDate: null as any }, 'Event date is required'],
        ['invalid date format', { ...validEventData, eventDate: 'invalid-date' as any }, 'Invalid event date format'],
        ['past date', { ...validEventData, eventDate: new Date('2020-01-01') }, 'Event date must be in the future']
      ])('%s should fail validation', async (_label, data, expectedError) => {
        const result = await createNewEvent(data);
        expect(result).toEqual({ success: false, error: expectedError });
        expect(mockCreateEvent).not.toHaveBeenCalled();
      });

      it('should accept valid urgency values', async () => {
        const urgencies = ['low', 'medium', 'high', 'urgent'];
        for (const urgency of urgencies) {
          const validData = { ...validEventData, urgency };
          mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });
          const result = await createNewEvent(validData);
          expect(result.success).toBe(true);
        }
      });

      it('should accept boundary values', async () => {
        const boundaryData = { ...validEventData, eventName: 'A'.repeat(100) };
        mockCreateEvent.mockResolvedValue({ id: '1', ...boundaryData, createdAt: new Date(), updatedAt: new Date() });
        const result = await createNewEvent(boundaryData);
        expect(result.success).toBe(true);
      });
    });

    it('should create event with valid data', async () => {
      const mockCreatedEvent = {
        id: '1',
        ...validEventData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCreateEvent.mockResolvedValue(mockCreatedEvent);

      const result = await createNewEvent(validEventData);

      expect(result).toEqual({ success: true, data: mockCreatedEvent });
      expect(mockCreateEvent).toHaveBeenCalledWith({
        eventName: validEventData.eventName.trim(),
        description: validEventData.description.trim(),
        location: validEventData.location.trim(),
        requiredSkills: validEventData.requiredSkills.map(s => s.trim()),
        urgency: validEventData.urgency,
        eventDate: validEventData.eventDate
      });
    });

    it('should trim whitespace from fields', async () => {
      const dataWithWhitespace = {
        ...validEventData,
        eventName: '  Test Event  ',
        description: '  Test Description  ',
        location: '  Test Location  ',
        requiredSkills: ['  Skill 1  ', '  Skill 2  ']
      };
      mockCreateEvent.mockResolvedValue({ id: '1', ...validEventData, createdAt: new Date(), updatedAt: new Date() });

      await createNewEvent(dataWithWhitespace);

      expect(mockCreateEvent).toHaveBeenCalledWith({
        eventName: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['Skill 1', 'Skill 2'],
        urgency: validEventData.urgency,
        eventDate: validEventData.eventDate
      });
    });

    it('should accept future date as string and convert it', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const validData = { ...validEventData, eventDate: futureDate.toISOString() as any };
      mockCreateEvent.mockResolvedValue({ id: '1', ...validEventData, eventDate: new Date(validData.eventDate), createdAt: new Date(), updatedAt: new Date() });

      const result = await createNewEvent(validData);
      expect(result.success).toBe(true);
    });

    it.each([
      ['with message', new Error('Database error'), 'Database error'],
      ['without message', 'String error', 'Failed to create event']
    ])('should handle DAL errors %s', async (_label, error, expectedError) => {
      mockCreateEvent.mockRejectedValue(error);
      const result = await createNewEvent(validEventData);
      expect(result).toEqual({ success: false, error: expectedError });
    });
  });

  describe('updateEventDetails', () => {
    const existingEvent = {
      id: '1',
      eventName: 'Old Event',
      description: 'Old Description',
      location: 'Old Location',
      requiredSkills: ['Old Skill'],
      urgency: 'low',
      eventDate: new Date('2025-12-01')
    };

    beforeEach(() => {
      mockGetEventById.mockResolvedValue(existingEvent);
    });

    it('should require event ID', async () => {
      const result = await updateEventDetails('', {});
      expect(result).toEqual({ success: false, error: 'Event ID is required' });
      expect(mockGetEventById).not.toHaveBeenCalled();
    });

    it('should return error when event not found', async () => {
      mockGetEventById.mockResolvedValue(null);
      const result = await updateEventDetails('999', { eventName: 'New Name' });
      expect(result).toEqual({ success: false, error: 'Event not found' });
    });

    it('should update event with valid data', async () => {
      const updateData = { eventName: 'Updated Event', urgency: 'high' };
      const updatedEvent = { ...existingEvent, ...updateData };
      mockUpdateEvent.mockResolvedValue(updatedEvent);

      const result = await updateEventDetails('1', updateData);

      expect(result).toEqual({ success: true, data: updatedEvent });
      expect(mockUpdateEvent).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const updateData = { eventName: 'Only Name Updated' };
      mockUpdateEvent.mockResolvedValue({ ...existingEvent, ...updateData });

      const result = await updateEventDetails('1', updateData);
      expect(result.success).toBe(true);
    });

    it.each([
      ['eventName', { eventName: 'AB' }, 'Event name must be at least 3 characters'],
      ['description', { description: 'Short' }, 'Description must be at least 10 characters'],
      ['location', { location: 'NYC' }, 'Location must be at least 5 characters'],
      ['urgency', { urgency: 'invalid' }, 'Urgency must be low, medium, high, or urgent'],
      ['eventDate', { eventDate: new Date('2020-01-01') }, 'Event date must be in the future']
    ])('should validate %s if provided', async (_field, updateData, expectedError) => {
      const result = await updateEventDetails('1', updateData);
      expect(result).toEqual({ success: false, error: expectedError });
    });

    it('should handle DAL errors gracefully', async () => {
      mockUpdateEvent.mockRejectedValue(new Error('Update failed'));
      const result = await updateEventDetails('1', { eventName: 'Valid Event Name' });
      expect(result).toEqual({ success: false, error: 'Update failed' });
    });
  });

  describe('deleteEventById', () => {
    it('should require event ID', async () => {
      const result = await deleteEventById('');
      expect(result).toEqual({ success: false, error: 'Event ID is required' });
      expect(mockGetEventById).not.toHaveBeenCalled();
    });

    it('should return error when event not found', async () => {
      mockGetEventById.mockResolvedValue(null);
      const result = await deleteEventById('999');
      expect(result).toEqual({ success: false, error: 'Event not found' });
      expect(mockDeleteEvent).not.toHaveBeenCalled();
    });

    it('should delete event successfully', async () => {
      mockGetEventById.mockResolvedValue({ id: '1', eventName: 'Test Event' });
      mockDeleteEvent.mockResolvedValue(true);

      const result = await deleteEventById('1');

      expect(result).toEqual({ success: true, message: 'Event deleted successfully' });
      expect(mockDeleteEvent).toHaveBeenCalledWith('1');
    });

    it('should handle delete failure', async () => {
      mockGetEventById.mockResolvedValue({ id: '1', eventName: 'Test Event' });
      mockDeleteEvent.mockResolvedValue(false);

      const result = await deleteEventById('1');
      expect(result).toEqual({ success: false, error: 'Failed to delete event' });
    });

    it('should handle DAL errors gracefully', async () => {
      mockGetEventById.mockResolvedValue({ id: '1' });
      mockDeleteEvent.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteEventById('1');
      expect(result).toEqual({ success: false, error: 'Delete failed' });
    });
  });
});
