'use server';

import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';

// Normalizes DOB input string by stripping dividers (e.g. 15/08/2005 to 15082005)
function normalizeDOBString(dobStr: string): string {
  if (!dobStr) return '';
  return dobStr.trim().replace(/[\/\-\s\.]/g, '');
}

// Convert Excel dates (serials or strings) to DDMMYYYY
function parseExcelDOB(val: any): string | null {
  if (val === undefined || val === null) return null;

  // Case 1: Excel Serial Number (e.g., 37736 -> 25042003)
  if (typeof val === 'number') {
    try {
      // Excel serial date starts from 1899-12-30
      const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
      const dd = String(dateObj.getUTCDate()).padStart(2, '0');
      const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = String(dateObj.getUTCFullYear());
      return `${dd}${mm}${yyyy}`;
    } catch {
      return null;
    }
  }

  // Case 2: Date String
  const str = String(val).trim();
  if (!str) return null;

  // Clean characters
  const cleaned = normalizeDOBString(str);

  // If already DDMMYYYY (8 digits)
  if (/^\d{8}$/.test(cleaned)) {
    // If year starts with 19 or 20, let's verify if first 4 digits or last 4 digits represent the year.
    // Excel usually exports YYYYMMDD (e.g., 20030425) or the user types DDMMYYYY (e.g., 25042003).
    // Let's check which part is the year.
    const yearAtEnd = parseInt(cleaned.slice(4, 8));
    const yearAtStart = parseInt(cleaned.slice(0, 4));

    if (yearAtStart >= 1900 && yearAtStart <= 2100) {
      // It is YYYYMMDD -> convert to DDMMYYYY
      const yyyy = cleaned.slice(0, 4);
      const mm = cleaned.slice(4, 6);
      const dd = cleaned.slice(6, 8);
      return `${dd}${mm}${yyyy}`;
    }

    return cleaned; // Assumed DDMMYYYY
  }

  // Case 3: Parse standard date text like '2003-04-25' or '25 Apr 2003'
  const parsedDate = Date.parse(str);
  if (!isNaN(parsedDate)) {
    const dateObj = new Date(parsedDate);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = String(dateObj.getFullYear());
    return `${dd}${mm}${yyyy}`;
  }

  return null;
}

interface UploadError {
  row: number;
  regNo: string;
  name: string;
  reason: string;
}

export async function uploadStudentRoster(base64Data: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse sheet rows
    const rows = xlsx.utils.sheet_to_json<any>(sheet);

    if (rows.length === 0) {
      return { error: 'The uploaded Excel sheet contains no rows of data.' };
    }

    let addedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: UploadError[] = [];

    // Helper mapping functions to handle flexible case-insensitive column headers
    const findValue = (row: any, keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.includes(k.toLowerCase().trim())) {
          return row[k];
        }
      }
      return null;
    };

    // Pre-load all existing students to check for duplicates in memory (faster DB lookup)
    const existingStudents = await prisma.student.findMany({
      select: { regNo: true },
    });
    const existingRegNos = new Set(existingStudents.map((s) => s.regNo.toUpperCase()));
    const seenInFile = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed plus header row is row 1

      // Search matching headers
      const rawRegNo = findValue(row, ['regno', 'register number', 'reg no', 'registerno']);
      const rawName = findValue(row, ['name', 'student name', 'fullname', 'full name']);
      const rawDept = findValue(row, ['department', 'dept', 'course', 'branch']);
      const rawDob = findValue(row, ['dob', 'dateofbirth', 'date of birth', 'birthdate']);

      const regNo = rawRegNo ? String(rawRegNo).trim().toUpperCase() : '';
      const name = rawName ? String(rawName).trim() : '';
      const department = rawDept ? String(rawDept).trim() : '';

      // Validation checks
      if (!regNo) {
        failedCount++;
        errors.push({ row: rowNum, regNo: 'N/A', name: name || 'N/A', reason: 'Missing Register Number' });
        continue;
      }

      if (!name) {
        failedCount++;
        errors.push({ row: rowNum, regNo, name: 'N/A', reason: 'Missing Name' });
        continue;
      }

      if (!department) {
        failedCount++;
        errors.push({ row: rowNum, regNo, name, reason: 'Missing Department' });
        continue;
      }

      const dobParsed = parseExcelDOB(rawDob);
      if (!dobParsed || dobParsed.length !== 8) {
        failedCount++;
        errors.push({
          row: rowNum,
          regNo,
          name,
          reason: `Invalid DOB format (${rawDob || 'empty'}). Expected DDMMYYYY (e.g. 15082003)`,
        });
        continue;
      }

      // Check duplicate within the uploaded file itself
      if (seenInFile.has(regNo)) {
        skippedCount++;
        continue; // Silent skip for identical duplicates within same file
      }
      seenInFile.add(regNo);

      // Check duplicate against DB
      if (existingRegNos.has(regNo)) {
        skippedCount++;
        continue; // Skip existing student record
      }

      // Hash DOB password
      const hashedDob = bcrypt.hashSync(dobParsed, 10);

      // Insert Student
      await prisma.student.create({
        data: {
          regNo,
          name,
          department,
          dob: hashedDob,
        },
      });

      addedCount++;
    }

    revalidatePath('/admin/students');
    revalidatePath('/admin/dashboard');

    // Create error report sheet if any failures occurred
    let errorReportBase64 = '';
    if (errors.length > 0) {
      const errSheetData = errors.map((e) => ({
        'Row Number': e.row,
        'Register Number': e.regNo,
        'Student Name': e.name,
        'Error Reason': e.reason,
      }));
      const errWs = xlsx.utils.json_to_sheet(errSheetData);
      const errWb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(errWb, errWs, 'Errors');
      const errBuf = xlsx.write(errWb, { type: 'buffer', bookType: 'xlsx' });
      errorReportBase64 = errBuf.toString('base64');
    }

    return {
      success: true,
      summary: {
        processed: rows.length,
        added: addedCount,
        skipped: skippedCount,
        failed: failedCount,
      },
      errors,
      errorReportBase64,
    };
  } catch (error: any) {
    console.error('Roster upload error:', error);
    return { error: 'Failed to process Excel sheet. Check file format.' };
  }
}
