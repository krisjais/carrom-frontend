'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Trophy, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Crown, Shield, Play, Clock, Edit3, Users } from 'lucide-react';
import { StatusBadge, MainBoardBadge } from '@/components/ui/Badge';
import { CarromCoin } from '@/components/ui/CarromElements';
import { CarromMatchTimer, formatMatchDurationTaken } from '@/components/common/CarromMatchTimer';
import { SubstitutePartnerModal } from '@/components/admin/SubstitutePartnerModal';

export const BracketView = ({ rounds, category, isLocked, isPublished, onMatchUpdated }) => {
  const { isAdmin } = useAuth();
  const [zoom, setZoom] = useState(1);
  const [substituteModal, setSubstituteModal] = useState({
    isOpen: false,
    match: null,
    slot: 'team1'
  });

  const handleOpenSubstitute = (match, slot = 'team1') => {
    setSubstituteModal({
      isOpen: true,
      match,
      slot
    });
  };

  const handleSubstituteSuccess = (updatedMatch) => {
    if (onMatchUpdated) {
      onMatchUpdated(updatedMatch);
    }
  };

  if (!rounds || rounds.length === 0) {
    return (
      <div className="p-12 text-center editorial-card rounded-2xl space-y-3 bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]">
        <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto mb-2">
          <CarromCoin type="queen" size="sm" />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">No Bracket Generated Yet</h3>
        <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] max-w-sm mx-auto">
          The dynamic single-elimination knockout bracket for this division has not been drawn by tournament officials yet.
        </p>
        {isAdmin && (
          <div className="mt-4">
            <Link
              href="/admin/draws"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-xs"
            >
              Generate Draw in Control Room →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top controls: Category status, Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-sans uppercase font-bold">Status:</span>
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034] font-mono tracking-wider">
              <Shield className="w-3 h-3 text-[#E74C3C]" />
              <span>PUBLISHED & LOCKED</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060] dark:text-[#B8B1A5] border border-[#E8E1D5] dark:border-[#2B3034] font-mono tracking-wider">
              DRAFT / UNLOCKED
            </span>
          )}
          <span className="text-xs text-[#D5C4A1] dark:text-[#2B3034]">|</span>
          <span className="text-xs text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold">{rounds.length} Knockout Rounds</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-[#FAF9F6] dark:bg-[#181C1F] p-1 rounded-lg border border-[#E8E1D5] dark:border-[#2B3034]">
          <button
            onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
            className="p-1.5 rounded-md text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] hover:bg-white dark:hover:bg-[#15191C] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
            className="p-1.5 rounded-md text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] hover:bg-white dark:hover:bg-[#15191C] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-md text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] hover:bg-white dark:hover:bg-[#15191C] transition-colors ml-1 cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bracket Tree Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-12 pt-6 rounded-2xl bg-white dark:bg-[#121517] border border-[#E8E1D5] dark:border-[#2B3034] p-6 sm:p-8 min-h-[550px] shadow-xs relative transition-colors duration-200">
        <div
          className="flex items-stretch gap-12 sm:gap-16 min-w-max transition-transform origin-top-left relative"
          style={{ transform: `scale(${zoom})` }}
        >
          {rounds.map((round, rIdx) => {
            const isFinal = rIdx === rounds.length - 1;
            return (
              <div key={round.roundNumber} className="flex flex-col w-72 shrink-0 relative">
                {/* Round Header */}
                <div className="text-center pb-3 mb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                  <span className="text-[10px] font-mono text-[#E74C3C] uppercase tracking-widest font-bold block">
                    STAGE {round.roundNumber} OF {rounds.length}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
                    {round.roundName}
                  </h4>
                  <span className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-mono">
                    {round.matches.length} {round.matches.length === 1 ? 'Championship Final' : 'Matches'}
                  </span>
                </div>

                {/* Match Cards Container */}
                <div className="flex flex-col justify-around flex-grow gap-8 relative">
                  {round.matches.map((match) => (
                    <MatchNode
                      key={match._id}
                      match={match}
                      isFinal={isFinal}
                      isAdmin={isAdmin}
                      onSubstitute={handleOpenSubstitute}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitute Partner / Update Match Name Modal */}
      {isAdmin && (
        <SubstitutePartnerModal
          isOpen={substituteModal.isOpen}
          onClose={() => setSubstituteModal({ isOpen: false, match: null, slot: 'team1' })}
          match={substituteModal.match}
          initialSlot={substituteModal.slot}
          onSuccess={handleSubstituteSuccess}
        />
      )}
    </div>
  );
};

const MatchNode = ({ match, isFinal, isAdmin, onSubstitute }) => {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isScheduled = match.status === 'scheduled';
  const isBye = match.isBye || match.status === 'bye';

  const isTeam1Winner =
    match.winnerTeam && match.team1 && (match.winnerTeam._id === match.team1._id || match.winnerTeam === match.team1._id);
  const isTeam2Winner =
    match.winnerTeam && match.team2 && (match.winnerTeam._id === match.team2._id || match.winnerTeam === match.team2._id);

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all duration-200 shadow-xs ${
        isLive
          ? 'bg-[#FAF9F6] dark:bg-[#181C1F] border-[#E74C3C] ring-1 ring-[#E74C3C]/50 shadow-md'
          : isScheduled
          ? 'bg-white dark:bg-[#15191C] border-[#3E342B] dark:border-[#D4A94C]/40'
          : isCompleted
          ? 'bg-white dark:bg-[#15191C] border-[#E8E1D5] dark:border-[#2B3034]'
          : isBye
          ? 'bg-[#FAF9F6]/80 dark:bg-[#15191C]/60 border-[#D5C4A1]/40 dark:border-[#2B3034]'
          : 'bg-white dark:bg-[#15191C] border-[#E8E1D5] dark:border-[#2B3034]'
      }`}
    >
      {/* Node Meta: Match # & Status */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E8E1D5] dark:border-[#2B3034] text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] text-[11px]">M#{match.matchNumber}</span>
          {isFinal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] font-bold uppercase font-mono text-[9px] border border-[#E74C3C]/30">
              <CarromCoin type="queen" size="xs" />
              <span>FINAL</span>
            </span>
          )}
        </div>
        <StatusBadge status={match.status} queuePosition={match.queuePosition} />
      </div>

      {/* Team 1 Slot */}
      <div
        className={`group flex items-center justify-between p-2 rounded-lg mb-1.5 transition-all text-xs ${
          isTeam1Winner
            ? 'bg-[#FAF9F6] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] font-bold border border-[#D5C4A1] dark:border-[rgba(212,169,76,0.3)]'
            : match.team1
            ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8]'
            : 'bg-[#FAF9F6]/60 dark:bg-[#121517] text-[#7E7060]/70 dark:text-[#817B72] italic'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          <CarromCoin type={match.team1 ? "black" : "white"} size="xs" />
          <span className="truncate">
            {match.team1 ? match.team1.name : 'TBD (Round Winner)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && match.team1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSubstitute && onSubstitute(match, 'team1');
              }}
              title="Substitute partner / update player name"
              className="p-1 rounded-md text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#E74C3C] hover:bg-white dark:hover:bg-[#202529] transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
          {isTeam1Winner && (
            <span className="text-[10px] font-mono font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1 shrink-0">
              <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
              <span>WIN</span>
            </span>
          )}
        </div>
      </div>

      {/* Team 2 Slot */}
      <div
        className={`group flex items-center justify-between p-2 rounded-lg transition-all text-xs ${
          isBye
            ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060] dark:text-[#817B72] italic border border-[#D5C4A1] dark:border-[#2B3034]'
            : isTeam2Winner
            ? 'bg-[#FAF9F6] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] font-bold border border-[#D5C4A1] dark:border-[rgba(212,169,76,0.3)]'
            : match.team2
            ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8]'
            : 'bg-[#FAF9F6]/60 dark:bg-[#121517] text-[#7E7060]/70 dark:text-[#817B72] italic'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          <CarromCoin type={isBye ? "white" : match.team2 ? "black" : "white"} size="xs" />
          <span className="truncate">
            {isBye ? 'BYE (Automatic Advance)' : match.team2 ? match.team2.name : 'TBD (Round Winner)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && match.team2 && !isBye && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSubstitute && onSubstitute(match, 'team2');
              }}
              title="Substitute partner / update player name"
              className="p-1 rounded-md text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#E74C3C] hover:bg-white dark:hover:bg-[#202529] transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
          {isTeam2Winner && !isBye && (
            <span className="text-[10px] font-mono font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1 shrink-0">
              <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
              <span>WIN</span>
            </span>
          )}
        </div>
      </div>

      {/* Completed Match Time Taken & Details */}
      {isCompleted && (
        <div className="mt-2.5 pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#3E342B] dark:text-[#F5F1E8] bg-[#FAF9F6] dark:bg-[#181C1F] px-2 py-0.5 rounded-md border border-[#E8E1D5] dark:border-[#2B3034]">
            <Clock className="w-3 h-3 text-[#E74C3C]" />
            <span>{formatMatchDurationTaken(match)}</span>
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSubstitute && onSubstitute(match, 'team1')}
                title="Substitute partner or update match name"
                className="text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#E74C3C] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                <Users className="w-3 h-3" />
                <span>Substitute</span>
              </button>
            )}
            {isAdmin && (
              <Link
                href={`/admin/matches/${match._id}/score`}
                className="text-[#E74C3C] dark:text-[#D4A94C] hover:underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              >
                <span>Scorecard</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Live Match Active Timer */}
      {isLive && (
        <div className="mt-2.5 pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between">
          <CarromMatchTimer match={match} variant="compact" />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSubstitute && onSubstitute(match, 'team1')}
                title="Substitute partner or update match name"
                className="text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#E74C3C] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                <Users className="w-3 h-3" />
                <span>Substitute</span>
              </button>
            )}
            {isAdmin && (
              <Link
                href={`/admin/matches/${match._id}/score`}
                className="text-[#E74C3C] font-mono text-[10px] font-bold uppercase hover:underline flex items-center gap-0.5"
              >
                <span>Score</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Admin Referee Action for Scheduled/Pending Match */}
      {isAdmin && !isBye && (match.team1 || match.team2) && !isLive && !isCompleted && (
        <div className="mt-2.5 pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-[10px] font-mono">
          <button
            type="button"
            onClick={() => onSubstitute && onSubstitute(match, 'team1')}
            className="flex items-center gap-1 text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#E74C3C] dark:hover:text-[#E74C3C] font-bold transition-colors uppercase tracking-wider cursor-pointer"
            title="Change partner or player name in this match fixture"
          >
            <Users className="w-3 h-3 text-[#E74C3C]" />
            <span>Change Partner</span>
          </button>
          {match.team1 && match.team2 && (
            <Link
              href={`/admin/matches/${match._id}/score`}
              className="flex items-center gap-1 font-bold text-[#E74C3C] dark:text-[#D4A94C] hover:underline transition-colors uppercase tracking-wider"
            >
              <span>Score Match</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};


