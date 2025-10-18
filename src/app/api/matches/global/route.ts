import { NextRequest, NextResponse } from 'next/server';
import { getTopVolunteerEventMatches } from '@/app/lib/services/matchingService';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{}> }
) {
  await context.params; // align with validator expectations

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const topParam = searchParams.get('top');
  let k = 1;
  if (topParam !== null) {
    const parsed = Number(topParam);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json({ message: 'Invalid top parameter' }, { status: 400 });
    }
    k = Math.trunc(parsed);
  }

  try {
    const matches = await getTopVolunteerEventMatches(k);
    return NextResponse.json(matches, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to compute matches' }, { status: 500 });
  }
}

