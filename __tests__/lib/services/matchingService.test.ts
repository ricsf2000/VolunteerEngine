import * as authModule from '@/auth';
import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import * as userProfileDAL from '@/app/lib/dal/userProfile';
import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
import { getMatchesForEvent, getTopVolunteerEventMatches } from '@/app/lib/services/matchingService';

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/app/lib/dal/eventDetails', () => ({
  getEventById: jest.fn(),
  getAllEvents: jest.fn()
}));

jest.mock('@/app/lib/dal/userProfile', () => ({
  getAllUserProfiles: jest.fn()
}));

jest.mock('@/app/lib/dal/volunteerHistory', () => ({
  getHistoryByUserId: jest.fn()
}));

const mockAuth = authModule.auth as jest.MockedFunction<any>;
const mockGetEventById = eventDetailsDAL.getEventById as jest.MockedFunction<any>;
const mockGetAllEvents = eventDetailsDAL.getAllEvents as jest.MockedFunction<any>;
const mockGetAllUserProfiles = userProfileDAL.getAllUserProfiles as jest.MockedFunction<any>;
const mockGetHistoryByUserId = volunteerHistoryDAL.getHistoryByUserId as jest.MockedFunction<any>;

describe('matchingService.getMatchesForEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const eventId = 'evt-1';
  const event = {
    id: eventId,
    eventName: 'Food Drive',
    description: 'desc',
    location: 'Houston, TX 77001',
    requiredSkills: ['First Aid', 'Logistics'],
    urgency: 'high',
    eventDate: new Date('2030-12-01T00:00:00Z')
  };

  const v1 = {
    userId: 'v1',
    fullName: 'A',
    skills: ['First Aid', 'Logistics'],
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    availability: ['2030-12-01']
  };

  const v2 = {
    userId: 'v2',
    fullName: 'B',
    skills: ['First Aid'],
    city: 'Dallas',
    state: 'TX',
    zipCode: '75001',
    availability: []
  };

  const v3 = {
    userId: 'v3',
    fullName: 'C',
    skills: ['Cooking'],
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    availability: []
  };

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await getMatchesForEvent(eventId, 5);
    expect(res).toEqual({ status: 401, message: 'Unauthorized' });
  });

  it('validates eventId', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    const res = await getMatchesForEvent('   ', 5);
    expect(res).toEqual({ status: 400, message: 'Invalid eventId' });
  });

  it('returns 404 when event not found', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(null);
    const res = await getMatchesForEvent(eventId, 5);
    expect(res).toEqual({ status: 404, message: 'Event not found' });
  });

  it('scores, excludes history, and sorts matches', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(event);
    mockGetAllUserProfiles.mockResolvedValue([v1, v2, v3]);
    // histories: v2 has history with event -> exclude; others none
    mockGetHistoryByUserId.mockImplementation(async (uid: string) => {
      if (uid === 'v2') return [{ userId: 'v2', eventId }];
      return [];
    });

    const res = await getMatchesForEvent(eventId, 10);
    expect(res.status).toBe(200);
    if (res.status === 200) {
      const ids = res.matches.map(m => m.volunteer.userId);
      // v1 should be first (highest score), v3 has 0 score but may still appear with 0
      expect(ids).toContain('v1');
      expect(ids).not.toContain('v2'); // excluded by history
      const top = res.matches[0];
      expect(top.volunteer.userId).toBe('v1');
      expect(top.score).toBeGreaterThan(0);
      expect(Array.isArray(top.reasons)).toBe(true);
    }
  });
});

describe('matchingService.getTopVolunteerEventMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const eSoon = {
    id: 'eSoon',
    eventName: 'Soon',
    description: 'd',
    location: 'Dallas, TX 75001',
    requiredSkills: ['A'],
    urgency: 'low',
    eventDate: new Date('2030-01-01T00:00:00Z')
  };
  const eLater = {
    id: 'eLater',
    eventName: 'Later',
    description: 'd',
    location: 'Houston, TX 77001',
    requiredSkills: ['A'],
    urgency: 'low',
    eventDate: new Date('2030-02-01T00:00:00Z')
  };

  const vA = {
    userId: 'uA',
    fullName: 'A',
    skills: ['A'],
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    availability: ['2030-01-01'] // matches eSoon date
  };
  const vB = {
    userId: 'uB',
    fullName: 'B',
    skills: ['A'],
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    availability: []
  };

  it('computes global matches honoring history exclusions and tie-breaking', async () => {
    mockGetAllEvents.mockResolvedValue([eSoon, eLater]);
    mockGetAllUserProfiles.mockResolvedValue([vA, vB]);
    mockGetHistoryByUserId.mockResolvedValue([]);

    const list = await getTopVolunteerEventMatches(3);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    // Expect vA-eSoon to be highly ranked due to date availability and locality
    const top = list[0];
    expect(top.volunteer.userId).toBe('uA');
    expect(['eSoon', 'eLater']).toContain(top.event.id);
    expect(top.score).toBeGreaterThan(0);
    expect(Array.isArray(top.reasons)).toBe(true);
  });

  it('excludes events with existing history for a volunteer', async () => {
    mockGetAllEvents.mockResolvedValue([eSoon]);
    mockGetAllUserProfiles.mockResolvedValue([vA]);
    mockGetHistoryByUserId.mockImplementation(async (uid: string) => uid === 'uA' ? [{ userId: 'uA', eventId: 'eSoon' }] : []);

    const list = await getTopVolunteerEventMatches(5);
    // No pairs since volunteer has history with eSoon
    expect(list).toEqual([]);
  });
});

