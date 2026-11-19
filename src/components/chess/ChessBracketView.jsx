'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Crown, Shield, 
  Play, Pause, Clock, Trash2, Zap, ArrowRight, UserCheck, Sparkles 
} from 'lucide-react';

/**
 * Standardizes matches into an ordered array of rounds/stages:
 * Stage 1 (Round 1), Stage 2 (Round 2), ..., Stage N (Finals / Grand Finals)
 */
function groupMatchesIntoStages(matches = []) {
  if (!matches || matches.length === 0) return [];

  // Group by round number
  const roundMap = new Map();

  matches.forEach((m) => {
    const rNum = m.round || 1;
    if (!roundMap.has(rNum)) {
      roundMap.set(rNum, {
        roundNumber: rNum,
        roundName: m.roundName || `Round ${rNum}`,
        matches: []
      });
    }
    roundMap.get(rNum).matches.push(m);
  });

  // Sort rounds ascending
  const sortedRounds = Array.from(roundMap.values()).sort((a, b) => a.roundNumber - b.roundNumber);

  // Beautify names if generic and it's the final stage
  const totalStages = sortedRounds.length;
  sortedRounds.forEach((round, index) => {
    if (index === totalStages - 1 && totalStages > 1) {
      if (!round.roundName.toLowerCase().includes('final')) {
        round.roundName = round.matches.length === 1 ? 'Championship Final' : 'Final Round';
      }
    } else if (index === totalStages - 2 && totalStages > 2) {
      if (!round.roundName.toLowerCase().includes('semi') && !round.roundName.toLowerCase().includes('quarter')) {
        round.roundName = 'Semi-Finals';
      }
    }
  });

  return sortedRounds;
}

