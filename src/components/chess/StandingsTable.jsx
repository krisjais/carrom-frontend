'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Trophy, Award, Medal } from 'lucide-react';

export function StandingsTable({ standings = [], loading = false }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', 'First Year', 'Second Year', 'IT Team', 'MJ Team', 'HR Team'];

  const filteredStandings = standings.filter((player) => {
    const matchesDept = selectedDept === 'all' || player.department === selectedDept;
    const matchesSearch =
      !search ||
      (player.fullName && player.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (player.playerId && player.playerId.toLowerCase().includes(search.toLowerCase())) ||
      (player.department && player.department.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const top3 = standings.slice(0, 3);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold font-serif text-sm shadow-sm" title="Champion Rank 1">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-xl bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#383733] text-[#171715] dark:text-[#FAF8F3] flex items-center justify-center font-bold font-serif text-sm" title="2nd Place">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-xl bg-[#FAF8F3] dark:bg-[#1A1A18] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#77736B] dark:text-[#A8A49C] flex items-center justify-center font-bold font-serif text-sm" title="3rd Place">
          3
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-xl bg-transparent border border-[#D5CFC5]/60 dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93] flex items-center justify-center font-mono text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Podium Highlights for Top 3 (if available) */}
      {!loading && top3.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {/* 2nd place */}
          <div className="order-2 md:order-1 bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 text-center space-y-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#EFEAE1] dark:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93]">
                🥈 2nd Place
              </span>
              <h4 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3] mt-2">
                {top3[1]?.fullName}
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans">
                {top3[1]?.department}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] block">
                {top3[1]?.tournamentPoints ?? 0} pts
              </span>
              <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93]">
                {top3[1]?.materialPoints ?? 0} Mat. Points
              </span>
            </div>
          </div>

          {/* 1st place (Hero Podium) */}
          <div className="order-1 md:order-2 bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] rounded-2xl p-7 text-center space-y-3 shadow-xl transform md:-translate-y-2 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 dark:bg-black/10 text-[#FAF8F3] dark:text-[#0D0D0D] font-bold">
                👑 1st Place • Championship Leader
              </span>
              <h4 className="font-serif font-bold text-2xl tracking-tight mt-3">
                {top3[0]?.fullName}
              </h4>
              <p className="text-xs opacity-70 font-sans">
                {top3[0]?.department}
              </p>
            </div>
            <div className="pt-3">
              <span className="text-3xl font-serif font-bold block">
                {top3[0]?.tournamentPoints ?? 0} pts
              </span>
              <span className="text-[10px] font-mono uppercase opacity-70">
                {top3[0]?.materialPoints ?? 0} Mat. Points • {top3[0]?.wins ?? 0} Wins
              </span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="order-3 md:order-3 bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 text-center space-y-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#EFEAE1] dark:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93]">
                🥉 3rd Place
              </span>
              <h4 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3] mt-2">
                {top3[2]?.fullName || 'Contender'}
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans">
                {top3[2]?.department || 'Division'}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] block">
                {top3[2]?.tournamentPoints ?? 0} pts
              </span>
              <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93]">
                {top3[2]?.materialPoints ?? 0} Mat. Points
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-3 sm:p-4 rounded-2xl">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitor, ID, or department..."
            className="w-full bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] dark:placeholder-[#8E8E93] focus:outline-none transition-colors"
          />
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#77736B] dark:text-[#8E8E93] shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-2.5 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors cursor-pointer"
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D5CFC5]/70 dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93] font-mono font-semibold uppercase text-[10px]">
              <th className="py-4 px-6 text-center">Rank</th>
              <th className="py-4 px-6">Competitor</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-4 text-center">Played</th>
              <th className="py-4 px-4 text-center">Wins</th>
              <th className="py-4 px-4 text-center">Draws</th>
              <th className="py-4 px-4 text-center">Losses</th>
              <th className="py-4 px-4 text-center">Material</th>
              <th className="py-4 px-6 text-center">Tourn. Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5CFC5]/40 dark:divide-[#262624]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#77736B] dark:text-[#8E8E93] font-sans">
                  <div className="inline-block w-7 h-7 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-mono text-xs uppercase tracking-widest">Loading Official Standings...</p>
                </td>
              </tr>
            ) : filteredStandings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#77736B] dark:text-[#8E8E93] font-sans">
                  No competitors found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredStandings.map((player, idx) => {
                const rank = player.rank || idx + 1;
                const isRank1 = rank === 1;

                return (
                  <tr
                    key={player._id}
                    className={`transition-colors hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1B1B19] ${
                      isRank1 ? 'bg-[#EFEAE1]/30 dark:bg-[#1B1B19]/50' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">{getRankBadge(rank)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/chess/player/${player._id}`}
                        className="font-bold text-[#171715] dark:text-[#FAF8F3] hover:underline font-serif text-sm block"
                      >
                        {player.fullName}
                      </Link>
                      <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">{player.playerId}</span>
                    </td>
                    <td className="py-4 px-6 text-[#4E4C47] dark:text-[#9E9B93] font-sans">
                      {player.department}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-semibold text-[#171715] dark:text-[#FAF8F3]">
                      {player.matchesPlayed || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {player.wins || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-[#77736B] dark:text-[#8E8E93]">
                      {player.draws || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-rose-700 dark:text-rose-400">
                      {player.losses || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                      +{player.materialPoints || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-bold text-xs px-3.5 py-1 rounded-xl shadow-xs">
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-12 text-[#77736B] dark:text-[#8E8E93] bg-[#FAF8F3] dark:bg-[#141414] rounded-2xl border border-[#D5CFC5] dark:border-[#262624]">
            Loading standings...
          </div>
        ) : filteredStandings.length === 0 ? (
          <div className="text-center py-12 text-[#77736B] dark:text-[#8E8E93] bg-[#FAF8F3] dark:bg-[#141414] rounded-2xl border border-[#D5CFC5] dark:border-[#262624]">
            No player standings found.
          </div>
        ) : (
          filteredStandings.map((player, idx) => {
            const rank = player.rank || idx + 1;
            return (
              <div
                key={player._id}
                className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-4 rounded-2xl space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankBadge(rank)}
                    <div>
                      <Link
                        href={`/chess/player/${player._id}`}
                        className="font-bold text-[#171715] dark:text-[#FAF8F3] font-serif text-sm block"
                      >
                        {player.fullName}
                      </Link>
                      <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                        {player.department} • {player.playerId}
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                    {player.tournamentPoints || 0} pts
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] bg-[#EFEAE1]/50 dark:bg-[#1B1B19] p-2 rounded-xl border border-[#D5CFC5]/70 dark:border-[#282826]">
                  <div>
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Played</span>
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{player.matchesPlayed || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">W-D-L</span>
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{player.wins || 0}-{player.draws || 0}-{player.losses || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Material</span>
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">+{player.materialPoints || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Points</span>
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{player.tournamentPoints || 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
