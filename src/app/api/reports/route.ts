import { NextRequest, NextResponse } from 'next/server';

import {
  generateEventReportCSV,
  generateEventReportPDF,
  generateVolunteerReportCSV,
  generateVolunteerReportPDF,
  GeneratedReport,
  ReportFormat,
  ReportType,
  ServiceResult,
} from '@/app/lib/services/reportService';

type Generator = () => Promise<ServiceResult<GeneratedReport>>;

const generatorMap: Record<ReportType, Record<ReportFormat, Generator>> = {
  events: {
    PDF: generateEventReportPDF,
    CSV: generateEventReportCSV,
  },
  volunteers: {
    PDF: generateVolunteerReportPDF,
    CSV: generateVolunteerReportCSV,
  },
};

function isReportType(value: string): value is ReportType {
  return value === 'events' || value === 'volunteers';
}

function isReportFormat(value: string): value is ReportFormat {
  return value === 'PDF' || value === 'CSV';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const formatParam = searchParams.get('format');

  if (!typeParam || !formatParam) {
    return NextResponse.json(
      { error: 'Query parameters "type" and "format" are required.' },
      { status: 400 }
    );
  }

  const normalizedType = typeParam.toLowerCase();
  const normalizedFormat = formatParam.toUpperCase();

  if (!isReportType(normalizedType)) {
    return NextResponse.json(
      { error: 'Invalid report type. Expected "events" or "volunteers".' },
      { status: 400 }
    );
  }

  if (!isReportFormat(normalizedFormat)) {
    return NextResponse.json(
      { error: 'Invalid format. Expected "PDF" or "CSV".' },
      { status: 400 }
    );
  }

  const generator = generatorMap[normalizedType][normalizedFormat];
  const result = await generator();

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error || 'Unable to generate the requested report.' },
      { status: 400 }
    );
  }

  const { fileBuffer, contentType, fileName } = result.data;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
