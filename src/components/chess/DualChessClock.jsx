'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Flag, Sparkles, RotateCw, ChevronUp, ChevronDown, Smartphone } from 'lucide-react';
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
  playerColor = 'white', // 'white' | 'black' (which player the local phone user is)
  onTimeExpired,
  onTurnChange,
  variant = 'standard', // 'standard' | 'compact' | 'phone' | 'modal'
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
  const [flipOpponent, setFlipOpponent] = useState(false);
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

  // Clock pad tap handler (tap your clock -> stops your clock, starts opponent clock)
  const handleClockPadClick = (color) => {
    if (readOnly || flagFall) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch {}

    if (!isRunning) {
      // If paused or before start: tapping passes turn to the other player and starts ticking
      const targetNextTurn = color === 'white' ? 'black' : 'white';
      setActiveTurn(targetNextTurn);
      setIsRunning(true);
      if (soundEnabled) playAudioTone('click');
      broadcastAndSync({ activeTurn: targetNextTurn, isRunning: true });
      if (onTurnChange) onTurnChange(targetNextTurn);
      return;
    }

    // When running: tapping clock passes turn to opponent
    handleSwitchTurn();
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
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleSwitchTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, readOnly, handleSwitchTurn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWhiteActive = isRunning && activeTurn === 'white';
  const isBlackActive = isRunning && activeTurn === 'black';

  const isWhiteUrgent = p1Time <= 60 && p1Time > 0;
  const isBlackUrgent = p2Time <= 60 && p2Time > 0;

  // Phone view orientation & player assignment
  const isPlayerWhite = playerColor === 'white';
  const myColor = isPlayerWhite ? 'white' : 'black';
  const oppColor = isPlayerWhite ? 'black' : 'white';

  const myTime = isPlayerWhite ? p1Time : p2Time;
  const oppTime = isPlayerWhite ? p2Time : p1Time;

  const myName = isPlayerWhite ? player1Name : player2Name;
  const oppName = isPlayerWhite ? player2Name : player1Name;

  const isMyActive = isRunning && activeTurn === myColor;
  const isOppActive = isRunning && activeTurn === oppColor;

  const isMyUrgent = myTime <= 60 && myTime > 0;
  const isOppUrgent = oppTime <= 60 && oppTime > 0;

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
          <button
            type="button"
            onClick={() => handleClockPadClick('white')}
            disabled={readOnly || !!flagFall}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
              isWhiteActive
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border-[#D5CFC5] dark:border-[#282826]'
            }`}
          >
            <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block truncate">
              White ({player1Name.split(' ')[0]})
            </span>
            <span className={`text-xl font-mono font-black ${isWhiteUrgent ? 'text-rose-600 animate-pulse' : 'text-[#171715] dark:text-[#FAF8F3]'}`}>
              {formatTime(p1Time)}
            </span>
          </button>

          {/* Black Clock */}
          <button
            type="button"
            onClick={() => handleClockPadClick('black')}
            disabled={readOnly || !!flagFall}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
              isBlackActive
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border-[#D5CFC5] dark:border-[#282826]'
            }`}
          >
            <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block truncate">
              Black ({player2Name.split(' ')[0]})
            </span>
            <span className={`text-xl font-mono font-black ${isBlackUrgent ? 'text-rose-600 animate-pulse' : 'text-[#171715] dark:text-[#FAF8F3]'}`}>
              {formatTime(p2Time)}
            </span>
          </button>
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

  // FULLSCREEN FACE-TO-FACE TABLETOP DIGITAL CLOCK
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F2EB] dark:bg-[#0A0A0A] p-2 sm:p-4 flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-200">
        {/* UPPER SIDE: OPPONENT TIMER (Rotated 180° for Over-the-Board Play) */}
        <button
          type="button"
          onClick={() => handleClockPadClick(oppColor)}
          disabled={readOnly || !!flagFall}
          className={`flex-1 w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center transition-all cursor-pointer border-2 shadow-lg active:scale-[0.99] select-none ${
            flipOpponent ? 'rotate-180' : ''
          } ${
            isOppActive
              ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-500 ring-4 ring-amber-500/30 text-amber-950 dark:text-amber-100'
              : 'bg-white/80 dark:bg-[#141414] border-[#D5CFC5] dark:border-[#282826] text-[#171715] dark:text-[#FAF8F3] opacity-85'
          }`}
        >
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full border ${oppColor === 'white' ? 'bg-white border-[#D5CFC5]' : 'bg-black border-white/40'}`} />
              Opponent ({oppColor.toUpperCase()}) • {oppName}
            </span>
            {isOppActive ? (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Counting Down
              </span>
            ) : (
              <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">Tap When Opponent Moves</span>
            )}
          </div>

          <div className="py-4">
            <span className={`text-6xl sm:text-8xl font-mono font-black tracking-tight ${
              flagFall === oppColor
                ? 'text-rose-600 line-through'
                : isOppUrgent
                ? 'text-rose-600 animate-pulse'
                : isOppActive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[#171715] dark:text-[#FAF8F3]'
            }`}>
              {formatTime(oppTime)}
            </span>
          </div>

          <div className="text-center font-mono text-xs opacity-75">
            {isOppActive ? 'Opponent Clock Running • Tap to Switch Turn' : 'Waiting for Opponent...'}
          </div>
        </button>

        {/* CENTER CONTROL STRIP (Divider) */}
        <div className="my-2 py-2 px-4 rounded-2xl bg-[#EFEAE1] dark:bg-[#1C1C1A] border border-[#D5CFC5] dark:border-[#282826] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            {/* Direction Arrow */}
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
              isOppActive
                ? 'bg-amber-500 text-white animate-pulse'
                : isMyActive
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-neutral-200 dark:bg-neutral-800 text-[#77736B]'
            }`}>
              {isOppActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isOppActive ? 'Opponent Turn' : isMyActive ? 'Your Turn' : 'Paused'}</span>
            </span>

            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] hidden sm:inline">
              Move #{movesCount}
            </span>
          </div>

          {/* Central Controls */}
          <div className="flex items-center gap-2">
            {!readOnly && (
              isRunning ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-3.5 py-1.5 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-black font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartResume}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )
            )}

            {/* 180° Rotation Toggle for Opponent */}
            <button
              type="button"
              onClick={() => setFlipOpponent(!flipOpponent)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                flipOpponent
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white dark:bg-[#252523] border-[#D5CFC5] dark:border-[#383733] text-[#77736B] hover:text-[#171715]'
              }`}
              title={flipOpponent ? 'Unflip Opponent Screen' : 'Flip Opponent Screen 180° for Table Play'}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white dark:bg-[#252523] border border-[#D5CFC5] dark:border-[#383733] text-[#77736B] cursor-pointer"
              title="Sound On/Off"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Exit Fullscreen */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-xl bg-white dark:bg-[#252523] border border-[#D5CFC5] dark:border-[#383733] text-[#77736B] hover:text-rose-600 cursor-pointer"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DOWNSIDE: PLAYER TIMER (Facing Player, Tap to Switch) */}
        <button
          type="button"
          onClick={() => handleClockPadClick(myColor)}
          disabled={readOnly || !!flagFall}
          className={`flex-1 w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center transition-all cursor-pointer border-2 shadow-lg active:scale-[0.99] select-none ${
            isMyActive
              ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-500 ring-4 ring-amber-500/30 text-amber-950 dark:text-amber-100'
              : 'bg-white/80 dark:bg-[#141414] border-[#D5CFC5] dark:border-[#282826] text-[#171715] dark:text-[#FAF8F3] opacity-85'
          }`}
        >
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full border ${myColor === 'white' ? 'bg-white border-[#D5CFC5]' : 'bg-black border-white/40'}`} />
              You ({myColor.toUpperCase()}) • {myName}
            </span>
            {isMyActive ? (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Your Turn Now
              </span>
            ) : (
              <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">Waiting for Opponent</span>
            )}
          </div>

          <div className="py-4">
            <span className={`text-6xl sm:text-8xl font-mono font-black tracking-tight ${
              flagFall === myColor
                ? 'text-rose-600 line-through'
                : isMyUrgent
                ? 'text-rose-600 animate-pulse'
                : isMyActive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[#171715] dark:text-[#FAF8F3]'
            }`}>
              {formatTime(myTime)}
            </span>
          </div>

          <div className="text-center font-mono text-xs">
            {isMyActive ? (
              <span className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold uppercase tracking-wider animate-pulse inline-block shadow-sm">
                TAP TO PASS TURN TO OPPONENT ⇆
              </span>
            ) : (
              <span className="opacity-75">Your clock is paused. Activates after opponent moves.</span>
            )}
          </div>
        </button>
      </div>
    );
  }

  // STANDARD DUAL CLOCK (Mobile Stacked Phone-View + Desktop Side-by-Side)
  return (
    <div className="relative bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-6 select-none transition-all">
      
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#171715] dark:text-[#FAF8F3] leading-none">
              Tournament Chess Clock
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] pt-0.5 block">
              10:00 Rapid • Tap Clock to Switch Turns
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Flip 180° Toggle */}
          <button
            type="button"
            onClick={() => setFlipOpponent(!flipOpponent)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              flipOpponent
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-[#EFEAE1] dark:bg-[#1E1E1C] border-[#D5CFC5] dark:border-[#282826] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715]'
            }`}
            title="Rotate Opponent View 180° for Over-the-Board Play"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px] font-mono font-bold">Flip 180°</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute clock sound' : 'Enable clock sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand Fullscreen Face-to-Face */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-2 rounded-xl bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] transition-colors cursor-pointer flex items-center gap-1"
            title="Open Fullscreen Tabletop Clock"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-mono font-bold">Tabletop Mode</span>
          </button>
        </div>
      </div>

      {/* Flag Fall Banner */}
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

      {/* ------------------------------------------------------------- */}
      {/* 1. MOBILE PHONE VIEW: UPPER OPPONENT TIMER | DOWNSIDE PLAYER  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col space-y-3 sm:hidden">
        
        {/* UPPER SIDE: OPPONENT TIMER */}
        <button
          type="button"
          onClick={() => handleClockPadClick(oppColor)}
          disabled={readOnly || !!flagFall}
          className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 text-left flex flex-col justify-between min-h-[145px] cursor-pointer select-none active:scale-[0.98] ${
            flipOpponent ? 'rotate-180' : ''
          } ${
            isOppActive
              ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-[#FAF8F3]/60 dark:bg-[#181816] border-[#D5CFC5] dark:border-[#282826] opacity-80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full border ${oppColor === 'white' ? 'bg-white border-[#D5CFC5]' : 'bg-black border-white/40'}`} />
              <span className="font-bold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                Opponent ({oppColor})
              </span>
            </div>
            {isOppActive ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Clock Ticking
              </span>
            ) : (
              <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                Tap when opponent moves
              </span>
            )}
          </div>

          <div className="py-1 text-center">
            <span className={`text-5xl font-mono font-black tracking-tight ${
              flagFall === oppColor
                ? 'text-rose-600 line-through'
                : isOppUrgent
                ? 'text-rose-600 animate-pulse'
                : isOppActive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[#171715] dark:text-[#FAF8F3]'
            }`}>
              {formatTime(oppTime)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] truncate max-w-[180px]">
              {oppName}
            </span>
            <span className="text-[#77736B] dark:text-[#8E8E93]">
              {isOppActive ? 'Opponent Active' : 'Waiting'}
            </span>
          </div>
        </button>

        {/* CENTER CONTROL STRIP (Between Opponent and Player) */}
        <div className="bg-[#EFEAE1]/80 dark:bg-[#1A1A18] py-2 px-3 rounded-xl border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
              isOppActive
                ? 'bg-amber-500 text-white animate-pulse'
                : isMyActive
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-neutral-200 dark:bg-neutral-800 text-[#77736B]'
            }`}>
              {isOppActive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isOppActive ? 'Opponent Moving' : isMyActive ? 'Your Move' : 'Paused'}</span>
            </span>

            <span className="text-[#77736B] dark:text-[#8E8E93] text-[11px]">
              Moves: {movesCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!readOnly && (
              isRunning ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-2.5 py-1 rounded-lg bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-black text-[10px] font-bold uppercase inline-flex items-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3 h-3 fill-current" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartResume}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold uppercase inline-flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Resume</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setFlipOpponent(!flipOpponent)}
              className="p-1 rounded-lg bg-white dark:bg-[#252523] border border-[#D5CFC5] dark:border-[#383733] text-[#77736B] cursor-pointer"
              title="Flip Opponent 180°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DOWNSIDE: PLAYER TIMER (Click on your timer to start other player's timer!) */}
        <button
          type="button"
          onClick={() => handleClockPadClick(myColor)}
          disabled={readOnly || !!flagFall}
          className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 text-left flex flex-col justify-between min-h-[155px] cursor-pointer select-none active:scale-[0.98] ${
            isMyActive
              ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-500 ring-4 ring-amber-500/30 shadow-md'
              : 'bg-[#FAF8F3]/60 dark:bg-[#181816] border-[#D5CFC5] dark:border-[#282826] opacity-80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full border ${myColor === 'white' ? 'bg-white border-[#D5CFC5]' : 'bg-black border-white/40'}`} />
              <span className="font-bold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                You ({myColor})
              </span>
            </div>
            {isMyActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Your Turn Active
              </span>
            ) : (
              <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                Paused
              </span>
            )}
          </div>

          <div className="py-1 text-center">
            <span className={`text-5xl font-mono font-black tracking-tight ${
              flagFall === myColor
                ? 'text-rose-600 line-through'
                : isMyUrgent
                ? 'text-rose-600 animate-pulse'
                : isMyActive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[#171715] dark:text-[#FAF8F3]'
            }`}>
              {formatTime(myTime)}
            </span>
          </div>

          <div className="text-center font-mono text-xs">
            {isMyActive ? (
              <span className="w-full py-1.5 px-3 rounded-xl bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wider animate-pulse inline-block shadow-sm">
                CLICK WHEN YOU MOVE PAWN ⇆
              </span>
            ) : (
              <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                Your time is paused. Tapping your timer starts opponent clock.
              </span>
            )}
          </div>
        </button>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DESKTOP VIEW: INTERACTIVE SIDE-BY-SIDE CLICKABLE TOUCH PADS*/}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* PLAYER 1: WHITE CLOCK PAD */}
        <button
          type="button"
          onClick={() => handleClockPadClick('white')}
          disabled={readOnly || !!flagFall}
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-150 text-center flex flex-col justify-between min-h-[190px] cursor-pointer select-none active:scale-[0.99] ${
            isWhiteActive
              ? 'bg-[#FAF8F3] dark:bg-[#1A1A17] border-amber-500 ring-4 ring-amber-500/20 shadow-2xl scale-[1.02]'
              : 'bg-[#FAF8F3]/60 dark:bg-[#141414] border-[#D5CFC5] dark:border-[#282826] opacity-80 hover:opacity-100'
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
            <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block mt-0.5">
              {isWhiteActive ? 'Click to Pass Turn to Black ⇆' : 'White Clock Paused'}
            </span>
          </div>
        </button>

        {/* PLAYER 2: BLACK CLOCK PAD */}
        <button
          type="button"
          onClick={() => handleClockPadClick('black')}
          disabled={readOnly || !!flagFall}
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-150 text-center flex flex-col justify-between min-h-[190px] cursor-pointer select-none active:scale-[0.99] ${
            isBlackActive
              ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#1E1E1B] border-amber-500 ring-4 ring-amber-500/20 shadow-2xl scale-[1.02]'
              : 'bg-[#2B2925] text-[#FAF8F3] dark:bg-[#161614] border-[#3E3C37] dark:border-[#282826] opacity-80 hover:opacity-100'
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
            <span className="text-[10px] font-mono text-[#D5CFC5]/80 block mt-0.5">
              {isBlackActive ? 'Click to Pass Turn to White ⇆' : 'Black Clock Paused'}
            </span>
          </div>
        </button>

      </div>

      {/* CENTRAL ACTION BAR (Desktop) */}
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
            Tap clock or press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#242422] rounded border text-[10px] font-bold">Space</kbd> to switch turns
          </span>
        </div>

        {/* Action Buttons */}
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
