'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Trophy, MapPin, Shield, CheckCircle2, ArrowRight, Sparkles, Award } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 text-[#171614] dark:text-[#F7F4EC]">
      
      {/* 1. Championship Hero Spotlight */}
      <div className="rounded-3xl overflow-hidden border border-[#DCD6C8] dark:border-[#2E2B25] bg-[#F7F4EC] dark:bg-[#1D1C19] shadow-md grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C] font-semibold">
                ANNUAL TOURNAMENT SERIES
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] text-[10px] font-mono font-bold uppercase">
                EDITION {tournament?.edition || '2025'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#171614] dark:text-[#F7F4EC] leading-[1.1]">
              {tournament?.title || 'National Collegiate Carrom Championship'}
            </h1>
            <p className="text-sm text-[#6F6A60] dark:text-[#A8A194] leading-relaxed max-w-xl font-sans pt-1">
              The premier inter-collegiate carrom showdown featuring single-elimination knockout brackets, computerized Swiss draws, and live digital scorekeeping on the Main Board.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/registration"
              className="px-6 py-3 rounded-xl bg-[#171614] hover:bg-[#2A2824] dark:bg-[#F7F4EC] dark:hover:bg-white text-[#F7F4EC] dark:text-[#171614] text-xs font-bold tracking-wider uppercase transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>Register as Athlete</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/live"
              className="px-6 py-3 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] hover:bg-[#FAF9F6] text-[#171614] dark:text-[#F7F4EC] text-xs font-bold transition-colors shadow-xs"
            >
              Live Arena Stream
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full">
          <Image
            src="/carrom_arena_cinematic.jpg"
            alt="Championship Carrom Arena"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#F7F4EC] dark:from-[#1D1C19] via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* 2. Three Editorial Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl p-7 space-y-3 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-[#171614] dark:text-[#F7F4EC]">
            <Trophy className="w-5 h-5 text-[#C2A268]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#171614] dark:text-[#F7F4EC]">Knockout Format</h3>
          <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
            Single-game knockout matches across all 5 divisions. Every point counts towards advancing directly into subsequent rounds.
          </p>
        </div>

        <div className="rounded-3xl p-7 space-y-3 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-[#171614] dark:text-[#F7F4EC]">
            <MapPin className="w-5 h-5 text-[#171614] dark:text-[#F7F4EC]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#171614] dark:text-[#F7F4EC]">Single Board Arena</h3>
          <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
            All tournament fixtures take place on the centralized Main Carrom Board with high-visibility sequential FIFO queue management.
          </p>
        </div>

        <div className="rounded-3xl p-7 space-y-3 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-[#171614] dark:text-[#F7F4EC]">
            <Shield className="w-5 h-5 text-[#171614] dark:text-[#F7F4EC]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#171614] dark:text-[#F7F4EC]">Certified Adjudication</h3>
          <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
            Official referee desk certifies board winners with instant live bracket propagation and verified scorecards.
          </p>
        </div>
      </div>

      {/* 3. Five Championship Divisions */}
      <div className="rounded-3xl p-8 sm:p-10 space-y-6 border border-[#DCD6C8] dark:border-[#2E2B25] bg-[#F7F4EC] dark:bg-[#1D1C19] shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-4 gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C]">Competition Scope</span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#171614] dark:text-[#F7F4EC] mt-1">
              5 Championship Divisions
            </h2>
          </div>
          <Link
            href="/brackets"
            className="text-xs font-bold text-[#171614] dark:text-[#F7F4EC] hover:underline flex items-center gap-1.5 uppercase"
          >
            <span>Explore All Brackets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="boys_singles" />
              <span className="font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC]">Boys Singles</span>
            </div>
            <p className="text-[#6F6A60] dark:text-[#A8A194]">Individual knockout bracket for male student athletes.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="girls_singles" />
              <span className="font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC]">Girls Singles</span>
            </div>
            <p className="text-[#6F6A60] dark:text-[#A8A194]">Individual knockout bracket for female student athletes.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="boys_doubles" />
              <span className="font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC]">Boys Doubles</span>
            </div>
            <p className="text-[#6F6A60] dark:text-[#A8A194]">2 male student athletes competing in tandem.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="girls_doubles" />
              <span className="font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC]">Girls Doubles</span>
            </div>
            <p className="text-[#6F6A60] dark:text-[#A8A194]">2 female student athletes competing in tandem.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryCoinPair category="mixed_doubles" />
              <span className="font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC]">Mixed Doubles</span>
            </div>
            <p className="text-[#6F6A60] dark:text-[#A8A194]">1 male and 1 female athlete paired as a squad.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
