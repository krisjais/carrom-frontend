'use client';

import React, { useEffect, useState, useRef } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessHeroCard } from '@/components/chess/ChessHeroCard';
import { ChessModeGrid } from '@/components/chess/ChessModeGrid';
import { ChessFeaturedRow } from '@/components/chess/ChessFeaturedRow';
import { ChessLiveSection } from '@/components/chess/ChessLiveSection';
import { HowItWorksGrid } from '@/components/chess/HowItWorksGrid';
import { RecentMatchesTable } from '@/components/chess/RecentMatchesTable';
import { TopPlayersCard } from '@/components/chess/TopPlayersCard';
import { UpcomingMatchCard } from '@/components/chess/UpcomingMatchCard';
import { ChessPieceValuesCard } from '@/components/chess/ChessPieceValuesCard';
import { ChessFooter } from '@/components/chess/ChessFooter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DEMO_CHESS_STATS, DEMO_CHESS_MATCHES, DEMO_CHESS_STANDINGS } from '@/lib/chessDemoData';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ChessPortalHome() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainContainerRef = useRef(null);

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

  const displayStats = (stats && (stats.totalRegistrations > 0 || stats.registeredCount > 0)) ? stats : DEMO_CHESS_STATS;
  const displayMatches = matches && matches.length > 0 ? matches : DEMO_CHESS_MATCHES;
  const displayStandings = standings && standings.length > 0 ? standings : DEMO_CHESS_STANDINGS;

  const liveMatches = displayMatches.filter((m) => m.status === 'live');
  const upcomingMatch = displayMatches.find((m) => m.status === 'scheduled') || null;
  const totalPlayersCount = displayStats?.totalRegistrations ?? displayStats?.registeredCount ?? displayStandings.length;

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28] transition-colors duration-300">
      
      {/* 1. Compact Floating Navbar */}
      <ChessHeader />

      {/* 2. Main Page Sections */}
      <main ref={mainContainerRef} className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4">
        
        {/* HERO SECTION: Editorial 2-column with studio photographic king & stat strip */}
        <ChessHeroCard stats={displayStats} />

        {/* TOURNAMENT OVERVIEW: "Choose Your Mode / Play Your Way" 4-card grid */}
        <ChessModeGrid />

        {/* FEATURED ASYMMETRIC ROW: Community Knight Card & Master Quote */}
        <ChessFeaturedRow totalPlayers={totalPlayersCount} />

        {/* LIVE ARENA: Matches in progress / Editorial empty state */}
        <ChessLiveSection liveMatches={liveMatches} />

        {/* RECENT MATCHES FIXTURES */}
        <RecentMatchesTable matches={displayMatches} loading={loading} />

        {/* PROCESS TIMELINE: "Your Path to the Championship" */}
        <HowItWorksGrid />

        {/* LEADERBOARD & MATERIAL STRATEGY ROW */}
        <section className="py-12 sm:py-16 border-t border-[#D5CFC5]/80 dark:border-[#262624]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Top Players Podium (7 cols) */}
            <div className="lg:col-span-7">
              <TopPlayersCard standings={displayStandings} />
            </div>

            {/* Next on the Board & Piece Values (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <UpcomingMatchCard match={upcomingMatch} />
              <ChessPieceValuesCard />
            </div>

          </div>
        </section>

      </main>

      {/* 3. Luxury Editorial Footer */}
      <ChessFooter />

    </div>
  );
}
