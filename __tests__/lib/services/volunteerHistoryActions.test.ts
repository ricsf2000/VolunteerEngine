import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
import {
  getHistory,
  getHistoryById,
  createHistoryEntry,
  updateHistoryStatus,
  getAllHistory
} from '@/app/lib/services/volunteerHistoryActions';

// Mock the auth module and DAL
jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/app/lib/dal/volunteerHistory');

const { auth } = require('@/auth');
const mockAuth = auth as jest.MockedFunction<any>;

const mockGetHistoryByUserId = volunteerHistoryDAL.getHistoryByUserId as jest.MockedFunction<any>;
const mockCreateVolunteerHistory = volunteerHistoryDAL.createVolunteerHistory as jest.MockedFunction<any>;
const mockUpdateVolunteerHistory = volunteerHistoryDAL.updateVolunteerHistory as jest.MockedFunction<any>;

const makeSession = (id = 'user-123', role = 'volunteer') => ({ user: { id, role } });
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

describe('Volunteer History Actions (refactored)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getHistory', () => {
    test('not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      expectNotAuth(await getHistory());
      expect(mockGetHistoryByUserId).not.toHaveBeenCalled();
    });

    test('user can get own history; admin can get others; non-admin denied', async () => {
      import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
      import {
        getHistory,
        getHistoryById,
        createHistoryEntry,
        updateHistoryStatus,
        getAllHistory
      } from '@/app/lib/services/volunteerHistoryActions';

      // Mock the auth module and DAL
      jest.mock('@/auth', () => ({ auth: jest.fn() }));
      jest.mock('@/app/lib/dal/volunteerHistory');

      const { auth } = require('@/auth');
      const mockAuth = auth as jest.MockedFunction<any>;

      const mockGetHistoryByUserId = volunteerHistoryDAL.getHistoryByUserId as jest.MockedFunction<any>;
      const mockCreateVolunteerHistory = volunteerHistoryDAL.createVolunteerHistory as jest.MockedFunction<any>;
      const mockUpdateVolunteerHistory = volunteerHistoryDAL.updateVolunteerHistory as jest.MockedFunction<any>;

      const makeSession = (id = 'user-123', role = 'volunteer') => ({ user: { id, role } });
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

      describe('Volunteer History Actions (refactored)', () => {
        beforeEach(() => jest.clearAllMocks());

        describe('getHistory', () => {
          test('not authenticated', async () => {
            mockAuth.mockResolvedValue(null);
            expectNotAuth(await getHistory());
            expect(mockGetHistoryByUserId).not.toHaveBeenCalled();
          });

          test('user can get own history; admin can get others; non-admin denied', async () => {
            // user own history
            mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
            const items = [makeHistoryItem()];
            mockGetHistoryByUserId.mockResolvedValue(items);
            const r1 = await getHistory();
            expect(r1.success).toBe(true);

            // admin viewing other user
            mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
            mockGetHistoryByUserId.mockResolvedValue([makeHistoryItem({ userId: 'user-456', id: '2' })]);
            const r2 = await getHistory('user-456');
            expect(r2.success).toBe(true);
            expect(mockGetHistoryByUserId).toHaveBeenCalledWith('user-456');

            // non-admin trying to view other
            mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
            const r3 = await getHistory('user-456');
            expect(r3).toEqual({ success: false, error: 'Unauthorized to view this history' });
          });

          test('DAL error handled', async () => {
            mockAuth.mockResolvedValue(makeSession());
            mockGetHistoryByUserId.mockRejectedValue(new Error('DB'));
            const r = await getHistory();
            expect(r).toEqual({ success: false, error: 'Failed to fetch volunteer history' });
          });
        });

        describe('getHistoryById', () => {
          test('auth and id validation', async () => {
            mockAuth.mockResolvedValue(null);
            expectNotAuth(await getHistoryById('1'));

            mockAuth.mockResolvedValue(makeSession());
            for (const bad of ['', '   ']) {
              const r = await getHistoryById(bad);
              expect(r).toEqual({ success: false, error: 'History ID is required' });
            }
          });

          test('found, not found and DAL error', async () => {
            mockAuth.mockResolvedValue(makeSession());
            mockGetHistoryByUserId.mockResolvedValue([makeHistoryItem({ id: '1' })]);
            const ok = await getHistoryById('1');
            expect(ok.success).toBe(true);
            if (ok.success) expect(ok.data.id).toBe('1');

            mockGetHistoryByUserId.mockResolvedValue([]);
            const notFound = await getHistoryById('999');
            expect(notFound).toEqual({ success: false, error: 'History entry not found' });

            mockGetHistoryByUserId.mockRejectedValue(new Error('boom'));
            const err = await getHistoryById('1');
            expect(err).toEqual({ success: false, error: 'Failed to fetch history entry' });
          });
        });

        describe('createHistoryEntry', () => {
          const validData = { userId: 'user-123', eventId: 'event-456', participantStatus: 'pending', registrationDate: '2024-12-15' };

          test('auth and authorization', async () => {
            mockAuth.mockResolvedValue(null);
            expectNotAuth(await createHistoryEntry(validData));

            mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
            mockCreateVolunteerHistory.mockResolvedValue(makeHistoryItem());
            const own = await createHistoryEntry(validData);
            expect(own.success).toBe(true);

            mockAuth.mockResolvedValue(makeSession('user-999', 'volunteer'));
            const other = await createHistoryEntry(validData);
            expect(other).toEqual({ success: false, error: 'Unauthorized to create history for other users' });

            mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
            mockCreateVolunteerHistory.mockResolvedValue(makeHistoryItem({ id: '2' }));
            const admin = await createHistoryEntry(validData);
            expect(admin.success).toBe(true);
          });

          test.each([
            ['userId', { ...validData, userId: undefined }, 'User ID is required'],
            ['userId empty', { ...validData, userId: '' }, 'User ID is required'],
            ['eventId missing', { ...validData, eventId: undefined }, 'Event ID is required'],
            ['status missing', { ...validData, participantStatus: undefined }, 'Participant status is required'],
            ['regDate missing', { ...validData, registrationDate: undefined }, 'Registration date is required'],
            ['invalid date', { ...validData, registrationDate: 'not-a-date' }, 'Invalid registration date format']
          ])('%s validation -> %s', async (_, data, expected) => {
            mockAuth.mockResolvedValue(makeSession('user-123', 'volunteer'));
            const res = await createHistoryEntry(data as any);
            expect(res).toEqual({ success: false, error: expected });
          });

          test('participant status allowed values and rejection', async () => {
            const allowed = ['pending', 'confirmed', 'cancelled', 'no-show'];
            for (const s of allowed) {
              mockAuth.mockResolvedValue(makeSession());
              mockCreateVolunteerHistory.mockResolvedValue(makeHistoryItem({ participantStatus: s }));
              const r = await createHistoryEntry({ ...validData, participantStatus: s });
              expect(r.success).toBe(true);
            }

            mockAuth.mockResolvedValue(makeSession());
            const bad = await createHistoryEntry({ ...validData, participantStatus: 'x' as any });
            expect(bad).toEqual({ success: false, error: 'Participant status must be pending, confirmed, cancelled, or no-show' });
          });

          test('success case trims and passes Date', async () => {
            mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
            const created = makeHistoryItem();
            mockCreateVolunteerHistory.mockResolvedValue(created);

            const r = await createHistoryEntry({ userId: '  user-123 ', eventId: ' event-456 ', participantStatus: 'pending', registrationDate: '2024-12-15' });
            expect(r.success).toBe(true);
            if (r.success) expect(r.data).toEqual(created);
            expect(mockCreateVolunteerHistory).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-123', eventId: 'event-456', registrationDate: expect.any(Date) }));
          });

          test('DAL error handled', async () => {
            mockAuth.mockResolvedValue(makeSession());
            mockCreateVolunteerHistory.mockRejectedValue(new Error('DB'));
            const r = await createHistoryEntry(validData as any);
            expect(r).toEqual({ success: false, error: 'Failed to create history entry' });
          });
        });

        describe('updateHistoryStatus', () => {
          test('auth and id validation', async () => {
            mockAuth.mockResolvedValue(null);
            expectNotAuth(await updateHistoryStatus('1', 'confirmed'));

            mockAuth.mockResolvedValue(makeSession());
            for (const bad of ['', '   ']) {
              const r = await updateHistoryStatus(bad, 'confirmed');
              expect(r).toEqual({ success: false, error: 'History ID is required' });
            }
          });

          test('status validation and success/not-found/error', async () => {
            mockAuth.mockResolvedValue(makeSession());
            const invalid = await updateHistoryStatus('1', 'x' as any);
            expect(invalid).toEqual({ success: false, error: 'Status must be pending, confirmed, cancelled, or no-show' });

            const allowed = ['pending', 'confirmed', 'cancelled', 'no-show'];
            for (const s of allowed) {
              mockUpdateVolunteerHistory.mockResolvedValue(makeHistoryItem({ participantStatus: s }));
              const r = await updateHistoryStatus('123', s as any);
              expect(r.success).toBe(true);
            }

            mockUpdateVolunteerHistory.mockResolvedValue(null);
            const notFound = await updateHistoryStatus('999', 'confirmed');
            expect(notFound).toEqual({ success: false, error: 'History entry not found' });

            mockUpdateVolunteerHistory.mockRejectedValue(new Error('boom'));
            const err = await updateHistoryStatus('123', 'confirmed');
            expect(err).toEqual({ success: false, error: 'Failed to update history status' });
          });
        });

        describe('getAllHistory', () => {
          test('auth & permissions', async () => {
            mockAuth.mockResolvedValue(null);
            expectNotAuth(await getAllHistory());

            mockAuth.mockResolvedValue(makeSession('user-1', 'volunteer'));
            const notAdmin = await getAllHistory();
            expect(notAdmin).toEqual({ success: false, error: 'Unauthorized - Admin access required' });

            mockAuth.mockResolvedValue(makeSession('admin-1', 'admin'));
            const ok = await getAllHistory();
            expect(ok.success).toBe(true);
            if (ok.success) expect(Array.isArray(ok.data)).toBe(true);
          });
        });
      });
        const mockCreated = {
          id: '1',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'no-show' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCreateVolunteerHistory.mockResolvedValue(mockCreated);

        const result = await createHistoryEntry({ ...validData, participantStatus: 'no-show' });

        expect(result.success).toBe(true);
      });

      it('should reject invalid status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const invalidData = { ...validData, participantStatus: 'invalid-status' };

        const result = await createHistoryEntry(invalidData);

        expect(result).toEqual({ success: false, error: 'Participant status must be pending, confirmed, cancelled, or no-show' });
      });

      it('should reject empty status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const invalidData = { ...validData, participantStatus: '' };

        const result = await createHistoryEntry(invalidData);

        expect(result).toEqual({ success: false, error: 'Participant status is required' });
      });
    });

    describe('Registration Date Validation', () => {
      it('should reject missing registrationDate', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const invalidData = { ...validData, registrationDate: undefined };

        const result = await createHistoryEntry(invalidData);

        expect(result).toEqual({ success: false, error: 'Registration date is required' });
      });

      it('should reject invalid date format', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const invalidData = { ...validData, registrationDate: 'invalid-date' };

        const result = await createHistoryEntry(invalidData);

        expect(result).toEqual({ success: false, error: 'Invalid registration date format' });
      });

      it('should accept valid ISO date string', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockCreated = {
          id: '1',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCreateVolunteerHistory.mockResolvedValue(mockCreated);

        const result = await createHistoryEntry({ ...validData, registrationDate: '2024-12-15T10:00:00Z' });

        expect(result.success).toBe(true);
      });

      it('should accept Date object', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockCreated = {
          id: '1',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCreateVolunteerHistory.mockResolvedValue(mockCreated);

        const result = await createHistoryEntry({ ...validData, registrationDate: new Date('2024-12-15') });

        expect(result.success).toBe(true);
      });
    });

    describe('Success Case', () => {
      it('should create history entry with all valid data', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockCreated = {
          id: '1',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCreateVolunteerHistory.mockResolvedValue(mockCreated);

        const result = await createHistoryEntry(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(mockCreated);
        }
        expect(mockCreateVolunteerHistory).toHaveBeenCalledWith({
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending',
          registrationDate: expect.any(Date)
        });
      });

      it('should trim whitespace from IDs', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'admin' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockCreated = {
          id: '1',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCreateVolunteerHistory.mockResolvedValue(mockCreated);

        const dataWithWhitespace = {
          userId: '  user-123  ',
          eventId: '  event-456  ',
          participantStatus: 'pending',
          registrationDate: '2024-12-15'
        };

        const result = await createHistoryEntry(dataWithWhitespace);

        expect(result.success).toBe(true);
        expect(mockCreateVolunteerHistory).toHaveBeenCalledWith({
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending',
          registrationDate: expect.any(Date)
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle DAL errors gracefully', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);
        mockCreateVolunteerHistory.mockRejectedValue(new Error('Database error'));

        const result = await createHistoryEntry(validData);

        expect(result).toEqual({ success: false, error: 'Failed to create history entry' });
      });
    });
  });

  describe('updateHistoryStatus', () => {
    describe('Authentication', () => {
      it('should return error when not authenticated', async () => {
        mockAuth.mockResolvedValue(null);

        const result = await updateHistoryStatus('123', 'confirmed');

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
        expect(mockUpdateVolunteerHistory).not.toHaveBeenCalled();
      });
    });

    describe('History ID Validation', () => {
      it('should reject missing history ID', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const result = await updateHistoryStatus('', 'confirmed');

        expect(result).toEqual({ success: false, error: 'History ID is required' });
      });

      it('should reject whitespace history ID', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const result = await updateHistoryStatus('   ', 'confirmed');

        expect(result).toEqual({ success: false, error: 'History ID is required' });
      });
    });

    describe('Status Validation', () => {
      it('should reject missing status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const result = await updateHistoryStatus('123', '');

        expect(result).toEqual({ success: false, error: 'Status is required' });
      });

      it('should reject invalid status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const result = await updateHistoryStatus('123', 'invalid-status');

        expect(result).toEqual({ success: false, error: 'Status must be pending, confirmed, cancelled, or no-show' });
      });

      it('should accept "pending" status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockUpdated = {
          id: '123',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'pending' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockUpdateVolunteerHistory.mockResolvedValue(mockUpdated);

        const result = await updateHistoryStatus('123', 'pending');

        expect(result.success).toBe(true);
      });

      it('should accept "confirmed" status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockUpdated = {
          id: '123',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'confirmed' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockUpdateVolunteerHistory.mockResolvedValue(mockUpdated);

        const result = await updateHistoryStatus('123', 'confirmed');

        expect(result.success).toBe(true);
      });

      it('should accept "cancelled" status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockUpdated = {
          id: '123',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'cancelled' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockUpdateVolunteerHistory.mockResolvedValue(mockUpdated);

        const result = await updateHistoryStatus('123', 'cancelled');

        expect(result.success).toBe(true);
      });

      it('should accept "no-show" status', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockUpdated = {
          id: '123',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'no-show' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockUpdateVolunteerHistory.mockResolvedValue(mockUpdated);

        const result = await updateHistoryStatus('123', 'no-show');

        expect(result.success).toBe(true);
      });
    });

    describe('Success Case', () => {
      it('should update history status successfully', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);

        const mockUpdated = {
          id: '123',
          userId: 'user-123',
          eventId: 'event-456',
          participantStatus: 'confirmed' as const,
          registrationDate: new Date('2024-12-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockUpdateVolunteerHistory.mockResolvedValue(mockUpdated);

        const result = await updateHistoryStatus('123', 'confirmed');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(mockUpdated);
        }
        expect(mockUpdateVolunteerHistory).toHaveBeenCalledWith('123', {
          participantStatus: 'confirmed'
        });
      });
    });

    describe('Not Found Case', () => {
      it('should return error when history entry not found', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);
        mockUpdateVolunteerHistory.mockResolvedValue(null);

        const result = await updateHistoryStatus('999', 'confirmed');

        expect(result).toEqual({ success: false, error: 'History entry not found' });
      });
    });

    describe('Error Handling', () => {
      it('should handle DAL errors gracefully', async () => {
        const mockSession = {
          user: { id: 'user-123', role: 'volunteer' }
        };
        mockAuth.mockResolvedValue(mockSession as any);
        mockUpdateVolunteerHistory.mockRejectedValue(new Error('Database error'));

        const result = await updateHistoryStatus('123', 'confirmed');

        expect(result).toEqual({ success: false, error: 'Failed to update history status' });
      });
    });
  });

  describe('getAllHistory', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getAllHistory();

      expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('should return error when user is not admin', async () => {
      const mockSession = {
        user: { id: 'user-123', role: 'volunteer' }
      };
      mockAuth.mockResolvedValue(mockSession as any);

      const result = await getAllHistory();

      expect(result).toEqual({ success: false, error: 'Unauthorized - Admin access required' });
    });

    it('should return all enriched history for admin', async () => {
      const mockSession = {
        user: { id: 'admin-1', role: 'admin' }
      };
      mockAuth.mockResolvedValue(mockSession as any);

      const result = await getAllHistory();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });
});
