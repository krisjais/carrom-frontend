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
          <span className="text-xs text-[#D5C4A1]/80 font-mono tracking-wide">
            Collegiate Approved Entry
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 pt-2">
        {p1 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-xs text-xs text-white shadow-xs">
            <span className={`w-2 h-2 rounded-full ${sideColor === 'white' ? 'bg-[#FAF9F6] ring-1 ring-[#D5C4A1]' : 'bg-[#2A2420] ring-1 ring-white/40'}`} />
            <span className="font-semibold">{p1.fullName || 'Athlete 1'}</span>
            {p1.department && (
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono text-[#D5C4A1] uppercase font-bold tracking-wider">
                {p1.department}
              </span>
            )}
            {p1.collegeYear && (
              <span className="text-[10px] text-white/50 font-mono">Yr {p1.collegeYear}</span>
            )}
          </div>
        )}

        {p2 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-xs text-xs text-white shadow-xs ml-0 sm:ml-1">
            <span className={`w-2 h-2 rounded-full ${sideColor === 'white' ? 'bg-[#FAF9F6] ring-1 ring-[#D5C4A1]' : 'bg-[#2A2420] ring-1 ring-white/40'}`} />
            <span className="font-semibold">{p2.fullName || 'Athlete 2'}</span>
            {p2.department && (
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono text-[#D5C4A1] uppercase font-bold tracking-wider">
                {p2.department}
              </span>
            )}
            {p2.collegeYear && (
              <span className="text-[10px] text-white/50 font-mono">Yr {p2.collegeYear}</span>
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

      {/* 2. THE CHAMPIONSHIP CARROM BOARD ARENA (HERO SHOWPIECE) */}
      <section className="space-y-4">
        {currentMatch ? (
          /* ========================================================================= */
          /* AUTHENTIC CHAMPIONSHIP CARROM BOARD HERO DISPLAY                           */
          /* ========================================================================= */
          <div className="relative rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-[#4A382A] via-[#2F241B] to-[#1C1613] border-2 border-[#5C4736] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(213,196,161,0.2)] overflow-hidden">
            
            {/* Real Rosewood Carrom Board Outer Rim with Bevel & Corner Net Insets */}
            <div className="relative rounded-[22px] sm:rounded-[26px] bg-gradient-to-br from-[#1C1A17] via-[#141311] to-[#0D0C0B] p-5 sm:p-8 lg:p-10 text-white overflow-hidden border border-white/5 shadow-inner">
              
              {/* Corner Pockets: Authentic visual insets representing the 4 carrom net pockets */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-black to-[#221C18] border border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] opacity-80 pointer-events-none" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-bl from-black to-[#221C18] border border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-gradient-to-tr from-black to-[#221C18] border border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gradient-to-tl from-black to-[#221C18] border border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.95)] opacity-80 pointer-events-none" />

              {/* Authentic Carrom Center Circles and Arrows Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
                <CarromBoardGeometry className="w-[500px] h-[500px] max-w-none text-[#D4AF37]" />
              </div>

              {/* Ambient Golden Arena Spotlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-[#D4AF37]/15 to-transparent blur-3xl pointer-events-none" />

              {/* ------------------------------------------------------------- */}
              {/* TOP HUD BAR: Championship Board Status & Match Metadata        */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#E74C3C] text-white text-[10px] font-mono font-black tracking-widest uppercase shadow-[0_0_12px_rgba(231,76,60,0.5)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE ON BOARD 01
                  </span>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
                    <CategoryCoinPair category={currentMatch.category} />
                    <CategoryBadge category={currentMatch.category} />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#D5C4A1]/20 border border-[#D5C4A1]/40 text-[#D5C4A1] text-[11px] font-mono font-bold uppercase tracking-wider">
                    {currentMatch.roundName || 'Championship Round'}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-white/70">
                  <span className="hidden sm:inline">
                    Match <strong className="text-white">#{currentMatch.matchNumber}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-[#D5C4A1] font-bold">
                    Knockout Decider
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* BATTLE ARENA: Side A (White) vs Center Duel (Queen) vs Side B  */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-11 items-center gap-6 py-8">
                
                {/* SIDE A: Team 1 (White Coin) */}
                <div className="lg:col-span-5 relative group rounded-2xl p-6 sm:p-7 bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 backdrop-blur-sm transition-all duration-300 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CarromCoin type="white" size="md" />
                        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#D5C4A1] uppercase">
                          SIDE A · WHITE COIN
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        First Break
                      </span>
                    </div>

                    <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                      {currentMatch.team1?.name || 'Team 1'}
                    </h2>

                    {renderPlayerRoster(currentMatch.team1, 'white')}
                  </div>

                  {/* Spectator Cheer for Team 1 */}
                  <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleCheer(1)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        cheerEffect1
                          ? 'bg-[#E74C3C] text-white scale-105 shadow-[0_0_15px_rgba(231,76,60,0.8)]'
                          : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${cheerEffect1 ? 'fill-white animate-bounce' : 'fill-rose-500 text-rose-500'}`} />
                      <span>Cheer Side A</span>
                    </button>
                    <span className="text-[11px] font-mono text-[#D5C4A1] font-semibold">
                      {cheersTeam1} Cheers
                    </span>
                  </div>
                </div>

                {/* CENTER DUEL: Queen Emblem & Clash Marker */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center my-2 lg:my-0 space-y-3">
                  <div className="relative flex items-center justify-center">
                    {/* Glowing Queen Ring */}
                    <div className="absolute w-16 h-16 rounded-full bg-[#E74C3C]/25 animate-ping pointer-events-none" />
                    <div className="w-14 h-14 rounded-full bg-[#1F1B18] border-2 border-[#D5C4A1] shadow-[0_0_20px_rgba(213,196,161,0.3)] flex items-center justify-center">
                      <CarromCoin type="queen" size="md" />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="font-serif italic font-bold text-lg sm:text-xl text-[#D5C4A1] block">
                      VS
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">
                      Match #{currentMatch.matchNumber}
                    </span>
                  </div>
                </div>

                {/* SIDE B: Team 2 (Black Coin) */}
                <div className="lg:col-span-5 relative group rounded-2xl p-6 sm:p-7 bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 backdrop-blur-sm transition-all duration-300 shadow-xl flex flex-col justify-between text-left lg:text-right">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between lg:flex-row-reverse">
                      <div className="flex items-center gap-2">
                        <CarromCoin type="black" size="md" />
                        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#D5C4A1] uppercase">
                          SIDE B · BLACK COIN
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/80 border border-white/15 font-bold uppercase">
                        Counter Strike
                      </span>
                    </div>

                    <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                      {currentMatch.team2?.name || 'Team 2'}
                    </h2>

                    <div className="lg:flex lg:flex-col lg:items-end">
                      {renderPlayerRoster(currentMatch.team2, 'black')}
                    </div>
                  </div>

                  {/* Spectator Cheer for Team 2 */}
                  <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between lg:flex-row-reverse">
                    <button
                      onClick={() => handleCheer(2)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        cheerEffect2
                          ? 'bg-amber-500 text-white scale-105 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                          : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${cheerEffect2 ? 'fill-white animate-bounce' : 'fill-amber-400 text-amber-400'}`} />
                      <span>Cheer Side B</span>
                    </button>
                    <span className="text-[11px] font-mono text-[#D5C4A1] font-semibold">
                      {cheersTeam2} Cheers
                    </span>
                  </div>
                </div>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* ARENA STADIUM TIMER: High-Impact Clock Display                */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 py-3">
                <CarromMatchTimer match={currentMatch} variant="arena" />
              </div>

              {/* ------------------------------------------------------------- */}
              {/* LOWER TELEMETRY STRIP: Broadcast Metadata                     */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-10 pt-5 mt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-white/40 block">Official Board</span>
                  <p className="font-bold text-white text-xs truncate">Table 01 · 29" Sissoo Wood</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-white/40 block">Match Format</span>
                  <p className="font-bold text-[#D5C4A1] text-xs truncate">Single-Game Knockout</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-white/40 block">Referee Desk</span>
                  <p className="font-bold text-emerald-400 text-xs truncate flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> Live Adjudication
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-white/40 block">Next On Deck</span>
                  <p className="font-bold text-white text-xs truncate">
                    {nextMatch ? `${nextMatch.team1?.name || 'TBD'} vs ${nextMatch.team2?.name || 'TBD'}` : 'Waiting on Bracket'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* OPEN ARENA (NO MATCH LIVE RIGHT NOW): INVITATION & SPOTLIGHT               */
          /* ========================================================================= */
          <div className="relative rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-[#4A382A] via-[#2F241B] to-[#1C1613] border-2 border-[#5C4736] shadow-xl overflow-hidden">
            <div className="relative rounded-[22px] sm:rounded-[26px] bg-gradient-to-br from-[#1C1A17] via-[#141311] to-[#0D0C0B] p-8 sm:p-14 text-white text-center space-y-6 overflow-hidden">
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
                <CarromBoardGeometry className="w-[450px] h-[450px] max-w-none text-[#D4AF37]" />
              </div>

              <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2A221C] border-2 border-[#D5C4A1] flex items-center justify-center mx-auto shadow-xl">
                <CarromCoin type="queen" size="lg" className="shadow-lg" />
              </div>

              <div className="relative z-10 space-y-2 max-w-lg mx-auto">
                <span className="px-3 py-1 rounded-full bg-[#D5C4A1]/20 border border-[#D5C4A1]/40 text-[#D5C4A1] text-[11px] font-mono font-bold tracking-widest uppercase inline-block">
                  CHAMPIONSHIP TABLE 01 OPEN
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Main Carrom Board is Free
                </h2>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  {nextMatch
                    ? `Next match on deck: ${nextMatch.team1?.name || 'TBD'} vs ${nextMatch.team2?.name || 'TBD'} in ${nextMatch.roundName}. Waiting for players to report to the referee desk.`
                    : 'All current scheduled games for this session are complete or pending bracket seeding. Check back shortly for the next knockout round.'}
                </p>
              </div>

              {nextMatch && (
                <div className="relative z-10 p-4 rounded-2xl bg-white/[0.06] border border-white/10 max-w-md mx-auto space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#D5C4A1] font-mono">
                    <span>Next Match On Deck</span>
                    <CategoryBadge category={nextMatch.category} />
                  </div>
                  <p className="font-serif font-bold text-white text-base">
                    {nextMatch.team1?.name || 'TBD'} <span className="italic font-normal text-white/60">vs</span> {nextMatch.team2?.name || 'TBD'}
                  </p>
                  <p className="text-[11px] text-white/60 font-mono">
                    Sequential Queue Position #1 · 10m Knockout Round
                  </p>
                </div>
              )}

              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/admin/matches"
                  className="px-5 py-2.5 rounded-xl bg-[#D5C4A1] hover:bg-[#EAE1D0] text-[#3E342B] text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-md"
                >
                  Referee Desk Control
                </Link>
                <Link
                  href="/fixtures"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold font-mono tracking-wider uppercase transition-all"
                >
                  View All Fixtures
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
