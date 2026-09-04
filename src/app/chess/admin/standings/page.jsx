'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              LEADERBOARD RECALCULATION & ENGINE
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Standings Management
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] mt-1">
              Recalculate cumulative points, material piece captured points, and rank order.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
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
