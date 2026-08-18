'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, MapPin, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Championship Overview
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          {tournament?.title || 'Annual Inter-College Carrom Championship'}
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Edition {tournament?.edition || '2026'} • Main Carrom Board Arena
        </p>
        <div className="pt-1 flex items-center justify-center gap-2">
          <MainBoardBadge />
          <StatusBadge status={tournament?.status || 'ongoing'} />
        </div>
      </div>

      {/* 3 Main Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#FFBA00]">
            <Trophy className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">Knockout Format</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            Single-elimination knockout in all 5 categories. Each match is decided by 1 single game. Winners advance directly to the next round.
          </p>
        </div>

        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#FDB095]">
            <MapPin className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">Single Board Arena</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            All matches are played on the <strong>Main Carrom Board</strong> with sequential FIFO queuing and spectator tracking.
          </p>
        </div>

        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#E5958E]">
            <Shield className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">Official Scoring</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            Referee desk confirms board winners in 1 click, instantly propagating advancing teams downstream to the bracket.
          </p>
        </div>
      </div>

      {/* 5 Categories Summary */}
      <div className="sport-card p-8 space-y-6 rounded-4xl border border-[#4A138C]">
        <h3 className="font-black text-white text-xl font-display">5 Championship Divisions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C]">
            <span className="font-bold text-white block mb-1">1. Boys Singles</span>
            <p className="text-[#D8C7F0]">Individual knockout for male participants.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C]">
            <span className="font-bold text-white block mb-1">2. Girls Singles</span>
            <p className="text-[#D8C7F0]">Individual knockout for female participants.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C]">
            <span className="font-bold text-white block mb-1">3. Boys Doubles</span>
            <p className="text-[#D8C7F0]">2 male participants per team.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C]">
            <span className="font-bold text-white block mb-1">4. Girls Doubles</span>
            <p className="text-[#D8C7F0]">2 female participants per team.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C]">
            <span className="font-bold text-white block mb-1">5. Mixed Doubles</span>
            <p className="text-[#D8C7F0]">1 male and 1 female participant per team.</p>
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
