import { getMatchesForEvent } from '@/app/lib/services/matchingService';

jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/app/lib/dal/eventDetails', () => ({
  getEventById: jest.fn(),
}));
jest.mock('@/app/lib/dal/userProfile', () => ({
  getAllUserProfiles: jest.fn(),
}));
jest.mock('@/app/lib/dal/volunteerHistory', () => ({
  getHistoryByUserId: jest.fn(),
}));

const { auth } = jest.requireMock('@/auth');
const { getEventById } = jest.requireMock('@/app/lib/dal/eventDetails');
const { getAllUserProfiles } = jest.requireMock('@/app/lib/dal/userProfile');
const { getHistoryByUserId } = jest.requireMock('@/app/lib/dal/volunteerHistory');

describe('matchingService.getMatchesForEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);
    const res = await getMatchesForEvent('1');
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid eventId', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    const res1 = await getMatchesForEvent('');
    const res2 = await getMatchesForEvent('   ');
    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
  });

  it('returns 404 when event not found', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    getEventById.mockResolvedValue(null);
    const res = await getMatchesForEvent('999');
    expect(res.status).toBe(404);
  });

  it('returns 200 with sorted matches and reasons', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    const event = {
      id: '1',
      eventName: 'Food Drive',
      description: '',
      location: 'Houston, TX 77002',
      requiredSkills: ['A', 'B'],
      urgency: 'high',
      eventDate: new Date('2024-12-15T09:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    getEventById.mockResolvedValue(event);

    // volunteers
    const v1 = { userId: 'v1', id: 'p1', fullName: 'Alpha', address1: '', address2: '', city: 'Houston', state: 'TX', zipCode: '77002', skills: ['A', 'B'], preferences: '', availability: ['2024-12-15'], createdAt: new Date(), updatedAt: new Date() };
    const v2 = { userId: 'v2', id: 'p2', fullName: 'Beta',  address1: '', address2: '', city: 'Austin',  state: 'TX', zipCode: '73301', skills: ['A'],      preferences: '', availability: ['2024-12-15'], createdAt: new Date(), updatedAt: new Date() };
    const v3 = { userId: 'v3', id: 'p3', fullName: 'Gamma', address1: '', address2: '', city: 'Dallas',  state: 'TX', zipCode: '75001', skills: [],         preferences: '', availability: [],               createdAt: new Date(), updatedAt: new Date() };

    getAllUserProfiles.mockResolvedValue([v1, v2, v3]);
    getHistoryByUserId.mockResolvedValue([]);

    const res = await getMatchesForEvent('1');
    expect(res.status).toBe(200);
    const matches = (res as any).matches as Array<{ volunteer: any; score: number; reasons: string[] }>;
    expect(matches.length).toBeGreaterThanOrEqual(2);
    // v1 should be top: 2 skills(10) + availability(3) + zip(2) = 15
    expect(matches[0].volunteer.userId).toBe('v1');
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
    const reasons = matches[0].reasons.join(' | ');
    expect(reasons).toMatch(/Skills overlap/);
    expect(reasons).toMatch(/Available on event date/);
    expect(reasons).toMatch(/Exact ZIP match|Same state/);
  });
});

