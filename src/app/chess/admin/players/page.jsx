'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ChessExcelImportModal } from '@/components/chess/ChessExcelImportModal';
import {
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  FileSpreadsheet,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  X
} from 'lucide-react';
import { useConfirm } from '@/context/ToastContext';

export default function ChessAdminPlayersPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Manual Add Player state
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState({
    fullName: '',
    department: 'First Year',
    email: '',
    phone: '',
    status: 'Approved'
  });
  const [creatingPlayer, setCreatingPlayer] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, [router]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await chessApi.updateRegistrationStatus(id, status);
      if (res.success) {
        setFeedback({ type: 'success', message: `Player status updated to ${status}.` });
        loadPlayers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating status' });
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Chess Player?',
      message: 'Are you sure you want to delete this player profile from the tournament?',
      confirmText: 'Delete Player',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      const res = await chessApi.deletePlayer(id);
      if (res.success) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setFeedback({ type: 'success', message: 'Player removed successfully.' });
        loadPlayers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting player' });
    }
  };

  const filtered = players.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Bulk selection logic
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.includes(p._id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map((p) => p._id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filtered.map((p) => p._id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await chessApi.bulkUpdateStatus(selectedIds, 'Approved');
      if (res.success) {
        setFeedback({ type: 'success', message: `Successfully approved ${res.count} player(s).` });
        setSelectedIds([]);
        loadPlayers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error during bulk approval.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const isConfirmed = await confirm({
      title: 'Delete Selected Players?',
      message: `Are you sure you want to permanently delete ${selectedIds.length} selected player(s)?`,
      confirmText: `Delete ${selectedIds.length} Players`,
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setBulkLoading(true);
    try {
      const res = await chessApi.bulkDeletePlayers(selectedIds);
      if (res.success) {
        setFeedback({ type: 'success', message: `Successfully deleted ${res.count} player(s).` });
        setSelectedIds([]);
        loadPlayers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error during bulk deletion.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleImportSuccess = (count) => {
    setFeedback({ type: 'success', message: `Successfully imported ${count} player(s) from spreadsheet.` });
    loadPlayers();
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerForm.fullName.trim() || !newPlayerForm.department.trim()) {
      setFeedback({ type: 'error', message: 'Full Name and Department are required.' });
      return;
    }
    setCreatingPlayer(true);
    try {
      const res = await chessApi.createPlayer(newPlayerForm);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Player registered and approved!' });
        setNewPlayerForm({
          fullName: '',
          department: 'First Year',
          email: '',
          phone: '',
          status: 'Approved'
        });
        setAddPlayerModalOpen(false);
        loadPlayers();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to add player.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating player.' });
    } finally {
      setCreatingPlayer(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header with Import Excel button & Add Player */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 sm:p-8 rounded-3xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              REGISTRATION APPROVALS & ROSTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Player Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Direct Add Player Button */}
            <button
              onClick={() => setAddPlayerModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Player</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] border border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3] px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
            </button>

            {/* Total count badge */}
            <div className="bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] px-4 py-2 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase block">Total Players</span>
              <span className="text-base font-bold font-mono text-[#171715] dark:text-[#FAF8F3]">{players.length}</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-sans transition-all animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Floating Bulk Action Bar (when players selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-6 h-6 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center font-bold text-xs">
                {selectedIds.length}
              </span>
              <span className="font-semibold">player{selectedIds.length > 1 ? 's' : ''} selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk Approve */}
              <button
                type="button"
                disabled={bulkLoading}
                onClick={handleBulkApprove}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Bulk Approve</span>
              </button>

              {/* Bulk Delete */}
              <button
                type="button"
                disabled={bulkLoading}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Bulk Delete</span>
              </button>

              {/* Clear Selection */}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl border border-white/20 dark:border-black/20 text-xs font-mono uppercase tracking-wider hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-4 rounded-2xl shadow-xs text-xs">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search competitor name, ID, or email..."
              className="w-full bg-[#EFEAE1]/60 dark:bg-[#1D1D1B] border border-[#D5CFC5]/80 dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl pl-10 pr-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#EFEAE1]/60 dark:bg-[#1D1D1B] border border-[#D5CFC5]/80 dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table with Selection Checkboxes */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC5]/80 dark:border-[#262624] bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-[#D5CFC5] accent-[#171715] dark:accent-[#FAF8F3] cursor-pointer"
                    title="Select / Deselect all"
                  />
                </th>
                <th className="py-3.5 px-4 font-semibold">Player ID</th>
                <th className="py-3.5 px-4 font-semibold">Full Name</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC5]/50 dark:divide-[#262624]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">
                    <div className="inline-block w-6 h-6 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="font-mono text-xs uppercase tracking-wider">Loading competitor roster...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">
                    No competitors found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isSelected = selectedIds.includes(p._id);

                  return (
                    <tr
                      key={p._id}
                      className={`transition-colors hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B]/50 ${
                        isSelected ? 'bg-[#EFEAE1]/40 dark:bg-[#1D1D1B]/60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p._id)}
                          className="rounded border-[#D5CFC5] accent-[#171715] dark:accent-[#FAF8F3] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {p.playerId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {p.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-[#77736B] dark:text-[#8E8E93] font-mono text-[11px]">
                        {p.email || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171715] dark:text-[#FAF8F3]">
                        {p.department}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            p.status === 'Approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                              : p.status === 'Rejected'
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {p.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(p._id, 'Approved')}
                            className="bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                            className="border border-[#D5CFC5] dark:border-[#262624] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-[#77736B] hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                          title="Delete Player"
                        >
                          <Trash2 className="w-4 h-4 inline" />
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

      {/* Excel / CSV Drag and Drop Import Modal */}
      <ChessExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Manual Add Player Modal */}
      {addPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    MANUAL ENROLLMENT
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                    Add New Competitor
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddPlayerModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px] font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlayerForm.fullName}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, fullName: e.target.value })}
                  placeholder="e.g. Magnus Carlsen"
                  className="w-full bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px] font-semibold mb-1">
                  Department / Team *
                </label>
                <select
                  value={newPlayerForm.department}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, department: e.target.value })}
                  className="w-full bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none cursor-pointer"
                >
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="IT Team">IT Team</option>
                  <option value="MJ Team">MJ Team</option>
                  <option value="HR Team">HR Team</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px] font-semibold mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newPlayerForm.email}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, email: e.target.value })}
                    placeholder="player@example.com"
                    className="w-full bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px] font-semibold mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newPlayerForm.phone}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px] font-semibold mb-1">
                  Registration Status
                </label>
                <select
                  value={newPlayerForm.status}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, status: e.target.value })}
                  className="w-full bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-[#171715] dark:text-[#FAF8F3] focus:outline-none cursor-pointer"
                >
                  <option value="Approved">Approved (Ready for pairing)</option>
                  <option value="Registered">Registered (Pending approval)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddPlayerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPlayer}
                  className="bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] px-6 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {creatingPlayer ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Add Player</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
