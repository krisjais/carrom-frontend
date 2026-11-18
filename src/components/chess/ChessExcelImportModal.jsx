'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, Download, Loader2 } from 'lucide-react';
import { chessApi } from '@/lib/chessApi';

export function ChessExcelImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [allRows, setAllRows] = useState([]);
  const [deduplicate, setDeduplicate] = useState(true);
  const [duplicateCount, setDuplicateCount] = useState(0);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setErrorMsg('');
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExts.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('The uploaded sheet contains no data rows.');
          return;
        }

        // Map flexible column names
        const normalized = rawJson.map((row, idx) => {
          const keys = Object.keys(row);

          const findVal = (possibleNames) => {
            const matchedKey = keys.find((k) => {
              const sanitized = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              return possibleNames.some((p) => {
                const cleanP = p.toLowerCase().replace(/[^a-z0-9]/g, '');
                return sanitized === cleanP || sanitized.includes(cleanP);
              });
            });
            return matchedKey ? String(row[matchedKey]).trim() : '';
          };

          const fullName = findVal(['fullname', 'name', 'playername', 'competitor', 'player', 'studentname']);
          const rawEmail = findVal(['email', 'emailaddress', 'mail', 'collegeemail', 'useremail']);
          const rawDept = findVal(['classbatch', 'class', 'batch', 'department', 'dept', 'team', 'division', 'branch', 'year']);
          const phone = findVal(['phone', 'mobile', 'contact', 'whatsapp', 'phoneno', 'contactno']);
          const category = findVal(['chesscategory', 'category', 'gender', 'section']);
          const experience = findVal(['chessexperience', 'experience', 'skill', 'level']);

          // Department normalization (ensuring compatibility with tournament backend)
          let department = 'IT Team';
          if (rawDept) {
            const dLower = rawDept.toLowerCase();
            if (dLower.includes('first') || dLower.includes('fe') || dLower.includes('1st') || dLower.includes('fy')) {
              department = 'First Year';
            } else if (dLower.includes('second') || dLower.includes('se') || dLower.includes('2nd') || dLower.includes('sy')) {
              department = 'Second Year';
            } else if (dLower.includes('staff') || dLower.includes('faculty') || dLower.includes('teacher') || dLower.includes('prof')) {
              department = 'IT Team';
            } else if (dLower.includes('it') || dLower.includes('tech') || dLower.includes('comp') || dLower.includes('cs')) {
              department = 'IT Team';
            } else if (dLower.includes('mj') || dLower.includes('media')) {
              department = 'MJ Team';
            } else if (dLower.includes('hr') || dLower.includes('human')) {
              department = 'HR Team';
            } else {
              department = 'IT Team';
            }
          }

          // Generate synthetic email if missing from the form sheet
          const cleanSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isAutoEmail = !rawEmail;
          const email = rawEmail || `${cleanSlug || 'player'}_${idx + 1}@tournament.local`;

          return {
            fullName,
            rawEmail,
            email,
            isAutoEmail,
            rawDept: rawDept || department,
            department,
            phone,
            category,
            experience
          };
        });

        // Filter rows with valid names
        const validRows = normalized.filter((r) => r.fullName && r.fullName.length > 0);

        if (validRows.length === 0) {
          setErrorMsg('Could not find any rows with player names. Ensure your sheet has columns like "Full Name", "Email", or "Class/Batch".');
          return;
        }

        // Detect duplicates
        const seenNames = new Set();
        let dups = 0;
        validRows.forEach((r) => {
          const key = r.fullName.toLowerCase().trim();
          if (seenNames.has(key)) dups++;
          seenNames.add(key);
        });

        setDuplicateCount(dups);
        setAllRows(validRows);

        // Apply deduplication initially if enabled
        if (deduplicate) {
          const map = new Map();
          validRows.forEach((r) => map.set(r.fullName.toLowerCase().trim(), r));
          setParsedRows(Array.from(map.values()));
        } else {
          setParsedRows(validRows);
        }
      } catch (err) {
        console.error('Error parsing sheet:', err);
        setErrorMsg('Failed to parse Excel/CSV file: ' + err.message);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleToggleDeduplicate = (checked) => {
    setDeduplicate(checked);
    if (allRows.length === 0) return;
    if (checked) {
      const map = new Map();
      allRows.forEach((r) => map.set(r.fullName.toLowerCase().trim(), r));
      setParsedRows(Array.from(map.values()));
    } else {
      setParsedRows(allRows);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      { 'Full Name': 'Magnus Carlsen', 'Email': 'magnus@championship.edu', 'Department': 'IT Team', 'Chess Category': 'BOYS SINGLE' },
      { 'Full Name': 'Hikaru Nakamura', 'Email': 'hikaru@championship.edu', 'Department': 'First Year', 'Chess Category': 'BOYS SINGLE' },
      { 'Full Name': 'Viswanathan Anand', 'Email': 'vishy@championship.edu', 'Department': 'Second Year', 'Chess Category': 'BOYS SINGLE' },
      { 'Full Name': 'Judit Polgar', 'Email': 'judit@championship.edu', 'Department': 'MJ Team', 'Chess Category': 'GIRLS SINGLE' },
      { 'Full Name': 'Ding Liren', 'Email': 'ding@championship.edu', 'Department': 'HR Team', 'Chess Category': 'BOYS SINGLE' }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    XLSX.writeFile(wb, 'Chess_Registrations_Sample.xlsx');
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await chessApi.bulkImportPlayers(parsedRows, autoApprove ? 'Approved' : 'Registered');
      if (res.success) {
        if (onImportSuccess) {
          onImportSuccess(res.count);
        }
        handleClose();
      } else {
        setErrorMsg(res.errors?.length > 0 ? res.errors.slice(0, 3).join('; ') : 'Failed to import players.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setAllRows([]);
    setParsedRows([]);
    setDuplicateCount(0);
    setErrorMsg('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736B] dark:text-[#8E8E93] font-semibold block">
              Batch Competitor Registration
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] mt-0.5">
              Import from Excel / CSV
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-[#EFEAE1] dark:hover:bg-[#222220] text-[#77736B] dark:text-[#8E8E93] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3.5 text-red-700 dark:text-red-400 text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#171715] dark:border-[#FAF8F3] bg-[#EFEAE1]/70 dark:bg-[#1F1F1D]'
                : 'border-[#D5CFC5] dark:border-[#2E2E2B] hover:border-[#171715] dark:hover:border-[#FAF8F3] bg-[#EFEAE1]/30 dark:bg-[#1B1B19]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#2E2E2B] flex items-center justify-center mx-auto mb-3 text-[#171715] dark:text-[#FAF8F3]">
              <UploadCloud className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
              Drag & Drop your Excel or CSV file
            </h3>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] mt-1">
              Supports .xlsx, .xls, and .csv formats
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-mono text-xs font-semibold uppercase tracking-wider shadow-xs"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="bg-[#EFEAE1]/50 dark:bg-[#1B1B19] border border-[#D5CFC5] dark:border-[#282826] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-[#171715] dark:text-[#FAF8F3]">
                  {file.name}
                </p>
                <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                  {parsedRows.length} valid competitor rows found
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setParsedRows([]);
              }}
              className="text-xs font-mono uppercase text-[#77736B] hover:text-red-600 underline"
            >
              Change File
            </button>
          </div>
        )}

        {/* Preview of Parsed Rows */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3]">
                  Preview Rows ({parsedRows.length} Total)
                </span>
                {duplicateCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold">
                    {duplicateCount} duplicate submission{duplicateCount > 1 ? 's' : ''} {deduplicate ? 'filtered' : 'detected'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {duplicateCount > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={deduplicate}
                      onChange={(e) => handleToggleDeduplicate(e.target.checked)}
                      className="rounded border-[#D5CFC5] accent-[#171715] dark:accent-[#FAF8F3]"
                    />
                    <span className="text-[#171715] dark:text-[#FAF8F3]">Filter duplicates</span>
                  </label>
                )}

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="rounded border-[#D5CFC5] accent-[#171715] dark:accent-[#FAF8F3]"
                  />
                  <span className="text-[#171715] dark:text-[#FAF8F3] font-medium">Auto-approve on import</span>
                </label>
              </div>
            </div>

            <div className="border border-[#D5CFC5]/80 dark:border-[#262624] rounded-xl overflow-hidden bg-[#FAF8F3] dark:bg-[#151514] max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="sticky top-0 bg-[#EFEAE1] dark:bg-[#1E1E1C] z-10">
                  <tr className="border-b border-[#D5CFC5]/80 dark:border-[#262624] font-mono text-[10px] text-[#77736B] dark:text-[#8E8E93] uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Department / Class</th>
                    <th className="py-2.5 px-3">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5CFC5]/50 dark:divide-[#262624]">
                  {parsedRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-[#EFEAE1]/40 dark:hover:bg-[#1B1B19]">
                      <td className="py-2 px-3 font-mono text-[10px] text-[#77736B]">{i + 1}</td>
                      <td className="py-2 px-3 font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">{r.fullName}</td>
                      <td className="py-2 px-3 font-mono text-xs">
                        {r.isAutoEmail ? (
                          <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-[11px]">
                            Auto-generated
                          </span>
                        ) : (
                          <span className="text-[#77736B] dark:text-[#8E8E93]">{r.email}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#171715] dark:text-[#FAF8F3]">
                        {r.rawDept ? `${r.rawDept}` : r.department}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#77736B] dark:text-[#8E8E93]">
                        {r.category || '—'}
                      </td>
                    </tr>
                  ))}
                  {parsedRows.length > 10 && (
                    <tr>
                      <td colSpan={5} className="py-2 px-3 text-center font-mono text-[11px] text-[#77736B] dark:text-[#8E8E93] bg-[#EFEAE1]/20">
                        ... and {parsedRows.length - 10} more rows ready to import
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D5CFC5]/70 dark:border-[#262624]">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Template</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#282826] text-xs font-mono uppercase tracking-wider hover:bg-[#EFEAE1] dark:hover:bg-[#1E1E1C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || parsedRows.length === 0}
              onClick={handleExecuteImport}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white disabled:opacity-50 text-[#FAF8F3] dark:text-[#0D0D0D] px-6 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import {parsedRows.length} Players</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
