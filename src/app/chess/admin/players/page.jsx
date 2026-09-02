'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ConfirmationModal } from '@/components/chess/ConfirmationModal';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  MinusSquare,
  AlertCircle,
  Loader2,
  X,
  Upload,
  FileSpreadsheet,
  Download,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function ChessAdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Custom UI Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: true,
    loading: false,
    onConfirm: null
  });

  // CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function loadPlayers() {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    setLoading(true);
    try {
      const res = await chessApi.getAdminPlayers();
      if (res.success) {
        setPlayers(res.data || []);
      }
    } catch (err) {
      console.error('Error loading admin players:', err);
      showToast(err.message || 'Failed to load players', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, [router]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await chessApi.updateRegistrationStatus(id, status);
      if (res.success) {
        showToast(`Player marked as ${status}`);
        loadPlayers();
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  // Single Player Delete with UI Modal
  const handleDelete = (id, playerName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Player',
      message: `Are you sure you want to permanently delete player ${playerName ? `"${playerName}"` : ''}? This will remove all their match pairings and records.`,
      confirmText: 'Delete Player',
      cancelText: 'Keep Player',
      isDestructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await chessApi.deletePlayer(id);
          if (res.success) {
            showToast('Player deleted successfully');
            setSelectedIds(prev => prev.filter(item => item !== id));
            loadPlayers();
          }
        } catch (err) {
          showToast(err.message || 'Error deleting player', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // Bulk Operations
  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await chessApi.bulkUpdateRegistrationStatus(selectedIds, status);
      if (res.success) {
        showToast(`Updated ${selectedIds.length} player(s) to ${status}`);
        setSelectedIds([]);
        loadPlayers();
      }
    } catch (err) {
      showToast(err.message || 'Error executing bulk status update', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete with UI Modal
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete Players',
      message: `Are you sure you want to delete ${selectedIds.length} selected player(s)? This will permanently remove them from the roster. This action cannot be undone.`,
      confirmText: `Delete ${selectedIds.length} Players`,
      cancelText: 'Cancel',
      isDestructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await chessApi.bulkDeletePlayers(selectedIds);
          if (res.success) {
            showToast(`Successfully deleted ${selectedIds.length} player(s)`);
            setSelectedIds([]);
            loadPlayers();
          }
        } catch (err) {
          showToast(err.message || 'Error deleting selected players', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // CSV Parsing & Handling
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = [];
      let inQuote = false;
      let currVal = '';
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(currVal.trim().replace(/^["']|["']$/g, ''));
          currVal = '';
        } else {
          currVal += char;
        }
      }
      values.push(currVal.trim().replace(/^["']|["']$/g, ''));

      if (values.every(v => !v)) continue;

      const rowObj = {
        fullName: '',
        email: '',
        department: 'IT Team',
        phone: '',
        status: 'Registered'
      };

      headers.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h.includes('name') || h === 'player') rowObj.fullName = val;
        else if (h.includes('mail')) rowObj.email = val;
        else if (h.includes('dept') || h.includes('team') || h.includes('branch')) rowObj.department = val;
        else if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) rowObj.phone = val;
      });

      // Fallbacks if columns weren't named in header
      if (!rowObj.fullName && values[0]) rowObj.fullName = values[0];
      if (!rowObj.email && values[1] && values[1].includes('@')) rowObj.email = values[1];
      if (!rowObj.department && values[2]) rowObj.department = values[2];

      if (rowObj.fullName) {
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      showToast('Please upload a valid .csv file', 'error');
      return;
    }

    setImportFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result || '';
        const rows = parseCSV(text);
        if (rows.length === 0) {
          showToast('No valid player rows found in CSV', 'error');
        }
        setParsedRows(rows);
      } catch (err) {
        showToast('Failed to parse CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const executeImport = async () => {
    if (parsedRows.length === 0) {
      showToast('No rows to import', 'error');
      return;
    }

    setImporting(true);
    try {
      const res = await chessApi.importPlayers(parsedRows, 'Registered');
      if (res.success) {
        setImportResult(res.data);
        showToast(`Import completed: ${res.data?.importedCount || 0} player(s) imported as Registered (Pending)`);
        loadPlayers();
      } else {
        showToast(res.message || 'Import failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Server error during import', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = "Full Name,Email,Department,Phone,Status\nAlex Morgan,alex@chess.edu,IT Team,9876543210,Registered\nSarah Connor,sarah@chess.edu,First Year,9876543211,Registered\nVikram Mehta,vikram@chess.edu,Second Year,9876543212,Registered\nAnanya Sen,ananya@chess.edu,MJ Team,9876543213,Registered\nRohan Verma,rohan@chess.edu,HR Team,9876543214,Registered";
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'chess_players_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = players.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedIds.includes(p._id));
  const someFilteredSelected = filtered.some(p => selectedIds.includes(p._id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map(p => p._id));
      setSelectedIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filtered.map(p => p._id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors relative">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 pb-28">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800' 
              : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              REGISTRATION APPROVALS & ROSTER
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              PLAYER MANAGEMENT
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              Select multiple players for batch actions or import players in bulk using CSV.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#b08d20] dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV</span>
            </button>

            <div className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase block">Total Players</span>
              <span className="text-lg font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">{players.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-4 rounded-2xl shadow-sm text-xs">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name, ID, email, or department..."
              className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-4 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered (Pending)</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#232A3B] bg-slate-50 dark:bg-[#1A2337] text-[#64748B] dark:text-[#94A3B8] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={filtered.length === 0}
                    className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    title={allFilteredSelected ? 'Deselect all' : 'Select all visible'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#C9A227] dark:text-[#D4AF37]" />
                    ) : someFilteredSelected ? (
                      <MinusSquare className="w-4 h-4 text-[#C9A227] dark:text-[#D4AF37]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232A3B]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C9A227] dark:text-[#D4AF37]" />
                      <span>Loading roster...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No players found. Click <strong>Import CSV</strong> above to load participants.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isSelected = selectedIds.includes(p._id);
                  return (
                    <tr 
                      key={p._id} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-amber-50/60 dark:bg-[#C9A227]/10' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(p._id)}
                          className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#C9A227] dark:text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {p.playerId}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">
                        {p.fullName}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8]">
                        {p.email}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {p.department}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          p.status === 'Approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' 
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {p.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(p._id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p._id, p.fullName)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors inline-flex items-center"
                          title="Delete Player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-[#141B2D]/95 backdrop-blur-md text-white border border-slate-700 dark:border-[#232A3B] px-5 py-3.5 rounded-2xl shadow-2xl flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700 dark:border-slate-800 text-xs font-mono">
            <span className="w-6 h-6 rounded-full bg-[#C9A227] dark:bg-[#D4AF37] text-slate-950 font-bold flex items-center justify-center text-[11px]">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-slate-200">selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('Approved')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve All ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={actionLoading}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedIds([])}
            disabled={actionLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2E8F0] dark:border-[#232A3B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#C9A227] dark:text-[#D4AF37] border border-[#C9A227]/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase">
                    IMPORT PLAYERS FROM CSV
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Upload a CSV sheet to batch-register players into the championship.
                  </p>
                </div>
              </div>
              <button
                onClick={resetImportModal}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Template Download Prompt */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl">
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Need the standard CSV template?</span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Includes columns: Full Name, Email, Department, Phone, Status</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-1.5 border border-[#E2E8F0] dark:border-[#232A3B] bg-white dark:bg-[#141B2D] hover:bg-slate-100 dark:hover:bg-[#20293D] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>

              {/* Upload Drop Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 space-y-3 ${
                  isDragging
                    ? 'border-[#C9A227] dark:border-[#D4AF37] bg-amber-500/10 ring-4 ring-[#C9A227]/20 scale-[1.01]'
                    : importFile
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-[#CBD5E1] dark:border-[#334155] hover:border-[#C9A227] dark:hover:border-[#D4AF37] bg-slate-50/50 dark:bg-[#161F33]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-200 ${
                  isDragging 
                    ? 'bg-[#C9A227] text-slate-950 scale-110 shadow-lg' 
                    : importFile
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                }`}>
                  {importFile ? <FileCheck className="w-7 h-7" /> : <Upload className={`w-7 h-7 ${isDragging ? 'animate-bounce' : ''}`} />}
                </div>

                <div>
                  <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                    {isDragging ? (
                      <span className="text-[#C9A227] dark:text-[#D4AF37]">Drop your CSV file here...</span>
                    ) : importFile ? (
                      <span className="text-emerald-700 dark:text-emerald-400">{importFile.name}</span>
                    ) : (
                      'Drag & Drop your CSV file here or Browse'
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {importFile 
                      ? `${(importFile.size / 1024).toFixed(1)} KB • Click or drop another file to replace`
                      : 'Supports standard .csv file format (UTF-8)'}
                  </p>
                </div>
              </div>

              {/* Security & Approval Notice */}
              <div className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Strict Approval Flow:</strong> All imported players are added as <span className="font-bold underline">Registered (Pending Approval)</span>. You can review the list and use the <strong>Approve</strong> or <strong>Bulk Approve</strong> buttons to approve them.
                </div>
              </div>

              {/* Live Preview of Parsed Rows */}
              {parsedRows.length > 0 && !importResult && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-[#0F172A] dark:text-[#F8FAFC]">Preview ({parsedRows.length} player(s) detected)</span>
                  </div>
                  <div className="border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232A3B]">
                        {parsedRows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]">
                            <td className="py-1.5 px-3 font-mono text-[#64748B]">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{row.fullName}</td>
                            <td className="py-1.5 px-3 text-[#64748B] dark:text-[#94A3B8]">{row.email || '—'}</td>
                            <td className="py-1.5 px-3 text-[#0F172A] dark:text-[#F8FAFC]">{row.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 15 && (
                    <p className="text-[10px] text-center text-[#64748B] dark:text-[#94A3B8] font-mono">
                      ...and {parsedRows.length - 15} more rows
                    </p>
                  )}
                </div>
              )}

              {/* Import Results Summary */}
              {importResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Import Completed Successfully</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-200 font-mono space-y-1">
                    <div>• <strong>{importResult.importedCount}</strong> players imported</div>
                    <div>• <strong>{importResult.skippedCount}</strong> duplicates skipped</div>
                    {importResult.errorCount > 0 && (
                      <div className="text-red-600 dark:text-red-400">• <strong>{importResult.errorCount}</strong> errors encountered</div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#232A3B] flex justify-end gap-3 bg-slate-50 dark:bg-[#161F33] rounded-b-2xl">
              <button
                type="button"
                onClick={resetImportModal}
                disabled={importing}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#CBD5E1] dark:border-[#334155] hover:bg-slate-200 dark:hover:bg-[#20293D] transition-colors"
              >
                {importResult ? 'Close' : 'Cancel'}
              </button>

              {!importResult && (
                <button
                  type="button"
                  onClick={executeImport}
                  disabled={importing || parsedRows.length === 0}
                  className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#b08d20] dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-slate-950 px-5 py-2 rounded-xl text-xs font-bold uppercase font-display tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Confirm Import ({parsedRows.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal Component */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
