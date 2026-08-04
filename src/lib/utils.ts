// Utility helpers (no 'use server' - safe to import anywhere)

// Normalizes DOB input string by stripping dividers (e.g., 15/08/2005 or 15-08-2005 to 15082005)
export function normalizeDOB(dobStr: string): string {
  if (!dobStr) return '';
  return dobStr.trim().replace(/[\/\-\s\.]/g, '');
}
