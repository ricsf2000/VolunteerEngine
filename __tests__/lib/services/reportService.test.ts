import {
  aggregateEventDetailsAndAssignments,
  generateEventReportCSV,
  generateEventReportPDF,
  generateVolunteerReportCSV,
  generateVolunteerReportPDF,
  getReportData,
  EventWithAssignments,
  VolunteerAssignment,
} from '@/app/lib/services/reportService';
import * as eventDetailsDAL from '@/app/lib/dal/eventDetails';
import * as volunteerHistoryDAL from '@/app/lib/dal/volunteerHistory';

// Mock the database
jest.mock('@/app/lib/db', () => ({
  prisma: {
    userCredentials: {
      findMany: jest.fn(),
    },
  },
}));

// Mock the DAL functions
jest.mock('@/app/lib/dal/eventDetails');
jest.mock('@/app/lib/dal/volunteerHistory');

const mockGetAllEvents = eventDetailsDAL.getAllEvents as jest.MockedFunction<typeof eventDetailsDAL.getAllEvents>;
const mockGetAllHistory = volunteerHistoryDAL.getAllHistory as jest.MockedFunction<typeof volunteerHistoryDAL.getAllHistory>;

describe('reportService', () => {
  const mockEvents = [
    {
      id: 'event1',
      eventName: 'Community Cleanup',
      description: 'Help clean up the local park',
      location: '123 Park St',
      requiredSkills: ['Physical Labor', 'Environmental'],
      urgency: 'medium' as const,
      eventDate: new Date('2025-01-15T09:00:00Z'),
      createdAt: new Date('2024-12-01T10:00:00Z'),
      updatedAt: new Date('2024-12-01T10:00:00Z'),
    },
    {
      id: 'event2',
      eventName: 'Food Bank Distribution',
      description: 'Distribute food to families in need',
      location: '456 Main St',
      requiredSkills: ['Customer Service', 'Organization'],
      urgency: 'high' as const,
      eventDate: new Date('2025-01-20T08:00:00Z'),
      createdAt: new Date('2024-12-02T11:00:00Z'),
      updatedAt: new Date('2024-12-02T11:00:00Z'),
    },
  ];

  const mockVolunteerHistory = [
    {
      id: 'history1',
      userId: 'user1',
      eventId: 'event1',
      participantStatus: 'confirmed' as const,
      registrationDate: new Date('2024-12-10T12:00:00Z'),
      createdAt: new Date('2024-12-10T12:00:00Z'),
      updatedAt: new Date('2024-12-10T12:00:00Z'),
    },
    {
      id: 'history2',
      userId: 'user2',
      eventId: 'event1',
      participantStatus: 'pending' as const,
      registrationDate: new Date('2024-12-11T14:00:00Z'),
      createdAt: new Date('2024-12-11T14:00:00Z'),
      updatedAt: new Date('2024-12-11T14:00:00Z'),
    },
    {
      id: 'history3',
      userId: 'user3',
      eventId: 'event2',
      participantStatus: 'confirmed' as const,
      registrationDate: new Date('2024-12-12T16:00:00Z'),
      createdAt: new Date('2024-12-12T16:00:00Z'),
      updatedAt: new Date('2024-12-12T16:00:00Z'),
    },
  ];

  const mockUserCredentials = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      profile: {
        fullName: 'John Doe',
      },
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      profile: {
        fullName: 'Jane Smith',
      },
    },
    {
      id: 'user3',
      email: 'bob.johnson@example.com',
      profile: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetAllEvents.mockResolvedValue(mockEvents);
    mockGetAllHistory.mockResolvedValue(mockVolunteerHistory);
    
    const { prisma } = require('@/app/lib/db');
    prisma.userCredentials.findMany.mockResolvedValue(mockUserCredentials);
  });

  describe('aggregateEventDetailsAndAssignments', () => {
    it('should successfully aggregate event details and volunteer assignments', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return events sorted by event date in descending order', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      expect(result.data![0].eventName).toBe('Food Bank Distribution'); // Later date
      expect(result.data![1].eventName).toBe('Community Cleanup'); // Earlier date
    });

    it('should include correct event details', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event1 = result.data!.find(e => e.id === 'event1');
      
      expect(event1).toBeDefined();
      expect(event1!.eventName).toBe('Community Cleanup');
      expect(event1!.description).toBe('Help clean up the local park');
      expect(event1!.location).toBe('123 Park St');
      expect(event1!.requiredSkills).toEqual(['Physical Labor', 'Environmental']);
      expect(event1!.urgency).toBe('medium');
      expect(event1!.eventDate).toEqual(new Date('2025-01-15T09:00:00Z'));
    });

    it('should include assigned volunteers with correct details', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event1 = result.data!.find(e => e.id === 'event1');
      
      expect(event1).toBeDefined();
      expect(event1!.assignedVolunteers).toHaveLength(2);
      
      const volunteer1 = event1!.assignedVolunteers.find(v => v.volunteerId === 'user1');
      expect(volunteer1).toBeDefined();
      expect(volunteer1!.volunteerName).toBe('John Doe');
      expect(volunteer1!.email).toBe('john.doe@example.com');
      expect(volunteer1!.participantStatus).toBe('confirmed');
      expect(volunteer1!.registrationDate).toEqual(new Date('2024-12-10T12:00:00Z'));
    });

    it('should handle volunteers without profiles', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event2 = result.data!.find(e => e.id === 'event2');
      
      expect(event2).toBeDefined();
      expect(event2!.assignedVolunteers).toHaveLength(1);
      
      const volunteer3 = event2!.assignedVolunteers[0];
      expect(volunteer3.volunteerId).toBe('user3');
      expect(volunteer3.volunteerName).toBe('Profile not completed');
      expect(volunteer3.email).toBe('bob.johnson@example.com');
    });

    it('should sort assigned volunteers by registration date', async () => {
      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event1 = result.data!.find(e => e.id === 'event1');
      
      expect(event1).toBeDefined();
      expect(event1!.assignedVolunteers).toHaveLength(2);
      
      // Should be sorted by registration date (earliest first)
      expect(event1!.assignedVolunteers[0].volunteerId).toBe('user1'); // Dec 10
      expect(event1!.assignedVolunteers[1].volunteerId).toBe('user2'); // Dec 11
    });

    it('should handle events with no volunteers', async () => {
      // Mock events with no volunteer history
      mockGetAllHistory.mockResolvedValue([]);

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      
      result.data!.forEach(event => {
        expect(event.assignedVolunteers).toEqual([]);
      });
    });

    it('should handle empty events list', async () => {
      mockGetAllEvents.mockResolvedValue([]);

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database error from getAllEvents', async () => {
      mockGetAllEvents.mockRejectedValue(new Error('Database connection failed'));

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to aggregate event data');
      expect(result.data).toBeUndefined();
    });

    it('should handle database error from getAllHistory', async () => {
      mockGetAllHistory.mockRejectedValue(new Error('Volunteer history query failed'));

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to aggregate event data');
      expect(result.data).toBeUndefined();
    });

    it('should handle database error from userCredentials query', async () => {
      const { prisma } = require('@/app/lib/db');
      prisma.userCredentials.findMany.mockRejectedValue(new Error('User query failed'));

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to aggregate event data');
      expect(result.data).toBeUndefined();
    });

    it('should handle missing user in userMap gracefully', async () => {
      // Mock userCredentials without user2
      const partialUserCredentials = [
        {
          id: 'user1',
          email: 'john.doe@example.com',
          profile: { fullName: 'John Doe' },
        },
      ];

      const { prisma } = require('@/app/lib/db');
      prisma.userCredentials.findMany.mockResolvedValue(partialUserCredentials);

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event1 = result.data!.find(e => e.id === 'event1');
      
      expect(event1).toBeDefined();
      const volunteer2 = event1!.assignedVolunteers.find(v => v.volunteerId === 'user2');
      expect(volunteer2).toBeDefined();
      expect(volunteer2!.volunteerName).toBe('Profile not completed');
      expect(volunteer2!.email).toBe('Unknown');
    });

    it('should include all participant statuses', async () => {
      // Add more volunteer history with different statuses
      const extendedVolunteerHistory = [
        ...mockVolunteerHistory,
        {
          id: 'history4',
          userId: 'user1',
          eventId: 'event2',
          participantStatus: 'cancelled' as const,
          registrationDate: new Date('2024-12-13T10:00:00Z'),
          createdAt: new Date('2024-12-13T10:00:00Z'),
          updatedAt: new Date('2024-12-13T10:00:00Z'),
        },
        {
          id: 'history5',
          userId: 'user2',
          eventId: 'event2',
          participantStatus: 'no_show' as const,
          registrationDate: new Date('2024-12-14T10:00:00Z'),
          createdAt: new Date('2024-12-14T10:00:00Z'),
          updatedAt: new Date('2024-12-14T10:00:00Z'),
        },
      ];

      mockGetAllHistory.mockResolvedValue(extendedVolunteerHistory);

      const result = await aggregateEventDetailsAndAssignments();

      expect(result.success).toBe(true);
      const event2 = result.data!.find(e => e.id === 'event2');
      
      expect(event2).toBeDefined();
      expect(event2!.assignedVolunteers).toHaveLength(3);
      
      const statuses = event2!.assignedVolunteers.map(v => v.participantStatus);
      expect(statuses).toContain('confirmed');
      expect(statuses).toContain('cancelled');
      expect(statuses).toContain('no_show');
    });
  });

  describe('getReportData', () => {
    it('routes to event aggregation when report type is events', async () => {
      const result = await getReportData('events');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result!.data!.length).toBeGreaterThan(0);
    });

    it('returns an error when requesting volunteer report data', async () => {
      const result = await getReportData('volunteers');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });
  });

  describe('generateEventReportCSV', () => {
    it('creates a CSV report with the expected headers', async () => {
      const result = await generateEventReportCSV();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.contentType).toBe('text/csv');
      expect(result.data!.fileName).toBe('events-report.csv');

      const csvString = result.data!.fileBuffer.toString('utf-8');
      expect(csvString).toContain('Event Name');
      expect(csvString).toContain('Community Cleanup');
      expect(csvString).toContain('Food Bank Distribution');
    });

    it('returns an error when aggregation fails', async () => {
      mockGetAllEvents.mockRejectedValueOnce(new Error('db failure'));

      const result = await generateEventReportCSV();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to aggregate event data');
    });
  });

  describe('generateEventReportPDF', () => {
    it('creates a PDF report buffer for events', async () => {
      const result = await generateEventReportPDF();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.contentType).toBe('application/pdf');
      expect(result.data!.fileName).toBe('events-report.pdf');
      expect(result.data!.fileBuffer.byteLength).toBeGreaterThan(0);
    });

    it('returns graceful error when aggregation fails', async () => {
      mockGetAllEvents.mockRejectedValueOnce(new Error('db failure'));

      const result = await generateEventReportPDF();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to aggregate event data');
    });

    it('renders fallback text when no events exist', async () => {
      mockGetAllEvents.mockResolvedValueOnce([]);

      const result = await generateEventReportPDF();
      expect(result.success).toBe(true);
      expect(result.data?.fileBuffer.byteLength).toBeGreaterThan(0);
    });

    it('handles events with no assigned volunteers', async () => {
      mockGetAllHistory.mockResolvedValueOnce([]);

      const result = await generateEventReportPDF();
      expect(result.success).toBe(true);
      expect(result.data?.fileBuffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe('volunteer report generators', () => {
    it('returns an error for volunteer PDF report generation', async () => {
      const result = await generateVolunteerReportPDF();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns an error for volunteer CSV report generation', async () => {
      const result = await generateVolunteerReportCSV();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
