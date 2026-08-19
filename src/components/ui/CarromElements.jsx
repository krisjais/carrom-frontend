'use client';

import React from 'react';

// Reusable Flat CSS/SVG Carrom Coin
export function CarromCoin({ type = 'black', size = 'md', className = '', label = null }) {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    striker: 'w-10 h-10 sm:w-14 sm:h-14',
  };

  const styleMap = {
    black: 'bg-[#4A4238] dark:bg-[#24282B] border-[1.5px] border-[#3E342B] dark:border-[#181C1F] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_5px_rgba(74,66,56,0.25)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_2px_5px_rgba(0,0,0,0.4)]',
    white: 'bg-[#FFFFFF] dark:bg-[#F5F1E8] border-[1.5px] border-[#D5C4A1] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_5px_rgba(74,66,56,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_5px_rgba(0,0,0,0.3)]',
    queen: 'bg-[#E74C3C] border-[1.5px] border-[#C0392B] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_3px_8px_rgba(231,76,60,0.35)]',
    striker: 'bg-[#FAF9F6] dark:bg-[#F5F1E8] border-[2px] border-[#4A4238] dark:border-[#3D444A] shadow-[inset_0_0_0_2px_rgba(213,196,161,0.5),0_3px_10px_rgba(74,66,56,0.18)] dark:shadow-[inset_0_0_0_2px_rgba(212,169,76,0.3),0_3px_10px_rgba(0,0,0,0.4)]',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 transition-transform ${sizeMap[size] || sizeMap.md} ${styleMap[type] || styleMap.black} ${className}`}
    >
      {/* Subtle concentric inner groove for authentic carrom precision feel */}
      <div className="w-[60%] h-[60%] rounded-full border border-black/10 dark:border-white/10 pointer-events-none" />
      {type === 'queen' && (
        <div className="absolute w-[25%] h-[25%] rounded-full bg-white/75 pointer-events-none" />
      )}
      {label && (
        <span className="absolute text-[9px] font-mono font-bold text-white uppercase tracking-tighter pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
}

// Visual Identity for the 5 Real Championship Divisions
export function CategoryCoinPair({ category = 'boys_singles', className = '' }) {
  switch (category) {
    case 'boys_singles':
      return (
        <div className={`flex items-center gap-1.5 ${className}`} title="Boys Singles (1 Black Coin)">
          <CarromCoin type="black" size="md" />
        </div>
      );
    case 'girls_singles':
      return (
        <div className={`flex items-center gap-1.5 ${className}`} title="Girls Singles (1 White Coin)">
          <CarromCoin type="white" size="md" />
        </div>
      );
    case 'boys_doubles':
      return (
        <div className={`flex items-center -space-x-2 ${className}`} title="Boys Doubles (2 Black Coins)">
          <CarromCoin type="black" size="md" className="relative z-10" />
          <CarromCoin type="black" size="md" className="relative z-0 opacity-90" />
        </div>
      );
    case 'girls_doubles':
      return (
        <div className={`flex items-center -space-x-2 ${className}`} title="Girls Doubles (2 White Coins)">
          <CarromCoin type="white" size="md" className="relative z-10" />
          <CarromCoin type="white" size="md" className="relative z-0 opacity-90" />
        </div>
      );
    case 'mixed_doubles':
      return (
        <div className={`flex items-center -space-x-2 ${className}`} title="Mixed Doubles (1 Black + 1 White Coin)">
          <CarromCoin type="black" size="md" className="relative z-10" />
          <CarromCoin type="white" size="md" className="relative z-0" />
        </div>
      );
    default:
      return <CarromCoin type="black" size="md" className={className} />;
  }
}

// Subtle Carrom Board Geometric Watermark / Graphic
export function CarromBoardGeometry({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full pointer-events-none select-none ${className}`}
    >
      {/* Outer border */}
      <rect x="20" y="20" width="360" height="360" rx="16" stroke="currentColor" strokeWidth="1.5" className="text-[#4A4238]/12 dark:text-[#D4A94C]/10" />
      <rect x="36" y="36" width="328" height="328" rx="8" stroke="currentColor" strokeWidth="1" className="text-[#4A4238]/8 dark:text-[#D4A94C]/8" />

      {/* Center circle */}
      <circle cx="200" cy="200" r="45" stroke="currentColor" strokeWidth="1.5" className="text-[#4A4238]/15 dark:text-[#D4A94C]/15" />
      <circle cx="200" cy="200" r="16" stroke="#E74C3C" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="200" cy="200" r="4" fill="#E74C3C" fillOpacity="0.4" />

      {/* Diagonal Baseline Arrows */}
      <line x1="75" y1="75" x2="140" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-[#4A4238]/10 dark:text-[#D4A94C]/8" />
      <line x1="325" y1="75" x2="260" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-[#4A4238]/10 dark:text-[#D4A94C]/8" />
      <line x1="75" y1="325" x2="140" y2="260" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-[#4A4238]/10 dark:text-[#D4A94C]/8" />
      <line x1="325" y1="325" x2="260" y2="260" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-[#4A4238]/10 dark:text-[#D4A94C]/8" />

      {/* Baselines for Striker */}
      <line x1="100" y1="65" x2="300" y2="65" stroke="currentColor" strokeWidth="1" className="text-[#4A4238]/12 dark:text-[#D4A94C]/10" />
      <circle cx="100" cy="65" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="300" cy="65" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />

      <line x1="100" y1="335" x2="300" y2="335" stroke="currentColor" strokeWidth="1" className="text-[#4A4238]/12 dark:text-[#D4A94C]/10" />
      <circle cx="100" cy="335" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="300" cy="335" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />

      <line x1="65" y1="100" x2="65" y2="300" stroke="currentColor" strokeWidth="1" className="text-[#4A4238]/12 dark:text-[#D4A94C]/10" />
      <circle cx="65" cy="100" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="65" cy="300" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />

      <line x1="335" y1="100" x2="335" y2="300" stroke="currentColor" strokeWidth="1" className="text-[#4A4238]/12 dark:text-[#D4A94C]/10" />
      <circle cx="335" cy="100" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="335" cy="300" r="7" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.25" />
    </svg>
  );
}

// Editorial Hero Carrom Composition (Right Side of Homepage Hero)
export function CarromHeroArt() {
  return (
    <div className="relative w-full aspect-square max-w-[440px] mx-auto bg-white dark:bg-[#15191C] rounded-3xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] shadow-[0_16px_40px_-12px_rgba(74,66,56,0.1)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden transition-colors duration-200">
      {/* Background Board Geometry */}
      <CarromBoardGeometry className="absolute inset-0 scale-95 opacity-80" />

      {/* Subtle Night Arena Spotlight in dark mode */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_50%_35%,rgba(212,169,76,0.08),transparent_60%)] pointer-events-none" />

      {/* Center Concentric Coins Cluster */}
      <div className="relative z-10 w-44 h-44 flex items-center justify-center">
        {/* The Red Queen at center */}
        <CarromCoin type="queen" size="lg" className="relative z-20 shadow-lg" />

        {/* Orbiting Espresso and White Coins arranged like carrom tournament start */}
        <div className="absolute top-2">
          <CarromCoin type="black" size="md" />
        </div>
        <div className="absolute bottom-2">
          <CarromCoin type="black" size="md" />
        </div>
        <div className="absolute left-2">
          <CarromCoin type="white" size="md" />
        </div>
        <div className="absolute right-2">
          <CarromCoin type="white" size="md" />
        </div>
        <div className="absolute top-6 left-6">
          <CarromCoin type="black" size="md" />
        </div>
        <div className="absolute top-6 right-6">
          <CarromCoin type="white" size="md" />
        </div>
        <div className="absolute bottom-6 left-6">
          <CarromCoin type="white" size="md" />
        </div>
        <div className="absolute bottom-6 right-6">
          <CarromCoin type="black" size="md" />
        </div>
      </div>

      {/* Striker positioned strategically on the bottom baseline */}
      <div className="absolute bottom-8 right-16 z-20 flex flex-col items-center">
        <CarromCoin type="striker" size="striker" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#7E7060] dark:text-[#B8B1A5] font-bold mt-1">
          STRIKER
        </span>
      </div>

      {/* Decorative Editorial Badge */}
      <div className="absolute top-4 left-4 z-20 bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#E74C3C]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A4238] dark:text-[#F5F1E8] font-bold">
          MAIN BOARD · OFFICIAL
        </span>
      </div>
    </div>
  );
}

