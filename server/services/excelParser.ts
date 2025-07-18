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
      console.log(`Attempting to parse Excel file: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Excel file not found: ${filePath}`);
      }
      
      // Read the Excel file
      const workbook = XLSX.readFile(filePath, { cellStyles: true });
      console.log(`Workbook loaded with sheets: ${workbook.SheetNames.join(', ')}`);
      
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with defval option to handle empty cells
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false // This will convert values to strings, helping with color values
      });
      
      console.log(`Parsed ${jsonData.length} rows from Excel`);
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }
      
      // Get headers from first row
      const headers = jsonData[0];
      console.log('Excel headers:', headers);
      
      const reports: ExcelReportData[] = [];
      
      // Process each row (skip header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip empty rows
        if (!row || row.every((cell: any) => !cell && cell !== 0)) continue;
        
        // Convert color values to health status
        const convertColorToHealth = (colorValue: string): string => {
          if (!colorValue) return 'Green';
          const color = colorValue.toString().toLowerCase().trim();
          if (color.includes('red') || color === 'r') return 'Red';
          if (color.includes('yellow') || color.includes('amber') || color === 'y' || color === 'a') return 'Amber';
          if (color.includes('green') || color === 'g') return 'Green';
          // If it's already a valid status, return as is
          if (['Red', 'Amber', 'Green'].includes(colorValue)) return colorValue;
          return 'Green'; // Default fallback
        };
        
        const report: ExcelReportData = {
          projectName: this.getCellValue(row, headers, [
            'Project Name', 'Project', 'Name', 'Project Name:', 'Project:'
          ]) || `Project ${i}`,
          weekNumber: parseInt(this.getCellValue(row, headers, [
            'Week Number', 'Week', 'Week #', 'Week No', 'Wk'
          ]) || i.toString()),
          healthPreviousWeek: convertColorToHealth(this.getCellValue(row, headers, [
            'Health Previous Week', 'Previous Health', 'Last Week Health', 
            'Previous Week', 'Last Week', 'Prev Health'
          ])),
          healthCurrentWeek: convertColorToHealth(this.getCellValue(row, headers, [
            'Health Current Week', 'Current Health', 'This Week Health',
            'Current Week', 'This Week', 'Health Status', 'RAG Status', 'Status'
          ])),
          updateForCurrentWeek: this.getCellValue(row, headers, [
            'Update Current Week', 'Current Week Update', 'This Week Update',
            'Weekly Update', 'Update', 'Progress Update', 'Current Update'
          ]) || '',
          planForNextWeek: this.getCellValue(row, headers, [
            'Plan Next Week', 'Next Week Plan', 'Plan for Next Week',
            'Next Week', 'Future Plan', 'Upcoming Tasks'
          ]) || '',
          issuesChallenges: this.getCellValue(row, headers, [
            'Issues Challenges', 'Issues', 'Challenges', 'Issues/Challenges',
            'Problems', 'Risks', 'Blockers', 'Concerns'
          ]) || '',
          pathToGreen: this.getCellValue(row, headers, [
            'Path to Green', 'Path Green', 'Recovery Plan',
            'Mitigation', 'Action Plan', 'Resolution'
          ]) || '',
          resourcingStatus: this.getCellValue(row, headers, [
            'Resourcing Status', 'Resources', 'Resource Status',
            'Team Status', 'Staffing', 'Resource'
          ]) || '',
          clientEscalation: this.getCellValue(row, headers, [
            'Client Escalation', 'Escalation', 'Client Issues',
            'Client Status', 'Escalated', 'Client'
          ]) || 'None',
          tower: this.getCellValue(row, headers, [
            'Tower', 'Team Tower', 'Tower Assignment',
            'Team', 'Division', 'Unit'
          ]) || '',
          billingModel: this.getCellValue(row, headers, [
            'Billing Model', 'Billing', 'Contract Type',
            'Billing Type', 'Payment Model'
          ]) || '',
          fte: this.getCellValue(row, headers, [
            'FTE', 'Full Time Equivalent', 'Team Size',
            'Resources', 'Headcount'
          ]) || '',
          revenue: this.getCellValue(row, headers, [
            'Revenue', 'Contract Value', 'Project Value',
            'Value', 'Budget', 'Amount'
          ]) || ''
        };
        
        console.log(`Parsed project: ${report.projectName} - ${report.healthCurrentWeek}`);
        reports.push(report);
      }
      
      console.log(`Successfully parsed ${reports.length} project reports`);
      return reports;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static getCellValue(row: any[], headers: any[], possibleHeaders: string[]): string {
    for (const headerName of possibleHeaders) {
      const headerIndex = headers.findIndex((h: any) => {
        if (!h) return false;
        const headerStr = h.toString().toLowerCase().trim();
        const searchStr = headerName.toLowerCase().trim();
        return headerStr.includes(searchStr) || headerStr === searchStr;
      });
      
      if (headerIndex !== -1 && row[headerIndex] !== undefined && row[headerIndex] !== null) {
        const cellValue = row[headerIndex];
        if (cellValue === 0) return '0'; // Handle zero values properly
        return cellValue?.toString().trim() || '';
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