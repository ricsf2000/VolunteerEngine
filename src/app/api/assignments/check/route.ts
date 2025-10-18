import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllUserProfiles } from '@/app/lib/dal/userProfile';
import { getAllEvents } from '@/app/lib/dal/eventDetails';
import { getHistoryByUserId } from '@/app/lib/dal/volunteerHistory';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const volunteerName = (searchParams.get('volunteerName') || '').trim();
  const eventName = (searchParams.get('eventName') || '').trim();

  if (!volunteerName || !eventName) {
    return NextResponse.json({ message: 'volunteerName and eventName are required' }, { status: 400 });
  }

  const [profiles, events] = await Promise.all([
    getAllUserProfiles(),
    getAllEvents(),
  ]);

  const volunteer = profiles.find(p => p.fullName.toLowerCase() === volunteerName.toLowerCase());
  if (!volunteer) {
    return NextResponse.json({ message: 'Volunteer not found' }, { status: 404 });
  }

  const event = events.find(e => e.eventName.toLowerCase() === eventName.toLowerCase());
  if (!event) {
    return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  }

  const history = await getHistoryByUserId(volunteer.userId);
  const exists = history.some(h => h.eventId === event.id);

  return NextResponse.json({
    exists,
    volunteer: {
      userId: volunteer.userId,
      fullName: volunteer.fullName,
      skills: volunteer.skills,
      city: volunteer.city,
      state: volunteer.state,
      zipCode: volunteer.zipCode,
      availability: volunteer.availability,
    },
    event: {
      id: event.id,
      eventName: event.eventName,
      requiredSkills: event.requiredSkills,
      eventDate: event.eventDate.toISOString(),
      urgency: event.urgency,
    },
  }, { status: 200 });
}

