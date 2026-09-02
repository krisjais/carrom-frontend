'use client';

import React, { useEffect, useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { LiveMatchCard } from '@/components/chess/LiveMatchCard';
import { RecentMatchesTable } from '@/components/chess/RecentMatchesTable';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Filter, Calendar } from 'lucide-react';

export default function ChessMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await chessApi.getMatches();
        if (res.success) {
          setMatches(res.data || []);
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesRound = roundFilter === 'all' || m.round === Number(roundFilter);
    return matchesStatus && matchesRound;
  });

  const liveMatches = matches.filter((m) => m.status === 'live');

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#09090B] flex flex-col font-sans text-[#111111] dark:text-[#F4F4F5] antialiased transition-colors">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              MATCH SCHEDULE & RESULTS
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] dark:text-[#F4F4F5] uppercase">
              TOURNAMENT MATCHES
            </h1>
            <p className="text-xs text-[#666666] dark:text-[#A1A1AA] mt-1">
              View live games, upcoming fixtures, and official match results.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] px-3.5 py-2 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#666666] dark:text-[#A1A1AA] uppercase block">Total</span>
              <span className="text-base font-bold font-mono text-[#111111] dark:text-[#F4F4F5]">{matches.length}</span>
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[9px] font-mono text-red-600 dark:text-red-400 uppercase block">Live</span>
              <span className="text-base font-bold font-mono text-red-600 dark:text-red-400">{liveMatches.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-2xl shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#111111] dark:text-[#F4F4F5]" />
            <span className="font-mono font-bold text-[#111111] dark:text-[#F4F4F5] uppercase">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] focus:border-black dark:focus:border-white rounded-xl px-3 py-1.5 text-[#111111] dark:text-[#F4F4F5] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#111111] dark:text-[#F4F4F5]" />
            <span className="font-mono font-bold text-[#111111] dark:text-[#F4F4F5] uppercase">Round:</span>
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] focus:border-black dark:focus:border-white rounded-xl px-3 py-1.5 text-[#111111] dark:text-[#F4F4F5] focus:outline-none"
            >
              <option value="all">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
              <option value="3">Round 3</option>
              <option value="4">Round 4</option>
              <option value="5">Round 5</option>
            </select>
          </div>
        </div>

        {/* Live Matches cards */}
        {liveMatches.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase">
              ACTIVE LIVE GAMES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <LiveMatchCard key={m._id || m.matchId} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* Recent / All Matches Table */}
        <RecentMatchesTable matches={filteredMatches} loading={loading} />

      </main>

      <ChessFooter />
    </div>
  );
}
