import {
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  EventDetails,
  CreateEventDetailsInput,
  UpdateEventDetailsInput
} from '@/app/lib/dal/eventDetails';

describe('eventDetails DAL', () => {
  let testEventId: string;

  // Create a test event before each test
  beforeEach(async () => {
    const testEvent = await createEvent({
      eventName: 'Test Event for DAL',
      description: 'This is a test event created for testing purposes',
      location: 'Test Location, 123 Test St',
      requiredSkills: ['Testing'],
      urgency: 'medium',
      eventDate: new Date('2025-12-25T10:00:00')
    });
    testEventId = testEvent.id;
  });

  // Clean up test event after each test
  afterEach(async () => {
    if (testEventId) {
      try {
        await deleteEvent(testEventId);
      } catch (error) {
        // Event may have already been deleted by the test (e.g., in deleteEvent tests)
        // This is fine, just continue
      }
    }
  });

  describe('getEventById', () => {
    it('should return existing event for valid ID', async () => {
      const event = await getEventById(testEventId);

      expect(event).toBeTruthy();
      expect(event?.id).toBe(testEventId);
      expect(event?.eventName).toBe('Test Event for DAL');
    });

    it('should return null for non-existent ID', async () => {
      const event = await getEventById('00000000-0000-0000-0000-000000000000');

      expect(event).toBeNull();
    });

    it('should return null for empty ID', async () => {
      const event = await getEventById('');

      expect(event).toBeNull();
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const events = await getAllEvents();

      expect(events).toBeTruthy();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should return events with correct structure', async () => {
      const events = await getAllEvents();

      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('eventName');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('location');
        expect(event).toHaveProperty('requiredSkills');
        expect(event).toHaveProperty('urgency');
        expect(event).toHaveProperty('eventDate');
      });
    });
  });

  describe('createEvent', () => {
    const validInput: CreateEventDetailsInput = {
      eventName: 'New Test Event',
      description: 'A test event for unit testing',
      location: 'Test Location',
      requiredSkills: ['Testing', 'Quality Assurance'],
      urgency: 'medium',
      eventDate: new Date('2025-12-25T10:00:00')
    };

    it('should create new event successfully', async () => {
      const newEvent = await createEvent(validInput);

      expect(newEvent).toBeTruthy();
      expect(newEvent.eventName).toBe(validInput.eventName);
      expect(newEvent.description).toBe(validInput.description);
      expect(newEvent.location).toBe(validInput.location);
      expect(newEvent.requiredSkills).toEqual(validInput.requiredSkills);
      expect(newEvent.urgency).toBe(validInput.urgency);
      expect(newEvent.eventDate).toEqual(validInput.eventDate);
      expect(newEvent.id).toBeTruthy();
      expect(newEvent.createdAt).toBeInstanceOf(Date);
      expect(newEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign unique UUIDs', async () => {
      const input1 = { ...validInput, eventName: 'Event 1' };
      const input2 = { ...validInput, eventName: 'Event 2' };

      const event1 = await createEvent(input1);
      const event2 = await createEvent(input2);

      expect(event1.id).not.toBe(event2.id);
      expect(event1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(event2.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('updateEvent', () => {
    const updateInput: UpdateEventDetailsInput = {
      eventName: 'Updated Event Name',
      description: 'Updated description for testing',
      urgency: 'high'
    };

    it('should update existing event successfully', async () => {
      const updatedEvent = await updateEvent(testEventId, updateInput);

      expect(updatedEvent).toBeTruthy();
      expect(updatedEvent?.eventName).toBe(updateInput.eventName);
      expect(updatedEvent?.description).toBe(updateInput.description);
      expect(updatedEvent?.urgency).toBe(updateInput.urgency);
      expect(updatedEvent?.id).toBe(testEventId);
    });

    it('should return null for non-existent event', async () => {
      const result = await updateEvent('00000000-0000-0000-0000-000000000000', updateInput);

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { eventName: 'Partially Updated Event' };

      const updatedEvent = await updateEvent(testEventId, partialUpdate);

      expect(updatedEvent?.eventName).toBe('Partially Updated Event');
      expect(updatedEvent?.id).toBe(testEventId);
    });
  });

  describe('deleteEvent', () => {
    it('should delete existing event successfully', async () => {
      // First verify the event exists
      const eventBefore = await getEventById(testEventId);
      expect(eventBefore).toBeTruthy();

      // Delete the event
      const result = await deleteEvent(testEventId);
      expect(result).toBe(true);

      // Verify it's deleted
      const eventAfter = await getEventById(testEventId);
      expect(eventAfter).toBeNull();
    });

    it('should return false for non-existent event', async () => {
      const result = await deleteEvent('00000000-0000-0000-0000-000000000000');

      expect(result).toBe(false);
    });

    it('should return false for empty ID', async () => {
      const result = await deleteEvent('');

      expect(result).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should return null when getEventById encounters database error', async () => {
      const spy = jest.spyOn(require('@/app/lib/db').prisma.eventDetails, 'findUnique')
        .mockRejectedValueOnce(new Error('Database error'));
      
      const result = await getEventById('test-id');
      
      expect(result).toBeNull();
      spy.mockRestore();
    });

    it('should return empty array when getAllEvents encounters database error', async () => {
      const spy = jest.spyOn(require('@/app/lib/db').prisma.eventDetails, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));
      
      const result = await getAllEvents();
      
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    it('should throw error when createEvent encounters database error', async () => {
      const spy = jest.spyOn(require('@/app/lib/db').prisma.eventDetails, 'create')
        .mockRejectedValueOnce(new Error('Database error'));
      
      await expect(createEvent({
        eventName: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'medium',
        eventDate: new Date('2025-12-25T10:00:00')
      })).rejects.toThrow('Database error');
      
      spy.mockRestore();
    });
  });
});