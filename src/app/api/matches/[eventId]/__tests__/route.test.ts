import { GET } from '@/app/api/matches/[eventId]/route';

jest.mock('@/app/lib/services/matchingService', () => ({
  getMatchesForEvent: jest.fn(),
}));

const { getMatchesForEvent } = jest.requireMock('@/app/lib/services/matchingService');

describe('GET /api/matches/[eventId]', () => {
  it('maps 401/400/404 to HTTP and returns { message }', async () => {
    getMatchesForEvent.mockResolvedValueOnce({ status: 401, message: 'Unauthorized' });
    let res = await GET({} as any, { params: Promise.resolve({ eventId: '1' }) } as any);
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Unauthorized');

    getMatchesForEvent.mockResolvedValueOnce({ status: 400, message: 'Invalid eventId' });
    res = await GET({} as any, { params: Promise.resolve({ eventId: '' }) } as any);
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe('Invalid eventId');

    getMatchesForEvent.mockResolvedValueOnce({ status: 404, message: 'Event not found' });
    res = await GET({} as any, { params: Promise.resolve({ eventId: 'x' }) } as any);
    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('Event not found');
  });

  it('200 happy path returns matches array', async () => {
    const matches = [{ volunteer: { userId: 'v1' }, score: 10, reasons: ['Skills overlap'] }];
    getMatchesForEvent.mockResolvedValue({ status: 200, matches });
    const res = await GET({} as any, { params: Promise.resolve({ eventId: '1' }) } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].score).toBe(10);
    expect(body[0].reasons).toContain('Skills overlap');
  });
});

