'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Users, CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';

export default function ChessAdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        loadPlayers();
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    try {
      const res = await chessApi.deletePlayer(id);
      if (res.success) {
        loadPlayers();
      }
    } catch (err) {
      alert(err.message || 'Error deleting player');
    }
  };

  const filtered = players.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              REGISTRATION APPROVALS & ROSTER
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              PLAYER MANAGEMENT
            </h1>
          </div>
          <div className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase block">Total Registrations</span>
            <span className="text-lg font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">{players.length}</span>
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
              placeholder="Search player name or ID..."
              className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-4 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#232A3B] bg-slate-50 dark:bg-[#1A2337] text-[#64748B] dark:text-[#94A3B8] font-mono uppercase text-[10px]">
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
                <tr><td colSpan={6} className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]">Loading roster...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]">No players found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{p.playerId}</td>
                    <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">{p.fullName}</td>
                    <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8]">{p.email}</td>
                    <td className="py-3 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{p.department}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        p.status === 'Approved' ? 'badge-completed' : p.status === 'Rejected' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
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
                      {p.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors"
                        title="Delete Player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
