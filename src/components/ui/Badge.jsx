import React from 'react';
import { CheckCircle2, Clock, Play, Trophy, Shield, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, queuePosition }) => {
  const normalized = status?.toLowerCase() || '';

  if (normalized === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/35 shadow-sm shadow-rose-950/50">
        <span className="live-dot" />
        <span>LIVE ON BOARD</span>
      </span>
    );
  }

  if (normalized === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>Approved</span>
      </span>
    );
  }

  if (normalized === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-slate-800/90 text-slate-300 border border-slate-700">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>Completed</span>
      </span>
    );
  }

  if (normalized === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-[#F2C94C]/15 text-[#F2C94C] border border-[#F2C94C]/35">
        <Clock className="w-3 h-3 text-[#F2C94C]" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (normalized === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-[#D4A94C]/15 text-[#F2C94C] border border-[#D4A94C]/35">
        <Play className="w-2.5 h-2.5 fill-current text-[#F2C94C]" />
        <span>{queuePosition ? `READY · Q#${queuePosition}` : 'READY IN QUEUE'}</span>
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/30">
        <XCircle className="w-3 h-3 text-rose-400" />
        <span>Rejected</span>
      </span>
    );
  }

  if (normalized === 'bye') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-[#D4A94C]/20 text-[#FFECC7] border border-[#D4A94C]/40">
        <Trophy className="w-3 h-3 text-[#F2C94C]" />
        <span>BYE ADVANCE</span>
      </span>
    );
  }

  if (normalized === 'registration_open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Registration Open</span>
      </span>
    );
  }

  if (normalized === 'registration_closed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span>Registration Closed</span>
      </span>
    );
  }

  if (normalized === 'ongoing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide bg-[#F2C94C]/15 text-[#F2C94C] border border-[#F2C94C]/35">
        <span className="live-dot" />
        <span>Tournament Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono tracking-wide bg-[#1E3258] text-[#D4DEEE] border border-[#35538C]">
      {status?.toUpperCase() || 'STATUS'}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const map = {
    boys_singles: { name: 'Boys Singles', bg: 'bg-[#F2C94C]/15 text-[#F2C94C] border-[#F2C94C]/30' },
    girls_singles: { name: 'Girls Singles', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    boys_doubles: { name: 'Boys Doubles', bg: 'bg-[#1E3258] text-[#F5F1E8] border-[#D4A94C]/40' },
    girls_doubles: { name: 'Girls Doubles', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    mixed_doubles: { name: 'Mixed Doubles', bg: 'bg-gradient-to-r from-[#F2C94C]/15 to-purple-500/15 text-[#F2C94C] border-[#F2C94C]/40' },
  };

  const item = map[category] || {
    name: category?.replace(/_/g, ' ')?.toUpperCase() || 'CATEGORY',
    bg: 'bg-[#1E3258] text-[#D4DEEE] border-[#35538C]'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider border ${item.bg}`}>
      {item.name}
    </span>
  );
};

export const MainBoardBadge = () => {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152442] text-[#F2C94C] border border-[#D4A94C]/50 text-[11px] font-mono font-bold tracking-wider shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#F2C94C] animate-pulse" />
      Main Carrom Board
    </span>
  );
};

export const BoardNumberBadge = () => {
  return <MainBoardBadge />;
};
