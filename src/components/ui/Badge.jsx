import React from 'react';

export const StatusBadge = ({ status, queuePosition }) => {
  const map = {
    live: { label: 'LIVE ON BOARD', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10', dot: true },
    scheduled: {
      label: queuePosition ? `READY · Q#${queuePosition}` : 'READY',
      bg: 'bg-[#FDB095]/15 text-[#FDB095] border-[#FDB095]/30',
      dot: false
    },
    pending: { label: 'WAITING', bg: 'bg-[#2C0854] text-[#D8C7F0] border-[#4A138C]', dot: false },
    completed: { label: 'COMPLETED', bg: 'bg-[#FFBA00]/15 text-[#FFBA00] border-[#FFBA00]/30 font-bold', dot: false },
    bye: { label: 'BYE ADVANCE', bg: 'bg-[#E5958E]/20 text-[#F5B7B1] border-[#E5958E]/40', dot: false },
    approved: { label: 'Approved', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: false },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: false },
    registration_open: { label: 'Registration Open', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: true },
    registration_closed: { label: 'Closed', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: false },
    ongoing: { label: 'Tournament Active', bg: 'bg-[#FFBA00]/15 text-[#FFBA00] border-[#FFBA00]/30', dot: true },
  };

  const item = map[status] || { label: status?.toUpperCase(), bg: 'bg-[#2C0854] text-[#D8C7F0] border-[#4A138C]', dot: false };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono tracking-wide border ${item.bg}`}>
      {item.dot && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      {item.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const map = {
    boys_singles: { name: 'Boys Singles', bg: 'bg-[#FFBA00]/15 text-[#FFBA00] border-[#FFBA00]/30' },
    girls_singles: { name: 'Girls Singles', bg: 'bg-[#FDB095]/15 text-[#FDB095] border-[#FDB095]/30' },
    boys_doubles: { name: 'Boys Doubles', bg: 'bg-[#E5958E]/15 text-[#E5958E] border-[#E5958E]/30' },
    girls_doubles: { name: 'Girls Doubles', bg: 'bg-[#FDB095]/20 text-[#FFC4B0] border-[#FDB095]/40' },
    mixed_doubles: { name: 'Mixed Doubles', bg: 'bg-gradient-to-r from-[#FFBA00]/15 to-[#FDB095]/15 text-[#FFD866] border-[#FFBA00]/40' },
  };

  const item = map[category] || { name: category?.replace('_', ' ')?.toUpperCase() || '', bg: 'bg-[#2C0854] text-[#D8C7F0] border-[#4A138C]' };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${item.bg}`}>
      {item.name}
    </span>
  );
};

export const MainBoardBadge = () => {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#210440] text-[#FFBA00] border border-[#FFBA00]/40 text-[11px] font-mono font-bold tracking-wider shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#FFBA00] animate-pulse" />
      Main Carrom Board
    </span>
  );
};

export const BoardNumberBadge = () => {
  return <MainBoardBadge />;
};
