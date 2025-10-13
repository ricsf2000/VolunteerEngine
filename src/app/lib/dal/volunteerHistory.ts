export interface VolunteerHistory {
  id: string;
  userId: string; // Foreign key to UserCredentials
  eventId: string; // Foreign key to EventDetails
  participantStatus: 'pending' | 'confirmed' | 'cancelled' | 'no-show';
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateVolunteerHistoryInput = Omit<VolunteerHistory, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVolunteerHistoryInput = Partial<Omit<VolunteerHistory, 'id' | 'userId' | 'eventId' | 'createdAt' | 'updatedAt'>>;

// Hardcoded history - replace with Prisma queries later
const volunteerHistory: VolunteerHistory[] = [
  {
    id: '1',
    userId: '2', // volunteer@test.com
    eventId: '1', // Community Food Drive
    participantStatus: 'confirmed',
    registrationDate: new Date('2024-12-01'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
];

export async function getHistoryByUserId(userId: string): Promise<VolunteerHistory[]> {
  return volunteerHistory.filter(h => h.userId === userId);
}

export async function createVolunteerHistory(input: CreateVolunteerHistoryInput): Promise<VolunteerHistory> {
  
  const newHistory: VolunteerHistory = {
    id: (volunteerHistory.length + 1).toString(),
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  volunteerHistory.push(newHistory);
  
  return newHistory;
}

export async function updateVolunteerHistory(id: string, input: UpdateVolunteerHistoryInput): Promise<VolunteerHistory | null> {
  
  const historyIndex = volunteerHistory.findIndex(h => h.id === id);
  if (historyIndex === -1) return null;
  
  const history = volunteerHistory[historyIndex];
  
  volunteerHistory[historyIndex] = {
    ...history,
    ...input,
    updatedAt: new Date(),
  };
  
  return volunteerHistory[historyIndex];
}