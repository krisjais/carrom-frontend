'use client';

import React, { useEffect, useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { PlayerCard } from '@/components/chess/PlayerCard';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Search, Filter, Users, Trophy, Sparkles } from 'lucide-react';

export default function ChessPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', 'First Year', 'Second Year', 'IT Team', 'MJ Team', 'HR Team'];

  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await chessApi.getPlayers();
        if (res.success) {
          setPlayers(res.data || []);
        }
      } catch (err) {
        console.error('Error loading players:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  const filtered = players.filter((p) => {
    const matchesDept = selectedDept === 'all' || p.department === selectedDept;
    const matchesSearch =
      !search ||
      (p.fullName && p.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (p.playerId && p.playerId.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Page Header */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  Competitor Dossiers • Grand Roster
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Meet the Competitors
              </h1>
              <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Browse official profiles, current standings, win-loss records, and material ratings across every department in the championship.
              </p>
            </div>

            {/* Total count badge */}
            <div className="bg-[#EFEAE1] dark:bg-[#1C1C1A] border border-[#D5CFC5] dark:border-[#282826] px-6 py-4 rounded-2xl text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                Total Competitors
              </span>
              <span className="text-3xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                {players.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-3 sm:p-4 rounded-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search competitor by name or ID..."
              className="w-full bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] dark:placeholder-[#8E8E93] focus:outline-none transition-colors"
            />
          </div>

          {/* Department Chips / Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#77736B] dark:text-[#8E8E93] shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Divisions & Departments</option>
              {departments.filter((d) => d !== 'all').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Players Grid / States */}
        {loading ? (
          <div className="text-center py-24 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-[#D5CFC5] dark:border-[#262624] p-8">
            <div className="inline-block w-8 h-8 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
              Loading Competitor Dossiers...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-dashed border-[#D5CFC5] dark:border-[#262624]">
            <Users className="w-10 h-10 mx-auto text-[#77736B] dark:text-[#8E8E93] mb-3 stroke-[1.2]" />
            <h3 className="font-serif text-lg font-bold text-[#171715] dark:text-[#FAF8F3]">
              No Competitors Match Query
            </h3>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] max-w-sm mx-auto mt-1 font-sans">
              Try adjusting your search keywords or switching department filter to find registered tournament players.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((player) => (
              <PlayerCard key={player._id} player={player} />
            ))}
          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
