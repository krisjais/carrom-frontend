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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row font-sans text-[#111111] antialiased">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              REGISTRATION APPROVALS & ROSTER
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              PLAYER MANAGEMENT
            </h1>
          </div>
          <div className="bg-gray-50 border border-[#E5E5E5] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#666666] uppercase block">Total Registrations</span>
            <span className="text-lg font-bold font-mono text-[#111111]">{players.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-[#E5E5E5] p-4 rounded-2xl shadow-xs text-xs">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name or ID..."
              className="w-full bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl pl-10 pr-4 py-2 text-[#111111] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#111111]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl px-4 py-2 text-[#111111] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-gray-50 text-[#666666] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-[#666666]">Loading roster...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-[#666666]">No players found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#111111]">{p.playerId}</td>
                    <td className="py-3 px-4 font-bold text-[#111111] font-display">{p.fullName}</td>
                    <td className="py-3 px-4 text-[#666666]">{p.email}</td>
                    <td className="py-3 px-4 font-semibold text-[#111111]">{p.department}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        p.status === 'Approved' ? 'badge-completed' : p.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {p.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusUpdate(p._id, 'Approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:text-red-800 p-1"
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
