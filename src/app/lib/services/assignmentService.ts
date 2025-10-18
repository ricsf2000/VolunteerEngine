"use server";

import { auth } from '@/auth';
import { getEventById } from '@/app/lib/dal/eventDetails';
import { getUserProfileByUserId } from '@/app/lib/dal/userProfile';
import { createVolunteerHistory, VolunteerHistory } from '@/app/lib/dal/volunteerHistory';

type CreateAssignmentInput = { eventId: string; volunteerId: string };

export type CreateAssignmentResult =
  | { ok: true; status: 201; data: VolunteerHistory }
  | { ok: false; status: 400 | 401 | 404 | 500; message: string };

export async function createAssignment({ eventId, volunteerId }: CreateAssignmentInput): Promise<CreateAssignmentResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return { ok: false, status: 400, message: 'Invalid eventId' };
  }
  if (typeof volunteerId !== 'string' || volunteerId.trim().length === 0) {
    return { ok: false, status: 400, message: 'Invalid volunteerId' };
  }

  const event = await getEventById(eventId);
  if (!event) {
    return { ok: false, status: 404, message: 'Event not found' };
  }

  const profile = await getUserProfileByUserId(volunteerId);
  if (!profile) {
    return { ok: false, status: 404, message: 'Volunteer not found' };
  }

  try {
    const now = new Date();
    const created = await createVolunteerHistory({
      userId: volunteerId,
      eventId: eventId,
      participantStatus: 'confirmed',
      registrationDate: now,
    });

    // TODO: notification integration (out of scope for Matching module)

    return { ok: true, status: 201, data: created };
  } catch (err) {
    return { ok: false, status: 500, message: 'Failed to create assignment' };
  }
}

