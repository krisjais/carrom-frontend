'use client';

import React, { useEffect, useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { PlayerCard } from '@/components/chess/PlayerCard';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Search, Filter } from 'lucide-react';

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
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#09090B] flex flex-col font-sans text-[#111111] dark:text-[#F4F4F5] antialiased transition-colors">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              COMPETITOR DIRECTORY
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] dark:text-[#F4F4F5] uppercase">
              TOURNAMENT PLAYERS
            </h1>
            <p className="text-xs text-[#666666] dark:text-[#A1A1AA] mt-1">
              View approved competitors, stats, departments, and individual player records.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#666666] dark:text-[#A1A1AA] uppercase block">Total Players</span>
            <span className="text-lg font-bold font-mono text-[#111111] dark:text-[#F4F4F5]">{players.length}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-2xl shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] dark:text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player by name or ID..."
              className="w-full bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] focus:border-black dark:focus:border-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#111111] dark:text-[#F4F4F5] placeholder-[#666666] dark:placeholder-[#71717A] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#111111] dark:text-[#F4F4F5] shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] focus:border-black dark:focus:border-white rounded-xl px-4 py-2 text-xs text-[#111111] dark:text-[#F4F4F5] focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.filter((d) => d !== 'all').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#666666] dark:text-[#A1A1AA] bg-white dark:bg-[#121215] rounded-2xl border border-[#E5E5E5] dark:border-[#27272A]">
            Loading players directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#666666] dark:text-[#A1A1AA] bg-white dark:bg-[#121215] rounded-2xl border border-[#E5E5E5] dark:border-[#27272A]">
            No players found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
