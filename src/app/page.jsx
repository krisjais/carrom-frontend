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
  Crown
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
    <div className="flex-1 flex flex-col space-y-16 sm:space-y-24 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#233A66] via-[#1B2E52] to-[#152442] border-b border-[#35538C]">
        {/* Organic Carrom Board Radial Arcs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-[#FFD691]/10 carrom-radial-circle pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-[#D7A859]/15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFD691]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#D7A859]/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          {/* Championship Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E3258] border border-[#D7A859]/50 text-[#FFD691] text-xs font-mono font-bold tracking-wider shadow-lg shadow-[#0F1A30]/30">
            <Trophy className="w-3.5 h-3.5 text-[#FFD691]" />
            <span>CARROMPRO CHAMPIONSHIP 2026</span>
          </div>

          {/* Editorial Display Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-[1.08]">
              CARROMPRO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD691] via-[#FFE7BA] to-[#D7A859]">
                CHAMPIONSHIP 2026
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#D4DEEE] max-w-2xl mx-auto font-normal leading-relaxed">
              The official collegiate Carrom tournament. Dynamic single-elimination knockout brackets, live arena tracking on the Main Carrom Board, and verified tournament entries.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/registration"
              className="px-8 py-4 rounded-2xl btn-cream text-sm font-black tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tournament"
              className="px-8 py-4 rounded-2xl btn-secondary text-sm font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>VIEW TOURNAMENT</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CHAMPIONSHIP KEY STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sport-card p-6 text-center border-t-2 border-t-[#FFD691]/70">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {stats?.totalParticipants || 24}
            </div>
            <p className="text-xs text-[#FFD691] font-bold mt-1 uppercase tracking-wider">
              Registered Athletes
            </p>
          </div>

          <div className="sport-card p-6 text-center border-t-2 border-t-[#D7A859]/70">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#FFD691]">
              5
            </div>
            <p className="text-xs text-[#D4DEEE] font-bold mt-1 uppercase tracking-wider">
              Championship Divisions
            </p>
          </div>

          <div className="sport-card p-6 text-center border-t-2 border-t-emerald-400/70">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MAIN BOARD</span>
            </div>
            <p className="text-xs text-emerald-400/90 font-bold mt-1 uppercase tracking-wider">
              1 Live Equipment Arena
            </p>
          </div>

          <div className="sport-card p-6 text-center border-t-2 border-t-[#D7A859]/70">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {stats?.completedMatches || 0}
            </div>
            <p className="text-xs text-[#D4DEEE] font-bold mt-1 uppercase tracking-wider">
              Completed Knockouts
            </p>
          </div>
        </div>
      </section>

      {/* 3. LIVE MATCH SPOTLIGHT */}
      {currentMatch && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                LIVE ON MAIN CARROM BOARD
              </h2>
            </div>
            <Link
              href="/live"
              className="text-xs font-bold text-[#FFD691] hover:underline flex items-center gap-1"
            >
              <span>Arena Scorecard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-card p-6 sm:p-8 space-y-6 border-2 border-emerald-500/40 bg-gradient-to-br from-[#1E3258] to-[#152442] shadow-2xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs pb-4 border-b border-[#35538C]">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="text-[#D4DEEE] font-mono text-xs">{currentMatch.roundName}</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Match Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-2">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#D7A859] uppercase font-bold block">Team 1</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display truncate">
                  {currentMatch.team1?.name}
                </h3>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-[#152442] border border-[#D7A859]/50 text-xs font-mono font-black text-[#FFD691] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#D4DEEE] uppercase font-bold mt-1.5 block font-mono">
                  Single Game Knockout
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#D7A859] uppercase font-bold block">Team 2</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display truncate">
                  {currentMatch.team2?.name}
                </h3>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="pt-4 border-t border-[#35538C] flex items-center justify-between text-xs">
              <span className="text-[#D4DEEE] font-mono">Sequential Main Board Arena</span>
              <Link
                href="/live"
                className="px-4 py-2 rounded-xl btn-cream text-xs font-bold shadow-sm"
              >
                Watch Arena Live →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. CHAMPIONSHIP CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#35538C] pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#FFD691] uppercase tracking-widest block">
              Tournament Divisions
            </span>
            <h2 className="text-3xl font-black font-display text-white mt-1">
              Championship Categories
            </h2>
          </div>
          <p className="text-xs text-[#D4DEEE]">5 official divisions with dynamic single-elimination brackets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => {
            const catStat = stats?.categories?.[cat.id];

            return (
              <div
                key={cat.id}
                className="sport-card sport-card-hover p-6 flex flex-col justify-between space-y-5 rounded-3xl transition-all hover:border-[#D7A859]"
              >
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFD691]/15 text-[#FFD691] border border-[#FFD691]/30">
                    {cat.id.replace('_', ' ')}
                  </span>
                  <h3 className="font-black text-white text-lg font-display">{cat.name}</h3>
                  <p className="text-xs text-[#D4DEEE] leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#35538C] flex items-center justify-between text-xs">
                  <span className="text-[#D4DEEE] font-mono font-semibold">{catStat?.teams || 0} entries</span>
                  <Link
                    href={`/brackets?category=${cat.id}`}
                    className="text-[#FFD691] hover:underline font-bold flex items-center gap-1"
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

      {/* 5. TOURNAMENT ARCHITECTURE & RULES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card p-8 sm:p-10 space-y-8 rounded-4xl border border-[#35538C] bg-gradient-to-b from-[#1E3258] to-[#152442]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
            <div>
              <span className="text-xs font-mono font-bold text-[#FFD691] uppercase tracking-widest block">
                Official Rules & Standards
              </span>
              <h2 className="text-3xl font-black font-display text-white mt-1">Tournament Format</h2>
            </div>
            <Link
              href="/rules"
              className="px-5 py-2.5 rounded-xl btn-secondary text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Read Full Rulebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFD691]/15 text-[#FFD691] flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm font-display">Single-Game Knockout</h4>
              <p className="text-xs text-[#D4DEEE] leading-relaxed">
                1 match = 1 game to advance. The winner on the Main Carrom Board moves to the next round immediately.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#D7A859]/15 text-[#FFD691] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm font-display">Partner & Opponents</h4>
              <p className="text-xs text-[#D4DEEE] leading-relaxed">
                Partners are chosen at registration and verified by Admin. Opponents are selected strictly via random draw.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#D7A859]/15 text-[#FFE2AA] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm font-display">Dynamic Bye Logic</h4>
              <p className="text-xs text-[#D4DEEE] leading-relaxed">
                Even entry count produces 0 byes. Odd entry count awards exactly 1 random bye to advance 1 round.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm font-display">Main Carrom Board</h4>
              <p className="text-xs text-[#D4DEEE] leading-relaxed">
                Only 1 physical equipment board in the arena. Matches queue in FIFO order and play sequentially.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST NOTICE BOARD */}
      {announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#35538C] pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#FFD691] uppercase tracking-widest block">
                Official Updates
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">Latest Announcements</h2>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-bold text-[#FFD691] hover:underline flex items-center gap-1"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div key={ann._id} className="sport-card p-6 space-y-3 rounded-3xl">
                <div className="flex items-center justify-between text-[11px] text-[#D4DEEE]">
                  <span className="font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.priority === 'urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF6E80]/20 text-[#FF96A4] font-bold uppercase text-[10px] border border-[#FF6E80]/30">
                      Urgent
                    </span>
                  )}
                </div>
                <h4 className="font-black text-white text-sm leading-snug">{ann.title}</h4>
                <p className="text-xs text-[#D4DEEE] line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
