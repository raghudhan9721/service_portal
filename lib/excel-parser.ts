import * as XLSX from 'xlsx';

export interface ParsedStudent {
  name: string;
  email: string;
  rollNo: string;
  department: string;
}

export function parseExcelFile(buffer: ArrayBuffer): ParsedStudent[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  
  if (jsonData.length < 2) return [];
  
  const headers = jsonData[0].map(h => 
    String(h).trim().toLowerCase().replace(/\s+/g, '_')
  );
  
  const students: ParsedStudent[] = [];
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    const student: Record<string, string> = {};
    headers.forEach((header, index) => {
      student[header] = String(row[index] || '').trim();
    });
    
    students.push({
      name: student.name || student.student_name || '',
      email: student.email || student.email_id || '',
      rollNo: student.roll_no || student.rollno || student.roll_number || '',
      department: student.department || student.dept || ''
    });
  }
  
  return students.filter(s => s.email); // Only include students with email
}

export function parseCSVFile(content: string): ParsedStudent[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => 
    h.trim().toLowerCase().replace(/\s+/g, '_')
  );
  
  const students: ParsedStudent[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const student: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      student[header] = values[index]?.trim() || '';
    });
    
    students.push({
      name: student.name || student.student_name || '',
      email: student.email || student.email_id || '',
      rollNo: student.roll_no || student.rollno || student.roll_number || '',
      department: student.department || student.dept || ''
    });
  }
  
  return students.filter(s => s.email);
}
