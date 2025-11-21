declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    font?: string;
  }

  type PDFTextOptions = {
    align?: 'left' | 'center' | 'right' | 'justify';
    underline?: boolean;
  };

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    registerFont(name: string, src: string | Buffer): this;
    font(name: string, size?: number): this;
    fontSize(size: number): this;
    text(text: string, options?: PDFTextOptions): this;
    moveDown(lines?: number): this;
    fillColor(color: string): this;
    on(event: 'data', handler: (chunk: Buffer) => void): this;
    on(event: 'end', handler: () => void): this;
    on(event: 'error', handler: (err: Error) => void): this;
    end(): this;
  }

  export default PDFDocument;
}
