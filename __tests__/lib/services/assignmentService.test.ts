import * as authModule from '@/auth';
import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import * as userProfileDAL from '@/app/lib/dal/userProfile';
import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';
import { createAssignment } from '@/app/lib/services/assignmentService';

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/app/lib/dal/eventDetails', () => ({
  getEventById: jest.fn()
}));

jest.mock('@/app/lib/dal/userProfile', () => ({
  getUserProfileByUserId: jest.fn()
}));

jest.mock('@/app/lib/dal/volunteerHistory', () => ({
  createVolunteerHistory: jest.fn()
}));

const mockAuth = authModule.auth as jest.MockedFunction<any>;
const mockGetEventById = eventDetailsDAL.getEventById as jest.MockedFunction<any>;
const mockGetUserProfileByUserId = userProfileDAL.getUserProfileByUserId as jest.MockedFunction<any>;
const mockCreateVolunteerHistory = volunteerHistoryDAL.createVolunteerHistory as jest.MockedFunction<any>;

describe('assignmentService.createAssignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validEvent = {
    id: 'event-1',
    eventName: 'Test Event',
    description: 'Test',
    location: 'Houston, TX 77001',
    requiredSkills: ['A'],
    urgency: 'low',
    eventDate: new Date('2030-01-01T00:00:00Z')
  };

  const validProfile = {
    userId: 'vol-1',
    fullName: 'Jane Doe',
    skills: ['A'],
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    availability: ['2030-01-01']
  };

  it('returns 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await createAssignment({ eventId: 'e', volunteerId: 'v' });
    expect(res).toEqual({ ok: false, status: 401, message: 'Unauthorized' });
  });

  it('validates eventId and volunteerId', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    let res = await createAssignment({ eventId: '', volunteerId: 'v' });
    expect(res).toEqual({ ok: false, status: 400, message: 'Invalid eventId' });

    res = await createAssignment({ eventId: '  ', volunteerId: 'v' });
    expect(res).toEqual({ ok: false, status: 400, message: 'Invalid eventId' });

    res = await createAssignment({ eventId: 'e', volunteerId: '' });
    expect(res).toEqual({ ok: false, status: 400, message: 'Invalid volunteerId' });
  });

  it('returns 404 if event not found', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(null);
    const res = await createAssignment({ eventId: 'missing', volunteerId: 'vol-1' });
    expect(mockGetEventById).toHaveBeenCalledWith('missing');
    expect(res).toEqual({ ok: false, status: 404, message: 'Event not found' });
  });

  it('returns 404 if volunteer not found', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(validEvent);
    mockGetUserProfileByUserId.mockResolvedValue(null);
    const res = await createAssignment({ eventId: 'event-1', volunteerId: 'missing' });
    expect(mockGetUserProfileByUserId).toHaveBeenCalledWith('missing');
    expect(res).toEqual({ ok: false, status: 404, message: 'Volunteer not found' });
  });

  it('creates volunteer history and returns 201 on success', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(validEvent);
    mockGetUserProfileByUserId.mockResolvedValue(validProfile);
    const created = {
      id: 'vh-1',
      userId: 'vol-1',
      eventId: 'event-1',
      participantStatus: 'confirmed',
      registrationDate: new Date()
    };
    mockCreateVolunteerHistory.mockResolvedValue(created);

    const res = await createAssignment({ eventId: 'event-1', volunteerId: 'vol-1' });

    expect(mockCreateVolunteerHistory).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'vol-1',
      eventId: 'event-1',
      participantStatus: 'confirmed',
      registrationDate: expect.any(Date)
    }));
    expect(res).toEqual({ ok: true, status: 201, data: created });
  });

  it('returns 500 when history creation fails', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetEventById.mockResolvedValue(validEvent);
    mockGetUserProfileByUserId.mockResolvedValue(validProfile);
    mockCreateVolunteerHistory.mockRejectedValue(new Error('db down'));

    const res = await createAssignment({ eventId: 'event-1', volunteerId: 'vol-1' });
    expect(res).toEqual({ ok: false, status: 500, message: 'Failed to create assignment' });
  });
});

