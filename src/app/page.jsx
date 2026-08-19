'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import {
  ArrowRight,
  Trophy,
  Activity,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Disc,
  Crown,
  ChevronRight,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [liveData, setLiveData] = useState({ liveMatches: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, liveRes, annRes] = await Promise.all([
          api.getOverviewStats(),
          api.getLiveMatches(),
          api.getAnnouncements()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (liveRes.success) setLiveData(liveRes);
        if (annRes.success) setAnnouncements(annRes.announcements.slice(0, 3));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentMatch = liveData?.currentMatch;

  return (
    <div className="flex-1 flex flex-col space-y-16 sm:space-y-24 pb-24 overflow-hidden bg-[#0B0D0E]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#14171A] via-[#0E1012] to-[#0B0D0E] border-b border-[#D4A94C]/20">
        {/* Carrom Board Concentric SVG Motifs & Arena Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#F2C94C]/10 pointer-events-none carrom-wood-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#D4A94C]/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#F2C94C]/20 pointer-events-none" />
        
        {/* Corner Pocket & Striker Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#F2C94C]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#D4A94C]/10 blur-3xl pointer-events-none" />

        {/* Floating Decorative Striker SVG Motif in Top-Right Corner */}
        <div className="hidden lg:block absolute top-12 right-16 opacity-30 hover:opacity-75 transition-opacity duration-500 pointer-events-none">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="85" stroke="#F2C94C" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="90" cy="90" r="65" fill="#14171A" stroke="#D4A94C" strokeWidth="3" />
            <circle cx="90" cy="90" r="40" fill="#1E232B" stroke="#F2C94C" strokeWidth="2" />
            <circle cx="90" cy="90" r="16" fill="#F2C94C" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8 animate-in fade-in duration-500">
          {/* Championship Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A1E24] border border-[#D4A94C]/50 text-[#F2C94C] text-xs font-mono font-bold tracking-[0.2em] uppercase shadow-lg shadow-black/60">
            <Trophy className="w-3.5 h-3.5 text-[#F2C94C]" />
            <span>INTER-COLLEGE CHAMPIONSHIP 2026</span>
          </div>

          {/* Athletic Condensed Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight text-[#F5F1E8] leading-[0.95] uppercase">
              CHAMPIONSHIP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2C94C] via-[#F7DB82] to-[#D4A94C]">
                ARENA 2026
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#F5F1E8]/75 max-w-2xl mx-auto font-normal leading-relaxed">
              The official collegiate Carrom tournament platform. Single-elimination dynamic knockout brackets, live arena broadcast on the Main Carrom Board, and verified student athlete rosters.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/registration"
              className="px-9 py-4 rounded-2xl btn-gold text-sm font-black tracking-wider flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tournament"
              className="px-9 py-4 rounded-2xl btn-ghost text-sm font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>VIEW TOURNAMENT</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. UNIFIED SCOREBOARD STATS STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 sm:-mt-20 relative z-20">
        <div className="scoreboard-strip p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#D4A94C]/25 text-center">
            {/* Stat 1 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-4xl sm:text-5xl font-black font-display text-white">
                {stats?.totalParticipants || 24}
              </div>
              <p className="text-xs text-[#F2C94C] font-mono font-bold uppercase tracking-[0.16em]">
                Registered Athletes
              </p>
            </div>

            {/* Stat 2 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-4xl sm:text-5xl font-black font-display text-[#F2C94C]">
                5
              </div>
              <p className="text-xs text-[#F5F1E8]/80 font-mono font-bold uppercase tracking-[0.16em]">
                Championship Divisions
              </p>
            </div>

            {/* Stat 3 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-display text-emerald-400 flex items-center justify-center gap-2">
                <span className="live-dot" />
                <span>1 ARENA</span>
              </div>
              <p className="text-xs text-emerald-400/90 font-mono font-bold uppercase tracking-[0.16em]">
                Main Carrom Board
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-4xl sm:text-5xl font-black font-display text-white">
                {stats?.completedMatches || 0}
              </div>
              <p className="text-xs text-[#F5F1E8]/80 font-mono font-bold uppercase tracking-[0.16em]">
                Confirmed Knockouts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE MATCH SPOTLIGHT */}
      {currentMatch && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A313C] pb-4">
            <div className="flex items-center gap-3">
              <span className="live-dot" />
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
                LIVE ON MAIN CARROM BOARD
              </h2>
            </div>
            <Link
              href="/live"
              className="text-xs font-mono font-bold text-[#F2C94C] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Arena Scorecard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="arena-card p-6 sm:p-8 space-y-6 border border-[#F2C94C]/40 bg-gradient-to-br from-[#1A1E24] via-[#14171A] to-[#0E1012] shadow-2xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs pb-4 border-b border-[#2A313C]">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="text-[#F5F1E8]/70 font-mono text-xs">{currentMatch.roundName}</span>
              </div>
              <span className="text-rose-400 font-mono font-bold text-xs flex items-center gap-1.5 tracking-wider uppercase">
                <span className="live-dot" />
                <span>LIVE IN PLAY</span>
              </span>
            </div>

            {/* Match Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4A94C] uppercase font-bold tracking-widest block">Team 1</span>
                <h3 className="text-xl sm:text-3xl font-black text-white font-display truncate">
                  {currentMatch.team1?.name}
                </h3>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-[#14171A] border border-[#D4A94C]/50 text-xs font-mono font-black text-[#F2C94C] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#F5F1E8]/60 uppercase font-bold mt-1.5 block font-mono tracking-wider">
                  Knockout Match #{currentMatch.matchNumber}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4A94C] uppercase font-bold tracking-widest block">Team 2</span>
                <h3 className="text-xl sm:text-3xl font-black text-white font-display truncate">
                  {currentMatch.team2?.name}
                </h3>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="pt-4 border-t border-[#2A313C] flex items-center justify-between text-xs">
              <span className="text-[#F5F1E8]/60 font-mono text-[11px]">Sequential Single Arena Tournament</span>
              <Link
                href="/live"
                className="px-5 py-2.5 rounded-xl btn-gold text-xs font-bold shadow-sm"
              >
                Watch Arena Live →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. CHAMPIONSHIP CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#2A313C] pb-4">
          <div>
            <span className="eyebrow-label">Tournament Divisions</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">
              Championship Categories
            </h2>
          </div>
          <p className="text-xs text-[#F5F1E8]/60 font-mono">5 official divisions with dynamic single-elimination brackets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => {
            const catStat = stats?.categories?.[cat.id];
            const isDoubles = cat.id.includes('doubles');

            return (
              <div
                key={cat.id}
                className="arena-card arena-card-hover p-6 flex flex-col justify-between space-y-5 rounded-3xl transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2C94C]/15 text-[#F2C94C] border border-[#F2C94C]/30">
                      {cat.id.replace('_', ' ')}
                    </span>
                    {isDoubles ? (
                      <Users className="w-4 h-4 text-[#D4A94C]" />
                    ) : (
                      <Target className="w-4 h-4 text-[#D4A94C]" />
                    )}
                  </div>
                  <h3 className="font-black text-white text-lg font-display">{cat.name}</h3>
                  <p className="text-xs text-[#F5F1E8]/70 leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2A313C] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#F5F1E8]/60">{catStat?.teams || 0} entries</span>
                  <Link
                    href={`/brackets?category=${cat.id}`}
                    className="text-[#F2C94C] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Bracket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONNECTED FORMAT TIMELINE (01 - 04) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="arena-card p-8 sm:p-10 space-y-10 rounded-4xl border border-[#D4A94C]/30 bg-gradient-to-b from-[#1A1E24] to-[#111417]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2A313C]">
            <div>
              <span className="eyebrow-label">Tournament Architecture</span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">Official Format</h2>
            </div>
            <Link
              href="/rules"
              className="px-5 py-2.5 rounded-xl btn-ghost text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Read Full Rulebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Connected Numbered Sequence */}
          <div className="relative">
            {/* Desktop Gold Timeline Connector Line */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[2px] bg-gradient-to-r from-[#F2C94C]/20 via-[#F2C94C]/60 to-[#F2C94C]/20 pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 01 */}
              <div className="p-6 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F2C94C]/15 border border-[#F2C94C]/30 text-[#F2C94C] flex items-center justify-center font-display font-black text-lg">
                  01
                </div>
                <h4 className="font-black text-white text-base font-display">Single-Game Knockout</h4>
                <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
                  1 match = 1 single game. The winner on the Main Carrom Board advances immediately to the next round.
                </p>
              </div>

              {/* Step 02 */}
              <div className="p-6 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#D4A94C]/15 border border-[#D4A94C]/30 text-[#F2C94C] flex items-center justify-center font-display font-black text-lg">
                  02
                </div>
                <h4 className="font-black text-white text-base font-display">Pairing & Random Draw</h4>
                <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
                  Doubles partners are selected at registration. All bracket opponents are assigned strictly by random draw.
                </p>
              </div>

              {/* Step 03 */}
              <div className="p-6 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#D4A94C]/15 border border-[#D4A94C]/30 text-[#F2C94C] flex items-center justify-center font-display font-black text-lg">
                  03
                </div>
                <h4 className="font-black text-white text-base font-display">Dynamic Bye Logic</h4>
                <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
                  Even entry counts produce 0 byes. Odd entry counts award exactly 1 random bye to advance 1 round.
                </p>
              </div>

              {/* Step 04 */}
              <div className="p-6 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-display font-black text-lg">
                  04
                </div>
                <h4 className="font-black text-white text-base font-display">Main Arena Board</h4>
                <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
                  Single physical championship board. All tournament fixtures queue in FIFO order and play sequentially.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A313C] pb-4">
            <div>
              <span className="eyebrow-label">Tournament Communications</span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">Notice Board</h2>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-mono font-bold text-[#F2C94C] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div key={ann._id} className="arena-card p-6 space-y-3 rounded-3xl">
                <div className="flex items-center justify-between text-[11px] text-[#F5F1E8]/60 font-mono">
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.priority === 'urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase text-[10px] border border-rose-500/30">
                      Urgent
                    </span>
                  )}
                </div>
                <h4 className="font-black text-white text-base font-display leading-snug">{ann.title}</h4>
                <p className="text-xs text-[#F5F1E8]/70 line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
