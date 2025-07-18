import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface ExcelReportData {
  projectName: string;
  weekNumber: number;
  healthPreviousWeek: string;
  healthCurrentWeek: string;
  updateForCurrentWeek: string;
  planForNextWeek: string;
  issuesChallenges: string;
  pathToGreen: string;
  resourcingStatus: string;
  clientEscalation: string;
  tower: string;
  billingModel: string;
  fte: string;
  revenue: string;
}

export class ExcelParser {
  static parseWeeklyStatusReport(filePath: string): ExcelReportData[] {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }
      
      // Get headers from first row
      const headers = jsonData[0];
      const reports: ExcelReportData[] = [];
      
      // Process each row (skip header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip empty rows
        if (!row || row.every((cell: any) => !cell)) continue;
        
        const report: ExcelReportData = {
          projectName: this.getCellValue(row, headers, ['Project Name', 'Project', 'Name']) || '',
          weekNumber: parseInt(this.getCellValue(row, headers, ['Week Number', 'Week', 'Week #']) || '0'),
          healthPreviousWeek: this.getCellValue(row, headers, ['Health Previous Week', 'Previous Health', 'Last Week Health']) || 'Green',
          healthCurrentWeek: this.getCellValue(row, headers, ['Health Current Week', 'Current Health', 'This Week Health']) || 'Green',
          updateForCurrentWeek: this.getCellValue(row, headers, ['Update Current Week', 'Current Week Update', 'This Week Update']) || '',
          planForNextWeek: this.getCellValue(row, headers, ['Plan Next Week', 'Next Week Plan', 'Plan for Next Week']) || '',
          issuesChallenges: this.getCellValue(row, headers, ['Issues Challenges', 'Issues', 'Challenges', 'Issues/Challenges']) || '',
          pathToGreen: this.getCellValue(row, headers, ['Path to Green', 'Path Green', 'Recovery Plan']) || '',
          resourcingStatus: this.getCellValue(row, headers, ['Resourcing Status', 'Resources', 'Resource Status']) || '',
          clientEscalation: this.getCellValue(row, headers, ['Client Escalation', 'Escalation', 'Client Issues']) || 'None',
          tower: this.getCellValue(row, headers, ['Tower', 'Team Tower', 'Tower Assignment']) || '',
          billingModel: this.getCellValue(row, headers, ['Billing Model', 'Billing', 'Contract Type']) || '',
          fte: this.getCellValue(row, headers, ['FTE', 'Full Time Equivalent', 'Team Size']) || '',
          revenue: this.getCellValue(row, headers, ['Revenue', 'Contract Value', 'Project Value']) || ''
        };
        
        reports.push(report);
      }
      
      return reports;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static getCellValue(row: any[], headers: any[], possibleHeaders: string[]): string {
    for (const headerName of possibleHeaders) {
      const headerIndex = headers.findIndex((h: any) => 
        h && h.toString().toLowerCase().includes(headerName.toLowerCase())
      );
      
      if (headerIndex !== -1 && row[headerIndex] !== undefined) {
        return row[headerIndex]?.toString() || '';
      }
    }
    return '';
  }
  
  static getExcelFiles(): string[] {
    const excelDir = path.join(process.cwd(), 'public', 'excels');
    
    if (!fs.existsSync(excelDir)) {
      return [];
    }
    
    return fs.readdirSync(excelDir)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => path.join(excelDir, file));
  }
}