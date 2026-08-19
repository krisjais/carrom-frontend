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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row font-sans text-[#111111] antialiased">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              LEADERBOARD RECALCULATION & ENGINE
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              STANDINGS MANAGEMENT
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              className="bg-[#000000] hover:bg-[#222222] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C9A227]" />
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
