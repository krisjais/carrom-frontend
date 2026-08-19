'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, MapPin, Shield, CheckCircle2, ArrowRight, Target, Users } from 'lucide-react';
import { StatusBadge, MainBoardBadge } from '@/components/ui/Badge';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Championship Overview
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          {tournament?.title || 'Annual Inter-College Carrom Championship'}
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Edition {tournament?.edition || '2026'} • Main Carrom Board Arena
        </p>
        <div className="pt-2 flex items-center justify-center gap-2.5">
          <MainBoardBadge />
          <StatusBadge status={tournament?.status || 'ongoing'} />
        </div>
      </div>

      {/* 3 Main Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="arena-card p-6 space-y-3 rounded-3xl">
          <div className="flex items-center gap-2.5 text-[#F2C94C]">
            <Trophy className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display uppercase tracking-wide">Knockout Format</h3>
          </div>
          <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
            Single-elimination knockout across all 5 divisions. Each match is decided by 1 single game. Winners advance directly into the next round.
          </p>
        </div>

        <div className="arena-card p-6 space-y-3 rounded-3xl">
          <div className="flex items-center gap-2.5 text-[#F2C94C]">
            <MapPin className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display uppercase tracking-wide">Single Board Arena</h3>
          </div>
          <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
            All tournament fixtures are scheduled on the <strong>Main Carrom Board</strong> with sequential FIFO queuing and spectator broadcast.
          </p>
        </div>

        <div className="arena-card p-6 space-y-3 rounded-3xl">
          <div className="flex items-center gap-2.5 text-[#F2C94C]">
            <Shield className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display uppercase tracking-wide">Official Scoring</h3>
          </div>
          <p className="text-xs text-[#F5F1E8]/70 leading-relaxed">
            Official scorekeeper desk confirms board winners with live instant propagation downstream to the tournament tree.
          </p>
        </div>
      </div>

      {/* 5 Categories Summary */}
      <div className="arena-card p-8 space-y-6 rounded-4xl border border-[#D4A94C]/30 bg-gradient-to-b from-[#1A1E24] to-[#111417]">
        <div className="flex items-center justify-between border-b border-[#2A313C] pb-4">
          <div>
            <span className="eyebrow-label">Divisions</span>
            <h3 className="font-black text-white text-2xl font-display uppercase mt-1">5 Championship Divisions</h3>
          </div>
          <Link href="/brackets" className="text-xs font-mono font-bold text-[#F2C94C] hover:underline uppercase">
            View All Brackets →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-1">
            <span className="font-black text-white text-sm font-display block">1. Boys Singles</span>
            <p className="text-[#F5F1E8]/70">Individual knockout for male student athletes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-1">
            <span className="font-black text-white text-sm font-display block">2. Girls Singles</span>
            <p className="text-[#F5F1E8]/70">Individual knockout for female student athletes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-1">
            <span className="font-black text-white text-sm font-display block">3. Boys Doubles</span>
            <p className="text-[#F5F1E8]/70">2 male student athletes per paired team.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-1">
            <span className="font-black text-white text-sm font-display block">4. Girls Doubles</span>
            <p className="text-[#F5F1E8]/70">2 female student athletes per paired team.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-1">
            <span className="font-black text-white text-sm font-display block">5. Mixed Doubles</span>
            <p className="text-[#F5F1E8]/70">1 male and 1 female athlete per paired team.</p>
          </div>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="text-center pt-2">
        <Link
          href="/registration"
          className="inline-block px-10 py-4 rounded-2xl btn-gold font-black text-xs tracking-wider shadow-lg transition-all"
        >
          REGISTER FOR TOURNAMENT →
        </Link>
      </div>
    </div>
  );
}
