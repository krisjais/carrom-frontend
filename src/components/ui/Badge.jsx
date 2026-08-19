import React from 'react';
import { CheckCircle2, Clock, Play, Trophy, Shield, XCircle } from 'lucide-react';
import { CategoryCoinPair } from './CarromElements';

export const StatusBadge = ({ status, queuePosition }) => {
  const normalized = status?.toLowerCase() || '';

  if (normalized === 'live' || normalized === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 shadow-xs">
        <span className="live-dot" />
        <span>LIVE ON BOARD</span>
      </span>
    );
  }

  if (normalized === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>Approved</span>
      </span>
    );
  }

  if (normalized === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#F4EFE6] dark:bg-[#181C1F] text-[#4A4238] dark:text-[#F5F1E8] border border-[#E8E1D5] dark:border-[#2B3034]">
        <CheckCircle2 className="w-3 h-3 text-[#4A4238] dark:text-[#D4A94C]" />
        <span>Completed</span>
      </span>
    );
  }

  if (normalized === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#FAF9F6] dark:bg-[#15191C] text-[#7E7060] dark:text-[#B8B1A5] border border-[#D5C4A1] dark:border-[#2B3034]">
        <Clock className="w-3 h-3 text-[#B8A47E] dark:text-[#D4A94C]" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (normalized === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#F4EFE6] dark:bg-[#1B2024] text-[#3E342B] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034]">
        <Play className="w-2.5 h-2.5 fill-current text-[#4A4238] dark:text-[#D4A94C]" />
        <span>{queuePosition ? `READY · Q#${queuePosition}` : 'READY IN QUEUE'}</span>
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
        <XCircle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
        <span>Rejected</span>
      </span>
    );
  }

  if (normalized === 'bye') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#F4EFE6] dark:bg-[#181C1F] text-[#4A4238] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034]">
        <Trophy className="w-3 h-3 text-[#B8A47E] dark:text-[#D4A94C]" />
        <span>BYE ADVANCE</span>
      </span>
    );
  }

  if (normalized === 'registration_open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Registration Open</span>
      </span>
    );
  }

  if (normalized === 'registration_closed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#F4EFE6] dark:bg-[#181C1F] text-[#7E7060] dark:text-[#817B72] border border-[#E8E1D5] dark:border-[#2B3034]">
        <span>Registration Closed</span>
      </span>
    );
  }

  if (normalized === 'ongoing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30">
        <span className="live-dot" />
        <span>Championship Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold font-mono tracking-wide bg-[#F4EFE6] dark:bg-[#181C1F] text-[#4A4238] dark:text-[#F5F1E8] border border-[#E8E1D5] dark:border-[#2B3034]">
      {status?.toUpperCase() || 'STATUS'}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const map = {
    boys_singles: { name: 'Boys Singles', type: 'boys_singles' },
    girls_singles: { name: 'Girls Singles', type: 'girls_singles' },
    boys_doubles: { name: 'Boys Doubles', type: 'boys_doubles' },
    girls_doubles: { name: 'Girls Doubles', type: 'girls_doubles' },
    mixed_doubles: { name: 'Mixed Doubles', type: 'mixed_doubles' },
  };

  const item = map[category] || {
    name: category?.replace(/_/g, ' ')?.toUpperCase() || 'DIVISION',
    type: 'boys_singles'
  };

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-white dark:bg-[#15191C] text-[#4A4238] dark:text-[#F5F1E8] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
      <CategoryCoinPair category={category} />
      <span>{item.name}</span>
    </span>
  );
};

export const MainBoardBadge = () => {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#15191C] text-[#4A4238] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] font-mono font-bold tracking-wider shadow-xs">
      <span className="w-2 h-2 rounded-full bg-[#E74C3C]" />
      MAIN CARROM BOARD
    </span>
  );
};

export const BoardNumberBadge = () => {
  return <MainBoardBadge />;
};

