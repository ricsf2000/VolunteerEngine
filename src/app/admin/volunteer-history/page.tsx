import React from "react";
import { getAllHistory } from '@/app/lib/dal/volunteerHistory';
import { getEventById } from '@/app/lib/dal/eventDetails';
import { getUserProfileByUserId } from '@/app/lib/dal/userProfile';
import VolunteerHistoryClient from './VolunteerHistoryClient';

type VolunteerHistoryWithEvent = {
  id: string;
  fullName: string;
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
  eventTime: string;
  participantStatus: "pending" | "confirmed";
};

async function getVolunteerHistoriesWithEvents(): Promise<VolunteerHistoryWithEvent[]> {
  const histories = await getAllHistory();
  
  const historiesWithEvents: VolunteerHistoryWithEvent[] = [];
  
  for (const history of histories) {
    const [event, userProfile] = await Promise.all([
      getEventById(history.eventId),
      getUserProfileByUserId(history.userId)
    ]);
    
    if (event) {
      historiesWithEvents.push({
        id: history.id,
        fullName: userProfile?.fullName || "Unknown User",
        eventName: event.eventName,
        eventDescription: event.description,
        location: event.location,
        requiredSkills: event.requiredSkills,
        urgency: event.urgency.charAt(0).toUpperCase() + event.urgency.slice(1),
        eventDate: event.eventDate.toISOString().split('T')[0],
        eventTime: event.eventDate.toISOString().split('T')[1].slice(0, 5),
        participantStatus: history.participantStatus as "pending" | "confirmed"
      });
    }
  }
  
  return historiesWithEvents;
}

export default async function AdminVolunteers() {
  const volunteerHistories = await getVolunteerHistoriesWithEvents();
  
  return <VolunteerHistoryClient initialData={volunteerHistories} />;
}
