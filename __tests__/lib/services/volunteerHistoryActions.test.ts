import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
import {
  getHistory,
  getHistoryById,
  createHistoryEntry,
  updateHistoryStatus,
  getAllHistory
} from '@/app/lib/services/volunteerHistoryActions';

// Mock the auth module and DAL (same style as your other tests)
jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/app/lib/dal/volunteerHistory');

const { auth } = require('@/auth');
const mockAuth = auth as jest.MockedFunction<any>;

const mockGetHistoryByUserId = volunteerHistoryDAL.getHistoryByUserId as jest.MockedFunction<any>;
const mockGetHistoryById = volunteerHistoryDAL.getHistoryById as jest.MockedFunction<any>;
const mockGetAllHistory = volunteerHistoryDAL.getAllHistory as jest.MockedFunction<any>;
const mockCreateVolunteerHistory = volunteerHistoryDAL.createVolunteerHistory as jest.MockedFunction<any>;
const mockUpdateVolunteerHistory = volunteerHistoryDAL.updateVolunteerHistory as jest.MockedFunction<any>;

const makeSession = (id = 'user-123', role: 'volunteer' | 'admin' = 'volunteer') => ({ user: { id, role } });
const makeHistoryItem = (overrides: any = {}) => ({
  id: overrides.id ?? '1',
  userId: overrides.userId ?? 'user-123',
  eventId: overrides.eventId ?? 'event-1',
  participantStatus: overrides.participantStatus ?? 'pending',
  registrationDate: overrides.registrationDate ?? new Date('2024-12-15'),
  createdAt: new Date(),
  updatedAt: new Date()
});
const expectNotAuth = (res: any) => expect(res).toEqual({ success: false, error: 'Not authenticated' });

