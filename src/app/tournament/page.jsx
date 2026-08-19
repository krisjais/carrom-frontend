'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, MapPin, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge, MainBoardBadge } from '@/components/ui/Badge';
import { CategoryCoinPair, CarromCoin } from '@/components/ui/CarromElements';

export default function TournamentPage() {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.getCurrentTournament();
        if (res.success) setTournament(res.tournament);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          CHAMPIONSHIP OVERVIEW
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          {tournament?.title || 'College Carrom Championship'}
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Edition {tournament?.edition || '2026'} • Main Carrom Board Arena
        </p>
        <div className="pt-2 flex items-center justify-center gap-2.5">
          <MainBoardBadge />
          <StatusBadge status={tournament?.status || 'ongoing'} />
        </div>
      </div>

      {/* 3 Main Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="editorial-card p-6 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-2.5 text-[#3E342B] dark:text-[#F5F1E8]">
            <Trophy className="w-5 h-5 text-[#E74C3C]" />
            <h3 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">Knockout Format</h3>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            Single-elimination knockout across all 5 divisions. Each match is decided by 1 single game. Winners advance directly into the next round.
          </p>
        </div>

        <div className="editorial-card p-6 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-2.5 text-[#3E342B] dark:text-[#F5F1E8]">
            <MapPin className="w-5 h-5 text-[#3E342B] dark:text-[#D4A94C]" />
            <h3 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">Single Board Arena</h3>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            All tournament fixtures are scheduled on the <strong>Main Carrom Board</strong> with sequential FIFO queuing and live scoring.
          </p>
        </div>

        <div className="editorial-card p-6 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-2.5 text-[#3E342B] dark:text-[#F5F1E8]">
            <Shield className="w-5 h-5 text-[#3E342B] dark:text-[#D4A94C]" />
            <h3 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">Official Scoring</h3>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            Official scorekeeper desk confirms board winners with live instant propagation downstream to the tournament tree.
          </p>
        </div>
      </div>

      {/* 5 Categories Summary */}
      <div className="editorial-card p-8 space-y-6 rounded-3xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-4">
          <div>
            <span className="eyebrow-label">Divisions</span>
            <h3 className="font-serif font-bold text-2xl text-[#3E342B] dark:text-[#F5F1E8] mt-1">5 Championship Divisions</h3>
          </div>
          <Link href="/brackets" className="text-xs font-bold text-[#E74C3C] hover:underline flex items-center gap-1 uppercase">
            <span>View All Brackets</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="boys_singles" />
              <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">Boys Singles</span>
            </div>
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">Individual knockout for male student athletes.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="girls_singles" />
              <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">Girls Singles</span>
            </div>
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">Individual knockout for female student athletes.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="boys_doubles" />
              <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">Boys Doubles</span>
            </div>
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">2 male student athletes per paired team.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="girls_doubles" />
              <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">Girls Doubles</span>
            </div>
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">2 female student athletes per paired team.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="mixed_doubles" />
              <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">Mixed Doubles</span>
            </div>
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">1 male and 1 female athlete per paired team.</p>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="text-center pt-2">
        <Link
          href="/registration"
          className="btn-primary text-xs font-bold px-9 py-3.5 shadow-md inline-flex items-center gap-2"
        >
          <span>REGISTER FOR TOURNAMENT</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}


