'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export function MatchTimer({ match, durationMinutes = 10, onTimeExpired }) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!match || match.status !== 'live' || !match.actualStartTime) {
      if (match?.status === 'completed' || match?.status === 'cancelled') {
        setTimeLeftSeconds(0);
      } else {
        setTimeLeftSeconds(durationMinutes * 60);
      }
      return;
    }

    const calculateTimeLeft = () => {
      const startTimeMs = new Date(match.actualStartTime).getTime();
      const nowMs = Date.now();
      const elapsedSeconds = Math.floor((nowMs - startTimeMs) / 1000);
      const totalAllowedSeconds = (match.durationMinutes || durationMinutes) * 60;
      const remaining = totalAllowedSeconds - elapsedSeconds;

      if (remaining <= 0) {
        setTimeLeftSeconds(0);
        setIsExpired(true);
        if (onTimeExpired) onTimeExpired();
      } else {
        setTimeLeftSeconds(remaining);
        setIsExpired(false);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [match, durationMinutes, onTimeExpired]);

  const totalAllowedSeconds = (match?.durationMinutes || durationMinutes) * 60;
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
          ? 'text-red-600 animate-pulse'
          : isUrgent
          ? 'text-red-600 animate-pulse'
          : isWarning
          ? 'text-amber-600'
          : 'text-[#C9A227]'
      }`}>
        {formatTime(timeLeftSeconds)}
      </span>

      {/* Visual Duration Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border border-gray-100">
        <div
          className={`h-full transition-all duration-1000 ${
            isExpired || isUrgent
              ? 'bg-red-600'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-[#C9A227]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <span className="text-[9px] text-[#666666] font-mono uppercase font-semibold">
        {isExpired ? 'Time Out' : 'Remaining'}
      </span>
    </div>
  );
}
