'use client';

import React, { useEffect, useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { RefreshCw } from 'lucide-react';

export default function ChessStandingsPage() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStandings() {
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
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#111111] antialiased">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              OFFICIAL LEADERBOARD
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              TOURNAMENT STANDINGS
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              Ranked by Tournament Points (3 Win / 1 Draw), total Material Points, and Wins.
            </p>
          </div>

          <button
            onClick={loadStandings}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#000000] hover:bg-[#222222] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A227] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Standings</span>
          </button>
        </div>

        {/* Standings Table */}
        <StandingsTable standings={standings} loading={loading} />

      </main>

      <ChessFooter />
    </div>
  );
}
