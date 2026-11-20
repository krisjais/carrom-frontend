'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Download, Loader2, Key } from 'lucide-react';
import { chessApi } from '@/lib/chessApi';

/**
 * Standard RFC-4180 compliant CSV line parser supporting quoted strings with commas and escaped quotes
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function ChessCsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [loading, setLoading] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const fileInputRef = useRef(null);

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
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processCsvFile(e.target.files[0]);
    }
  };

  const processCsvFile = (selectedFile) => {
    setErrorMsg('');
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      setErrorMsg('Please upload a valid CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

        if (lines.length < 2) {
          setErrorMsg('The uploaded CSV file contains no player data rows.');
          return;
        }

        const rawHeaders = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

        // Identify column indexes
        const findColIndex = (possibleNames) => {
          return rawHeaders.findIndex((h) =>
            possibleNames.some((p) => h === p || h.includes(p))
          );
        };

        const nameIdx = findColIndex(['fullname', 'name', 'playername', 'competitor', 'player', 'studentname']);
        const emailIdx = findColIndex(['email', 'emailaddress', 'mail', 'collegeemail', 'useremail']);
        const deptIdx = findColIndex(['classbatch', 'class', 'batch', 'department', 'dept', 'team', 'division', 'branch', 'year']);
        const phoneIdx = findColIndex(['phone', 'mobile', 'contact', 'whatsapp', 'phoneno', 'contactno']);
        const passIdx = findColIndex(['password', 'pass', 'pwd', 'playerpassword', 'pin', 'code']);

        const dataRows = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCsvLine(lines[i]);
          if (cells.length === 0 || cells.every((c) => !c)) continue;

          const fullName = nameIdx >= 0 ? cells[nameIdx] : (cells[0] || '');
          const rawEmail = emailIdx >= 0 ? cells[emailIdx] : (cells[1] || '');
          const rawDept = deptIdx >= 0 ? cells[deptIdx] : (cells[2] || '');
          const phone = phoneIdx >= 0 ? cells[phoneIdx] : '';
          const rawPassword = passIdx >= 0 && cells[passIdx] ? cells[passIdx].trim() : 'chess123';

          if (!fullName.trim()) continue;

          // Normalize department
          let department = 'IT Team';
          if (rawDept) {
            const dLower = rawDept.toLowerCase();
            if (dLower.includes('first') || dLower.includes('fe') || dLower.includes('1st') || dLower.includes('fy')) {
              department = 'First Year';
            } else if (dLower.includes('second') || dLower.includes('se') || dLower.includes('2nd') || dLower.includes('sy')) {
              department = 'Second Year';
            } else if (dLower.includes('it') || dLower.includes('tech') || dLower.includes('computer')) {
              department = 'IT Team';
            } else if (dLower.includes('mj') || dLower.includes('media') || dLower.includes('journalism')) {
              department = 'MJ Team';
            } else if (dLower.includes('hr') || dLower.includes('human')) {
              department = 'HR Team';
            } else if (dLower.includes('staff') || dLower.includes('faculty') || dLower.includes('teacher')) {
              department = 'Staff';
            }
          }

          const cleanName = fullName.replace(/\s+/g, ' ').trim();
          const cleanEmail = rawEmail.trim().toLowerCase() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}_${i}@chess.edu`;

          dataRows.push({
            id: i,
            fullName: cleanName,
            email: cleanEmail,
            department,
            phone: phone.trim(),
            password: rawPassword,
            plainPassword: rawPassword,
            status: autoApprove ? 'Approved' : 'Registered'
          });
        }

        if (dataRows.length === 0) {
          setErrorMsg('No valid student rows could be parsed. Please check headers (Full Name, Department, etc.).');
          return;
        }

        // Deduplication by email and name
        const seenEmails = new Set();
        const seenNames = new Set();
        const unique = [];
        let dupes = 0;

        for (const row of dataRows) {
          const emailKey = row.email.toLowerCase();
          const nameKey = row.fullName.toLowerCase();
          if (seenEmails.has(emailKey) || seenNames.has(nameKey)) {
            dupes++;
          } else {
            seenEmails.add(emailKey);
            seenNames.add(nameKey);
            unique.push(row);
          }
        }

        setAllRows(dataRows);
        setDuplicateCount(dupes);
        setParsedRows(unique);
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        setErrorMsg('Failed to read CSV. Please ensure standard comma-separated format.');
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleDownloadSample = () => {
    const csvContent =
      'Full Name,Email,Department,Phone,Password\n' +
      'Magnus Carlsen,magnus@example.com,First Year,9876543210,chess123\n' +
      'Hikaru Nakamura,hikaru@example.com,IT Team,9876543211,chess123\n' +
      'Viswanathan Anand,vishy@example.com,Second Year,9876543212,chess123\n' +
      'Gukesh D,gukesh@example.com,Staff,9876543213,chess123\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'chess_players_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = parsedRows.map((r) => ({
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        phone: r.phone,
        password: r.password,
        plainPassword: r.plainPassword || r.password
      }));

      const res = await chessApi.bulkImportPlayers(payload, autoApprove ? 'Approved' : 'Registered');

      if (res.success) {
        if (onImportSuccess) onImportSuccess(res.count || res.data?.importedCount || payload.length);
        onClose();
      } else {
        setErrorMsg(res.message || (res.errors && res.errors[0]) || 'Failed to complete import.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error during competitor import.');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setParsedRows([]);
    setAllRows([]);
    setErrorMsg('');
    setDuplicateCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
                Import Competitors from CSV
              </h3>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] font-mono">
                Upload a .csv file to batch register chess competitors with passwords.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-[#D5CFC5] dark:border-[#262624] hover:border-[#171715] dark:hover:border-[#FAF8F3] bg-[#EFEAE1]/30 dark:bg-[#1D1D1B]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3] shadow-xs">
                <UploadCloud className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171715] dark:text-[#FAF8F3]">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="text-xs text-[#77736B] dark:text-[#8E8E93] mt-1 font-mono">
                  Accepts .csv format (comma-separated with Full Name, Email, Department, Password)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#EFEAE1]/50 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold font-mono text-[#171715] dark:text-[#FAF8F3] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                      {parsedRows.length} valid rows found {duplicateCount > 0 && `(${duplicateCount} duplicates removed)`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetSelection}
                  className="text-xs text-rose-600 hover:underline font-mono ml-3 cursor-pointer shrink-0"
                >
                  Change CSV
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-[#D5CFC5] dark:border-[#262624] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[10px] uppercase font-mono text-[#77736B] dark:text-[#8E8E93] sticky top-0 border-b border-[#D5CFC5] dark:border-[#262624]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Full Name</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5CFC5]/40 dark:divide-[#262624]">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#EFEAE1]/30 dark:hover:bg-[#1D1D1B]/30 font-mono text-[11px]">
                        <td className="p-2.5 text-[#77736B]">{idx + 1}</td>
                        <td className="p-2.5 font-bold font-sans text-[#171715] dark:text-[#FAF8F3]">{row.fullName}</td>
                        <td className="p-2.5 text-[#5A3E28] dark:text-[#D4A94C]">{row.department}</td>
                        <td className="p-2.5 text-[#77736B] truncate max-w-[140px]">{row.email}</td>
                        <td className="p-2.5 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Key className="w-3 h-3 opacity-60" />
                          <span>{row.password}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p className="text-[10px] text-[#77736B] text-center font-mono">
                  + {parsedRows.length - 15} more rows ready to be imported
                </p>
              )}
            </div>
          )}

          {/* Settings & Options */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="rounded border-[#D5CFC5] accent-[#171715] dark:accent-[#FAF8F3] cursor-pointer"
              />
              <span className="text-xs font-mono text-[#171715] dark:text-[#FAF8F3]">
                Automatically approve imported competitors (Ready for match draw)
              </span>
            </label>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV Template</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#D5CFC5] dark:border-[#262624] pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#D5CFC5] dark:border-[#262624] text-xs font-mono uppercase text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Competitors` : 'Players'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
