'use client';

import { useState, useTransition } from 'react';
import { uploadStudentRoster } from '@/app/actions/students';
import { useRouter } from 'next/navigation';

interface StudentRow {
  id: string;
  regNo: string;
  name: string;
  department: string;
}

interface UploadSummary {
  processed: number;
  added: number;
  skipped: number;
  failed: number;
}

interface UploadError {
  row: number;
  regNo: string;
  name: string;
  reason: string;
}

export default function StudentsClient({
  initialStudents,
  totalCount,
}: {
  initialStudents: StudentRow[];
  totalCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [errorReportBase64, setErrorReportBase64] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setSummary(null);
      setErrors([]);
      setErrorReportBase64('');
      setErrorMessage('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setErrorMessage('');
    setSummary(null);
    setErrors([]);
    setErrorReportBase64('');

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      startTransition(async () => {
        const res = await uploadStudentRoster(base64);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success && res.summary) {
          setSummary(res.summary);
          if (res.errors) setErrors(res.errors);
          if (res.errorReportBase64) setErrorReportBase64(res.errorReportBase64);
          setFile(null);
          const fileInput = document.getElementById('excelFile') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          router.refresh();
        }
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const downloadErrorReport = () => {
    if (!errorReportBase64) return;
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${errorReportBase64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = `student_upload_errors_${Date.now()}.xlsx`;
    downloadLink.click();
  };

  // Client side filtering for visual roster list
  const filteredStudents = initialStudents.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.regNo.toLowerCase().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Upload & Instructions Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Upload Form */}
        <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <h3 className="text-lg font-bold text-slate-100">Upload Student Roster</h3>
          
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">1. Template Format</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Ensure columns match: <strong>RegNo, Name, Department, DOB</strong> exactly. DOB must be valid date or DDMMYYYY text.
            </p>
            <a
              href="/api/admin/template"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Excel Template
            </a>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="excelFile" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Excel File (.xlsx)
              </label>
              <input
                id="excelFile"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={isPending}
                required
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-850 file:text-amber-400 hover:file:bg-slate-800 file:cursor-pointer disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !file}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Processing...' : 'Upload & Parse Roster'}
            </button>
          </form>
        </div>

        {/* Right: Validation Summary & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}

          {summary && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-slate-100 text-lg">Upload validation summary</h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Processed</span>
                  <strong className="text-xl text-white block mt-1">{summary.processed}</strong>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-wider block">Added</span>
                  <strong className="text-xl text-emerald-400 block mt-1">{summary.added}</strong>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Skipped</span>
                  <strong className="text-xl text-slate-400 block mt-1">{summary.skipped}</strong>
                </div>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                  <span className="text-red-500/80 text-[10px] font-bold uppercase tracking-wider block">Failed</span>
                  <strong className="text-xl text-red-400 block mt-1">{summary.failed}</strong>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                      Lines containing validation errors ({errors.length})
                    </span>
                    <button
                      onClick={downloadErrorReport}
                      className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Download Error Report (.xlsx)
                    </button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-850 rounded-xl divide-y divide-slate-900">
                    {errors.map((err, idx) => (
                      <div key={idx} className="p-3 text-xs flex justify-between gap-4">
                        <span className="text-slate-500">Row {err.row}</span>
                        <span className="text-slate-300 font-medium">{err.regNo} ({err.name})</span>
                        <span className="text-red-400/90 text-right">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Roster list search & verification */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Student Union Voter Roster</h3>
            <p className="text-xs text-slate-500">
              Total uploaded students in database: <strong className="text-slate-300">{totalCount}</strong>
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by RegNo, Name, or Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 text-sm w-full sm:max-w-xs"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No matching student records found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold tracking-wide">
                  <th className="p-3">Register Number</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredStudents.slice(0, 100).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/30">
                    <td className="p-3 font-semibold text-slate-100">{student.regNo}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3 text-slate-400">{student.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length > 100 && (
              <div className="p-3 text-center text-slate-500 border-t border-slate-850">
                Showing first 100 records only. Refine your search to find specific students.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
