'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Timer,
  CheckCircle2,
  Sparkles,
  Flame,
  Trophy
} from 'lucide-react';
import { useConfirm, usePrompt } from '@/context/ToastContext';

export function CarromMatchTimer({
  match,
  durationMinutes = 20,
  variant = 'standard', // 'standard' | 'desk' | 'compact' | 'badge'
  onTimerAction = null, // callback for admin actions: (action, payload) => {}
  showControls = false,
  onStartMatch = null,
  isStarting = false,
  onTimeExpired = null,
  onEndMatchClick = null
}) {
  const confirm = useConfirm();
  const prompt = usePrompt();
  const [now, setNow] = useState(Date.now());
  const hasExpiredRef = React.useRef(false);

  // Tick every second if live, not paused, and not expired
  useEffect(() => {
    if (!match || match.status !== 'live' || match.isTimerPaused) return;

    const baseMin = Number(match?.roundDurationMinutes || match?.durationMinutes || durationMinutes || 20);
    const extraMin = Number(match?.extraTimeMinutes || 0);
    const totalAllowedSeconds = (baseMin + extraMin) * 60;

    let initialElapsed = Number(match.timeElapsedBeforePause || 0);
    if (match.actualStartTime) {
      const startTimeMs = new Date(match.actualStartTime).getTime();
      initialElapsed += Math.max(0, Math.floor((Date.now() - startTimeMs) / 1000));
    }

    // Stop ticking if match has already reached or exceeded its duration
    if (initialElapsed >= totalAllowedSeconds) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [
    match?.status,
    match?.isTimerPaused,
    match?.actualStartTime,
    match?.roundDurationMinutes,
    match?.durationMinutes,
    match?.extraTimeMinutes,
    match?.timeElapsedBeforePause,
    durationMinutes
  ]);

  const timerStats = useMemo(() => {
    if (!match || match.status !== 'live' || !match.actualStartTime) {
      const baseMin = Number(match?.roundDurationMinutes || match?.durationMinutes || durationMinutes || 20);
      return {
        isLive: false,
        isPaused: Boolean(match?.isTimerPaused),
        isCompleted: match?.status === 'completed',
        totalAllowedSeconds: baseMin * 60,
        elapsedSeconds: 0,
        remainingSeconds: baseMin * 60,
        isExpired: false,
        isWarning: false,
        isUrgent: false,
        progressPercent: 100,
        formattedTime: `${String(baseMin).padStart(2, '0')}:00`,
        extraTimeMinutes: match?.extraTimeMinutes || 0,
        baseMinutes: baseMin
      };
    }

    const baseMin = Number(match.roundDurationMinutes || match.durationMinutes || durationMinutes || 20);
    const extraMin = Number(match.extraTimeMinutes || 0);
    const totalAllowedSeconds = (baseMin + extraMin) * 60;

    let elapsed = Number(match.timeElapsedBeforePause || 0);
    if (!match.isTimerPaused && match.actualStartTime) {
      const startTimeMs = new Date(match.actualStartTime).getTime();
      const currentSessionSeconds = Math.max(0, Math.floor((now - startTimeMs) / 1000));
      elapsed += currentSessionSeconds;
    }

    // STOP counting past completion: clamp at totalAllowedSeconds
    const isExpired = elapsed >= totalAllowedSeconds;
    if (isExpired) {
      elapsed = totalAllowedSeconds;
    }

    const remaining = Math.max(0, totalAllowedSeconds - elapsed);
    const isUrgent = remaining > 0 && remaining <= 120; // <= 2 mins
    const isWarning = remaining > 120 && remaining <= 300; // <= 5 mins

    const progress = totalAllowedSeconds > 0
      ? Math.max(0, Math.min(100, (remaining / totalAllowedSeconds) * 100))
      : 0;

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return {
      isLive: true,
      isPaused: Boolean(match.isTimerPaused),
      isCompleted: false,
      totalAllowedSeconds,
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      isExpired,
      isWarning,
      isUrgent,
      progressPercent: progress,
      formattedTime: formatted,
      extraTimeMinutes: extraMin,
      baseMinutes: baseMin
    };
  }, [match, durationMinutes, now]);

  // Trigger onTimeExpired once when timer expires
  useEffect(() => {
    if (timerStats.isLive && timerStats.isExpired && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      if (onTimeExpired) {
        onTimeExpired();
      }
    } else if (!timerStats.isExpired) {
      hasExpiredRef.current = false;
    }
  }, [timerStats.isLive, timerStats.isExpired, onTimeExpired]);

  // Mini Badge Variant (For headers, live tickers, table badges)
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border transition-all ${
          timerStats.isExpired
            ? 'bg-[#FDEDEC] dark:bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/40 animate-pulse'
            : timerStats.isUrgent
            ? 'bg-[#FDEDEC] dark:bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/30'
            : timerStats.isWarning
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/40'
            : 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] border-[#E8E1D5] dark:border-[#2B3034]'
        }`}
      >
        <Clock className="w-3 h-3 text-current shrink-0" />
        <span>{timerStats.isExpired ? '00:00 ENDED' : timerStats.formattedTime}</span>
        {timerStats.isPaused && !timerStats.isExpired && <span className="text-[9px] opacity-80">(PAUSED)</span>}
      </span>
    );
  }

  // Compact Variant (For queue items, match list cards)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${timerStats.isUrgent || timerStats.isExpired ? 'text-[#E74C3C] animate-pulse' : 'text-[#7E7060] dark:text-[#817B72]'}`} />
          <span className={`font-bold tabular-nums ${
            timerStats.isExpired
              ? 'text-[#E74C3C] dark:text-[#E74C3C]'
              : timerStats.isUrgent
              ? 'text-[#E74C3C] dark:text-[#E74C3C]'
              : timerStats.isWarning
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-[#3E342B] dark:text-[#F5F1E8]'
          }`}>
            {timerStats.isExpired ? '00:00 Time Ended' : timerStats.formattedTime}
          </span>
        </div>
        {timerStats.isPaused && !timerStats.isExpired && (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
            Paused
          </span>
        )}
      </div>
    );
  }

  // Referee Desk Variant (Full control panel for LiveScoreKeeper)
  if (variant === 'desk') {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs space-y-4 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase tracking-wider">
            <Timer className="w-4 h-4 text-[#E74C3C]" />
            <span>Official Round Timer Clock</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] font-bold">
              {timerStats.isLive ? `Round Cap: ${timerStats.baseMinutes} min` : `Duration: ${timerStats.baseMinutes} min`}
              {timerStats.extraTimeMinutes > 0 ? ` (+${timerStats.extraTimeMinutes}m extra)` : ''}
            </span>
          </div>
        </div>

        {/* Large Timer Digits */}
        <div className="py-2 space-y-1">
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-5xl sm:text-6xl font-mono font-black tabular-nums tracking-tight ${
                !timerStats.isLive
                  ? 'text-[#3E342B] dark:text-[#F5F1E8]'
                  : timerStats.isExpired
                  ? 'text-[#E74C3C] dark:text-[#E74C3C] animate-pulse'
                  : timerStats.isUrgent
                  ? 'text-[#E74C3C] dark:text-[#E74C3C]'
                  : timerStats.isWarning
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-[#171614] dark:text-[#F7F4EC]'
              }`}
            >
              {timerStats.formattedTime}
            </span>
            <span className="text-xs font-mono uppercase font-bold text-[#7E7060] dark:text-[#817B72]">
              {!timerStats.isLive ? 'TOTAL' : timerStats.isExpired ? 'TIME COMPLETED' : 'LEFT'}
            </span>
          </div>

          <p className="text-xs font-mono text-[#7E7060] dark:text-[#817B72]">
            {!timerStats.isLive ? (
              <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Match Scheduled · Ready to start on Main Carrom Board</span>
            ) : timerStats.isExpired ? (
              <span className="text-[#E74C3C] font-bold">⚠️ Official Round Time Expired · Match Ended (Declare Winner Below)</span>
            ) : timerStats.isPaused ? (
              <span className="text-amber-700 dark:text-amber-400 font-bold">⏸ Timer Paused by Referee</span>
            ) : timerStats.isUrgent ? (
              <span className="text-[#E74C3C] font-bold">⏳ Final 2 Minutes in Progress</span>
            ) : (
              <span>Main Carrom Board Official Time · Counting Down</span>
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E8E1D5] dark:bg-[#2B3034] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              !timerStats.isLive
                ? 'bg-[#3E342B] dark:bg-[#D4A94C]'
                : timerStats.isExpired
                ? 'bg-[#E74C3C]'
                : timerStats.isUrgent
                ? 'bg-[#E74C3C]'
                : timerStats.isWarning
                ? 'bg-amber-500'
                : 'bg-[#3E342B] dark:bg-[#D4A94C]'
            }`}
            style={{ width: `${timerStats.progressPercent}%` }}
          />
        </div>

        {/* Referee Controls if showControls is true */}
        {showControls && (
          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034] space-y-3">
            {!timerStats.isLive ? (
              /* Pre-Match Controls (When Scheduled) */
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {onStartMatch && (
                  <button
                    type="button"
                    onClick={onStartMatch}
                    disabled={isStarting}
                    className="px-6 py-2.5 rounded-xl btn-primary text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isStarting ? 'Starting Match...' : 'Start Match & Timer'}</span>
                  </button>
                )}

                {/* Duration Presets before starting */}
                <div className="flex items-center gap-1 flex-wrap">
                  {[10, 15, 20, 25, 30, 45].map((mVal) => {
                    const isSelected = timerStats.baseMinutes === mVal;
                    return (
                      <button
                        key={mVal}
                        type="button"
                        onClick={() => {
                          if (onTimerAction) onTimerAction('set_duration', { roundDurationMinutes: mVal });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3E342B] dark:bg-[#D4A94C] text-white dark:text-[#15191C] shadow-xs'
                            : 'bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B]'
                        }`}
                      >
                        {mVal}m
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={async () => {
                      const custom = await prompt({
                        title: 'Set Round Duration',
                        message: 'Enter custom round duration in minutes:',
                        defaultValue: String(timerStats.baseMinutes),
                        placeholder: 'e.g. 15',
                        inputType: 'number',
                        confirmText: 'Set Minutes'
                      });
                      if (custom && Number(custom) > 0 && onTimerAction) {
                        onTimerAction('set_duration', { roundDurationMinutes: Number(custom) });
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Custom Min
                  </button>
                </div>
              </div>
            ) : (
              /* Live Match In-Play Controls */
              <div className="flex flex-wrap items-center justify-center gap-2">
                {timerStats.isExpired ? (
                  onEndMatchClick ? (
                    <button
                      type="button"
                      onClick={onEndMatchClick}
                      className="px-5 py-2 rounded-xl bg-[#E74C3C] hover:bg-[#C0392B] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer animate-pulse"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>End Match & Select Winner</span>
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-[#FDEDEC] dark:bg-[#E74C3C]/20 border border-[#E74C3C]/40 text-[#E74C3C] text-xs font-mono font-bold">
                      Round Finished · Select Winner Below
                    </span>
                  )
                ) : timerStats.isPaused ? (
                  <button
                    type="button"
                    onClick={() => onTimerAction && onTimerAction('resume')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Timer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTimerAction && onTimerAction('pause')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Timer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onTimerAction && onTimerAction('add_time', { extraMinutes: 2 })}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#24221E] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-mono font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+2 Min</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTimerAction && onTimerAction('add_time', { extraMinutes: 5 })}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#24221E] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-mono font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+5 Min</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const custom = await prompt({
                      title: 'Set Round Duration',
                      message: 'Enter official round duration in minutes:',
                      defaultValue: String(timerStats.baseMinutes),
                      placeholder: 'e.g. 20',
                      inputType: 'number',
                      confirmText: 'Set Minutes'
                    });
                    if (custom && Number(custom) > 0 && onTimerAction) {
                      onTimerAction('set_duration', { roundDurationMinutes: Number(custom) });
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#24221E] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Set Duration
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const isConfirmed = await confirm({
                      title: 'Reset Round Timer?',
                      message: 'Are you sure you want to reset the round timer clock back to zero elapsed time?',
                      confirmText: 'Reset Timer',
                      cancelText: 'Cancel',
                      type: 'warning'
                    });
                    if (isConfirmed && onTimerAction) {
                      onTimerAction('reset');
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-[#7E7060] dark:text-[#817B72] hover:text-[#E74C3C] text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Arena Stadium Variant (For Live Broadcast Hero Board)
  if (variant === 'arena') {
    return (
      <div className="flex flex-col items-center justify-center space-y-3.5 w-full max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between w-full text-[11px] font-mono border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 text-[#D5C4A1] font-bold uppercase tracking-wider">
            <Clock className={`w-3.5 h-3.5 ${timerStats.isExpired || timerStats.isUrgent ? 'text-[#E74C3C] animate-pulse' : 'text-[#D5C4A1]'}`} />
            <span>Official Round Timer · {timerStats.baseMinutes}m Cap</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
            timerStats.isExpired
              ? 'bg-[#E74C3C]/20 text-[#E74C3C] border border-[#E74C3C]/40 animate-pulse'
              : timerStats.isPaused
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : timerStats.isUrgent
              ? 'bg-[#E74C3C]/20 text-[#E74C3C] border border-[#E74C3C]/30 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {timerStats.isExpired ? '⚠️ Time Completed' : timerStats.isPaused ? '⏸ Paused' : '● Live In Play'}
          </span>
        </div>

        {/* Stadium Giant Digits */}
        <div className="flex items-baseline justify-center gap-2 py-1">
          <span
            className={`text-5xl sm:text-6xl font-mono font-black tabular-nums tracking-tight filter drop-shadow-lg ${
              timerStats.isExpired
                ? 'text-[#E74C3C] animate-pulse'
                : timerStats.isUrgent
                ? 'text-[#E74C3C] animate-pulse'
                : timerStats.isWarning
                ? 'text-amber-400'
                : 'text-white'
            }`}
          >
            {timerStats.formattedTime}
          </span>
          <span className="text-xs font-mono font-bold uppercase text-white/50 tracking-wider">
            {timerStats.isExpired ? 'Ended' : 'Remaining'}
          </span>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timerStats.isExpired
                ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                : timerStats.isUrgent
                ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_12px_rgba(231,76,60,0.6)]'
                : timerStats.isWarning
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                : 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
            }`}
            style={{ width: `${timerStats.progressPercent}%` }}
          />
        </div>

        {/* Context Note */}
        <div className="text-[10px] font-mono text-white/60 flex items-center justify-between w-full pt-1">
          <span>Main Carrom Board 01</span>
          <span>{timerStats.isExpired ? 'Buzzer Reached · Match Time Completed' : 'Sequential Match Flow'}</span>
        </div>
      </div>
    );
  }

  // Standard Variant (For Home, Live Broadcast, Admin Dashboard Hero cards)
  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xs border border-white/15 dark:border-white/10 text-center space-y-2 w-full max-w-[200px] sm:max-w-[220px]">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#C2A268] font-bold">
        <Clock className="w-3 h-3 shrink-0" />
        <span>ROUND TIMER ({timerStats.baseMinutes}M)</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight ${
            timerStats.isExpired
              ? 'text-[#D93829] dark:text-[#FF6B6B] animate-pulse'
              : timerStats.isUrgent
              ? 'text-[#D93829] dark:text-[#FF6B6B] animate-pulse'
              : timerStats.isWarning
              ? 'text-amber-400 dark:text-amber-300'
              : 'text-white'
          }`}
        >
          {timerStats.formattedTime}
        </span>
        <span className="text-[10px] font-mono uppercase text-white/60 font-semibold">
          {timerStats.isExpired ? 'ended' : 'rem'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timerStats.isExpired
              ? 'bg-[#D93829]'
              : timerStats.isUrgent
              ? 'bg-[#D93829]'
              : timerStats.isWarning
              ? 'bg-amber-400'
              : 'bg-emerald-400'
          }`}
          style={{ width: `${timerStats.progressPercent}%` }}
        />
      </div>

      <span className="text-[9px] font-mono uppercase text-white/70">
        {timerStats.isExpired ? 'TIME COMPLETED' : timerStats.isPaused ? '⏸ PAUSED' : 'MATCH IN PLAY'}
      </span>
    </div>
  );
}

/**
 * Format the actual elapsed time that a completed match took to finish.
 * Returns formatted string like "14m 23s", "45s", or "15m".
 */
export function formatMatchDurationTaken(match) {
  if (!match) return null;

  const roundMin = Number(match.roundDurationMinutes || match.durationMinutes || 20);
  const extraMin = Number(match.extraTimeMinutes || 0);
  const maxCapSecs = (roundMin + extraMin) * 60;

  // 1. If elapsedTimeSeconds is explicitly saved and > 0
  if (match.elapsedTimeSeconds && match.elapsedTimeSeconds > 0) {
    const totalSecs = Math.min(maxCapSecs, Math.round(match.elapsedTimeSeconds));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }

  // 2. If actualStartTime and actualEndTime are both present
  if (match.actualStartTime && match.actualEndTime) {
    const start = new Date(match.actualStartTime).getTime();
    const end = new Date(match.actualEndTime).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const rawSecs = Math.max(1, Math.floor((end - start) / 1000));
      const totalSecs = Math.min(maxCapSecs, rawSecs);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      if (mins === 0) return `${secs}s`;
      if (secs === 0) return `${mins}m`;
      return `${mins}m ${secs}s`;
    }
  }

  // 3. If timeElapsedBeforePause is stored and > 0
  if (match.timeElapsedBeforePause && match.timeElapsedBeforePause > 0) {
    const totalSecs = Math.min(maxCapSecs, Math.round(match.timeElapsedBeforePause));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }

  // 4. If match is completed, show the allocated round duration
  if (match.status === 'completed') {
    return `${roundMin}m`;
  }

  return null;
}
