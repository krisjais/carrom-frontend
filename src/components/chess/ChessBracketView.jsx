'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Trophy, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Undo2, Crown, Shield, 
  Play, Pause, Clock, Trash2, Zap, ArrowRight, UserCheck, Sparkles, ArrowRightLeft, Loader2, Move 
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

/**
 * Format remaining seconds to mm:ss format
 */
function formatClockTime(seconds = 600) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function ChessBracketView({
  matches = [],
  isAdmin = false,
  onStartMatch,
  onPauseResumeMatch,
  onSwitchTurnMatch,
  onUndoTurnMatch,
  onQuickAddTime,
  onOpenTimeModal,
  onOpenMatchModal,
  onRestartMatch,
  onOpenResultModal,
  onDeleteMatch,
  onDeleteRound,
  startingMatchId = null,
  deletingMatchId = null
}) {
  const [zoom, setZoom] = useState(1);
  const [mobileRoundFilter, setMobileRoundFilter] = useState('all');
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const stages = useMemo(() => groupMatchesIntoStages(matches), [matches]);
  const visibleStages = useMemo(() => {
    if (mobileRoundFilter === 'all') return stages;
    return stages.filter((s) => String(s.roundNumber) === String(mobileRoundFilter));
  }, [stages, mobileRoundFilter]);

  // Mouse drag-to-pan implementation
  const handleMouseDown = (e) => {
    // Only pan if not clicking interactive elements (buttons, links, inputs)
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }
    if (!containerRef.current) return;
    setIsPanning(true);
    setDragStart({
      x: e.pageX - containerRef.current.offsetLeft,
      y: e.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - dragStart.x) * 1.3;
    const walkY = (y - dragStart.y) * 1.3;
    containerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    containerRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoom(1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

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
    <div className="space-y-4">
      
      {/* Top Controls Bar: Stage Stats & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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

        {/* Zoom & Scroll Helpers */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93] px-2.5 py-1 rounded-lg bg-[#EFEAE1]/40 dark:bg-[#1E1E1C]/60 border border-[#D5CFC5]/50 dark:border-[#282826]">
            <Move className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Click & Drag to Pan • Scroll in any direction</span>
          </div>

          <div className="flex items-center gap-1 bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#D5CFC5] dark:border-[#2E2E2B]">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.5, +(zoom - 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-[#171715] dark:text-[#FAF8F3] font-bold min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(1.5, +(zoom + 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:bg-[#FAF8F3] dark:hover:bg-[#151514] transition-colors ml-0.5 cursor-pointer flex items-center gap-1 text-[11px] font-mono"
              title="Reset Zoom & Pan to Start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Round Jump Tabs (Easy one-handed navigation on phones) */}
      {totalStages > 1 && (
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setMobileRoundFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
              mobileRoundFilter === 'all'
                ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D]'
                : 'bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93]'
            }`}
          >
            All Stages ({totalStages})
          </button>
          {stages.map((stage) => (
            <button
              key={stage.roundNumber}
              type="button"
              onClick={() => setMobileRoundFilter(String(stage.roundNumber))}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                String(mobileRoundFilter) === String(stage.roundNumber)
                  ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D]'
                  : 'bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93]'
              }`}
            >
              {stage.roundName}
            </button>
          ))}
        </div>
      )}

      {/* Bracket Tree Container with both horizontal and vertical scrolling + panning */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`w-full overflow-x-auto overflow-y-auto max-h-[82vh] pb-10 sm:pb-12 pt-4 sm:pt-6 rounded-2xl sm:rounded-3xl bg-[#FAF8F3] dark:bg-[#101010] border border-[#D5CFC5] dark:border-[#262624] p-3.5 sm:p-8 min-h-[380px] sm:min-h-[580px] shadow-xs relative transition-colors ${
          isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ scrollBehavior: isPanning ? 'auto' : 'smooth' }}
      >
        <div
          className={`flex items-stretch gap-6 sm:gap-16 ${mobileRoundFilter !== 'all' ? 'w-full md:min-w-max' : 'min-w-max'} transition-transform origin-top-left relative`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          {visibleStages.map((stage, sIdx) => {
            const isFinalStage = stage.roundNumber === stages[totalStages - 1]?.roundNumber;

            return (
              <div
                key={stage.roundNumber}
                className={`flex flex-col shrink-0 relative ${
                  mobileRoundFilter !== 'all' ? 'w-full md:w-80' : 'w-[272px] sm:w-80'
                }`}
              >
                
                {/* Stage Header with Stage name and Direct Round Delete option for Admins */}
                <div className="pb-3 mb-6 border-b border-[#D5CFC5] dark:border-[#262624] relative">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-widest font-bold">
                      STAGE {sIdx + 1} OF {totalStages}
                    </span>
                    {isAdmin && onDeleteRound && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRound(stage.roundNumber, stage.roundName, stage.matches.length);
                        }}
                        className="p-1 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={`Delete ${stage.roundName} (${stage.matches.length} matches)`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    {stage.roundName}
                  </h4>
                  <span className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                    {stage.matches.length} {stage.matches.length === 1 ? 'Championship Final' : 'Matches'}
                  </span>
                </div>

                {/* Match Cards List */}
                <div className="flex flex-col justify-around flex-grow gap-8 relative py-2">
                  {stage.matches?.filter(Boolean).map((match) => (
                    <ChessMatchNode
                      key={match?._id || match?.matchId}
                      match={match}
                      isFinal={isFinalStage}
                      isAdmin={isAdmin}
                      onStartMatch={onStartMatch}
                      onPauseResumeMatch={onPauseResumeMatch}
                      onSwitchTurnMatch={onSwitchTurnMatch}
                      onUndoTurnMatch={onUndoTurnMatch}
                      onQuickAddTime={onQuickAddTime}
                      onOpenTimeModal={onOpenTimeModal}
                      onOpenMatchModal={onOpenMatchModal}
                      onRestartMatch={onRestartMatch}
                      onOpenResultModal={onOpenResultModal}
                      onDeleteMatch={onDeleteMatch}
                      isStarting={startingMatchId === (match?._id || match?.matchId)}
                      isDeleting={deletingMatchId === (match?._id || match?.matchId)}
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
  onSwitchTurnMatch,
  onUndoTurnMatch,
  onQuickAddTime,
  onOpenTimeModal,
  onOpenMatchModal,
  onRestartMatch,
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
      className={`rounded-2xl border p-4 transition-all duration-200 shadow-xs relative group hover:shadow-md hover:border-amber-500/70 dark:hover:border-amber-500/70 ${
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
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-[#D5CFC5]/70 dark:border-[#262624] text-[10px] font-mono">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMatchModal && onOpenMatchModal(match);
            }}
            className="font-bold text-[#171715] dark:text-[#FAF8F3] text-[11px] hover:text-amber-700 dark:hover:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            title="Open Match Dossier & Arbiter Desk"
          >
            {match.matchId}
          </button>
          {match.boardNumber && (
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#77736B] dark:text-[#A8A49C] border border-[#D5CFC5]/60 dark:border-[#282826]">
              Board #{match.boardNumber}
            </span>
          )}
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

        {/* Status Pill & Delete Button */}
        <div className="flex items-center gap-1.5">
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

          {/* Direct Delete Match Button */}
          {onDeleteMatch && !isBye && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMatch(match._id || match.matchId, match.matchId);
              }}
              disabled={isDeleting}
              className="w-5 h-5 rounded-md flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title={`Delete match ${match.matchId}`}
            >
              {isDeleting ? <Loader2 className="w-2.5 h-2.5 animate-spin text-rose-600" /> : <Trash2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* PLAYER 1 SLOT (WHITE) */}
      <div
        className={`flex items-center justify-between p-2.5 rounded-xl mb-1.5 transition-all text-xs ${
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
          <span className="truncate font-serif font-bold text-xs sm:text-sm">
            {p1Name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {isLive && (
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                match.activeTurn === 'white'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-500/30 animate-pulse'
                  : 'bg-[#EFEAE1] dark:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93]'
              }`}
            >
              {formatClockTime(match.whiteTimeRemaining)}
            </span>
          )}
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
        className={`flex items-center justify-between p-2.5 rounded-xl transition-all text-xs ${
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
          <span className="truncate font-serif font-bold text-xs sm:text-sm">
            {p2Name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {isLive && !isBye && (
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                match.activeTurn === 'black'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-500/30 animate-pulse'
                  : 'bg-[#EFEAE1] dark:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93]'
              }`}
            >
              {formatClockTime(match.blackTimeRemaining)}
            </span>
          )}
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

      {/* FOOTER ACTIONS & CLOCK CONTROLS (Clean, 2-tier, never overflowing!) */}
      <div className="mt-3 pt-2.5 border-t border-[#D5CFC5]/70 dark:border-[#262624] space-y-2 text-[10px] font-mono">
        {/* Row 1: Status & Click to Open Match Modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{match.activeTurn === 'black' ? "Black's Turn" : "White's Turn"}</span>
                <span className="opacity-60 font-normal">• {match.movesCount || 0} moves</span>
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                Completed
              </span>
            ) : isBye ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                Auto Advanced
              </span>
            ) : (
              <span className="text-[#77736B] dark:text-[#8E8E93] text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{match.durationMinutes || 10}m Rapid</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMatchModal && onOpenMatchModal(match);
            }}
            className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 transition-colors cursor-pointer shadow-2xs"
            title="Open match detail & controls modal"
          >
            <span>Open Match</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Row 2: Quick Arbiter Actions */}
        {isAdmin && !isBye && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
            {isLive ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPauseResumeMatch && onPauseResumeMatch(match);
                  }}
                  className={`flex-1 py-1 rounded-lg uppercase font-bold text-[10px] inline-flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer ${
                    match.isClockRunning !== false
                      ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-black'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  }`}
                  title={match.isClockRunning !== false ? 'Pause timer' : 'Resume timer'}
                >
                  {match.isClockRunning !== false ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                  <span>{match.isClockRunning !== false ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchTurnMatch && onSwitchTurnMatch(match);
                  }}
                  className="flex-1 py-1 rounded-lg uppercase font-bold text-[10px] bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  title={`Pass turn to ${match.activeTurn === 'black' ? 'White' : 'Black'}`}
                >
                  <ArrowRightLeft className="w-2.5 h-2.5" />
                  <span>Switch ({match.activeTurn === 'black' ? 'W' : 'B'})</span>
                </button>

                {onUndoTurnMatch && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUndoTurnMatch(match);
                    }}
                    disabled={!match.previousClockState?.activeTurn && !(match.movesCount > 0) && match.activeTurn !== 'black'}
                    className="px-2 py-1 rounded-lg uppercase font-bold text-[10px] border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Admin Only: Undo last turn switch"
                  >
                    <Undo2 className="w-2.5 h-2.5" />
                    <span>Undo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestartMatch && onRestartMatch(match);
                  }}
                  className="px-2 py-1 rounded-lg uppercase font-bold text-[10px] border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Restart match from beginning"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Restart</span>
                </button>
              </>
            ) : isScheduled ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartMatch && onStartMatch(match._id);
                  }}
                  disabled={isStarting}
                  className="flex-1 bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black py-1 rounded-lg uppercase font-bold inline-flex items-center justify-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer text-[10px]"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Start (10m)</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenResultModal && onOpenResultModal(match);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg uppercase font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer text-[10px]"
                >
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>Winner</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestartMatch && onRestartMatch(match);
                  }}
                  className="px-2 py-1 rounded-lg uppercase font-bold text-[10px] border border-[#D5CFC5] dark:border-[#262624] text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] inline-flex items-center gap-1 cursor-pointer"
                  title="Reset clocks"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenResultModal && onOpenResultModal(match);
                  }}
                  className="flex-1 border border-[#D5CFC5] dark:border-[#2E2E2B] bg-[#EFEAE1] dark:bg-[#20201E] hover:bg-[#E4DED5] text-[#171715] dark:text-[#FAF8F3] py-1 rounded-lg uppercase font-bold text-[10px] text-center cursor-pointer"
                >
                  Edit Winner
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestartMatch && onRestartMatch(match);
                  }}
                  className="px-2.5 py-1 rounded-lg uppercase font-bold text-[10px] border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Restart match from beginning"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Restart Match</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
