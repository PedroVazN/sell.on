declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    text(text: string, x: number, y: number): jsPDF;
    setFontSize(size: number): jsPDF;
    setTextColor(r: number, g?: number, b?: number): jsPDF;
    addPage(): jsPDF;
    save(filename: string): void;
    output(type: string): any;
    getNumberOfPages(): number;
    setPage(pageNumber: number): jsPDF;
    rect(x: number, y: number, width: number, height: number, style?: string): jsPDF;
    roundedRect(x: number, y: number, width: number, height: number, rx: number, ry: number, style?: string): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    setDrawColor(r: number, g?: number, b?: number): jsPDF;
    setFillColor(r: number, g?: number, b?: number): jsPDF;
    circle(x: number, y: number, radius: number, style?: string): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    getTextWidth(text: string): number;
    getFontSize(): number;
    splitTextToSize(text: string, maxWidth: number): string[];
    autoTable(options: any): jsPDF;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }
}
