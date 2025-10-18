import { NextResponse, NextRequest } from 'next/server';
import { getMatchesForEvent } from '@/app/lib/services/matchingService';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const result = await getMatchesForEvent(eventId);

  if (result.status === 200) {
    return NextResponse.json(result.matches, { status: 200 });
  }

  return NextResponse.json({ message: result.message }, { status: result.status });
}