describe('Volunteer History Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- getHistory ----------------
  describe('getHistory', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getHistory();

      expectNotAuth(result);
      expect(mockGetHistoryByUserId).not.toHaveBeenCalled();
    });

    it('should return user history when authenticated', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
      const items = [makeHistoryItem()];
      mockGetHistoryByUserId.mockResolvedValue(items);

      const result = await getHistory();

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(items);
      expect(mockGetHistoryByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should allow admin to view other user history', async () => {
      mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
      const items = [makeHistoryItem({ userId: 'user-456', id: '2' })];
      mockGetHistoryByUserId.mockResolvedValue(items);

      const result = await getHistory('user-456');

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(items);
      expect(mockGetHistoryByUserId).toHaveBeenCalledWith('user-456');
    });

    it('should deny non-admin from viewing other user history', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));

      const result = await getHistory('user-456');

      expect(result).toEqual({ success: false, error: 'Unauthorized to view this history' });
      expect(mockGetHistoryByUserId).not.toHaveBeenCalled();
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockGetHistoryByUserId.mockRejectedValue(new Error('Database error'));

      const result = await getHistory();

      expect(result).toEqual({ success: false, error: 'Failed to fetch volunteer history' });
    });
  });

  // ---------------- getHistoryById ----------------
  describe('getHistoryById', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getHistoryById('123');

      expectNotAuth(result);
    });

    it('should validate empty/whitespace ID', async () => {
      mockAuth.mockResolvedValue(makeSession());

      for (const bad of ['', '   ']) {
        const res = await getHistoryById(bad);
        expect(res).toEqual({ success: false, error: 'History ID is required' });
      }
    });

    it('should return history entry when found', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
      mockGetHistoryById.mockResolvedValue(makeHistoryItem({ id: '1' }));

      const result = await getHistoryById('1');

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.id).toBe('1');
    });

    it('should return error when history entry not found', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockGetHistoryById.mockResolvedValue(null);

      const result = await getHistoryById('999');

      expect(result).toEqual({ success: false, error: 'History entry not found' });
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockGetHistoryById.mockRejectedValue(new Error('Database error'));

      const result = await getHistoryById('1');

      expect(result).toEqual({ success: false, error: 'Failed to fetch history entry' });
    });
  });

  // ---------------- createHistoryEntry ----------------
  describe('createHistoryEntry', () => {
    const validData = {
      userId: 'user-123',
      eventId: 'event-456',
      participantStatus: 'pending',
      registrationDate: '2024-12-15'
    };

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await createHistoryEntry(validData);

      expectNotAuth(result);
      expect(mockCreateVolunteerHistory).not.toHaveBeenCalled();
    });

    it('should allow user to create history for themselves', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
      const created = makeHistoryItem();
      mockCreateVolunteerHistory.mockResolvedValue(created);

      const result = await createHistoryEntry(validData);

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(created);
    });

    it('should allow admin to create history for other users', async () => {
      mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
      const created = makeHistoryItem({ id: '2' });
      mockCreateVolunteerHistory.mockResolvedValue(created);

      const result = await createHistoryEntry(validData);

      expect(result.success).toBe(true);
    });

    it('should deny non-admin from creating history for other users', async () => {
      mockAuth.mockResolvedValue(makeSession('user-999', 'volunteer'));

      const result = await createHistoryEntry(validData);

      expect(result).toEqual({ success: false, error: 'Unauthorized to create history for other users' });
      expect(mockCreateVolunteerHistory).not.toHaveBeenCalled();
    });

    it('should use session userId when userId not provided (self-registration)', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
      const created = makeHistoryItem({ userId: 'user-123' });
      mockCreateVolunteerHistory.mockResolvedValue(created);

      // Omit userId - should use session user's ID
      const dataWithoutUserId = {
        eventId: 'event-456',
        participantStatus: 'pending',
        registrationDate: '2024-12-15'
      };

      const result = await createHistoryEntry(dataWithoutUserId as any);

      expect(result.success).toBe(true);
      expect(mockCreateVolunteerHistory).toHaveBeenCalledWith({
        userId: 'user-123', // Should use session user ID
        eventId: 'event-456',
        participantStatus: 'pending',
        registrationDate: expect.any(Date)
      });
    });

    it.each([
      ['missing eventId', { ...validData, eventId: undefined }, 'Event ID is required'],
      ['missing status', { ...validData, participantStatus: undefined }, 'Participant status is required'],
      ['missing registrationDate', { ...validData, registrationDate: undefined }, 'Registration date is required'],
      ['invalid date', { ...validData, registrationDate: 'invalid-date' }, 'Invalid registration date format']
    ])('%s', async (_label, data, expected) => {
      mockAuth.mockResolvedValue(makeSession());
      const result = await createHistoryEntry(data as any);
      expect(result).toEqual({ success: false, error: expected });
    });

    it('should accept allowed statuses and reject invalid', async () => {
      const allowed = ['pending', 'confirmed', 'cancelled', 'no-show'] as const;
      for (const s of allowed) {
        mockAuth.mockResolvedValue(makeSession());
        mockCreateVolunteerHistory.mockResolvedValue(makeHistoryItem({ participantStatus: s }));
        const r = await createHistoryEntry({ ...validData, participantStatus: s });
        expect(r.success).toBe(true);
      }

      mockAuth.mockResolvedValue(makeSession());
      const bad = await createHistoryEntry({ ...validData, participantStatus: 'x' as any });
      expect(bad).toEqual({
        success: false,
        error: 'Participant status must be pending, confirmed, cancelled, or no-show'
      });
    });

    it('should trim whitespace and pass Date to DAL', async () => {
      mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
      const created = makeHistoryItem();
      mockCreateVolunteerHistory.mockResolvedValue(created);

      const result = await createHistoryEntry({
        userId: '  user-123  ',
        eventId: '  event-456  ',
        participantStatus: 'pending',
        registrationDate: '2024-12-15'
      });

      expect(result.success).toBe(true);
      expect(mockCreateVolunteerHistory).toHaveBeenCalledWith({
        userId: 'user-123',
        eventId: 'event-456',
        participantStatus: 'pending',
        registrationDate: expect.any(Date)
      });
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockCreateVolunteerHistory.mockRejectedValue(new Error('Database error'));

      const result = await createHistoryEntry(validData);

      expect(result).toEqual({ success: false, error: 'Failed to create history entry' });
    });
  });

  // ---------------- updateHistoryStatus ----------------
  describe('updateHistoryStatus', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await updateHistoryStatus('123', 'confirmed');

      expectNotAuth(result);
      expect(mockUpdateVolunteerHistory).not.toHaveBeenCalled();
    });

    it('should validate missing/whitespace history ID', async () => {
      mockAuth.mockResolvedValue(makeSession());

      for (const bad of ['', '   ']) {
        const res = await updateHistoryStatus(bad, 'confirmed');
        expect(res).toEqual({ success: false, error: 'History ID is required' });
      }
    });

    it('should validate status (missing / invalid)', async () => {
      mockAuth.mockResolvedValue(makeSession());

      const missing = await updateHistoryStatus('123', '');
      expect(missing).toEqual({ success: false, error: 'Status is required' });

      const invalid = await updateHistoryStatus('123', 'invalid-status');
      expect(invalid).toEqual({
        success: false,
        error: 'Status must be pending, confirmed, cancelled, or no-show'
      });
    });

    it('should accept allowed statuses and return success', async () => {
      mockAuth.mockResolvedValue(makeSession());
      const allowed = ['pending', 'confirmed', 'cancelled', 'no-show'] as const;

      for (const s of allowed) {
        const updated = makeHistoryItem({ participantStatus: s });
        mockUpdateVolunteerHistory.mockResolvedValue(updated);

        const result = await updateHistoryStatus('123', s);

        expect(result.success).toBe(true);
        if (result.success) expect(result.data.participantStatus).toBe(s);
        expect(mockUpdateVolunteerHistory).toHaveBeenCalledWith('123', { participantStatus: s });
      }
    });

    it('should return error when entry not found', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockUpdateVolunteerHistory.mockResolvedValue(null);

      const result = await updateHistoryStatus('999', 'confirmed');

      expect(result).toEqual({ success: false, error: 'History entry not found' });
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue(makeSession());
      mockUpdateVolunteerHistory.mockRejectedValue(new Error('Database error'));

      const result = await updateHistoryStatus('123', 'confirmed');

      expect(result).toEqual({ success: false, error: 'Failed to update history status' });
    });
  });

  // ---------------- getAllHistory ----------------
  describe('getAllHistory', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getAllHistory();

      expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('should return error when user is not admin', async () => {
      mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));

      const result = await getAllHistory();

      expect(result).toEqual({ success: false, error: 'Unauthorized - Admin access required' });
    });

    it('should return all enriched history for admin', async () => {
      mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
      const allHistory = [makeHistoryItem({ id: '1' }), makeHistoryItem({ id: '2', userId: 'user-456' })];
      mockGetAllHistory.mockResolvedValue(allHistory);

      const result = await getAllHistory();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toEqual(allHistory);
      }
      expect(mockGetAllHistory).toHaveBeenCalled();
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
      mockGetAllHistory.mockRejectedValue(new Error('Database error'));

      const result = await getAllHistory();

      expect(result).toEqual({ success: false, error: 'Failed to fetch volunteer history' });
    });
  });
});