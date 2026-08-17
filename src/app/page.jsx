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
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { StatusBadge, CategoryBadge, BoardNumberBadge } from '@/components/ui/Badge';

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

  return (
    <div className="flex-1 flex flex-col space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#1C2B48] bg-gradient-to-b from-[#0A101F] to-[#070B16] overflow-hidden">
        {/* Subtle Carrom Circle Outline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#1C2B48]/40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#D4AF37]/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          {/* Small Tournament Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0E1626] border border-[#1C2B48] text-[#D4AF37] text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>2026 Inter-College Championship</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
            Carrom Championship <span className="text-[#D4AF37]">2026</span>
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto font-normal leading-relaxed">
            The official collegiate Carrom tournament. Dynamic knockout brackets, live arena scoring, and official Tournament Rules.
          </p>

          {/* 2 Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/registration"
              className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-sm shadow-sm transition-all"
            >
              Register Now
            </Link>
            <Link
              href="/live"
              className="px-6 py-3.5 rounded-xl bg-[#0E1626] hover:bg-[#141F36] text-white font-semibold text-sm border border-[#1C2B48] hover:border-[#2D426B] transition-all"
            >
              View Live Matches
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 SIMPLE STATISTICS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sport-card p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {stats?.totalParticipants || 18}
            </div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1 uppercase tracking-wide">
              Registered Players
            </p>
          </div>

          <div className="sport-card p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#D4AF37]">
              5
            </div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1 uppercase tracking-wide">
              Categories
            </p>
          </div>

          <div className="sport-card p-5 text-center">
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${liveData.currentMatch ? 'text-emerald-400' : 'text-blue-400'}`}>
              {liveData.currentMatch ? '1 LIVE' : 'AVAILABLE'}
            </div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1 uppercase tracking-wide">
              Main Carrom Board
            </p>
          </div>

          <div className="sport-card p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-300">
              {stats?.completedMatches || 0}
            </div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1 uppercase tracking-wide">
              Completed Matches
            </p>
          </div>
        </div>
      </section>

      {/* 3. LIVE MATCH SPOTLIGHT */}
      {liveData.currentMatch && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-2xl font-bold font-display text-white">Main Carrom Board — Live Now</h2>
            </div>
            <Link
              href="/live"
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>Arena Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="sport-card p-6 space-y-4 border-2 border-emerald-500/40 bg-gradient-to-b from-[#0E1626] to-[#070B16]">
            {/* Top line */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1C2B48]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/20">
                  LIVE ARENA
                </span>
                <CategoryBadge category={liveData.currentMatch.category} />
                <span className="text-[#94A3B8] font-mono text-xs">{liveData.currentMatch.roundName}</span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">Match #{liveData.currentMatch.matchNumber}</span>
            </div>

            {/* Match Players & Score */}
            <div className="grid grid-cols-3 items-center text-center gap-2 py-2">
              <div className="text-left font-bold text-white text-base truncate">
                {liveData.currentMatch.team1?.name}
              </div>
              <div>
                <div className="font-mono text-3xl font-black text-[#D4AF37]">
                  {liveData.currentMatch.finalScore?.team1BoardsWon || 0} - {liveData.currentMatch.finalScore?.team2BoardsWon || 0}
                </div>
                <span className="text-[9px] text-[#64748B] uppercase font-semibold">Boards Won (Best of 3)</span>
              </div>
              <div className="text-right font-bold text-white text-base truncate">
                {liveData.currentMatch.team2?.name}
              </div>
            </div>

            {/* Link to live scorekeeper */}
            <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-mono">Sequential Tournament Arena</span>
              <Link href="/live" className="text-[#D4AF37] font-semibold hover:underline flex items-center gap-1">
                <span>View Full Scorecard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. 5 CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Championship Categories</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">5 official divisions with dynamic knockout brackets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const catStat = stats?.categories?.[cat.id];
            return (
              <div key={cat.id} className="sport-card sport-card-hover p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <CategoryBadge category={cat.id} />
                  <h3 className="font-bold text-white text-base font-display">{cat.name}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1C2B48] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] font-mono">{catStat?.teams || 0} entries</span>
                  <Link
                    href={`/brackets?category=${cat.id}`}
                    className="text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Bracket</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TOURNAMENT INFORMATION (ONE ATTRACTIVE UNIFIED SECTION) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="sport-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1C2B48]">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Tournament Information</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">Official rules, scoring matrix, and match format</p>
            </div>
            <Link
              href="/rules"
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>View Full Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1.5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Trophy className="w-4 h-4" />
                <h4 className="font-bold text-white text-xs">Match Format</h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Best of 3 Boards (2–0 or 2–1). Board 3 is played only if the first two boards are 1–1.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1.5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Disc className="w-4 h-4" />
                <h4 className="font-bold text-white text-xs">Coin Scoring</h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                White/Black coin = 1 point. Maximum board score is capped at 25 points.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1.5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Crown className="w-4 h-4" />
                <h4 className="font-bold text-white text-xs">Queen & Cover</h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Queen = 3 points when successfully covered with another coin in the immediate shot.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1.5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-bold text-white text-xs">Fouls & Board Winner</h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Striker pocketed = -1 point. Admin manually confirms board winners after physical play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST ANNOUNCEMENTS (3 COMPACT CARDS) */}
      {announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white">Latest Announcements</h2>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              All Notices
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <div key={ann._id} className="sport-card p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span className="font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.priority === 'urgent' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-xs leading-snug">{ann.title}</h4>
                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
