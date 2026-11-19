'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Flag, Sparkles } from 'lucide-react';
import { chessApi } from '@/lib/chessApi';

/**
 * Native Web Audio synthesizer for turn-switch clicks and flag fall alarm
 * Zero external audio files required, runs directly in any browser.
 */
function playAudioTone(type = 'click') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      // Crisp mechanical chess clock tap sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'urgent') {
      // Low-time warning beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'flag') {
      // Flag fall buzzer
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch {
    // Ignore audio errors on un-interacted page
  }
}

export function DualChessClock({
  match = null,
  initialMinutes = 10,
  player1Name = 'White Player',
  player2Name = 'Black Player',
  onTimeExpired,
  onTurnChange,
  variant = 'standard', // 'standard' | 'compact' | 'modal'
  readOnly = false
}) {
  const matchId = match?._id || match?.matchId || null;
  const initialSeconds = (match?.durationMinutes || initialMinutes) * 60;

  // Resolve initial state from match if available
  const getInitialWhite = () => {
    if (typeof match?.whiteTimeRemaining === 'number') return match.whiteTimeRemaining;
    return initialSeconds;
  };
  const getInitialBlack = () => {
    if (typeof match?.blackTimeRemaining === 'number') return match.blackTimeRemaining;
    return initialSeconds;
  };
  const getInitialTurn = () => {
    if (match?.activeTurn && match.activeTurn !== 'none') return match.activeTurn;
    return 'white';
  };
  const getInitialRunning = () => {
    if (typeof match?.isClockRunning === 'boolean') return match.isClockRunning;
    return match?.status === 'live';
  };

  const [p1Time, setP1Time] = useState(getInitialWhite);
  const [p2Time, setP2Time] = useState(getInitialBlack);
  const [activeTurn, setActiveTurn] = useState(getInitialTurn);
  const [isRunning, setIsRunning] = useState(getInitialRunning);
  const [movesCount, setMovesCount] = useState(match?.movesCount || 0);
  const [flagFall, setFlagFall] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastTurnState, setLastTurnState] = useState(null);

  const timerRef = useRef(null);
  const channelRef = useRef(null);

  // Sync state from server prop `match` whenever it updates
  useEffect(() => {
    if (!match) return;

    let wSec = typeof match.whiteTimeRemaining === 'number' ? match.whiteTimeRemaining : initialSeconds;
    let bSec = typeof match.blackTimeRemaining === 'number' ? match.blackTimeRemaining : initialSeconds;
    const running = match.isClockRunning ?? (match.status === 'live');
    const turn = match.activeTurn && match.activeTurn !== 'none' ? match.activeTurn : 'white';

    // Account for elapsed time if clock is running on server
    if (running && match.lastClockUpdate) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(match.lastClockUpdate).getTime()) / 1000));
      if (turn === 'white') {
        wSec = Math.max(0, wSec - elapsed);
      } else if (turn === 'black') {
        bSec = Math.max(0, bSec - elapsed);
      }
    }

    // Smooth clock sync: Prevent server poll delays from overwriting local smooth countdown
    setP1Time((prev) => {
      if (isRunning && running && activeTurn === turn && Math.abs(prev - wSec) <= 2) {
        return prev;
      }
      return wSec;
    });

    setP2Time((prev) => {
      if (isRunning && running && activeTurn === turn && Math.abs(prev - bSec) <= 2) {
        return prev;
      }
      return bSec;
    });

    setActiveTurn(turn);
    setIsRunning(running && wSec > 0 && bSec > 0);
    setMovesCount(match.movesCount || 0);

    if (wSec <= 0) setFlagFall('white');
    else if (bSec <= 0) setFlagFall('black');
    else setFlagFall(null);
  }, [match?._id, match?.matchId, match?.whiteTimeRemaining, match?.blackTimeRemaining, match?.activeTurn, match?.isClockRunning, match?.movesCount, match?.lastClockUpdate, initialSeconds, isRunning, activeTurn]);

  // BroadcastChannel for instant multi-tab synchronization
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    const channel = new BroadcastChannel('chess_tournament_clock');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (matchId && data.matchId && data.matchId !== matchId) return;

      const w = typeof data.p1Time === 'number' ? data.p1Time : (typeof data.whiteSeconds === 'number' ? data.whiteSeconds : null);
      const b = typeof data.p2Time === 'number' ? data.p2Time : (typeof data.blackSeconds === 'number' ? data.blackSeconds : null);

      if (w !== null) setP1Time(w);
      if (b !== null) setP2Time(b);
      if (data.activeTurn) setActiveTurn(data.activeTurn);
      const running = data.isRunning !== undefined ? data.isRunning : data.isClockRunning;
      if (typeof running === 'boolean') setIsRunning(running);
      if (typeof data.movesCount === 'number') setMovesCount(data.movesCount);
      if (data.flagFall !== undefined) setFlagFall(data.flagFall);
    };

    return () => {
      channel.close();
    };
  }, [matchId]);

  // Helper to broadcast clock state to all tabs and sync to backend
  const broadcastAndSync = useCallback((updates) => {
    const payload = {
      matchId,
      p1Time: updates.p1Time !== undefined ? updates.p1Time : p1Time,
      p2Time: updates.p2Time !== undefined ? updates.p2Time : p2Time,
      activeTurn: updates.activeTurn !== undefined ? updates.activeTurn : activeTurn,
      isRunning: updates.isRunning !== undefined ? updates.isRunning : isRunning,
      movesCount: updates.movesCount !== undefined ? updates.movesCount : movesCount,
      flagFall: updates.flagFall !== undefined ? updates.flagFall : flagFall,
      timestamp: Date.now()
    };

    if (channelRef.current) {
      try {
        channelRef.current.postMessage(payload);
      } catch {
        // Channel closed or unavailable
      }
    }

    if (matchId) {
      chessApi.syncMatchClock(matchId, {
        activeTurn: payload.activeTurn,
        whiteTimeRemaining: payload.p1Time,
        blackTimeRemaining: payload.p2Time,
        movesCount: payload.movesCount,
        isClockRunning: payload.isRunning,
        status: payload.isRunning ? 'live' : undefined
      }).catch((err) => {
        console.error('Failed to sync clock to server:', err);
      });
    }
  }, [matchId, p1Time, p2Time, activeTurn, isRunning, movesCount, flagFall]);

  // Countdown loop
  useEffect(() => {
    if (!isRunning || !activeTurn || flagFall) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (activeTurn === 'white') {
        setP1Time((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setFlagFall('white');
            if (soundEnabled) playAudioTone('flag');
            if (onTimeExpired) onTimeExpired('white');
            broadcastAndSync({ p1Time: 0, isRunning: false, flagFall: 'white' });
            return 0;
          }
          if (prev === 31 || prev === 11) {
            if (soundEnabled) playAudioTone('urgent');
          }
          return prev - 1;
        });
      } else if (activeTurn === 'black') {
        setP2Time((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setFlagFall('black');
            if (soundEnabled) playAudioTone('flag');
            if (onTimeExpired) onTimeExpired('black');
            broadcastAndSync({ p2Time: 0, isRunning: false, flagFall: 'black' });
            return 0;
          }
          if (prev === 31 || prev === 11) {
            if (soundEnabled) playAudioTone('urgent');
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, activeTurn, flagFall, soundEnabled, onTimeExpired, broadcastAndSync]);

  // Start / Resume Game
  const handleStartResume = () => {
    if (flagFall) return;
    const turn = activeTurn || 'white';
    setActiveTurn(turn);
    setIsRunning(true);
    if (soundEnabled) playAudioTone('click');
    broadcastAndSync({ activeTurn: turn, isRunning: true });
  };

  // Pause
  const handlePause = () => {
    setIsRunning(false);
    broadcastAndSync({ isRunning: false });
  };

  // Switch turn
  const handleSwitchTurn = useCallback((forcedTurn = null) => {
    if (flagFall) return;

    let nextTurn;
    if (forcedTurn) {
      nextTurn = forcedTurn;
    } else {
      if (!isRunning) {
        nextTurn = activeTurn === 'black' ? 'white' : 'black';
      } else {
        nextTurn = activeTurn === 'white' ? 'black' : 'white';
      }
    }

    // Save snapshot for Undo
    setLastTurnState({
      activeTurn,
      p1Time,
      p2Time,
      movesCount
    });

    const nextMoves = activeTurn === 'black' ? movesCount + 1 : movesCount;
    setActiveTurn(nextTurn);
    setIsRunning(true);
    setMovesCount(nextMoves);

    if (soundEnabled) playAudioTone('click');

    broadcastAndSync({
      activeTurn: nextTurn,
      isRunning: true,
      movesCount: nextMoves,
      p1Time,
      p2Time
    });

    if (onTurnChange) {
      onTurnChange(nextTurn);
    }
  }, [flagFall, isRunning, activeTurn, movesCount, soundEnabled, p1Time, p2Time, onTurnChange, broadcastAndSync]);

  // Undo accidental turn switch
  const handleUndoTurn = () => {
    if (flagFall) return;

    let targetTurn = activeTurn === 'white' ? 'black' : 'white';
    let targetP1 = p1Time;
    let targetP2 = p2Time;
    let targetMoves = Math.max(0, movesCount - 1);

    if (lastTurnState) {
      targetTurn = lastTurnState.activeTurn;
      targetP1 = lastTurnState.p1Time;
      targetP2 = lastTurnState.p2Time;
      targetMoves = Math.max(0, lastTurnState.movesCount);
      setLastTurnState(null);
    }

    setActiveTurn(targetTurn);
    setP1Time(targetP1);
    setP2Time(targetP2);
    setMovesCount(targetMoves);

    if (soundEnabled) playAudioTone('click');

    broadcastAndSync({
      activeTurn: targetTurn,
      p1Time: targetP1,
      p2Time: targetP2,
      movesCount: targetMoves,
      isRunning
    });
  };

  // Reset clock
  const handleReset = () => {
    setIsRunning(false);
    setActiveTurn('white');
    setFlagFall(null);
    setP1Time(initialSeconds);
    setP2Time(initialSeconds);
    setMovesCount(0);
    broadcastAndSync({
      isRunning: false,
      activeTurn: 'white',
      flagFall: null,
      p1Time: initialSeconds,
      p2Time: initialSeconds,
      movesCount: 0
    });
  };

  // Keyboard shortcut (Spacebar = switch turn, P = pause)
  useEffect(() => {
    if (readOnly) return;
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isRunning) handlePause();
        else handleStartResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, readOnly]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWhiteActive = isRunning && activeTurn === 'white';
  const isBlackActive = isRunning && activeTurn === 'black';

  const isWhiteUrgent = p1Time <= 60 && p1Time > 0;
  const isBlackUrgent = p2Time <= 60 && p2Time > 0;

  // COMPACT VARIANT (for inline cards or small modals)
  if (variant === 'compact') {
    return (
      <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-3 rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93]">
          <span className="flex items-center gap-1 font-bold">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-[#77736B]'}`} />
            {isRunning ? `${activeTurn?.toUpperCase()} CLOCK ACTIVE` : 'DUAL 10:00 CLOCK'}
          </span>
          <span>Moves: {movesCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* White Clock */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              isWhiteActive
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40'
                : 'bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border-[#D5CFC5] dark:border-[#282826]'
            }`}
          >
            <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block truncate">
              White ({player1Name.split(' ')[0]})
            </span>
            <span className={`text-xl font-mono font-black ${isWhiteUrgent ? 'text-rose-600 animate-pulse' : 'text-[#171715] dark:text-[#FAF8F3]'}`}>
              {formatTime(p1Time)}
            </span>
          </div>

          {/* Black Clock */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              isBlackActive
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40'
                : 'bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border-[#D5CFC5] dark:border-[#282826]'
            }`}
          >
            <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block truncate">
              Black ({player2Name.split(' ')[0]})
            </span>
            <span className={`text-xl font-mono font-black ${isBlackUrgent ? 'text-rose-600 animate-pulse' : 'text-[#171715] dark:text-[#FAF8F3]'}`}>
              {formatTime(p2Time)}
            </span>
          </div>
        </div>

        {/* Small Action Strip */}
        <div className="flex items-center justify-between pt-1 border-t border-[#D5CFC5]/50 dark:border-[#262624]">
          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <button
                type="button"
                onClick={handlePause}
                className="px-2.5 py-1 rounded-lg bg-[#EFEAE1] dark:bg-[#20201E] hover:bg-[#E4DED5] text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 text-[#171715] dark:text-[#FAF8F3] cursor-pointer"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartResume}
                className="px-2.5 py-1 rounded-lg bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 text-[#FAF8F3] dark:text-[#0D0D0D] cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
              title="Reset 10:00 clocks"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
            {isRunning ? '10:00 Rapid Live' : 'Clock Paused'}
          </div>
        </div>
      </div>
    );
  }

  // STANDARD & FULL-FEATURED DUAL CLOCK
  return (
    <div className={`relative bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 select-none transition-all ${
      isExpanded ? 'fixed inset-4 z-50 overflow-y-auto max-w-4xl mx-auto flex flex-col justify-between' : ''
    }`}>
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#171715] dark:text-[#FAF8F3] leading-none">
              Dual 10:00 Tournament Clock
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] pt-1 block">
              10 Mins Per Player • Turn-Based Rapid Control
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute clock sound' : 'Enable clock sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand / Minimize */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] transition-colors cursor-pointer"
            title={isExpanded ? 'Exit full clock' : 'Expand full clock'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Flag Fall Banner (Out of time outcome) */}
      {flagFall && (
        <div className="bg-gradient-to-r from-rose-500/15 via-rose-500/25 to-rose-500/15 border-2 border-rose-500 rounded-2xl p-4 text-center animate-bounce">
          <div className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono font-bold uppercase text-xs">
            <Flag className="w-4 h-4" />
            <span>TIME OUT — FLAG FELL ON {flagFall.toUpperCase()}!</span>
          </div>
          <h4 className="text-xl font-serif font-black text-[#171715] dark:text-[#FAF8F3] mt-1">
            {flagFall === 'white' ? player2Name : player1Name} Wins on Time!
          </h4>
        </div>
      )}

      {/* DUAL DIGITAL CLOCK DISPLAY (Side-by-Side or Stacked) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* PLAYER 1: WHITE CLOCK PAD */}
        <div
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-200 text-center flex flex-col justify-between min-h-[190px] ${
            isWhiteActive
              ? 'bg-[#FAF8F3] dark:bg-[#1A1A17] border-amber-500 ring-4 ring-amber-500/20 shadow-2xl scale-[1.02]'
              : 'bg-[#FAF8F3]/60 dark:bg-[#141414] border-[#D5CFC5] dark:border-[#282826] opacity-80'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white border border-[#D5CFC5] shadow-xs inline-block" />
              <span className="font-bold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                White
              </span>
            </div>
            {isWhiteActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Active Turn
              </span>
            )}
          </div>

          {/* Big Time Display */}
          <div className="py-2">
            <span
              className={`text-5xl sm:text-6xl font-mono font-black tracking-tight ${
                flagFall === 'white'
                  ? 'text-rose-600 line-through'
                  : isWhiteUrgent
                  ? 'text-rose-600 animate-pulse'
                  : isWhiteActive
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#171715] dark:text-[#FAF8F3]'
              }`}
            >
              {formatTime(p1Time)}
            </span>
          </div>

          {/* Footer / Subtitle */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] truncate">
              {player1Name}
            </h4>
            <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block">
              {isWhiteActive ? 'White Clock Active' : 'Waiting for White...'}
            </span>
          </div>
        </div>

        {/* PLAYER 2: BLACK CLOCK PAD */}
        <div
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-200 text-center flex flex-col justify-between min-h-[190px] ${
            isBlackActive
              ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#1E1E1B] border-amber-500 ring-4 ring-amber-500/20 shadow-2xl scale-[1.02]'
              : 'bg-[#2B2925] text-[#FAF8F3] dark:bg-[#161614] border-[#3E3C37] dark:border-[#282826] opacity-80'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#171715] border border-white/40 shadow-xs inline-block" />
              <span className="font-bold text-white uppercase tracking-wider">
                Black
              </span>
            </div>
            {isBlackActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Active Turn
              </span>
            )}
          </div>

          {/* Big Time Display */}
          <div className="py-2">
            <span
              className={`text-5xl sm:text-6xl font-mono font-black tracking-tight ${
                flagFall === 'black'
                  ? 'text-rose-400 line-through'
                  : isBlackUrgent
                  ? 'text-rose-400 animate-pulse'
                  : isBlackActive
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {formatTime(p2Time)}
            </span>
          </div>

          {/* Footer / Subtitle */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white truncate">
              {player2Name}
            </h4>
            <span className="text-[10px] font-mono text-[#D5CFC5]/80 block">
              {isBlackActive ? 'Black Clock Active' : 'Waiting for Black...'}
            </span>
          </div>
        </div>

      </div>

      {/* CENTRAL ACTION BAR */}
      <div className="bg-[#EFEAE1]/70 dark:bg-[#1B1B19] p-4 rounded-2xl border border-[#D5CFC5] dark:border-[#262624] flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#77736B] dark:text-[#8E8E93] uppercase">Moves:</span>
            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] bg-[#FAF8F3] dark:bg-[#20201E] px-2 py-0.5 rounded-md border border-[#D5CFC5] dark:border-[#2E2E2B]">
              {movesCount}
            </span>
          </div>
          <span className="text-[#D5CFC5] dark:text-[#2E2E2B]">|</span>
          <span className="text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93]">
            Shortcuts: <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#242422] rounded border text-[10px] font-bold">P</kbd> pause/resume
          </span>
        </div>

        {/* Action Buttons or Read-Only Status */}
        {readOnly ? (
          <div className="flex items-center gap-2 font-mono text-xs text-[#77736B] dark:text-[#8E8E93]">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isRunning ? 'Official Clock Active' : 'Official Clock Paused'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                type="button"
                onClick={handlePause}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Clock</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartResume}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{activeTurn ? 'Resume Clock' : 'Start 10:00 (White Moves)'}</span>
              </button>
            )}

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl border border-[#D5CFC5] dark:border-[#282826] bg-[#FAF8F3] dark:bg-[#20201E] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#77736B] hover:text-rose-600 transition-colors cursor-pointer"
              title="Reset to 10:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
