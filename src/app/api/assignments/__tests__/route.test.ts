import { POST } from '@/app/api/assignments/route';

jest.mock('@/app/lib/services/assignmentService', () => ({
  createAssignment: jest.fn(),
}));

const { createAssignment } = jest.requireMock('@/app/lib/services/assignmentService');

describe('POST /api/assignments', () => {
  it('400 when missing/blank fields', async () => {
    // missing fields
    let req: any = { json: async () => ({}) };
    let res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBeDefined();

    // blank fields
    req = { json: async () => ({ eventId: ' ', volunteerId: '' }) } as any;
    res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('maps service errors to HTTP codes', async () => {
    createAssignment.mockResolvedValueOnce({ ok: false, status: 401, message: 'Unauthorized' });
    let req: any = { json: async () => ({ eventId: '1', volunteerId: 'v1' }) };
    let res = await POST(req);
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Unauthorized');

    createAssignment.mockResolvedValueOnce({ ok: false, status: 404, message: 'Not found' });
    res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('201 on success returns created record', async () => {
    const created = { id: 'h1', eventId: '1', userId: 'v1', participantStatus: 'confirmed', registrationDate: new Date().toISOString() };
    createAssignment.mockResolvedValue({ ok: true, status: 201, data: created });
    const req: any = { json: async () => ({ eventId: '1', volunteerId: 'v1' }) };
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('h1');
    expect(body.eventId).toBe('1');
  });
});

