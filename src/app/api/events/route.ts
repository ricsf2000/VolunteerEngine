/**
 * Event Management API Routes
 *
 * GET /api/events - Get all events
 * POST /api/events - Create a new event
 * PUT /api/events - Update an existing event
 */

import { NextRequest } from 'next/server';
import { getEvents, createNewEvent, updateEventDetails } from '@/app/lib/services/eventActions';

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

/**
 * PUT /api/events
 * Update an existing event
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const result = await updateEventDetails(id, updateData);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return Response.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return Response.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
