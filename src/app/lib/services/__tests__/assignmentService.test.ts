import { createAssignment } from '@/app/lib/services/assignmentService';

jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/app/lib/dal/eventDetails', () => ({ getEventById: jest.fn() }));
jest.mock('@/app/lib/dal/userProfile', () => ({ getUserProfileByUserId: jest.fn() }));
jest.mock('@/app/lib/dal/volunteerHistory', () => ({ createVolunteerHistory: jest.fn() }));

const { auth } = jest.requireMock('@/auth');
const { getEventById } = jest.requireMock('@/app/lib/dal/eventDetails');
const { getUserProfileByUserId } = jest.requireMock('@/app/lib/dal/userProfile');
const { createVolunteerHistory } = jest.requireMock('@/app/lib/dal/volunteerHistory');

describe('assignmentService.createAssignment', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);
    const res = await createAssignment({ eventId: '1', volunteerId: 'v1' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });

  it('400 when invalid IDs', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    let res = await createAssignment({ eventId: '', volunteerId: 'v1' });
    expect(res.status).toBe(400);
    res = await createAssignment({ eventId: '1', volunteerId: ' ' });
    expect(res.status).toBe(400);
  });

  it('404 when event not found', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    getEventById.mockResolvedValue(null);
    const res = await createAssignment({ eventId: 'x', volunteerId: 'v1' });
    expect(res.status).toBe(404);
  });

  it('404 when volunteer not found', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    getEventById.mockResolvedValue({ id: '1' });
    const res = await createAssignment({ eventId: '1', volunteerId: 'v-missing' });
    expect(res.status).toBe(404);
  });

  it('201 on success and writes history', async () => {
    auth.mockResolvedValue({ user: { id: 'admin-1' } });
    getEventById.mockResolvedValue({ id: '1' });
    getUserProfileByUserId.mockResolvedValue({ userId: 'v1' });
    const created = { id: 'h1', userId: 'v1', eventId: '1', participantStatus: 'confirmed', registrationDate: new Date(), createdAt: new Date(), updatedAt: new Date() };
    createVolunteerHistory.mockResolvedValue(created);

    const res = await createAssignment({ eventId: '1', volunteerId: 'v1' });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
    expect(createVolunteerHistory).toHaveBeenCalledTimes(1);
    const payload = createVolunteerHistory.mock.calls[0][0];
    expect(payload.userId).toBe('v1');
    expect(payload.eventId).toBe('1');
    expect(payload.participantStatus).toBe('confirmed');
    expect(new Date(payload.registrationDate).toString()).not.toBe('Invalid Date');
  });
});

