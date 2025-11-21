'use server';

import path from 'node:path';

import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';

import { getAllEvents } from '@/app/lib/dal/eventDetails';
import { getAllHistory } from '@/app/lib/dal/volunteerHistory';
import { prisma } from '@/app/lib/db';
import type { ParticipantStatus } from '@/generated/prisma';

const DEFAULT_PDF_FONT_PATH =
  process.env.DEFAULT_PDF_FONT_PATH ??
  path.join(
    process.cwd(),
    'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf'
  );

export interface VolunteerAssignment {
  volunteerId: string;
  volunteerName: string;
  email: string;
  participantStatus: ParticipantStatus;
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

export interface GeneratedReport {
  fileBuffer: Buffer;
  contentType: string;
  fileName: string;
}

export type ReportType = 'events' | 'volunteers';
export type ReportFormat = 'PDF' | 'CSV';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const VOLUNTEER_REPORT_UNAVAILABLE_ERROR =
  'Volunteer participation report is not available yet.';

export async function aggregateEventDetailsAndAssignments(): Promise<ServiceResult<EventWithAssignments[]>> {
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

export async function getReportData(
  reportType: ReportType
): Promise<ServiceResult<EventWithAssignments[]>> {
  if (reportType === 'events') {
    return aggregateEventDetailsAndAssignments();
  }

  return {
    success: false,
    error: VOLUNTEER_REPORT_UNAVAILABLE_ERROR,
  };
}

function formatDateValue(date: Date) {
  return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

async function createPdfBuffer(render: (doc: PDFDocument) => void) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 50,
    font: DEFAULT_PDF_FONT_PATH,
  });
  const chunks: Buffer[] = [];

  try {
    doc.registerFont('app-default', DEFAULT_PDF_FONT_PATH);
    doc.font('app-default');
  } catch (error) {
    console.warn('Unable to register custom PDF font, falling back to default.', error);
  }

  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', chunk => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  render(doc);
  doc.end();

  return bufferPromise;
}

export async function generateEventReportPDF(): Promise<ServiceResult<GeneratedReport>> {
  try {
    const aggregation = await getReportData('events');

    if (!aggregation.success || !aggregation.data) {
      return {
        success: false,
        error: aggregation.error || 'Unable to load event data for the report.',
      };
    }

    const fileBuffer = await createPdfBuffer(doc => {
      const events = aggregation.data;

      doc.fontSize(20).text('Event Participation Report', { align: 'center' });
      doc.moveDown();

      if (!events || events.length === 0) {
        doc.fontSize(12).text('No events available.');
        return;
      }

      events.forEach(event => {
        doc
          .moveDown(0.5)
          .fontSize(14)
          .fillColor('#111827')
          .text(event.eventName, { underline: true });

        doc
          .moveDown(0.25)
          .fontSize(11)
          .fillColor('#374151')
          .text(`Date: ${formatDateValue(event.eventDate)}`)
          .text(`Description: ${event.description || 'N/A'}`)
          .text(`Location: ${event.location}`)
          .text(`Urgency: ${event.urgency}`)
          .text(`Required Skills: ${event.requiredSkills.join(', ') || 'N/A'}`)
          .text(`Assigned Volunteers: ${event.assignedVolunteers.length}`);

        if (event.assignedVolunteers.length > 0) {
          doc.moveDown(0.4).fontSize(11).fillColor('#1f2937').text('Volunteers:');
          event.assignedVolunteers.forEach(volunteer => {
            doc
              .fontSize(10)
              .fillColor('#4b5563')
              .text(
                `• ${volunteer.volunteerName} (${volunteer.email}) - ${volunteer.participantStatus} on ${formatDateValue(volunteer.registrationDate)}`
              );
          });
        } else {
          doc.moveDown(0.25).fontSize(10).fillColor('#6b7280').text('No volunteers assigned.');
        }

        doc
          .moveDown()
          .fillColor('#d1d5db')
          .text('--------------------------------------------');
      });
    });

    return {
      success: true,
      data: {
        fileBuffer,
        contentType: 'application/pdf',
        fileName: 'events-report.pdf',
      },
    };
  } catch (error) {
    console.error('Error generating event PDF report:', error);
    return { success: false, error: 'Failed to generate PDF report.' };
  }
}

export async function generateEventReportCSV(): Promise<ServiceResult<GeneratedReport>> {
  try {
    const aggregation = await getReportData('events');

    if (!aggregation.success || !aggregation.data) {
      return {
        success: false,
        error: aggregation.error || 'Unable to load event data for the report.',
      };
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'eventName', title: 'Event Name' },
        { id: 'eventDate', title: 'Event Date' },
        { id: 'eventDescription', title: 'Description' },
        { id: 'location', title: 'Location' },
        { id: 'urgency', title: 'Urgency' },
        { id: 'requiredSkills', title: 'Required Skills' },
        { id: 'volunteerSummary', title: 'Volunteer Assignments' },
      ],
      alwaysQuote: true,
    });

    const records = aggregation.data.map(event => {
      const volunteerSummary =
        event.assignedVolunteers.length === 0
          ? 'No volunteers assigned'
          : event.assignedVolunteers
              .map(volunteer => {
                const registration = formatDateValue(volunteer.registrationDate);
                return `${volunteer.volunteerName} (${volunteer.email}) - ${volunteer.participantStatus} on ${registration}`;
              })
              .join('; ');

      return {
        eventName: event.eventName,
        eventDate: formatDateValue(event.eventDate),
        eventDescription: event.description,
        location: event.location,
        urgency: event.urgency,
        requiredSkills: event.requiredSkills.length
          ? event.requiredSkills.join('; ')
          : 'N/A',
        volunteerSummary,
      };
    });

    const csvContent =
      csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    return {
      success: true,
      data: {
        fileBuffer: Buffer.from(csvContent, 'utf-8'),
        contentType: 'text/csv',
        fileName: 'events-report.csv',
      },
    };
  } catch (error) {
    console.error('Error generating event CSV report:', error);
    return { success: false, error: 'Failed to generate CSV report.' };
  }
}

export async function generateVolunteerReportPDF(): Promise<ServiceResult<GeneratedReport>> {
  return {
    success: false,
    error: VOLUNTEER_REPORT_UNAVAILABLE_ERROR,
  };
}

export async function generateVolunteerReportCSV(): Promise<ServiceResult<GeneratedReport>> {
  return {
    success: false,
    error: VOLUNTEER_REPORT_UNAVAILABLE_ERROR,
  };
}
