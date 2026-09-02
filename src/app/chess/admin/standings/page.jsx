'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { RefreshCw, Download } from 'lucide-react';

export default function ChessAdminStandingsPage() {
  const router = useRouter();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStandings() {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    setLoading(true);
    try {
      const res = await chessApi.getStandings();
      if (res.success) {
        setStandings(res.data || []);
      }
    } catch (err) {
      console.error('Error loading standings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings();
  }, [router]);

  const handleRecalculate = async () => {
    try {
      const res = await chessApi.refreshStandings();
      if (res.success) {
        loadStandings();
      }
    } catch (err) {
      alert(err.message || 'Error refreshing standings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              LEADERBOARD RECALCULATION & ENGINE
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              STANDINGS MANAGEMENT
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C9A227] dark:text-slate-950" />
              <span>Recalculate Standings</span>
            </button>
          </div>
        </div>

        {/* Standings Table */}
        <StandingsTable standings={standings} loading={loading} />

      </main>
    </div>
  );
}
