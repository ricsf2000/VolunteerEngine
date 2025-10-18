import { POST } from '@/app/api/assignments/route';
import * as assignmentService from '@/app/lib/services/assignmentService';
import { NextRequest } from 'next/server';

jest.mock('@/app/lib/services/assignmentService', () => ({
  createAssignment: jest.fn()
}));

const mockCreateAssignment = assignmentService.createAssignment as jest.MockedFunction<any>;

describe('/api/assignments POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/assignments', {
      method: 'POST',
      body: 'not-json'
    } as any);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ message: 'Invalid JSON' });
  });

  it('returns 400 when eventId/volunteerId missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/assignments', {
      method: 'POST',
      body: JSON.stringify({ eventId: '  ', volunteerId: '' })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ message: 'eventId and volunteerId are required' });
    expect(mockCreateAssignment).not.toHaveBeenCalled();
  });

  it('returns 201 with created assignment on success', async () => {
    const created = { id: 'vh-1' };
    mockCreateAssignment.mockResolvedValue({ ok: true, status: 201, data: created });
    const req = new NextRequest('http://localhost:3000/api/assignments', {
      method: 'POST',
      body: JSON.stringify({ eventId: 'e1', volunteerId: 'v1' })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(created);
    expect(mockCreateAssignment).toHaveBeenCalledWith({ eventId: 'e1', volunteerId: 'v1' });
  });

  it('returns status and message from service on failure', async () => {
    mockCreateAssignment.mockResolvedValue({ ok: false, status: 401, message: 'Unauthorized' });
    const req = new NextRequest('http://localhost:3000/api/assignments', {
      method: 'POST',
      body: JSON.stringify({ eventId: 'e1', volunteerId: 'v1' })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ message: 'Unauthorized' });
  });
});

