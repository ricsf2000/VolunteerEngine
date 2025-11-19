'use server';

import { getAllEvents } from '@/app/lib/dal/eventDetails';
import { getAllHistory } from '@/app/lib/dal/volunteerHistory';
import { prisma } from '@/app/lib/db';

export interface VolunteerAssignment {
  volunteerId: string;
  volunteerName: string;
  email: string;
  participantStatus: 'pending' | 'confirmed' | 'cancelled' | 'no_show';
  registrationDate: Date;
}

export interface EventWithAssignments {
  id: string;
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  eventDate: Date;
  assignedVolunteers: VolunteerAssignment[];
}

export async function aggregateEventDetailsAndAssignments() {
  try {
    const events = await getAllEvents();
    const volunteerHistory = await getAllHistory();
    
    const userEmails = await prisma.userCredentials.findMany({
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            fullName: true,
          },
        },
      },
    });

    const userMap = new Map(
      userEmails.map(user => [
        user.id,
        {
          email: user.email,
          fullName: user.profile?.fullName || 'Profile not completed',
        },
      ])
    );

    const eventsWithAssignments: EventWithAssignments[] = events.map(event => {
      const eventAssignments = volunteerHistory.filter(history => history.eventId === event.id);
      
      const assignedVolunteers: VolunteerAssignment[] = eventAssignments.map(assignment => {
        const userInfo = userMap.get(assignment.userId);
        return {
          volunteerId: assignment.userId,
          volunteerName: userInfo?.fullName || 'Profile not completed',
          email: userInfo?.email || 'Unknown',
          participantStatus: assignment.participantStatus,
          registrationDate: assignment.registrationDate,
        };
      });

      return {
        id: event.id,
        eventName: event.eventName,
        description: event.description,
        location: event.location,
        requiredSkills: event.requiredSkills,
        urgency: event.urgency,
        eventDate: event.eventDate,
        assignedVolunteers: assignedVolunteers.sort((a, b) => 
          a.registrationDate.getTime() - b.registrationDate.getTime()
        ),
      };
    });

    const sortedEvents = eventsWithAssignments.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());

    return { success: true, data: sortedEvents };
  } catch (error) {
    console.error('Error aggregating event details and assignments:', error);
    return { success: false, error: 'Failed to aggregate event data' };
  }
}