'use client';

import React, { useState, useEffect, useRef } from 'react';

export function MatchTimer({ match, durationMinutes = 10, onTimeExpired }) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  // Store callback in a ref to avoid infinite re-render cycles
  const onTimeExpiredRef = useRef(onTimeExpired);
  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  const hasExpiredFiredRef = useRef(false);

  const matchStatus = match?.status;
  const actualStartTime = match?.actualStartTime;
  const matchDuration = match?.durationMinutes || durationMinutes;

  useEffect(() => {
    if (matchStatus !== 'live' || !actualStartTime) {
      if (matchStatus === 'completed' || matchStatus === 'cancelled') {
        setTimeLeftSeconds(0);
        setIsExpired(true);
      } else {
        setTimeLeftSeconds(matchDuration * 60);
        setIsExpired(false);
      }
      hasExpiredFiredRef.current = false;
      return;
    }

    const calculateTimeLeft = () => {
      const startTimeDate = new Date(actualStartTime);
      const startTimeMs = startTimeDate.getTime();
      if (isNaN(startTimeMs)) {
        setTimeLeftSeconds(matchDuration * 60);
        return;
      }

      const nowMs = Date.now();
      const elapsedSeconds = Math.floor((nowMs - startTimeMs) / 1000);
      const totalAllowedSeconds = matchDuration * 60;
      const remaining = totalAllowedSeconds - elapsedSeconds;

      if (remaining <= 0) {
        setTimeLeftSeconds(0);
        setIsExpired(true);
        if (!hasExpiredFiredRef.current) {
          hasExpiredFiredRef.current = true;
          if (onTimeExpiredRef.current) {
            onTimeExpiredRef.current();
          }
        }
      } else {
        setTimeLeftSeconds(remaining);
        setIsExpired(false);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [matchStatus, actualStartTime, matchDuration]);

  const totalAllowedSeconds = matchDuration * 60;
  const progressPercent = Math.max(0, Math.min(100, (timeLeftSeconds / totalAllowedSeconds) * 100));

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWarning = timeLeftSeconds > 0 && timeLeftSeconds <= 300 && timeLeftSeconds > 120;
  const isUrgent = timeLeftSeconds > 0 && timeLeftSeconds <= 120;

  return (
    <div className="flex flex-col items-center justify-center space-y-1 w-full max-w-[120px]">
      <span className={`text-base sm:text-lg font-bold font-mono tracking-wider ${
        isExpired
          ? 'text-red-600 dark:text-red-400 animate-pulse'
          : isUrgent
          ? 'text-red-600 dark:text-red-400 animate-pulse'
          : isWarning
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-[#171715] dark:text-[#FAF8F3]'
      }`}>
        {formatTime(timeLeftSeconds)}
      </span>

      {/* Visual Duration Progress Bar */}
      <div className="w-full bg-[#E4DED5] dark:bg-[#262624] h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isExpired || isUrgent
              ? 'bg-red-600 dark:bg-red-400'
              : isWarning
              ? 'bg-amber-500 dark:bg-amber-400'
              : 'bg-[#171715] dark:bg-[#FAF8F3]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase font-semibold">
        {isExpired ? 'Time Out' : 'Remaining'}
      </span>
    </div>
  );
}
