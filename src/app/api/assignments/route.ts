import { NextRequest, NextResponse } from 'next/server';
import { createAssignment } from '@/app/lib/services/assignmentService';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = typeof body?.eventId === 'string' ? body.eventId : '';
  const volunteerId = typeof body?.volunteerId === 'string' ? body.volunteerId : '';

  if (!eventId.trim() || !volunteerId.trim()) {
    return NextResponse.json({ message: 'eventId and volunteerId are required' }, { status: 400 });
  }

  const result = await createAssignment({ eventId, volunteerId });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  return NextResponse.json({ message: result.message }, { status: result.status });
}

