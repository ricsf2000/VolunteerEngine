import { NextRequest } from 'next/server';

import { GET } from '@/app/api/reports/route';
import {
  generateEventReportCSV,
  generateEventReportPDF,
  generateVolunteerReportCSV,
  generateVolunteerReportPDF,
} from '@/app/lib/services/reportService';

jest.mock('@/app/lib/services/reportService', () => ({
  generateEventReportCSV: jest.fn(),
  generateEventReportPDF: jest.fn(),
  generateVolunteerReportCSV: jest.fn(),
  generateVolunteerReportPDF: jest.fn(),
}));

const mockEventPDF = generateEventReportPDF as jest.Mock;
const mockEventCSV = generateEventReportCSV as jest.Mock;
const mockVolunteerPDF = generateVolunteerReportPDF as jest.Mock;
const mockVolunteerCSV = generateVolunteerReportCSV as jest.Mock;

function makeRequest(type?: string, format?: string) {
  const url = new URL('http://localhost/api/reports');
  if (type) url.searchParams.set('type', type);
  if (format) url.searchParams.set('format', format);

  return new NextRequest(url.toString());
}

describe('GET /api/reports', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockEventPDF.mockResolvedValue({
      success: true,
      data: {
        fileBuffer: Buffer.from('pdf'),
        contentType: 'application/pdf',
        fileName: 'events-report.pdf',
      },
    });

    mockEventCSV.mockResolvedValue({
      success: true,
      data: {
        fileBuffer: Buffer.from('csv'),
        contentType: 'text/csv',
        fileName: 'events-report.csv',
      },
    });

    mockVolunteerPDF.mockResolvedValue({
      success: true,
      data: {
        fileBuffer: Buffer.from('vol-pdf'),
        contentType: 'application/pdf',
        fileName: 'volunteers-report.pdf',
      },
    });

    mockVolunteerCSV.mockResolvedValue({
      success: true,
      data: {
        fileBuffer: Buffer.from('vol-csv'),
        contentType: 'text/csv',
        fileName: 'volunteers-report.csv',
      },
    });
  });

  it('responds with file contents when generator succeeds', async () => {
    const response = await GET(makeRequest('events', 'PDF'));

    expect(mockEventPDF).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('events-report.pdf');
    const body = Buffer.from(await response.arrayBuffer()).toString('utf-8');
    expect(body).toBe('pdf');
  });

  it('supports volunteers CSV generation and normalizes params', async () => {
    const response = await GET(makeRequest('Volunteers', 'csv'));

    expect(mockVolunteerCSV).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('volunteers-report.csv');
  });

  it('validates missing query parameters', async () => {
    const response = await GET(makeRequest(undefined, 'PDF'));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain('"type"');
  });

  it('validates invalid report type/format', async () => {
    const resType = await GET(makeRequest('unknown', 'PDF'));
    expect(resType.status).toBe(400);

    const resFormat = await GET(makeRequest('events', 'DOC'));
    expect(resFormat.status).toBe(400);
  });

  it('propagates generator errors', async () => {
    mockEventCSV.mockResolvedValue({ success: false, error: 'boom' });

    const response = await GET(makeRequest('events', 'CSV'));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('boom');
  });
});
