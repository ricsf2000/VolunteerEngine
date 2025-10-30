import {
  getHistoryByUserId,
  getHistoryById,
  createVolunteerHistory,
  updateVolunteerHistory,
  VolunteerHistory,
  CreateVolunteerHistoryInput,
  UpdateVolunteerHistoryInput
} from '@/app/lib/dal/volunteerHistory';
import { prisma } from '@/app/lib/db';
import { createEvent } from '@/app/lib/dal/eventDetails';

describe('volunteerHistory DAL', () => {
  let testUserId: string;
  let testEventId: string;
  let testHistoryId: string;

  // Create test user and event before each test
  beforeEach(async () => {
    // Create test user
    const testUser = await prisma.userCredentials.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'test-password',
        role: 'volunteer',
      },
    });
    testUserId = testUser.id;

    // Create test event
    const testEvent = await createEvent({
      eventName: 'Test Event for History',
      description: 'This is a test event for volunteer history testing',
      location: 'Test Location, 123 Test St',
      requiredSkills: ['Testing'],
      urgency: 'medium',
      eventDate: new Date('2025-12-25T10:00:00'),
    });
    testEventId = testEvent.id;

    // Create test volunteer history
    const testHistory = await createVolunteerHistory({
      userId: testUserId,
      eventId: testEventId,
      participantStatus: 'confirmed',
      registrationDate: new Date('2024-12-01'),
    });
    testHistoryId = testHistory.id;
  });

  // Clean up test data after each test
  afterEach(async () => {
    try {
      // Delete in correct order due to foreign keys
      await prisma.volunteerHistory.deleteMany({ where: { userId: testUserId } });
      await prisma.eventDetails.delete({ where: { id: testEventId } }).catch(() => {});
      await prisma.userCredentials.delete({ where: { id: testUserId } }).catch(() => {});
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('getHistoryByUserId', () => {
    it('should return history for existing user', async () => {
      const history = await getHistoryByUserId(testUserId);

      expect(history).toBeTruthy();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].userId).toBe(testUserId);
    });

    it('should return empty array for user with no history', async () => {
      const history = await getHistoryByUserId('00000000-0000-0000-0000-000000000000');

      expect(history).toEqual([]);
    });

    it('should return empty array for empty user ID', async () => {
      const history = await getHistoryByUserId('');

      expect(history).toEqual([]);
    });

    it('should return only history for specified user', async () => {
      const history = await getHistoryByUserId(testUserId);

      history.forEach(record => {
        expect(record.userId).toBe(testUserId);
      });
    });
  });

  describe('getHistoryById', () => {
    it('should return history entry for existing ID', async () => {
      const entry = await getHistoryById(testHistoryId);

      expect(entry).toBeTruthy();
      expect(entry?.id).toBe(testHistoryId);
      expect(entry?.userId).toBe(testUserId);
      expect(entry?.eventId).toBe(testEventId);
    });

    it('should return null for non-existent ID', async () => {
      const entry = await getHistoryById('00000000-0000-0000-0000-000000000000');

      expect(entry).toBeNull();
    });

    it('should return null for empty ID', async () => {
      const entry = await getHistoryById('');

      expect(entry).toBeNull();
    });

    it('should return correct history entry structure', async () => {
      const entry = await getHistoryById(testHistoryId);

      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('eventId');
      expect(entry).toHaveProperty('participantStatus');
      expect(entry).toHaveProperty('registrationDate');
      expect(entry).toHaveProperty('createdAt');
      expect(entry).toHaveProperty('updatedAt');
    });
  });

  describe('createVolunteerHistory', () => {
    it('should create new volunteer history successfully', async () => {
      // Create a new event for this test to avoid unique constraint violation
      const newEvent = await createEvent({
        eventName: 'Another Test Event',
        description: 'Another test event for history testing',
        location: 'Test Location 2',
        requiredSkills: ['Testing'],
        urgency: 'low',
        eventDate: new Date('2025-12-26T10:00:00'),
      });

      const validInput: CreateVolunteerHistoryInput = {
        userId: testUserId,
        eventId: newEvent.id,
        participantStatus: 'pending',
        registrationDate: new Date('2024-12-15'),
      };

      const newHistory = await createVolunteerHistory(validInput);

      expect(newHistory).toBeTruthy();
      expect(newHistory.userId).toBe(validInput.userId);
      expect(newHistory.eventId).toBe(validInput.eventId);
      expect(newHistory.registrationDate).toEqual(validInput.registrationDate);
      expect(newHistory.participantStatus).toBe(validInput.participantStatus);
      expect(newHistory.id).toBeTruthy();
      expect(newHistory.createdAt).toBeInstanceOf(Date);
      expect(newHistory.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign unique UUIDs', async () => {
      // Create two different events to avoid unique constraint
      const event1 = await createEvent({
        eventName: 'UUID Test Event 1',
        description: 'Test event 1',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'medium',
        eventDate: new Date('2025-12-27T10:00:00'),
      });
      const event2 = await createEvent({
        eventName: 'UUID Test Event 2',
        description: 'Test event 2',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'medium',
        eventDate: new Date('2025-12-28T10:00:00'),
      });

      const input1: CreateVolunteerHistoryInput = {
        userId: testUserId,
        eventId: event1.id,
        participantStatus: 'pending',
        registrationDate: new Date('2024-12-15'),
      };
      const input2: CreateVolunteerHistoryInput = {
        userId: testUserId,
        eventId: event2.id,
        participantStatus: 'pending',
        registrationDate: new Date('2024-12-16'),
      };

      const history1 = await createVolunteerHistory(input1);
      const history2 = await createVolunteerHistory(input2);

      expect(history1.id).not.toBe(history2.id);
      expect(history1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(history2.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should create history with different statuses', async () => {
      // Create different events for each status to avoid unique constraint
      const event1 = await createEvent({
        eventName: 'Status Test Event 1',
        description: 'Test event for confirmed status',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'medium',
        eventDate: new Date('2025-12-29T10:00:00'),
      });
      const event2 = await createEvent({
        eventName: 'Status Test Event 2',
        description: 'Test event for cancelled status',
        location: 'Test Location',
        requiredSkills: ['Testing'],
        urgency: 'medium',
        eventDate: new Date('2025-12-30T10:00:00'),
      });

      const completedInput: CreateVolunteerHistoryInput = {
        userId: testUserId,
        eventId: event1.id,
        participantStatus: 'confirmed',
        registrationDate: new Date('2024-12-15'),
      };
      const cancelledInput: CreateVolunteerHistoryInput = {
        userId: testUserId,
        eventId: event2.id,
        participantStatus: 'cancelled',
        registrationDate: new Date('2024-12-16'),
      };

      const completedHistory = await createVolunteerHistory(completedInput);
      const cancelledHistory = await createVolunteerHistory(cancelledInput);

      expect(completedHistory.participantStatus).toBe('confirmed');
      expect(cancelledHistory.participantStatus).toBe('cancelled');
    });
  });

  describe('updateVolunteerHistory', () => {
    it('should update existing history successfully', async () => {
      const updateInput: UpdateVolunteerHistoryInput = {
        participantStatus: 'pending',
      };

      const updatedHistory = await updateVolunteerHistory(testHistoryId, updateInput);

      expect(updatedHistory).toBeTruthy();
      expect(updatedHistory?.participantStatus).toBe(updateInput.participantStatus);
      expect(updatedHistory?.id).toBe(testHistoryId);
      expect(updatedHistory?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent history', async () => {
      const updateInput: UpdateVolunteerHistoryInput = {
        participantStatus: 'confirmed',
      };
      const result = await updateVolunteerHistory('00000000-0000-0000-0000-000000000000', updateInput);

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { participantStatus: 'pending' as const };

      const updatedHistory = await updateVolunteerHistory(testHistoryId, partialUpdate);

      expect(updatedHistory?.participantStatus).toBe('pending');
      expect(updatedHistory?.id).toBe(testHistoryId);
    });

    it('should preserve unchanged fields', async () => {
      const partialUpdate = { participantStatus: 'cancelled' as const };

      const updatedHistory = await updateVolunteerHistory(testHistoryId, partialUpdate);

      expect(updatedHistory?.participantStatus).toBe('cancelled');
      expect(updatedHistory?.userId).toBe(testUserId); // Should remain unchanged
      expect(updatedHistory?.eventId).toBeTruthy(); // Should remain unchanged
    });
  });

  describe('Data Integrity', () => {
    it('should maintain consistent user associations', async () => {
      const userHistory = await getHistoryByUserId(testUserId);

      userHistory.forEach(record => {
        expect(record.userId).toBe(testUserId);
        expect(record.id).toBeTruthy();
        expect(record.eventId).toBeTruthy();
      });
    });

    it('should have valid date formats', async () => {
      const userHistory = await getHistoryByUserId(testUserId);

      userHistory.forEach(record => {
        expect(record.registrationDate).toBeInstanceOf(Date);
        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should have valid participant status', async () => {
      const userHistory = await getHistoryByUserId(testUserId);

      userHistory.forEach(record => {
        expect(['pending', 'confirmed', 'cancelled', 'no_show']).toContain(record.participantStatus);
      });
    });
  });
});