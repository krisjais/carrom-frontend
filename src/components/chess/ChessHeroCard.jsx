'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trophy, Clock, Users, ChevronDown, UserPlus } from 'lucide-react';
import { Chess3DHeroCanvas } from './Chess3DHeroCanvas';
import gsap from 'gsap';

export function ChessHeroCard({ stats }) {
  const registeredCount = stats?.totalRegistrations ?? stats?.registeredCount ?? 0;
  const currentRound = stats?.currentRound ?? 1;
  const matchDuration = stats?.matchDuration ?? 10;
  const liveCount = stats?.liveMatches ?? 0;

  const containerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const descRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndRef = useRef(null);

  // Coordinated GSAP Entrance Animation Sequence
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        eyebrowRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.1 }
      )
        .fromTo(
          [line1Ref.current, line2Ref.current, line3Ref.current],
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.16 },
          '-=0.3'
        )
        .fromTo(
          descRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3'
        )
        .fromTo(
          statsRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 },
          '-=0.2'
        )
        .fromTo(
          ctaRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.2'
        )
        .fromTo(
          scrollIndRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          '-=0.1'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl bg-[#0A0A0C] text-white p-6 sm:p-10 shadow-2xl border border-black/40 min-h-[520px] flex flex-col justify-between"
    >
      
      {/* Background 3D Three.js Hero Canvas on Right */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-85 sm:opacity-95 pointer-events-auto z-0">
        <Chess3DHeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-[#0A0A0C]/75 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-xl space-y-6 pt-2">
        
        {/* Eyebrow */}
        <span ref={eyebrowRef} className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
          CHESS CHAMPIONSHIP 2026
        </span>

        {/* Line-by-Line Staggered Editorial Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase leading-[1.05]">
          <span ref={line1Ref} className="block text-white">THINK AHEAD.</span>
          <span ref={line2Ref} className="block text-[#C9A227]">PLAY SMART.</span>
          <span ref={line3Ref} className="block text-white">FINISH STRONG.</span>
        </h1>

        {/* Supporting Paragraph */}
        <p ref={descRef} className="text-xs sm:text-sm text-gray-300 font-sans font-normal leading-relaxed max-w-md">
          Welcome to the official Inter-College Chess Championship. Compete under strict 10-minute match timers, earn material points, and claim the championship crown.
        </p>

        {/* 4 Stats Badges */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left transition-transform hover:scale-102">
            <div className="flex items-center gap-1.5 text-xs text-[#C9A227] font-bold">
              <Users className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">{registeredCount}</span>
            </div>
            <span className="text-[10px] text-gray-300 uppercase block font-medium">Registered Players</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left transition-transform hover:scale-102">
            <div className="flex items-center gap-1.5 text-xs text-[#C9A227] font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">Round {currentRound}</span>
            </div>
            <span className="text-[10px] text-gray-300 uppercase block font-medium">Current Round</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left transition-transform hover:scale-102">
            <div className="flex items-center gap-1.5 text-xs text-[#C9A227] font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">{matchDuration} Min</span>
            </div>
            <span className="text-[10px] text-gray-300 uppercase block font-medium">Match Duration</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left transition-transform hover:scale-102">
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
              <span className="live-dot" />
              <span className="font-mono text-sm">Live ({liveCount})</span>
            </div>
            <span className="text-[10px] text-gray-300 uppercase block font-medium">Matches Ongoing</span>
          </div>

        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/chess/register"
            className="bg-[#C9A227] hover:bg-[#D4A94C] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-xs uppercase tracking-wider font-display flex items-center gap-2 group"
          >
            <UserPlus className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
            <span>Register Now</span>
          </Link>

          <Link
            href="/chess/standings"
            className="border border-white/40 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-xs uppercase tracking-wider font-display"
          >
            View Standings
          </Link>
        </div>

      </div>

      {/* Scroll to Explore Indicator */}
      <div ref={scrollIndRef} className="relative z-10 pt-6 flex items-center justify-between border-t border-white/10 text-gray-400 text-[10px] font-mono uppercase tracking-widest">
        <span>INTER-COLLEGE CHESS 2026</span>
        <div className="flex items-center gap-1.5 text-gray-300 animate-bounce">
          <span>Scroll to explore</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#C9A227]" />
        </div>
      </div>

    </div>
  );
}
