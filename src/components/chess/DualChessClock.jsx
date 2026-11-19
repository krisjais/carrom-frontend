'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, AlertTriangle, Flag, Sparkles } from 'lucide-react';

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
  initialMinutes = 10,
  player1Name = 'White Player',
  player2Name = 'Black Player',
  onTimeExpired,
  onTurnChange,
  variant = 'standard' // 'standard' | 'compact' | 'modal'
}) {
  const initialSeconds = initialMinutes * 60;

  const [p1Time, setP1Time] = useState(initialSeconds);
  const [p2Time, setP2Time] = useState(initialSeconds);
  const [activeTurn, setActiveTurn] = useState(null); // 'white' | 'black' | null
  const [isRunning, setIsRunning] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [flagFall, setFlagFall] = useState(null); // 'white' | 'black' | null
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const timerRef = useRef(null);

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
  }, [isRunning, activeTurn, flagFall, soundEnabled, onTimeExpired]);

  // Start / Resume Game
  const handleStartResume = () => {
    if (flagFall) return;
    if (!activeTurn) {
      // White moves first by standard chess convention
      setActiveTurn('white');
    }
    setIsRunning(true);
    if (soundEnabled) playAudioTone('click');
  };

  // Pause
  const handlePause = () => {
    setIsRunning(false);
  };

  // Switch turn (When White moves -> switch to Black. When Black moves -> switch to White)
  const handleSwitchTurn = useCallback((forcedTurn = null) => {
    if (flagFall) return;

    let nextTurn;
    if (forcedTurn) {
      nextTurn = forcedTurn;
    } else {
      if (!isRunning) {
        // If not started yet, first click starts White
        nextTurn = activeTurn === 'black' ? 'white' : 'black';
        setIsRunning(true);
      } else {
        nextTurn = activeTurn === 'white' ? 'black' : 'white';
      }
    }

    setActiveTurn(nextTurn);
    setIsRunning(true);
    if (soundEnabled) playAudioTone('click');

    // Increment move count on Black's completed move
    if (activeTurn === 'black') {
      setMovesCount((m) => m + 1);
    }

    if (onTurnChange) {
      onTurnChange(nextTurn);
    }
  }, [flagFall, isRunning, activeTurn, soundEnabled, onTurnChange]);

  // Reset clock
  const handleReset = () => {
    setIsRunning(false);
    setActiveTurn(null);
    setFlagFall(null);
    setP1Time(initialSeconds);
    setP2Time(initialSeconds);
    setMovesCount(0);
  };

  // Keyboard shortcut (Spacebar = switch turn, P = pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing into an input/textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleSwitchTurn();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isRunning) handlePause();
        else handleStartResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwitchTurn, isRunning]);

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
          <button
            type="button"
            onClick={() => {
              if (isWhiteActive) handleSwitchTurn('black');
              else handleStartResume();
            }}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
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
          </button>

          {/* Black Clock */}
          <button
            type="button"
            onClick={() => {
              if (isBlackActive) handleSwitchTurn('white');
              else handleStartResume();
            }}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
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
          </button>
        </div>

        {/* Small Action Strip */}
        <div className="flex items-center justify-between pt-1 border-t border-[#D5CFC5]/50 dark:border-[#262624]">
          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <button
                type="button"
                onClick={handlePause}
                className="px-2.5 py-1 rounded-lg bg-[#EFEAE1] dark:bg-[#20201E] hover:bg-[#E4DED5] text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 text-[#171715] dark:text-[#FAF8F3]"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartResume}
                className="px-2.5 py-1 rounded-lg bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 text-[#FAF8F3] dark:text-[#0D0D0D]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]"
              title="Reset 10:00 clocks"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSwitchTurn()}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-[10px] uppercase shadow-xs transition-transform active:scale-95"
          >
            Tap Switch ⇋
          </button>
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
          onClick={() => {
            if (isWhiteActive) handleSwitchTurn('black');
            else if (!isRunning) handleStartResume();
          }}
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-center flex flex-col justify-between min-h-[190px] ${
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
            <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block">
              {isWhiteActive ? 'Tap to complete move & pass time →' : 'Waiting for White...'}
            </span>
          </div>
        </div>

        {/* PLAYER 2: BLACK CLOCK PAD */}
        <div
          onClick={() => {
            if (isBlackActive) handleSwitchTurn('white');
            else if (!isRunning) handleStartResume();
          }}
          className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-center flex flex-col justify-between min-h-[190px] ${
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
            <span className="text-[10px] font-mono text-[#D5CFC5]/80 block">
              {isBlackActive ? 'Tap to complete move & pass time →' : 'Waiting for Black...'}
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
            Shortcuts: <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#242422] rounded border text-[10px] font-bold">Space</kbd> switch turn • <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#242422] rounded border text-[10px] font-bold">P</kbd> pause
          </span>
        </div>

        {/* Action Buttons */}
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

          {/* Giant Switch Turn Button */}
          <button
            type="button"
            onClick={() => handleSwitchTurn()}
            className="bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black dark:hover:bg-white px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Switch Turn ⇋</span>
          </button>

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

      </div>

    </div>
  );
}
