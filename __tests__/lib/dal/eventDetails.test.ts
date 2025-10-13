import {
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  EventDetails,
  CreateEventDetailsInput,
  UpdateEventDetailsInput
} from '@/app/lib/dal/eventDetails';

describe('eventDetails DAL', () => {
  describe('getEventById', () => {
    it('should return existing event for valid ID', async () => {
      const event = await getEventById('1');

      expect(event).toBeTruthy();
      expect(event?.id).toBe('1');
      expect(event?.eventName).toBe('Community Food Drive');
    });

    it('should return null for non-existent ID', async () => {
      const event = await getEventById('999');

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
      eventName: 'Test Event',
      description: 'A test event for unit testing',
      location: 'Test Location',
      requiredSkills: ['Testing', 'Quality Assurance'],
      urgency: 'medium',
      eventDate: new Date('2024-12-25')
    };

    it('should create new event successfully', async () => {
      const newEvent = await createEvent(validInput);

      expect(newEvent).toBeTruthy();
      expect(newEvent.eventName).toBe(validInput.eventName);
      expect(newEvent.description).toBe(validInput.description);
      expect(newEvent.location).toBe(validInput.location);
      expect(newEvent.requiredSkills).toEqual(validInput.requiredSkills);
      expect(newEvent.urgency).toBe(validInput.urgency);
      expect(newEvent.eventDate).toBe(validInput.eventDate);
      expect(newEvent.id).toBeTruthy();
      expect(newEvent.createdAt).toBeInstanceOf(Date);
      expect(newEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign incremental IDs', async () => {
      const input1 = { ...validInput, eventName: 'Event 1' };
      const input2 = { ...validInput, eventName: 'Event 2' };

      const event1 = await createEvent(input1);
      const event2 = await createEvent(input2);

      expect(parseInt(event2.id)).toBeGreaterThan(parseInt(event1.id));
    });
  });

  describe('updateEvent', () => {
    const updateInput: UpdateEventDetailsInput = {
      eventName: 'Updated Event Name',
      description: 'Updated description',
      urgency: 'high'
    };

    it('should update existing event successfully', async () => {
      const updatedEvent = await updateEvent('1', updateInput);

      expect(updatedEvent).toBeTruthy();
      expect(updatedEvent?.eventName).toBe(updateInput.eventName);
      expect(updatedEvent?.description).toBe(updateInput.description);
      expect(updatedEvent?.urgency).toBe(updateInput.urgency);
      expect(updatedEvent?.id).toBe('1');
    });

    it('should return null for non-existent event', async () => {
      const result = await updateEvent('999', updateInput);

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { eventName: 'Partially Updated Event' };
      
      const updatedEvent = await updateEvent('1', partialUpdate);

      expect(updatedEvent?.eventName).toBe('Partially Updated Event');
      expect(updatedEvent?.id).toBe('1');
    });
  });
});