export function ChessBracketView({
  matches = [],
  isAdmin = false,
  onStartMatch,
  onPauseResumeMatch,
  onOpenResultModal,
  onDeleteMatch,
  startingMatchId = null,
  deletingMatchId = null
}) {
  const [zoom, setZoom] = useState(1);

  const stages = useMemo(() => groupMatchesIntoStages(matches), [matches]);

  if (!matches || matches.length === 0 || stages.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#EFEAE1] dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#2E2E2B] flex items-center justify-center mx-auto text-[#171715] dark:text-[#FAF8F3]">
          <Trophy className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
          No Bracket Generated Yet
        </h3>
        <p className="text-xs text-[#77736B] dark:text-[#8E8E93] max-w-md mx-auto leading-relaxed">
          The knockout elimination tree has not been drawn yet. When rounds are generated, each stage connects automatically from Round 1 through the Championship Finals.
        </p>
      </div>
    );
  }

  const totalStages = stages.length;

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar: Stage Stats & Zoom Controls (Identical UX to Carrom) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#77736B] dark:text-[#8E8E93] font-mono uppercase font-bold">
            Format:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#2E2E2B] font-mono tracking-wider">
            <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>KNOCKOUT SINGLE ELIMINATION</span>
          </span>
          <span className="text-xs text-[#D5CFC5] dark:text-[#2E2E2B]">|</span>
          <span className="text-xs text-[#171715] dark:text-[#FAF8F3] font-mono font-bold">
            {totalStages} Knockout Stage{totalStages === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-[#D5CFC5] dark:text-[#2E2E2B]">|</span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            10:00 Rapid Clocks
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#D5CFC5] dark:border-[#2E2E2B]">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.65, zoom - 0.1))}
            className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
            className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors ml-1 cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bracket Tree Container with horizontal scroll */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-12 pt-6 rounded-3xl bg-[#FAF8F3] dark:bg-[#101010] border border-[#D5CFC5] dark:border-[#262624] p-6 sm:p-8 min-h-[580px] shadow-xs relative transition-colors">
        <div
          className="flex items-stretch gap-12 sm:gap-16 min-w-max transition-transform origin-top-left relative"
          style={{ transform: `scale(${zoom})` }}
        >
          {stages.map((stage, sIdx) => {
            const isFinalStage = sIdx === totalStages - 1;
            const isSemiFinal = sIdx === totalStages - 2;

            return (
              <div key={stage.roundNumber} className="flex flex-col w-80 shrink-0 relative">
                
                {/* Stage Header (Identical to Carrom's Stage 1 of 2 Semifinals style) */}
                <div className="text-center pb-3 mb-6 border-b border-[#D5CFC5] dark:border-[#262624]">
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-widest font-bold block">
                    STAGE {sIdx + 1} OF {totalStages}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    {stage.roundName}
                  </h4>
                  <span className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                    {stage.matches.length} {stage.matches.length === 1 ? 'Championship Final' : 'Matches'}
                  </span>
                </div>

                {/* Match Cards List */}
                <div className="flex flex-col justify-around flex-grow gap-8 relative">
                  {stage.matches?.filter(Boolean).map((match) => (
                    <ChessMatchNode
                      key={match?._id || match?.matchId}
                      match={match}
                      isFinal={isFinalStage}
                      isAdmin={isAdmin}
                      onStartMatch={onStartMatch}
                      onPauseResumeMatch={onPauseResumeMatch}
                      onOpenResultModal={onOpenResultModal}
                      onDeleteMatch={onDeleteMatch}
                      isStarting={startingMatchId === match._id}
                      isDeleting={deletingMatchId === match._id}
                    />
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/**
 * Individual Match Node in the Bracket
 * Handles:
 * - Player 1 (White)
 * - Player 2 (Black)
 * - Automatic BYE nomination representation
 * - Live Timers and Material Scores
 * - Winner Crowns
 */
function ChessMatchNode({
  match,
  isFinal,
  isAdmin,
  onStartMatch,
  onPauseResumeMatch,
  onOpenResultModal,
  onDeleteMatch,
  isStarting,
  isDeleting
}) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isScheduled = match.status === 'scheduled';
  const isBye = match.isBye || match.resultType === 'bye';

  const p1Raw = match.player1 || match.byePlayer;
  const p2Raw = match.player2;

  const p1Name = (p1Raw && typeof p1Raw === 'object' && p1Raw.fullName)
    ? p1Raw.fullName
    : typeof p1Raw === 'string'
    ? p1Raw
    : isBye
    ? (match.byePlayer?.fullName || 'Advancing Player')
    : 'TBD (Round Winner)';

  const p2Name = isBye
    ? 'BYE — Automatic Nomination'
    : (p2Raw && typeof p2Raw === 'object' && p2Raw.fullName)
    ? p2Raw.fullName
    : typeof p2Raw === 'string'
    ? p2Raw
    : 'TBD (Round Winner)';

  const winnerPlayerId = (match?.winnerPlayer?._id || match?.winnerPlayer)?.toString();
  const p1Id = (match?.player1?._id || match?.player1 || match?.byePlayer?._id || match?.byePlayer)?.toString();
  const p2Id = (match?.player2?._id || match?.player2)?.toString();

  const isP1Winner =
    isCompleted &&
    (isBye ||
      match?.winner === 'player1' ||
      Boolean(winnerPlayerId && p1Id && winnerPlayerId === p1Id));

  const isP2Winner =
    isCompleted &&
    !isBye &&
    (match?.winner === 'player2' ||
      Boolean(winnerPlayerId && p2Id && winnerPlayerId === p2Id));


  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 shadow-xs relative ${
        isLive
          ? 'bg-[#FAF8F3] dark:bg-[#181816] border-rose-500 ring-2 ring-rose-500/30 shadow-lg'
          : isBye
          ? 'bg-gradient-to-br from-amber-50/70 to-emerald-50/50 dark:from-amber-950/20 dark:to-emerald-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
          : isScheduled
          ? 'bg-[#FAF8F3] dark:bg-[#151514] border-[#171715]/40 dark:border-[#FAF8F3]/30'
          : isCompleted
          ? 'bg-[#FAF8F3] dark:bg-[#151514] border-[#D5CFC5] dark:border-[#262624]'
          : 'bg-[#FAF8F3] dark:bg-[#151514] border-[#D5CFC5] dark:border-[#262624]'
      }`}
    >
      
      {/* Node Meta: Match # & Status */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#D5CFC5]/70 dark:border-[#262624] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#171715] dark:text-[#FAF8F3] text-[11px]">
            {match.matchId}
          </span>
          {isFinal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold uppercase text-[9px] border border-amber-300 dark:border-amber-800">
              <Trophy className="w-3 h-3" />
              <span>FINAL</span>
            </span>
          )}
          {isBye && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold uppercase text-[9px] border border-emerald-300 dark:border-emerald-800">
              <UserCheck className="w-3 h-3" />
              <span>BYE PASS</span>
            </span>
          )}
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
            isLive
              ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300'
              : isBye
              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
              : isCompleted
              ? 'bg-[#EFEAE1] dark:bg-[#20201E] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5]'
              : 'bg-[#EFEAE1]/60 dark:bg-[#1B1B19] text-[#77736B] dark:text-[#8E8E93] border border-[#D5CFC5]/70'
          }`}
        >
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-ping" />}
          {isBye ? 'BYE ADVANCE' : match.status}
        </span>
      </div>

      {/* PLAYER 1 SLOT (WHITE) */}
      <div
        className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-all text-xs ${
          isP1Winner
            ? 'bg-amber-50 dark:bg-amber-950/40 text-[#171715] dark:text-[#FAF8F3] font-bold border border-amber-300 dark:border-amber-700/60'
            : match.player1 || match.byePlayer
            ? 'bg-[#EFEAE1]/60 dark:bg-[#1A1A18] text-[#171715] dark:text-[#FAF8F3]'
            : 'bg-[#EFEAE1]/30 dark:bg-[#121210] text-[#77736B] italic'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {/* White Piece Symbol */}
          <span className="w-5 h-5 rounded-md bg-white border border-[#D5CFC5] text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            ♔
          </span>
          <span className="truncate font-serif">
            {p1Name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono">
          {isP1Winner && (
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>WIN</span>
            </span>
          )}
        </div>
      </div>

      {/* PLAYER 2 SLOT (BLACK OR BYE) */}
      <div
        className={`flex items-center justify-between p-2 rounded-xl transition-all text-xs ${
          isBye
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 font-medium'
            : isP2Winner
            ? 'bg-amber-50 dark:bg-amber-950/40 text-[#171715] dark:text-[#FAF8F3] font-bold border border-amber-300 dark:border-amber-700/60'
            : match.player2
            ? 'bg-[#EFEAE1]/60 dark:bg-[#1A1A18] text-[#171715] dark:text-[#FAF8F3]'
            : 'bg-[#EFEAE1]/30 dark:bg-[#121210] text-[#77736B] italic'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {/* Black Piece Symbol or BYE Shield */}
          {isBye ? (
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
              🛡️
            </span>
          ) : (
            <span className="w-5 h-5 rounded-md bg-[#171715] border border-white/30 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              ♚
            </span>
          )}
          <span className="truncate font-serif">
            {p2Name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono">
          {isP2Winner && !isBye && (
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>WIN</span>
            </span>
          )}
        </div>
      </div>

      {/* BYE HIGHLIGHT NOTIFICATION (Explicit Nomination to Next Round) */}
      {isBye && (
        <div className="mt-2.5 pt-2 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
          <span className="inline-flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Nominated Directly to Next Round</span>
          </span>
          <span className="font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            +3 PTS
          </span>
        </div>
      )}

      {/* FOOTER ACTIONS & CLOCK CONTROLS */}
      <div className="mt-3 pt-2.5 border-t border-[#D5CFC5]/70 dark:border-[#262624] flex items-center justify-between text-[10px] font-mono">
        
        {/* Left: Clock Badge */}
        <div className="flex items-center gap-1.5 text-[#77736B] dark:text-[#8E8E93]">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>{match.durationMinutes || 10}m Rapid</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Scheduled Match -> Start (10m) */}
          {isAdmin && isScheduled && !isBye && (
            <>
              <button
                type="button"
                onClick={() => onStartMatch && onStartMatch(match._id)}
                disabled={isStarting}
                className="bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black px-2.5 py-1 rounded-lg uppercase font-bold inline-flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Start</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenResultModal && onOpenResultModal(match)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-lg uppercase font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Declare Winner directly"
              >
                <Crown className="w-2.5 h-2.5 fill-current" />
                <span>Winner</span>
              </button>
            </>
          )}

          {/* Live Match -> Pause/Resume Clock & Declare Winner */}
          {isAdmin && isLive && (
            <>
              <button
                type="button"
                onClick={() => onPauseResumeMatch && onPauseResumeMatch(match)}
                className={`px-2 py-1 rounded-lg uppercase font-bold inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer ${
                  match.isClockRunning !== false
                    ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-black'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                }`}
                title={match.isClockRunning !== false ? 'Pause match timer' : 'Resume match timer'}
              >
                {match.isClockRunning !== false ? (
                  <>
                    <Pause className="w-2.5 h-2.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenResultModal && onOpenResultModal(match)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg uppercase font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Crown className="w-2.5 h-2.5 fill-current" />
                <span>Declare Winner</span>
              </button>
            </>
          )}

          {/* Edit Result for Completed */}
          {isAdmin && isCompleted && !isBye && (
            <button
              type="button"
              onClick={() => onOpenResultModal && onOpenResultModal(match)}
              className="border border-[#D5CFC5] dark:border-[#2E2E2B] bg-[#EFEAE1] dark:bg-[#20201E] hover:bg-[#E4DED5] text-[#171715] dark:text-[#FAF8F3] px-2 py-1 rounded-lg uppercase font-bold cursor-pointer"
            >
              Edit Winner
            </button>
          )}

          {/* Delete match if Admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onDeleteMatch && onDeleteMatch(match._id, match.matchId)}
              disabled={isDeleting}
              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title={`Delete fixture ${match.matchId}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {/* View Details Link */}
          <Link
            href={`/chess/matches/${match._id || match.matchId}`}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wider pl-1"
          >
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

      </div>

    </div>
  );
}
