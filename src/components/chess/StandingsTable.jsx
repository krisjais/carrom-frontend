'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Search, Filter, Medal, Award, Crown } from 'lucide-react';

export function StandingsTable({ standings = [], loading = false }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', 'First Year', 'Second Year', 'IT Team', 'MJ Team', 'HR Team'];

  const filteredStandings = standings.filter((player) => {
    const matchesDept = selectedDept === 'all' || player.department === selectedDept;
    const matchesSearch =
      !search ||
      player.fullName.toLowerCase().includes(search.toLowerCase()) ||
      player.playerId.toLowerCase().includes(search.toLowerCase()) ||
      player.department.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-[#C9A227]/10 border border-[#C9A227] text-[#C9A227] flex items-center justify-center font-bold font-mono text-xs shadow-xs" title="1st Place (Gold)">
          <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center font-bold font-mono text-xs" title="2nd Place (Silver)">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center font-bold font-mono text-xs" title="3rd Place (Bronze)">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg bg-gray-50 border border-[#E5E5E5] text-[#666666] flex items-center justify-center font-bold font-mono text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-4 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player name, ID, or department..."
            className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none transition-colors"
          />
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC] shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
          >
            <option value="all">All Departments</option>
            {departments.filter(d => d !== 'all').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#232A3B] bg-slate-50 dark:bg-[#1A2337] text-[#64748B] dark:text-[#94A3B8] font-mono font-bold uppercase text-[10px]">
              <th className="py-3.5 px-6 text-center">Rank</th>
              <th className="py-3.5 px-6">Player</th>
              <th className="py-3.5 px-6">Department</th>
              <th className="py-3.5 px-4 text-center">Played</th>
              <th className="py-3.5 px-4 text-center">Wins</th>
              <th className="py-3.5 px-4 text-center">Draws</th>
              <th className="py-3.5 px-4 text-center">Losses</th>
              <th className="py-3.5 px-4 text-center">Material Pts</th>
              <th className="py-3.5 px-6 text-center">Tournament Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232A3B]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                  Loading standings...
                </td>
              </tr>
            ) : filteredStandings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                  No player standings found.
                </td>
              </tr>
            ) : (
              filteredStandings.map((player, idx) => {
                const rank = player.rank || idx + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr
                    key={player._id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1E293B] ${
                      rank === 1 ? 'bg-amber-500/10 dark:bg-amber-500/10' : isTop3 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex justify-center">{getRankBadge(rank)}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/chess/player/${player._id}`}
                        className="font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#C9A227] dark:hover:text-[#D4AF37] transition-colors font-display block"
                      >
                        {player.fullName}
                      </Link>
                      <span className="text-[10px] font-mono text-[#C9A227] dark:text-[#D4AF37]">{player.playerId}</span>
                    </td>
                    <td className="py-3.5 px-6 text-[#64748B] dark:text-[#94A3B8] font-sans">
                      {player.department}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {player.matchesPlayed || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {player.wins || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {player.draws || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-red-600 dark:text-red-400">
                      {player.losses || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {player.materialPoints || 0}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-xs">
                        {player.tournamentPoints || 0} pts
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
