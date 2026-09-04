'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { LiveMatchCard } from '@/components/chess/LiveMatchCard';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Filter, Calendar, Swords, Radio } from 'lucide-react';

export default function ChessMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');

  useEffect(() => {
    async function loadMatches() {
      try {
        const [matchRes, roundRes] = await Promise.all([
          chessApi.getMatches(),
          chessApi.getRounds()
        ]);
        if (matchRes.success) {
          setMatches(matchRes.data || []);
        }
        if (roundRes.success && Array.isArray(roundRes.data)) {
          setRounds(roundRes.data);
        }
      } catch (err) {
        console.error('Error loading matches/rounds:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesRound = roundFilter === 'all' || m.round === Number(roundFilter);
    return matchesStatus && matchesRound;
  });

  const liveMatches = matches.filter((m) => m.status?.toLowerCase() === 'live');

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Header */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  Tournament Schedule • Official Pairings
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Every Battle on the Board
              </h1>
              <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Track all rounds, real-time board timers, live material scores, and official arbitrated outcomes across the championship.
              </p>
            </div>

            {/* Counts */}
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="bg-[#EFEAE1] dark:bg-[#1C1C1A] border border-[#D5CFC5] dark:border-[#282826] px-5 py-3.5 rounded-2xl text-center flex-1 sm:flex-initial">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                  Total Fixtures
                </span>
                <span className="text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                  {matches.length}
                </span>
              </div>
              <div className="bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] px-5 py-3.5 rounded-2xl text-center flex-1 sm:flex-initial shadow-sm">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#FAF8F3]/70 dark:text-[#0D0D0D]/70 block">
                  Active Live
                </span>
                <span className="text-2xl font-serif font-bold">
                  {liveMatches.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-3 sm:p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#77736B] dark:text-[#8E8E93]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live Now</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#77736B] dark:text-[#8E8E93]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93]">Round:</span>
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Rounds</option>
                {rounds.length > 0 ? (
                  rounds.map((r) => (
                    <option key={r.roundNumber} value={r.roundNumber}>
                      Round {r.roundNumber}: {r.name}
                    </option>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map((rn) => (
                    <option key={rn} value={rn}>Round {rn}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="font-mono text-[11px] text-[#77736B] dark:text-[#8E8E93]">
            Showing <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{filteredMatches.length}</span> matches
          </div>
        </div>

        {/* Live Matches Hero Section if any */}
        {liveMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#171715] dark:text-[#FAF8F3]">
                Live Arena Board
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveMatches.map((m) => (
                <LiveMatchCard key={m._id || m.matchId} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* Full Fixtures Table */}
        <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-xs overflow-hidden">
          <div className="border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4 mb-4 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
              All Fixtures & Outcomes
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
              Official Records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
                Loading Tournament Fixtures...
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-[#D5CFC5]/70 dark:border-[#262624] rounded-2xl">
              <Swords className="w-10 h-10 mx-auto text-[#77736B] dark:text-[#8E8E93] mb-3 stroke-[1.2]" />
              <h4 className="font-serif text-base font-bold text-[#171715] dark:text-[#FAF8F3]">
                No Fixtures Found
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] max-w-sm mx-auto mt-1 font-sans">
                No matches match the selected round and status filters. Check back once pairings are drawn.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D5CFC5]/60 dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
                      <th className="py-3 px-4 font-semibold">Match ID</th>
                      <th className="py-3 px-3 text-center font-semibold">Round</th>
                      <th className="py-3 px-4 font-semibold">Player 1 (White)</th>
                      <th className="py-3 px-4 font-semibold">Player 2 (Black)</th>
                      <th className="py-3 px-3 text-center font-semibold">Status</th>
                      <th className="py-3 px-3 text-center font-semibold">Result</th>
                      <th className="py-3 px-4 text-right font-semibold">Score</th>
                      <th className="py-3 px-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5CFC5]/40 dark:divide-[#262624]">
                    {filteredMatches.map((m) => {
                      const p1 = m.player1?.fullName || (m.isBye ? (m.byePlayer?.fullName || 'Player') : 'TBD');
                      const p2 = m.player2?.fullName || (m.isBye ? 'BYE' : 'TBD');
                      const isCompleted = m.status === 'completed';
                      const isLive = m.status === 'live';

                      let winnerText = '—';
                      if (isCompleted) {
                        if (m.isBye) winnerText = 'BYE (+3)';
                        else if (m.winner === 'player1') winnerText = `${p1.split(' ')[0]} Won`;
                        else if (m.winner === 'player2') winnerText = `${p2.split(' ')[0]} Won`;
                        else if (m.winner === 'draw') winnerText = 'Draw';
                        else winnerText = 'Completed';
                      }

                      return (
                        <tr key={m._id || m.matchId} className="hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1B1B19] transition-colors group">
                          <td className="py-4 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {m.matchId}
                          </td>
                          <td className="py-4 px-3 text-center font-mono text-[#77736B] dark:text-[#8E8E93]">
                            R{m.round}
                          </td>
                          <td className="py-4 px-4 font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {p1}
                          </td>
                          <td className="py-4 px-4 font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {p2}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {isCompleted ? (
                              <span className="bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#2E2E2B] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                                Completed
                              </span>
                            ) : isLive ? (
                              <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                <span>Live</span>
                              </span>
                            ) : (
                              <span className="bg-transparent text-[#77736B] dark:text-[#8E8E93] border border-[#D5CFC5]/80 dark:border-[#262624] px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                                Scheduled
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center font-medium text-[#171715] dark:text-[#FAF8F3]">
                            {winnerText}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                            {m.player1MaterialScore ?? 0} — {m.player2MaterialScore ?? 0}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/chess/matches/${m._id || m.matchId}`}
                              className="text-[11px] font-mono uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3] hover:underline underline-offset-4"
                            >
                              Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {filteredMatches.map((m) => {
                  const p1 = m.player1?.fullName || (m.isBye ? (m.byePlayer?.fullName || 'Player') : 'TBD');
                  const p2 = m.player2?.fullName || (m.isBye ? 'BYE' : 'TBD');
                  return (
                    <Link
                      key={m._id || m.matchId}
                      href={`/chess/matches/${m._id || m.matchId}`}
                      className="block bg-[#EFEAE1]/50 dark:bg-[#1B1B19] border border-[#D5CFC5]/70 dark:border-[#282826] rounded-2xl p-4 space-y-2.5 shadow-xs"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                        <span>{m.matchId} • Round {m.round}</span>
                        <span className="uppercase font-bold">{m.status}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-serif font-bold text-[#171715] dark:text-[#FAF8F3] text-sm">
                          {p1} <span className="text-xs text-[#77736B] font-sans font-normal">vs</span> {p2}
                        </div>
                        <div className="font-mono font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                          {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </main>

      <ChessFooter />
    </div>
  );
}
