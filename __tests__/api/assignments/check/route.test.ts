import { GET } from '@/app/api/assignments/check/route';
import * as authModule from '@/auth';
import * as userProfileDAL from '@/app/lib/dal/userProfile';
import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
import { NextRequest } from 'next/server';

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/app/lib/dal/userProfile', () => ({
  getAllUserProfiles: jest.fn()
}));

jest.mock('@/app/lib/dal/eventDetails', () => ({
  getAllEvents: jest.fn()
}));

jest.mock('@/app/lib/dal/volunteerHistory', () => ({
  getHistoryByUserId: jest.fn()
}));

const mockAuth = authModule.auth as jest.MockedFunction<any>;
const mockGetAllUserProfiles = userProfileDAL.getAllUserProfiles as jest.MockedFunction<any>;
const mockGetAllEvents = eventDetailsDAL.getAllEvents as jest.MockedFunction<any>;
const mockGetHistoryByUserId = volunteerHistoryDAL.getHistoryByUserId as jest.MockedFunction<any>;

describe('/api/assignments/check GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const profiles = [
    { userId: 'u1', fullName: 'Alice Smith', skills: ['A'], city: 'Houston', state: 'TX', zipCode: '77001', availability: [] },
    { userId: 'u2', fullName: 'Bob Jones', skills: ['B'], city: 'Austin', state: 'TX', zipCode: '73301', availability: [] },
  ];
  const events = [
    { id: 'e1', eventName: 'Food Drive', requiredSkills: ['A'], urgency: 'low', eventDate: new Date('2030-05-05'), location: 'Houston, TX 77001', description: '' },
  ];

  it('returns 401 if unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=Alice&eventName=Food');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: 'Unauthorized' });
  });

  it('returns 400 if params missing', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=&eventName=');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: 'volunteerName and eventName are required' });
  });

  it('returns 404 if volunteer not found', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetAllUserProfiles.mockResolvedValue(profiles);
    mockGetAllEvents.mockResolvedValue(events);
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=Charlie&eventName=Food%20Drive');
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: 'Volunteer not found' });
  });

  it('returns 404 if event not found', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetAllUserProfiles.mockResolvedValue(profiles);
    mockGetAllEvents.mockResolvedValue(events);
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=Alice%20Smith&eventName=Missing');
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: 'Event not found' });
  });

  it('returns exists=false and details when no history', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetAllUserProfiles.mockResolvedValue(profiles);
    mockGetAllEvents.mockResolvedValue(events);
    mockGetHistoryByUserId.mockResolvedValue([]);
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=Alice%20Smith&eventName=Food%20Drive');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exists).toBe(false);
    expect(body.volunteer.userId).toBe('u1');
    expect(body.event.id).toBe('e1');
    expect(typeof body.event.eventDate).toBe('string');
  });

  it('returns exists=true when history exists', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetAllUserProfiles.mockResolvedValue(profiles);
    mockGetAllEvents.mockResolvedValue(events);
    mockGetHistoryByUserId.mockResolvedValue([{ userId: 'u1', eventId: 'e1' }]);
    const req = new NextRequest('http://localhost/api/assignments/check?volunteerName=Alice%20Smith&eventName=Food%20Drive');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exists).toBe(true);
  });
});

