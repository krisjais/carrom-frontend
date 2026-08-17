import React from 'react';

export const StatusBadge = ({ status, queuePosition }) => {
  const map = {
    live: { label: 'LIVE', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: true },
    scheduled: {
      label: queuePosition ? `READY · Q#${queuePosition}` : 'READY',
      bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      dot: false
    },
    pending: { label: 'WAITING', bg: 'bg-[#141F36] text-slate-400 border-[#1C2B48]', dot: false },
    completed: { label: 'COMPLETED', bg: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30', dot: false },
    bye: { label: 'BYE ADVANCE', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30', dot: false },
    approved: { label: 'Approved', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: false },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: false },
    registration_open: { label: 'Open', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: true },
    registration_closed: { label: 'Closed', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: false },
    ongoing: { label: 'Tournament Active', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: true },
  };

  const item = map[status] || { label: status?.toUpperCase(), bg: 'bg-[#141F36] text-slate-300 border-[#1C2B48]', dot: false };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono tracking-wide border ${item.bg}`}>
      {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {item.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const map = {
    boys_singles: { name: 'Boys Singles', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
    girls_singles: { name: 'Girls Singles', bg: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
    boys_doubles: { name: 'Boys Doubles', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    girls_doubles: { name: 'Girls Doubles', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
    mixed_doubles: { name: 'Mixed Doubles', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  };

  const item = map[category] || { name: category?.replace('_', ' ')?.toUpperCase() || '', bg: 'bg-[#141F36] text-slate-300 border-[#1C2B48]' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.bg}`}>
      {item.name}
    </span>
  );
};

export const MainBoardBadge = () => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#070B16] text-[#D4AF37] border border-[#D4AF37]/30 text-[11px] font-mono font-bold tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
      Main Carrom Board
    </span>
  );
};

export const BoardNumberBadge = () => {
  return <MainBoardBadge />;
};
