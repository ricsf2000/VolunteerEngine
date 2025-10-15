/**
 * Event Management API Routes
 *
 * GET /api/events - Get all events
 * POST /api/events - Create a new event
 */

import { NextRequest } from 'next/server';
import { getEvents, createNewEvent } from '@/app/lib/services/eventActions';

/**
 * GET /api/events
 * Fetch all events
 */
export async function GET() {
  try {
    const result = await getEvents();

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createNewEvent(body);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
