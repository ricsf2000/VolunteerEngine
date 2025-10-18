import { GET } from '@/app/api/matches/global/route';
import * as authModule from '@/auth';
import * as matchingService from '@/app/lib/services/matchingService';
import { NextRequest } from 'next/server';

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

jest.mock('@/app/lib/services/matchingService', () => ({
  getTopVolunteerEventMatches: jest.fn()
}));

const mockAuth = authModule.auth as jest.MockedFunction<any>;
const mockGetTop = matchingService.getTopVolunteerEventMatches as jest.MockedFunction<any>;

describe('/api/matches/global GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ctx = { params: Promise.resolve({}) } as any;

  it('returns 401 when unauthorized', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/matches/global');
    const res = await GET(req, ctx);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: 'Unauthorized' });
  });

  it('validates top parameter', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    let req = new NextRequest('http://localhost/api/matches/global?top=abc');
    let res = await GET(req, ctx);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: 'Invalid top parameter' });

    req = new NextRequest('http://localhost/api/matches/global?top=0');
    res = await GET(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns matches from service', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    const matches = [{ volunteer: { userId: 'u1' }, event: { id: 'e1', eventName: 'X', eventDate: new Date().toISOString() }, score: 10, reasons: [] }];
    mockGetTop.mockResolvedValue(matches);
    const req = new NextRequest('http://localhost/api/matches/global?top=2');
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(matches);
    expect(mockGetTop).toHaveBeenCalledWith(2);
  });

  it('handles service errors with 500', async () => {
    mockAuth.mockResolvedValue(global.mockSession());
    mockGetTop.mockRejectedValue(new Error('boom'));
    const req = new NextRequest('http://localhost/api/matches/global');
    const res = await GET(req, ctx);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'Failed to compute matches' });
  });
});

