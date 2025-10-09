// dummy volunteer for testing
const dummyVolunteer = {
  id: 1,
  fullName: 'Sarah Johnson',
  address1: '123 Main Street',
  address2: 'Apt 4B',
  city: 'Houston',
  state: 'TX',
  zipCode: '77001',
  skills: ['teaching', 'organizing', 'event planning'],
  preferences: 'Prefers weekend events and working with children',
  availability: ['2025-10-15', '2025-10-20', '2025-10-25']
};

// dummy event for testing
const dummyEvent = {
  id: 1,
  eventName: 'Community Food Drive',
  eventDescription: 'Help organize and distribute food to families in need during the holiday season',
  location: '456 Community Center Dr, Houston, TX 77002',
  requiredSkills: ['organizing', 'setup', 'customer service'],
  urgency: 'High',
  eventDate: '2025-10-15'
};

// fake loading time
const delay = () => new Promise(resolve => setTimeout(resolve, 800));

export const volunteerMatchingApi = {
  async getRandomVolunteer() {
    await delay();
    return dummyVolunteer;
  },
  
  async getBestMatchForVolunteer() {
    await delay();
    return dummyEvent;
  },
  
  async submitMatch(volunteerId: number, eventId: number) {
    await delay();
    console.log(`Matching volunteer ${volunteerId} to event ${eventId}`);
    return { success: true };
  }
};