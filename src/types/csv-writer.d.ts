declare module 'csv-writer' {
  interface CsvHeader {
    id: string;
    title: string;
  }

  interface ObjectCsvStringifierParams {
    header: CsvHeader[];
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
  }

  interface ObjectCsvStringifier {
    getHeaderString(): string;
    stringifyRecords(records: Record<string, unknown>[]): string;
  }

  export function createObjectCsvStringifier(
    params: ObjectCsvStringifierParams
  ): ObjectCsvStringifier;
}
