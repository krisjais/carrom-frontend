'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Activity,
  Clock,
  RefreshCw,
  Trophy,
  ArrowRight,
  Radio,
  Award,
  Sparkles,
  Heart,
  Flame,
  Shield,
  Users,
  GitFork,
  CheckCircle2,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { CarromCoin, CategoryCoinPair, CarromBoardGeometry } from '@/components/ui/CarromElements';
import { CarromMatchTimer } from '@/components/common/CarromMatchTimer';

export default function LivePage() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cheersTeam1, setCheersTeam1] = useState(12);
  const [cheersTeam2, setCheersTeam2] = useState(15);
  const [cheerEffect1, setCheerEffect1] = useState(false);
  const [cheerEffect2, setCheerEffect2] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchLive = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.getLiveMatches();
      if (res?.success) {
        setLiveData(res);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Live matches fetch warning:', err.message);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(() => fetchLive(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCheer = (teamNum) => {
    if (teamNum === 1) {
      setCheersTeam1((prev) => prev + 1);
      setCheerEffect1(true);
      setTimeout(() => setCheerEffect1(false), 800);
    } else {
      setCheersTeam2((prev) => prev + 1);
      setCheerEffect2(true);
      setTimeout(() => setCheerEffect2(false), 800);
    }
  };

  const currentMatch = liveData?.currentMatch;
  const nextMatch = liveData?.nextMatch;
  const readyQueue = liveData?.readyQueue || [];
  const completedMatches = liveData?.completedMatches || [];

  // Helper to render collegiate player chips
  const renderPlayerRoster = (team, sideColor = 'white') => {
    if (!team) return null;
    const p1 = team.player1;
    const p2 = team.player2;

    if (!p1 && !p2) {
      return (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-xs text-[#7A614A] font-mono tracking-wide">
            Collegiate Approved Entry
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 pt-2">
        {p1 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F8F4EB] border border-[#D9C8B0] shadow-xs text-xs text-[#2B1B10]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D4F]" />
            <span className="font-semibold">{p1.fullName || 'Athlete 1'}</span>
            {p1.department && (
              <span className="px-1.5 py-0.5 rounded bg-[#EBE0CD] text-[10px] font-mono text-[#5A3E28] uppercase font-bold tracking-wider">
                {p1.department}
              </span>
            )}
            {p1.collegeYear && (
              <span className="text-[10px] text-[#7A6753] font-mono font-semibold">Yr {p1.collegeYear}</span>
            )}
          </div>
        )}

        {p2 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F8F4EB] border border-[#D9C8B0] shadow-xs text-xs text-[#2B1B10] ml-0 sm:ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D4F]" />
            <span className="font-semibold">{p2.fullName || 'Athlete 2'}</span>
            {p2.department && (
              <span className="px-1.5 py-0.5 rounded bg-[#EBE0CD] text-[10px] font-mono text-[#5A3E28] uppercase font-bold tracking-wider">
                {p2.department}
              </span>
            )}
            {p2.collegeYear && (
              <span className="text-[10px] text-[#7A6753] font-mono font-semibold">Yr {p2.collegeYear}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      
      {/* 1. TOP BROADCAST HEADER & LIVE HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2E2B25]">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] text-[11px] font-mono font-bold tracking-widest uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-ping" />
              <span>MAIN ARENA LIVE BROADCAST</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#7E7060] dark:text-[#B8B1A5] bg-white/60 dark:bg-[#15191C] px-2.5 py-1 rounded-full border border-[#E8E1D5] dark:border-[#2B3034]">
              <Radio className="w-3 h-3 text-[#E74C3C]" />
              Court #01
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#3E342B] dark:text-[#F5F1E8]">
            Championship Live Board
          </h1>
          <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] max-w-xl">
            Real-time scorecards, official referee decisions, and sequential on-deck queue streaming live from Board 1.
          </p>
        </div>

        {/* Action Controls: Refresh & Quick Links */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
          <button
            onClick={() => fetchLive(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] hover:bg-[#F4EFE6] dark:hover:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh live stream data immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#E74C3C]' : 'text-[#E74C3C]'}`} />
            <span className="font-mono text-[11px]">
              {refreshing ? 'Syncing...' : 'Sync (4s)'}
            </span>
          </button>

          <Link
            href="/brackets"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3E342B] dark:bg-[#D4A94C] hover:bg-[#2D251E] text-white dark:text-[#15191C] text-xs font-bold transition-all shadow-xs uppercase tracking-wider"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Brackets</span>
          </Link>
        </div>
      </div>

      {/* 2. THE CHAMPIONSHIP CARROM BOARD ARENA (COMPACT HERO SHOWPIECE) */}
      <section className="space-y-4 max-w-4xl mx-auto w-full">
        {currentMatch ? (
          /* ========================================================================= */
          /* AUTHENTIC CHAMPIONSHIP CARROM BOARD HERO DISPLAY - COMPACT LIGHT THEME     */
          /* ========================================================================= */
          <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-[#442D1C] via-[#332013] to-[#25160C] border-[3px] border-[#5A3E28] shadow-[0_16px_50px_-10px_rgba(42,26,14,0.3)] overflow-hidden">
            
            {/* Real Polished Birch Plywood Carrom Playing Surface */}
            <div className="relative rounded-[14px] sm:rounded-[20px] bg-gradient-to-br from-[#FCF9F2] via-[#F7EFE1] to-[#EFE3CF] p-3.5 sm:p-5 lg:p-6 text-[#2B1B10] overflow-hidden border border-[#DFCBB5] shadow-[inset_0_3px_20px_rgba(62,40,24,0.1)]">
              
              {/* Corner Pockets: Compact authentic visual insets */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-bl from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tl from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>

              {/* Authentic Carrom Center Circles and Arrows Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <CarromBoardGeometry hideCenter className="w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] max-w-none text-[#7D5E3F]" />
              </div>

              {/* Subtle Warm Arena Spotlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#D5C4A1]/20 to-transparent blur-2xl pointer-events-none" />

              {/* ------------------------------------------------------------- */}
              {/* TOP HUD BAR: Championship Board Status & Match Metadata        */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFCBB5] text-xs px-4 sm:px-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E74C3C] text-white text-[9px] font-mono font-black tracking-widest uppercase shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE ON BOARD 01
                  </span>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#D5C4A1] text-xs shadow-2xs">
                    <CategoryCoinPair category={currentMatch.category} />
                    <CategoryBadge category={currentMatch.category} />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#EFE4D0] border border-[#D0BF9F] text-[#5A3E28] text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                    {currentMatch.roundName || 'Championship Round'}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-[#635140]">
                  <span className="hidden sm:inline">
                    Match <strong className="text-[#2B1B10]">#{currentMatch.matchNumber}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E8DEC7] border border-[#D0BF9F] text-[#5A3E28] font-bold">
                    Knockout Decider
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* BATTLE ARENA: Side A vs Center Duel (Queen) vs Side B          */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-11 items-center gap-3 sm:gap-4 py-3 sm:py-4">
                
                {/* SIDE A: Team 1 */}
                <div className="lg:col-span-5 relative group rounded-xl p-3.5 sm:p-4 bg-white/85 hover:bg-white/95 border border-[#D5C4A1] backdrop-blur-xs transition-all duration-300 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#7A614A] uppercase">
                        SIDE A
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase">
                        First Break
                      </span>
                    </div>

                    <h2 className="font-serif font-black text-lg sm:text-xl lg:text-2xl text-[#2B1B10] tracking-tight leading-snug truncate">
                      {currentMatch.team1?.name || 'Team 1'}
                    </h2>

                    {renderPlayerRoster(currentMatch.team1, 'white')}
                  </div>

                  {/* Spectator Cheer for Team 1 */}
                  <div className="pt-2.5 mt-2 border-t border-[#DFCBB5] flex items-center justify-between">
                    <button
                      onClick={() => handleCheer(1)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        cheerEffect1
                          ? 'bg-[#E74C3C] text-white scale-105 shadow-md'
                          : 'bg-white hover:bg-[#F8F4EB] text-[#442D1C] border border-[#D5C4A1] shadow-2xs'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${cheerEffect1 ? 'fill-white animate-bounce' : 'fill-rose-500 text-rose-500'}`} />
                      <span>Cheer Side A</span>
                    </button>
                    <span className="text-[10px] font-mono text-[#7A614A] font-bold">
                      {cheersTeam1} Cheers
                    </span>
                  </div>
                </div>

                {/* CENTER DUEL: Queen Emblem & Clash Marker */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center my-1 lg:my-0 space-y-1">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 rounded-full bg-[#E74C3C]/15 animate-ping pointer-events-none" />
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FCF9F2] border-2 border-[#C0392B] shadow-sm flex items-center justify-center">
                      <CarromCoin type="queen" size="sm" />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="font-serif italic font-bold text-sm sm:text-base text-[#7A614A] block">
                      VS
                    </span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#937C64] block">
                      #{currentMatch.matchNumber}
                    </span>
                  </div>
                </div>

                {/* SIDE B: Team 2 */}
                <div className="lg:col-span-5 relative group rounded-xl p-3.5 sm:p-4 bg-white/85 hover:bg-white/95 border border-[#D5C4A1] backdrop-blur-xs transition-all duration-300 shadow-xs flex flex-col justify-between text-left lg:text-right">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between lg:flex-row-reverse">
                      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#7A614A] uppercase">
                        SIDE B
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EFE4D0] text-[#5A3E28] border border-[#D0BF9F] font-bold uppercase">
                        Counter Strike
                      </span>
                    </div>

                    <h2 className="font-serif font-black text-lg sm:text-xl lg:text-2xl text-[#2B1B10] tracking-tight leading-snug truncate">
                      {currentMatch.team2?.name || 'Team 2'}
                    </h2>

                    <div className="lg:flex lg:flex-col lg:items-end">
                      {renderPlayerRoster(currentMatch.team2, 'black')}
                    </div>
                  </div>

                  {/* Spectator Cheer for Team 2 */}
                  <div className="pt-2.5 mt-2 border-t border-[#DFCBB5] flex items-center justify-between lg:flex-row-reverse">
                    <button
                      onClick={() => handleCheer(2)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        cheerEffect2
                          ? 'bg-amber-600 text-white scale-105 shadow-md'
                          : 'bg-white hover:bg-[#F8F4EB] text-[#442D1C] border border-[#D5C4A1] shadow-2xs'
                      }`}
                    >
                      <Flame className={`w-3 h-3 ${cheerEffect2 ? 'fill-white animate-bounce' : 'fill-amber-600 text-amber-600'}`} />
                      <span>Cheer Side B</span>
                    </button>
                    <span className="text-[10px] font-mono text-[#7A614A] font-bold">
                      {cheersTeam2} Cheers
                    </span>
                  </div>
                </div>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* ARENA STADIUM TIMER: High-Impact Compact Clock Display        */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 py-1 sm:py-2">
                <CarromMatchTimer match={currentMatch} variant="arena" />
              </div>

              {/* ------------------------------------------------------------- */}
              {/* LOWER TELEMETRY STRIP: Broadcast Metadata                     */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 pt-3 mt-2 border-t border-[#DFCBB5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center sm:text-left text-[11px] font-mono px-6 sm:px-8">
                <div className="space-y-0">
                  <span className="text-[9px] uppercase text-[#7A6753] block font-bold">Official Board</span>
                  <p className="font-bold text-[#2B1B10] text-[11px] truncate">Table 01 · 29" Sissoo</p>
                </div>
                <div className="space-y-0">
                  <span className="text-[9px] uppercase text-[#7A6753] block font-bold">Match Format</span>
                  <p className="font-bold text-[#5A3E28] text-[11px] truncate">Knockout Decider</p>
                </div>
                <div className="space-y-0">
                  <span className="text-[9px] uppercase text-[#7A6753] block font-bold">Referee Desk</span>
                  <p className="font-bold text-emerald-800 text-[11px] truncate flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="w-3 h-3 inline text-emerald-700" /> Live In Play
                  </p>
                </div>
                <div className="space-y-0">
                  <span className="text-[9px] uppercase text-[#7A6753] block font-bold">Next On Deck</span>
                  <p className="font-bold text-[#2B1B10] text-[11px] truncate">
                    {nextMatch ? `${nextMatch.team1?.name || 'TBD'} vs ${nextMatch.team2?.name || 'TBD'}` : 'Waiting on Bracket'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* OPEN ARENA (NO MATCH LIVE RIGHT NOW): COMPACT BROWN & BEIGE THEME          */
          /* ========================================================================= */
          <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-[#442D1C] via-[#332013] to-[#25160C] border-[3px] border-[#5A3E28] shadow-[0_16px_50px_-10px_rgba(42,26,14,0.3)] overflow-hidden">
            {/* Real Polished Birch Plywood Carrom Playing Surface */}
            <div className="relative rounded-[14px] sm:rounded-[20px] bg-gradient-to-br from-[#FCF9F2] via-[#F7EFE1] to-[#EFE3CF] p-5 sm:p-8 text-[#2B1B10] text-center space-y-3.5 overflow-hidden border border-[#DFCBB5] shadow-[inset_0_3px_20px_rgba(62,40,24,0.1)]">
              
              {/* Corner Pockets: Compact authentic visual insets */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-bl from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tl from-[#1E1712] to-[#0E0A08] border-[1.5px] border-[#8C6D4F] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0A0705]" />
              </div>

              {/* Authentic Carrom Center Circles and Arrows Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <CarromBoardGeometry hideCenter className="w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] max-w-none text-[#7D5E3F]" />
              </div>

              {/* Authentic Center Concentric Carrom Rings with Queen Coin */}
              <div className="relative z-10 mx-auto flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed border-[#C0392B]/40 flex items-center justify-center p-1 bg-gradient-to-b from-[#F4E8D3]/80 to-[#E8DCBF]/80 shadow-inner">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#C0392B] bg-[#FCF9F2] flex items-center justify-center shadow-xs">
                    <CarromCoin type="queen" size="md" className="shadow-xs" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-1.5 max-w-md mx-auto">
                <span className="px-3 py-0.5 rounded-full bg-[#EFE4D0] border border-[#D0BF9F] text-[#5A3E28] text-[10px] font-mono font-bold tracking-widest uppercase inline-block shadow-2xs">
                  CHAMPIONSHIP TABLE 01 OPEN
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-[#2B1B10] tracking-tight">
                  Main Carrom Board is Free
                </h2>
                <p className="text-xs text-[#635140] leading-relaxed font-sans max-w-sm mx-auto">
                  {nextMatch
                    ? `Next on deck: ${nextMatch.team1?.name || 'TBD'} vs ${nextMatch.team2?.name || 'TBD'} in ${nextMatch.roundName}. Waiting for players to report.`
                    : 'All scheduled games for this session are complete or pending bracket seeding. Check back shortly for the next round.'}
                </p>
              </div>

              {nextMatch && (
                <div className="relative z-10 p-3 rounded-xl bg-white/90 border border-[#D5C4A1] max-w-sm mx-auto space-y-1.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#7A614A] font-mono font-semibold">
                    <span>Next Match On Deck</span>
                    <CategoryBadge category={nextMatch.category} />
                  </div>
                  <p className="font-serif font-bold text-[#2B1B10] text-sm">
                    {nextMatch.team1?.name || 'TBD'} <span className="italic font-normal text-[#7A614A]">vs</span> {nextMatch.team2?.name || 'TBD'}
                  </p>
                  <p className="text-[10px] text-[#7A614A] font-mono">
                    Sequential Queue Position #1 · 10m Knockout Round
                  </p>
                </div>
              )}

              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <Link
                  href="/fixtures"
                  className="px-4 py-2 rounded-xl bg-[#442D1C] hover:bg-[#301F12] text-[#FCF9F2] text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-md hover:shadow-lg inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View All Fixtures</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. SEQUENTIAL READY QUEUE (NEXT UP ON BOARD 1) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2E2B25] pb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#3E342B] dark:text-[#D4A94C]" />
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#3E342B] dark:text-[#F5F1E8]">
              On-Deck Ready Queue
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white dark:bg-[#1D1C19] border border-[#D5C4A1] dark:border-[#38342C] text-[#3E342B] dark:text-[#F5F1E8] shadow-2xs">
            {readyQueue.length} In Line for Board 01
          </span>
        </div>

        {readyQueue.length === 0 ? (
          <div className="rounded-2xl p-8 sm:p-10 text-center bg-white dark:bg-[#1D1C19] border border-[#E8E1D5] dark:border-[#2E2B25] text-xs text-[#7E7060] dark:text-[#A8A194] font-mono shadow-xs">
            No matches currently waiting in the ready queue. Complete earlier rounds to populate sequential fixtures.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyQueue.map((match, idx) => {
              const isOnDeck = idx === 0;
              return (
                <div
                  key={match._id}
                  className={`rounded-2xl p-5 space-y-3.5 transition-all shadow-xs ${
                    isOnDeck
                      ? 'bg-gradient-to-br from-white to-[#FAF7F0] dark:from-[#1D1C19] dark:to-[#24221E] border-2 border-[#D5C4A1] dark:border-[#C2A268]/50 shadow-md ring-1 ring-[#D5C4A1]/30'
                      : 'bg-white dark:bg-[#1D1C19] border border-[#E8E1D5] dark:border-[#2E2B25] hover:border-[#D5C4A1] dark:hover:border-[#C2A268]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[#E8E1D5] dark:border-[#38342C]">
                    <div className="flex items-center gap-1.5">
                      <CategoryCoinPair category={match.category} />
                      <CategoryBadge category={match.category} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isOnDeck
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                        : 'bg-[#F4EFE6] dark:bg-white/10 text-[#7E7060] dark:text-white/70'
                    }`}>
                      {isOnDeck ? '★ Next On Deck' : `#${idx + 1} In Queue`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                      <span className="truncate max-w-[42%]">{match.team1?.name || 'TBD'}</span>
                      <span className="font-serif italic text-xs text-[#7E7060] dark:text-[#A39C8F]">vs</span>
                      <span className="truncate max-w-[42%] text-right">{match.team2?.name || 'TBD'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#7E7060] dark:text-[#817B72] pt-1">
                      <span>{match.roundName}</span>
                      <span>Board 01 Sequential</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. RECENT CONFIRMED RESULTS */}
      {completedMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2E2B25] pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C2A268]" />
              <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#3E342B] dark:text-[#F5F1E8]">
                Recent Results Confirmed
              </h2>
            </div>
            <Link
              href="/results"
              className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] hover:text-[#E74C3C] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <span>View All Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {completedMatches.slice(0, 6).map((m) => (
              <div
                key={m._id}
                className="rounded-2xl p-5 space-y-2.5 bg-white dark:bg-[#1D1C19] border border-[#E8E1D5] dark:border-[#2E2B25] shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-[#7E7060] dark:text-[#A8A194] font-mono pb-2 border-b border-[#E8E1D5] dark:border-[#38342C]">
                  <CategoryBadge category={m.category} />
                  <span>Match #{m.matchNumber}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> Winner Confirmed
                  </span>
                  <p className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base truncate">
                    {m.winnerTeam?.name || 'Winner Decided'}
                  </p>
                  <p className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono truncate">
                    {m.roundName} · Advances in Knockout
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. ARENA INFORMATION CALLOUT */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] dark:bg-[#24221E] border border-[#D5C4A1] flex items-center justify-center shrink-0">
            <CarromCoin type="queen" size="xs" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">Official Carrom Championship Tournament Rules</p>
            <p className="text-[#7E7060] dark:text-[#817B72]">
              Matches strictly adhere to collegiate single-board sequential scheduling and 10-minute round regulation clocks.
            </p>
          </div>
        </div>
        <Link
          href="/rules"
          className="px-4 py-2 rounded-xl bg-[#F4EFE6] dark:bg-[#181C1F] hover:bg-[#EAE1D0] border border-[#D5C4A1] text-[#3E342B] dark:text-[#F5F1E8] font-bold font-mono uppercase tracking-wider shrink-0 transition-colors"
        >
          Read Rules
        </Link>
      </div>

    </div>
  );
}
