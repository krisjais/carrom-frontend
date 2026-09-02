'use client';

import React, { useEffect, useState, useRef } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessHeroCard } from '@/components/chess/ChessHeroCard';
import { TournamentStatusCard } from '@/components/chess/TournamentStatusCard';
import { LiveMatchCard } from '@/components/chess/LiveMatchCard';
import { RecentMatchesTable } from '@/components/chess/RecentMatchesTable';
import { TopPlayersCard } from '@/components/chess/TopPlayersCard';
import { UpcomingMatchCard } from '@/components/chess/UpcomingMatchCard';
import { ChessPieceValuesCard } from '@/components/chess/ChessPieceValuesCard';
import { HowItWorksGrid } from '@/components/chess/HowItWorksGrid';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ChessPortalHome() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const liveSectionRef = useRef(null);
  const recentSectionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, matchesRes, standingsRes] = await Promise.allSettled([
          chessApi.getSettings(),
          chessApi.getMatches(),
          chessApi.getStandings(),
        ]);

        if (settingsRes.status === 'fulfilled' && settingsRes.value?.success) {
          setStats(settingsRes.value.data);
        }
        if (matchesRes.status === 'fulfilled' && matchesRes.value?.success) {
          setMatches(matchesRes.value.data || []);
        }
        if (standingsRes.status === 'fulfilled' && standingsRes.value?.success) {
          setStandings(standingsRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading Chess homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (loading || typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Live Matches Reveal
      if (liveSectionRef.current) {
        gsap.fromTo(
          liveSectionRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: liveSectionRef.current,
              start: 'top 85%',
            }
          }
        );
      }

      // Recent Matches Table Reveal
      if (recentSectionRef.current) {
        gsap.fromTo(
          recentSectionRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: recentSectionRef.current,
              start: 'top 85%',
            }
          }
        );
      }

      // How It Works Reveal
      if (howItWorksRef.current) {
        gsap.fromTo(
          howItWorksRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: 'top 85%',
            }
          }
        );
      }

      // Right Sidebar Cards Staggered Reveal
      if (sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sidebarRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading]);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatch = matches.find((m) => m.status === 'scheduled') || null;

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#09090B] flex flex-col font-sans text-[#111111] dark:text-[#F4F4F5] antialiased transition-colors">
      
      {/* Top Header */}
      <ChessHeader />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Main Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (Main Content Area) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Hero Card Section with Three.js & GSAP Entrance */}
            <ChessHeroCard stats={stats} />

            {/* 2. Live Matches Section */}
            <div ref={liveSectionRef} className="space-y-4 bg-white dark:bg-[#121215] p-5 rounded-2xl border border-[#E5E5E5] dark:border-[#27272A] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase">
                    LIVE MATCHES
                  </h3>
                  {liveMatches.length > 0 && (
                    <span className="badge-live px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                      {liveMatches.length} Active
                    </span>
                  )}
                </div>

                <Link
                  href="/chess/matches"
                  className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] hover:text-[#C9A227] uppercase tracking-wider transition-colors"
                >
                  View All ({matches.length})
                </Link>
              </div>

              {/* Live Match Cards Grid */}
              {liveMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map((m) => (
                    <LiveMatchCard key={m._id || m.matchId} match={m} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#666666] dark:text-[#A1A1AA] space-y-2">
                  <p className="font-semibold text-[#111111] dark:text-[#F4F4F5]">No live games in progress right now.</p>
                  <p>Check the scheduled matches below or start a live game from the admin panel.</p>
                </div>
              )}
            </div>

            {/* 3. Recent Matches Table */}
            <div ref={recentSectionRef}>
              <RecentMatchesTable matches={matches} loading={loading} />
            </div>

            {/* 4. How It Works Section */}
            <div ref={howItWorksRef}>
              <HowItWorksGrid />
            </div>

          </div>

          {/* RIGHT COLUMN (Tournament Info Sidebar Cards) */}
          <div ref={sidebarRef} className="lg:col-span-4 space-y-6">
            
            {/* 1. Tournament Status Card */}
            <TournamentStatusCard stats={stats} />

            {/* 2. Top 3 Players Card */}
            <TopPlayersCard standings={standings} />

            {/* 3. Upcoming Match Card */}
            <UpcomingMatchCard match={upcomingMatch} />

            {/* 4. Chess Piece Values Card */}
            <ChessPieceValuesCard />

          </div>

        </div>

      </main>

      {/* Footer */}
      <ChessFooter />

    </div>
  );
}
