import {
  getHistoryByUserId,
  getHistoryById,
  createVolunteerHistory,
  updateVolunteerHistory,
  VolunteerHistory,
  CreateVolunteerHistoryInput,
  UpdateVolunteerHistoryInput
} from '@/app/lib/dal/volunteerHistory';

describe('volunteerHistory DAL', () => {
  describe('getHistoryByUserId', () => {
    it('should return history for existing user', async () => {
      const history = await getHistoryByUserId('2');

      expect(history).toBeTruthy();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].userId).toBe('2');
    });

    it('should return empty array for user with no history', async () => {
      const history = await getHistoryByUserId('999');

      expect(history).toEqual([]);
    });

    it('should return empty array for empty user ID', async () => {
      const history = await getHistoryByUserId('');

      expect(history).toEqual([]);
    });

    it('should return only history for specified user', async () => {
      const history = await getHistoryByUserId('2');

      history.forEach(record => {
        expect(record.userId).toBe('2');
      });
    });
  });

  describe('getHistoryById', () => {
    it('should return history entry for existing ID', async () => {
      const entry = await getHistoryById('1');

      expect(entry).toBeTruthy();
      expect(entry?.id).toBe('1');
      expect(entry?.userId).toBe('2');
      expect(entry?.eventId).toBe('1');
    });

    it('should return null for non-existent ID', async () => {
      const entry = await getHistoryById('999');

      expect(entry).toBeNull();
    });

    it('should return null for empty ID', async () => {
      const entry = await getHistoryById('');

      expect(entry).toBeNull();
    });

    it('should return correct history entry structure', async () => {
      const entry = await getHistoryById('1');

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
    const validInput: CreateVolunteerHistoryInput = {
      userId: 'test-user-123',
      eventId: 'test-event-456',
      participantStatus: 'confirmed',
      registrationDate: new Date('2024-12-15')
    };

    it('should create new volunteer history successfully', async () => {
      const newHistory = await createVolunteerHistory(validInput);

      expect(newHistory).toBeTruthy();
      expect(newHistory.userId).toBe(validInput.userId);
      expect(newHistory.eventId).toBe(validInput.eventId);
      expect(newHistory.registrationDate).toBe(validInput.registrationDate);
      expect(newHistory.participantStatus).toBe(validInput.participantStatus);
      expect(newHistory.id).toBeTruthy();
      expect(newHistory.createdAt).toBeInstanceOf(Date);
      expect(newHistory.updatedAt).toBeInstanceOf(Date);
    });

    it('should assign incremental IDs', async () => {
      const input1 = { ...validInput, userId: 'user-1' };
      const input2 = { ...validInput, userId: 'user-2' };

      const history1 = await createVolunteerHistory(input1);
      const history2 = await createVolunteerHistory(input2);

      expect(parseInt(history2.id)).toBeGreaterThan(parseInt(history1.id));
    });

    it('should create history with different statuses', async () => {
      const completedInput = { ...validInput, participantStatus: 'confirmed' as const };
      const cancelledInput = { ...validInput, participantStatus: 'cancelled' as const, userId: 'user-cancelled' };

      const completedHistory = await createVolunteerHistory(completedInput);
      const cancelledHistory = await createVolunteerHistory(cancelledInput);

      expect(completedHistory.participantStatus).toBe('confirmed');
      expect(cancelledHistory.participantStatus).toBe('cancelled');
    });
  });

  describe('updateVolunteerHistory', () => {
    const updateInput: UpdateVolunteerHistoryInput = {
      participantStatus: 'confirmed'
    };

    it('should update existing history successfully', async () => {
      const updatedHistory = await updateVolunteerHistory('1', updateInput);

      expect(updatedHistory).toBeTruthy();
      expect(updatedHistory?.participantStatus).toBe(updateInput.participantStatus);
      expect(updatedHistory?.id).toBe('1');
      expect(updatedHistory?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent history', async () => {
      const result = await updateVolunteerHistory('999', updateInput);

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { participantStatus: 'pending' as const };
      
      const updatedHistory = await updateVolunteerHistory('1', partialUpdate);

      expect(updatedHistory?.participantStatus).toBe('pending');
      expect(updatedHistory?.id).toBe('1');
    });

    it('should preserve unchanged fields', async () => {
      const partialUpdate = { participantStatus: 'cancelled' as const };
      
      const updatedHistory = await updateVolunteerHistory('1', partialUpdate);

      expect(updatedHistory?.participantStatus).toBe('cancelled');
      expect(updatedHistory?.userId).toBe('2'); // Should remain unchanged
      expect(updatedHistory?.eventId).toBeTruthy(); // Should remain unchanged
    });
  });

  describe('Data Integrity', () => {
    it('should maintain consistent user associations', async () => {
      const userHistory = await getHistoryByUserId('2');
      
      userHistory.forEach(record => {
        expect(record.userId).toBe('2');
        expect(record.id).toBeTruthy();
        expect(record.eventId).toBeTruthy();
      });
    });

    it('should have valid date formats', async () => {
      const userHistory = await getHistoryByUserId('2');
      
      userHistory.forEach(record => {
        expect(record.registrationDate).toBeInstanceOf(Date);
        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should have valid participant status', async () => {
      const userHistory = await getHistoryByUserId('2');
      
      userHistory.forEach(record => {
        expect(['pending', 'confirmed', 'cancelled', 'no-show']).toContain(record.participantStatus);
      });
    });
  });
});