'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Shield, Trophy, Calendar, CheckCircle2, ArrowRight, Radio, LogOut, Award } from 'lucide-react';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { CarromCoin, CategoryCoinPair } from '@/components/ui/CarromElements';

export default function ParticipantDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/participant/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.getParticipantDashboard();
        if (res.success) {
          setDashboardData(res);
        }
      } catch (err) {
        console.error('Error loading participant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#171614] border-t-transparent animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#857B6C]">Loading Athlete Record...</span>
      </div>
    );
  }

  const { participant, teams = [], matches = [] } = dashboardData || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#171614] dark:text-[#F7F4EC]">
      
      {/* 1. Header Profile Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] flex items-center justify-center font-serif font-black text-2xl shadow-inner shrink-0">
            {participant?.fullName?.charAt(0) || 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
                {participant?.fullName || 'Tournament Athlete'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171614]/5 dark:bg-white/10 text-xs font-semibold text-[#171614] dark:text-[#F7F4EC] border border-[#DCD6C8] dark:border-[#38342C]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Competitor
              </span>
            </div>
            <p className="text-xs font-sans text-[#6F6A60] dark:text-[#A8A194]">
              {participant?.department || 'Department'}{participant?.email ? ` • ${participant?.email}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/live"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] text-xs font-bold text-[#171614] dark:text-[#F7F4EC] hover:bg-[#FAF9F6] transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-[#D93829] animate-pulse" />
            <span>Live Board</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] text-xs font-bold text-[#857B6C] hover:text-[#D93829] hover:border-[#D93829]/40 transition-colors shadow-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#857B6C] block">Approved Squads</span>
            <div className="text-2xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] mt-1">{teams.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-[#171614] dark:text-[#F7F4EC]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#857B6C] block">Scheduled Fixtures</span>
            <div className="text-2xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] mt-1">{matches.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-[#171614] dark:text-[#F7F4EC]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#857B6C] block">Board Eligibility</span>
            <div className="text-base font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">Certified Active</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Approved Category Teams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C]">Roster Standing</span>
            <h2 className="text-xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
              My Approved Category Teams ({teams.length})
            </h2>
          </div>
          <Link href="/brackets" className="text-xs font-semibold text-[#171614] dark:text-[#F7F4EC] hover:underline flex items-center gap-1">
            <span>Explore All Brackets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-xs text-[#6F6A60] dark:text-[#A8A194] bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-2">
            <p className="font-semibold text-sm text-[#171614] dark:text-[#F7F4EC]">Registration In Review</p>
            <p>Your team nomination is currently awaiting admin verification and bracket seeding.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div
                key={t._id}
                className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#171614] dark:hover:border-[#C2A268] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryCoinPair category={t.category} />
                      <CategoryBadge category={t.category} />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      Approved
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-lg leading-snug">
                    {t.name}
                  </h3>
                </div>

                <div className="pt-3 border-t border-[#DCD6C8]/80 dark:border-[#38342C] flex items-center justify-between text-xs">
                  <span className="text-[#6F6A60] dark:text-[#A8A194] font-mono text-[11px]">Bracket Active</span>
                  <Link
                    href={`/brackets?category=${t.category}`}
                    className="inline-flex items-center gap-1.5 font-bold text-[#171614] dark:text-[#F7F4EC] hover:underline"
                  >
                    <span>View Bracket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. My Scheduled Matches & Reference Passion Card */}
      <div className="space-y-4">
        <div className="border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C]">Match Schedule</span>
          <h2 className="text-xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
            Upcoming Matches ({matches.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Matches Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {matches.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-xs text-[#6F6A60] dark:text-[#A8A194] bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-2 h-full flex flex-col items-center justify-center min-h-[220px]">
                <p className="font-semibold text-sm text-[#171614] dark:text-[#F7F4EC]">No Active Fixtures</p>
                <p>Your matches will appear here as soon as referee draws are seeded onto the Main Board.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m._id}
                    className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[#DCD6C8]/80 dark:border-[#38342C]">
                      <CategoryBadge category={m.category} />
                      <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                    </div>

                    <div className="grid grid-cols-11 items-center gap-2 py-1">
                      <div className="col-span-5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#857B6C] block">Side A</span>
                        <span className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-base truncate block">
                          {m.team1?.name || 'TBD'}
                        </span>
                      </div>
                      <div className="col-span-1 text-center font-serif italic text-xs text-[#857B6C]">vs</div>
                      <div className="col-span-5 text-right">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#857B6C] block">Side B</span>
                        <span className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-base truncate block">
                          {m.team2?.name || 'TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#DCD6C8]/80 dark:border-[#38342C] flex items-center justify-between text-xs text-[#6F6A60] dark:text-[#A8A194]">
                      <span className="font-mono text-[11px]">{m.roundName || 'Championship Match'}</span>
                      <span className="font-semibold text-[#171614] dark:text-[#F7F4EC]">Board 1 • Championship Table</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pure Editorial Photography Card without text overlay */}
          <div className="lg:col-span-4">
            <div className="relative w-full h-full min-h-[260px] rounded-3xl overflow-hidden border border-[#DCD6C8] dark:border-[#2E2B26] shadow-md bg-[#171614] group">
              <Image
                src="/carrom_play_passion.jpg"
                alt="Championship Carrom Action"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
