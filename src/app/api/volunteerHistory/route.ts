/**
 * Volunteer History API Routes
 *
 * GET /api/volunteerHistory - Get volunteer history for authenticated user
 * POST /api/volunteerHistory - Create a new history entry
 */

import { NextRequest } from 'next/server';
import { getHistory, createHistoryEntry } from '@/app/lib/services/volunteerHistoryActions';

/**
 * GET /api/volunteerHistory
 * Get volunteer history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: get userId from query params for admin viewing other users
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const result = await getHistory(userId);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    return Response.json(
      { error: 'Failed to fetch volunteer history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/volunteerHistory
 * Create a new volunteer history entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createHistoryEntry(body);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error creating history entry:', error);
    return Response.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}
