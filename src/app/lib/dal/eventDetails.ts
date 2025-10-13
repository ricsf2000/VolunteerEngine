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

// Hardcoded events - replace with Prisma queries later
const eventDetails: EventDetails[] = [
  {
    id: '1',
    eventName: 'Community Food Drive',
    description: 'Help organize and distribute food to families in need during the holiday season.',
    location: 'Houston Community Center, 456 Oak St, Houston, TX 77002',
    requiredSkills: ['Food Service', 'Administrative Support'],
    urgency: 'high',
    eventDate: new Date('2024-12-15T09:00:00'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    eventName: 'Youth Mentoring Workshop',
    description: 'Mentor local youth in educational activities and life skills development.',
    location: 'Lincoln High School, 789 Pine Ave, Houston, TX 77003',
    requiredSkills: ['Youth Mentoring', 'Teaching/Training'],
    urgency: 'medium',
    eventDate: new Date('2024-12-20T14:00:00'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export async function getEventById(id: string): Promise<EventDetails | null> {
  const event = eventDetails.find(e => e.id === id);
  return event || null;
}

export async function getAllEvents(): Promise<EventDetails[]> {
  return [...eventDetails];
}

export async function createEvent(input: CreateEventDetailsInput): Promise<EventDetails> {
  
  const newEvent: EventDetails = {
    id: (eventDetails.length + 1).toString(),
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  eventDetails.push(newEvent);
  
  return newEvent;
}

export async function updateEvent(id: string, input: UpdateEventDetailsInput): Promise<EventDetails | null> {
  
  const eventIndex = eventDetails.findIndex(e => e.id === id);
  if (eventIndex === -1) return null;
  
  const event = eventDetails[eventIndex];
  
  eventDetails[eventIndex] = {
    ...event,
    ...input,
    updatedAt: new Date(),
  };
  
  return eventDetails[eventIndex];
}