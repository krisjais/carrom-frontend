'use client';

import React from 'react';
import Link from 'next/link';
import { MatchTimer } from './MatchTimer';
import { Trophy, ChevronRight, Swords } from 'lucide-react';

export function MatchCard({ match }) {
  if (!match) return null;

  const player1 = match.player1 || { fullName: 'Player 1', department: 'TBD', playerId: 'CHS-000' };
  const player2 = match.player2 || { fullName: 'Player 2', department: 'TBD', playerId: 'CHS-000' };

  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';
  const isCancelled = match.status === 'cancelled';

  const getWinnerName = () => {
    if (match.winner === 'player1') return player1.fullName;
    if (match.winner === 'player2') return player2.fullName;
    if (match.winner === 'draw') return 'Draw';
    return null;
  };

  const statusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
          <span className="live-dot" />
          LIVE MATCH
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
          COMPLETED
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">
          CANCELLED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1F242C] border border-[#2A313C] text-[#9BB0D3] text-xs font-mono font-bold uppercase tracking-wider">
        SCHEDULED
      </span>
    );
  };

  return (
    <div className={`bg-[#14171A] border transition-all rounded-3xl p-5 sm:p-6 space-y-4 ${
      isLive
        ? 'border-red-500/40 shadow-lg shadow-red-950/30'
        : 'border-[#2A313C] hover:border-[#F2C94C]/40 hover:shadow-xl'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-[#2A313C]/60 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#F2C94C] uppercase tracking-wider bg-[#1F242C] px-2.5 py-1 rounded-lg border border-[#F2C94C]/20">
            {match.matchId}
          </span>
          <span className="text-xs font-mono text-[#9BB0D3]">
            Round {match.round}
          </span>
        </div>
        <div>{statusBadge()}</div>
      </div>

      {/* Players VS Row */}
      <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center pt-1">
        
        {/* Player 1 */}
        <div className={`sm:col-span-5 p-3.5 rounded-2xl border transition-colors ${
          match.winner === 'player1'
            ? 'bg-[#1F242C] border-[#F2C94C]/50 text-[#F5F1E8]'
            : 'bg-[#1A1E24] border-[#2A313C] text-[#9BB0D3]'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-[#F2C94C] font-semibold">{player1.playerId}</p>
              <h4 className="text-base font-bold font-display text-[#F5F1E8] truncate">{player1.fullName}</h4>
              <p className="text-xs text-[#9BB0D3]">{player1.department}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#9BB0D3] block">Material</span>
              <span className="text-xl font-bold font-mono text-[#F2C94C]">
                {match.player1MaterialScore || 0}
              </span>
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="sm:col-span-1 flex items-center justify-center py-1">
          <span className="w-8 h-8 rounded-full bg-[#1F242C] border border-[#2A313C] flex items-center justify-center text-xs font-bold font-mono text-[#F2C94C]">
            VS
          </span>
        </div>

        {/* Player 2 */}
        <div className={`sm:col-span-5 p-3.5 rounded-2xl border transition-colors ${
          match.winner === 'player2'
            ? 'bg-[#1F242C] border-[#F2C94C]/50 text-[#F5F1E8]'
            : 'bg-[#1A1E24] border-[#2A313C] text-[#9BB0D3]'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-[#F2C94C] font-semibold">{player2.playerId}</p>
              <h4 className="text-base font-bold font-display text-[#F5F1E8] truncate">{player2.fullName}</h4>
              <p className="text-xs text-[#9BB0D3]">{player2.department}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#9BB0D3] block">Material</span>
              <span className="text-xl font-bold font-mono text-[#F2C94C]">
                {match.player2MaterialScore || 0}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Details & Action Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3 border-t border-[#2A313C]/40 text-xs">
        <div>
          {isCompleted && (
            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#F2C94C]" />
              Winner: {getWinnerName()}
            </span>
          )}
          {isLive && (
            <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
          )}
          {isScheduled && (
            <span className="text-[#9BB0D3] font-mono">
              Scheduled Match (10 Mins)
            </span>
          )}
        </div>

        <Link
          href={`/chess/matches/${match._id}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F2C94C] hover:text-[#F7DB82] bg-[#1A1E24] hover:bg-[#1F242C] border border-[#2A313C] hover:border-[#F2C94C]/40 px-4 py-2 rounded-xl transition-all"
        >
          <span>View Match Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
