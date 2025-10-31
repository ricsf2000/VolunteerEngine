import { prisma } from '@/app/lib/db';
import type { VolunteerHistory as PrismaVolunteerHistory, ParticipantStatus } from '@/generated/prisma';

export interface VolunteerHistory {
  id: string; // Primary key
  userId: string; // Foreign key to UserCredentials
  eventId: string; // Foreign key to EventDetails
  participantStatus: 'pending' | 'confirmed' | 'cancelled' | 'no_show';
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateVolunteerHistoryInput = Omit<VolunteerHistory, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVolunteerHistoryInput = Partial<Omit<VolunteerHistory, 'id' | 'userId' | 'eventId' | 'createdAt' | 'updatedAt'>>;

/**
 * Helper function to convert Prisma VolunteerHistory to our interface
 */
function toVolunteerHistory(history: PrismaVolunteerHistory): VolunteerHistory {
  return {
    id: history.id,
    userId: history.userId,
    eventId: history.eventId,
    participantStatus: history.participantStatus as 'pending' | 'confirmed' | 'cancelled' | 'no_show',
    registrationDate: history.registrationDate,
    createdAt: history.createdAt,
    updatedAt: history.updatedAt,
  };
}

export async function getHistoryByUserId(userId: string): Promise<VolunteerHistory[]> {
  try {
    const histories = await prisma.volunteerHistory.findMany({
      where: { userId },
      orderBy: {
        registrationDate: 'desc',
      },
    });

    return histories.map(toVolunteerHistory);
  } catch { return []; }
}

export async function getHistoryById(id: string): Promise<VolunteerHistory | null> {
  try {
    const history = await prisma.volunteerHistory.findUnique({
      where: { id },
    });

    if (!history) return null;
    return toVolunteerHistory(history);
  } catch { return null; }
}

export async function createVolunteerHistory(input: CreateVolunteerHistoryInput): Promise<VolunteerHistory> {
  try {
    const history = await prisma.volunteerHistory.create({
      data: {
        userId: input.userId,
        eventId: input.eventId,
        participantStatus: input.participantStatus as ParticipantStatus,
        registrationDate: input.registrationDate,
      },
    });

    return toVolunteerHistory(history);
  } catch (error) { throw error; }
}

export async function updateVolunteerHistory(id: string, input: UpdateVolunteerHistoryInput): Promise<VolunteerHistory | null> {
  try {
    const history = await prisma.volunteerHistory.update({
      where: { id },
      data: {
        ...(input.participantStatus !== undefined && { participantStatus: input.participantStatus as ParticipantStatus }),
        ...(input.registrationDate !== undefined && { registrationDate: input.registrationDate }),
      },
    });

    return toVolunteerHistory(history);
  } catch { return null; }
}

export async function getAllHistory(): Promise<VolunteerHistory[]> {
  try {
    const histories = await prisma.volunteerHistory.findMany({
      orderBy: {
        registrationDate: 'desc',
      },
    });

    return histories.map(toVolunteerHistory);
  } catch { return []; }
}
