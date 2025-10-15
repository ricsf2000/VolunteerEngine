import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import {
  getEvents,
  getEvent,
  createNewEvent,
  updateEventDetails,
  deleteEventById
} from '@/app/lib/services/eventActions';

// Mock eventDetails DAL
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

    it('should return error for empty ID', async () => {
      const result = await getEvent('');

      expect(result).toEqual({ success: false, error: 'Event ID is required' });
      expect(mockGetEventById).not.toHaveBeenCalled();
    });

    it('should return error for whitespace ID', async () => {
      const result = await getEvent('   ');

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

    describe('Event Name Validation', () => {
      it('should require event name', async () => {
        const invalidData = { ...validEventData, eventName: '' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event name is required' });
        expect(mockCreateEvent).not.toHaveBeenCalled();
      });

      it('should require event name to not be only whitespace', async () => {
        const invalidData = { ...validEventData, eventName: '   ' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event name is required' });
      });

      it('should reject event name less than 3 characters', async () => {
        const invalidData = { ...validEventData, eventName: 'AB' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event name must be at least 3 characters' });
      });

      it('should reject event name over 100 characters', async () => {
        const invalidData = { ...validEventData, eventName: 'A'.repeat(101) };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event name cannot exceed 100 characters' });
      });

      it('should accept event name with exactly 100 characters', async () => {
        const validData = { ...validEventData, eventName: 'A'.repeat(100) };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('Description Validation', () => {
      it('should require description', async () => {
        const invalidData = { ...validEventData, description: '' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Description is required' });
      });

      it('should require description to not be only whitespace', async () => {
        const invalidData = { ...validEventData, description: '   ' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Description is required' });
      });

      it('should reject description less than 10 characters', async () => {
        const invalidData = { ...validEventData, description: 'Short' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Description must be at least 10 characters' });
      });

      it('should reject description over 1000 characters', async () => {
        const invalidData = { ...validEventData, description: 'A'.repeat(1001) };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Description cannot exceed 1000 characters' });
      });
    });

    describe('Location Validation', () => {
      it('should require location', async () => {
        const invalidData = { ...validEventData, location: '' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Location is required' });
      });

      it('should require location to not be only whitespace', async () => {
        const invalidData = { ...validEventData, location: '   ' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Location is required' });
      });

      it('should reject location less than 5 characters', async () => {
        const invalidData = { ...validEventData, location: 'NYC' };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Location must be at least 5 characters' });
      });

      it('should reject location over 200 characters', async () => {
        const invalidData = { ...validEventData, location: 'A'.repeat(201) };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Location cannot exceed 200 characters' });
      });
    });

    describe('Required Skills Validation', () => {
      it('should require skills to be an array', async () => {
        const invalidData = { ...validEventData, requiredSkills: 'Not an array' as any };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Required skills must be an array' });
      });

      it('should require at least one skill', async () => {
        const invalidData = { ...validEventData, requiredSkills: [] };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'At least one skill is required' });
      });

      it('should reject more than 10 skills', async () => {
        const invalidData = { ...validEventData, requiredSkills: Array(11).fill('Skill') };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Cannot require more than 10 skills' });
      });

      it('should reject empty skill strings', async () => {
        const invalidData = { ...validEventData, requiredSkills: ['Valid Skill', ''] };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'All skills must be non-empty strings' });
      });

      it('should reject whitespace skill strings', async () => {
        const invalidData = { ...validEventData, requiredSkills: ['Valid Skill', '   '] };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'All skills must be non-empty strings' });
      });

      it('should reject non-string skills', async () => {
        const invalidData = { ...validEventData, requiredSkills: ['Valid Skill', 123 as any] };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'All skills must be non-empty strings' });
      });
    });

    describe('Urgency Validation', () => {
      it('should require urgency', async () => {
        const invalidData = { ...validEventData, urgency: '' as any };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Urgency is required' });
      });

      it('should reject invalid urgency value', async () => {
        const invalidData = { ...validEventData, urgency: 'super-urgent' as any };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Urgency must be low, medium, high, or urgent' });
      });

      it('should accept "low" urgency', async () => {
        const validData = { ...validEventData, urgency: 'low' };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });

      it('should accept "medium" urgency', async () => {
        const validData = { ...validEventData, urgency: 'medium' };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });

      it('should accept "high" urgency', async () => {
        const validData = { ...validEventData, urgency: 'high' };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });

      it('should accept "urgent" urgency', async () => {
        const validData = { ...validEventData, urgency: 'urgent' };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('Event Date Validation', () => {
      it('should require event date', async () => {
        const invalidData = { ...validEventData, eventDate: null as any };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event date is required' });
      });

      it('should reject invalid date format', async () => {
        const invalidData = { ...validEventData, eventDate: 'invalid-date' as any };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Invalid event date format' });
      });

      it('should reject past dates', async () => {
        const invalidData = { ...validEventData, eventDate: new Date('2020-01-01') };

        const result = await createNewEvent(invalidData);

        expect(result).toEqual({ success: false, error: 'Event date must be in the future' });
      });

      it('should accept future dates', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const validData = { ...validEventData, eventDate: futureDate };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validData, createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });

      it('should accept date as string and convert it', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const validData = { ...validEventData, eventDate: futureDate.toISOString() as any };
        mockCreateEvent.mockResolvedValue({ id: '1', ...validEventData, eventDate: new Date(validData.eventDate), createdAt: new Date(), updatedAt: new Date() });

        const result = await createNewEvent(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('Success Case', () => {
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
    });

    describe('Error Handling', () => {
      it('should handle DAL errors gracefully', async () => {
        mockCreateEvent.mockRejectedValue(new Error('Database error'));

        const result = await createNewEvent(validEventData);

        expect(result).toEqual({ success: false, error: 'Database error' });
      });

      it('should handle errors without message property', async () => {
        mockCreateEvent.mockRejectedValue('String error');

        const result = await createNewEvent(validEventData);

        expect(result).toEqual({ success: false, error: 'Failed to create event' });
      });
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

    it('should validate event name if provided', async () => {
      const result = await updateEventDetails('1', { eventName: 'AB' });

      expect(result).toEqual({ success: false, error: 'Event name must be at least 3 characters' });
    });

    it('should validate description if provided', async () => {
      const result = await updateEventDetails('1', { description: 'Short' });

      expect(result).toEqual({ success: false, error: 'Description must be at least 10 characters' });
    });

    it('should validate location if provided', async () => {
      const result = await updateEventDetails('1', { location: 'NYC' });

      expect(result).toEqual({ success: false, error: 'Location must be at least 5 characters' });
    });

    it('should validate urgency if provided', async () => {
      const result = await updateEventDetails('1', { urgency: 'invalid' });

      expect(result).toEqual({ success: false, error: 'Urgency must be low, medium, high, or urgent' });
    });

    it('should validate event date if provided', async () => {
      const result = await updateEventDetails('1', { eventDate: new Date('2020-01-01') });

      expect(result).toEqual({ success: false, error: 'Event date must be in the future' });
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
      const mockEvent = { id: '1', eventName: 'Test Event' };
      mockGetEventById.mockResolvedValue(mockEvent);
      mockDeleteEvent.mockResolvedValue(true);

      const result = await deleteEventById('1');

      expect(result).toEqual({ success: true, message: 'Event deleted successfully' });
      expect(mockDeleteEvent).toHaveBeenCalledWith('1');
    });

    it('should handle delete failure', async () => {
      const mockEvent = { id: '1', eventName: 'Test Event' };
      mockGetEventById.mockResolvedValue(mockEvent);
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
