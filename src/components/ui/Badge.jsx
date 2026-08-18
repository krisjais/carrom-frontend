import React from 'react';

export const StatusBadge = ({ status, queuePosition }) => {
  const map = {
    live: { label: 'LIVE ON BOARD', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm', dot: true },
    scheduled: {
      label: queuePosition ? `READY · Q#${queuePosition}` : 'READY',
      bg: 'bg-[#D7A859]/15 text-[#FFD691] border-[#D7A859]/35',
      dot: false
    },
    pending: { label: 'WAITING', bg: 'bg-[#1E3258] text-[#D4DEEE] border-[#35538C]', dot: false },
    completed: { label: 'COMPLETED', bg: 'bg-[#FFD691]/15 text-[#FFD691] border-[#FFD691]/35 font-bold', dot: false },
    bye: { label: 'BYE ADVANCE', bg: 'bg-[#D7A859]/20 text-[#FFECC7] border-[#D7A859]/40', dot: false },
    approved: { label: 'Approved', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: false },
    rejected: { label: 'Rejected', bg: 'bg-[#FF6E80]/15 text-[#FF96A4] border-[#FF6E80]/30', dot: false },
    registration_open: { label: 'Registration Open', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: true },
    registration_closed: { label: 'Closed', bg: 'bg-[#D7A859]/15 text-[#FFD691] border-[#D7A859]/30', dot: false },
    ongoing: { label: 'Tournament Active', bg: 'bg-[#FFD691]/15 text-[#FFD691] border-[#FFD691]/30', dot: true },
  };

  const item = map[status] || { label: status?.toUpperCase(), bg: 'bg-[#1E3258] text-[#D4DEEE] border-[#35538C]', dot: false };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono tracking-wide border ${item.bg}`}>
      {item.dot && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      {item.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const map = {
    boys_singles: { name: 'Boys Singles', bg: 'bg-[#FFD691]/15 text-[#FFD691] border-[#FFD691]/30' },
    girls_singles: { name: 'Girls Singles', bg: 'bg-[#D7A859]/15 text-[#FFE2AA] border-[#D7A859]/30' },
    boys_doubles: { name: 'Boys Doubles', bg: 'bg-[#1E3258] text-white border-[#D7A859]/40' },
    girls_doubles: { name: 'Girls Doubles', bg: 'bg-[#D7A859]/20 text-[#FFD691] border-[#D7A859]/40' },
    mixed_doubles: { name: 'Mixed Doubles', bg: 'bg-gradient-to-r from-[#FFD691]/15 to-[#D7A859]/15 text-[#FFD691] border-[#FFD691]/40' },
  };

  const item = map[category] || { name: category?.replace('_', ' ')?.toUpperCase() || '', bg: 'bg-[#1E3258] text-[#D4DEEE] border-[#35538C]' };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${item.bg}`}>
      {item.name}
    </span>
  );
};

export const MainBoardBadge = () => {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152442] text-[#FFD691] border border-[#D7A859]/50 text-[11px] font-mono font-bold tracking-wider shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#FFD691] animate-pulse" />
      Main Carrom Board
    </span>
  );
};

export const BoardNumberBadge = () => {
  return <MainBoardBadge />;
};
