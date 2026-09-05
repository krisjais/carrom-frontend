'use client';

import React, { useEffect, useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { RefreshCw, Trophy, ShieldCheck } from 'lucide-react';

import { DEMO_CHESS_STANDINGS } from '@/lib/chessDemoData';

export default function ChessStandingsPage() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStandings() {
    setLoading(true);
    try {
      const res = await chessApi.getStandings();
      if (res.success && res.data && res.data.length > 0) {
        setStandings(res.data);
      } else {
        setStandings(DEMO_CHESS_STANDINGS);
      }
    } catch (err) {
      console.error('Error loading standings:', err);
      setStandings(DEMO_CHESS_STANDINGS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings();
  }, []);

  const activeStandings = standings.length > 0 ? standings : DEMO_CHESS_STANDINGS;

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Header Banner */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  Official Leaderboard • Championship Table
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Ranked by Masters
              </h1>
              <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Ranked primarily by Tournament Points (Win = 3 pts, Draw = 1 pt, Loss = 0 pts), then by accumulated Material Rating and head-to-head records.
              </p>
            </div>

            <button
              onClick={loadStandings}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-medium px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 w-full sm:w-auto justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Standings</span>
            </button>
          </div>
        </div>

        {/* Standings Table & Podiums */}
        <StandingsTable standings={activeStandings} loading={loading} />

      </main>

      <ChessFooter />
    </div>
  );
}
