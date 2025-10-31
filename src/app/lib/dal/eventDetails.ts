import { prisma } from '@/app/lib/db';
import type { EventDetails as PrismaEventDetails, EventUrgency } from '@/generated/prisma';

export interface EventDetails {
  id: string;
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEventDetailsInput = Omit<EventDetails, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventDetailsInput = Partial<Omit<EventDetails, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Helper function to convert Prisma EventDetails to our EventDetails interface
 */
function toEventDetails(event: PrismaEventDetails): EventDetails {
  return {
    id: event.id,
    eventName: event.eventName,
    description: event.description,
    location: event.location,
    requiredSkills: event.requiredSkills as string[],
    urgency: event.urgency as 'low' | 'medium' | 'high' | 'urgent',
    eventDate: event.eventDate,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function getEventById(id: string): Promise<EventDetails | null> {
  try {
    const event = await prisma.eventDetails.findUnique({
      where: { id },
    });

    if (!event) return null;
    return toEventDetails(event);
  } catch {
    return null;
  }
}

export async function getAllEvents(): Promise<EventDetails[]> {
  try {
    const events = await prisma.eventDetails.findMany({
      orderBy: {
        eventDate: 'desc',
      },
    });

    return events.map(toEventDetails);
  } catch {
    return [];
  }
}

export async function createEvent(input: CreateEventDetailsInput): Promise<EventDetails> {
  try {
    const event = await prisma.eventDetails.create({
      data: {
        eventName: input.eventName,
        description: input.description,
        location: input.location,
        requiredSkills: input.requiredSkills,
        urgency: input.urgency as EventUrgency,
        eventDate: input.eventDate,
      },
    });

    return toEventDetails(event);
  } catch (error) {
    throw error;
  }
}

export async function updateEvent(id: string, input: UpdateEventDetailsInput): Promise<EventDetails | null> {
  try {
    const event = await prisma.eventDetails.update({
      where: { id },
      data: {
        ...(input.eventName !== undefined && { eventName: input.eventName }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.requiredSkills !== undefined && { requiredSkills: input.requiredSkills }),
        ...(input.urgency !== undefined && { urgency: input.urgency as EventUrgency }),
        ...(input.eventDate !== undefined && { eventDate: input.eventDate }),
      },
    });

    return toEventDetails(event);
  } catch {
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    await prisma.eventDetails.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}