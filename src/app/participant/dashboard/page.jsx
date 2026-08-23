'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Shield, Trophy, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';
import { CarromCoin, CategoryCoinPair } from '@/components/ui/CarromElements';

export default function ParticipantDashboardPage() {
  const router = useRouter();
  const { user, isParticipant, logout } = useAuth();

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="py-24 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">Loading participant portal...</div>;
  }

  const { participant, registration, teams, matches } = dashboardData || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Top Profile Card */}
      <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center font-serif font-black text-2xl shadow-xs border border-[#D5C4A1] dark:border-[#2B3034]">
            {participant?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
                {participant?.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase border border-emerald-200 dark:border-emerald-800/40 font-mono">
                Verified Athlete
              </span>
            </div>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono mt-1">
              {participant?.department}{participant?.email ? ` • ${participant?.email}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-rose-500/40 text-xs font-bold font-mono text-[#7E7060] dark:text-[#B8B1A5] hover:text-rose-600 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* 2. Approved Category Teams */}
      <div className="space-y-4">
        <div className="border-b border-[#E8E1D5] dark:border-[#2B3034] pb-3">
          <span className="eyebrow-label">Roster Status</span>
          <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
            My Approved Teams ({teams?.length || 0})
          </h2>
        </div>

        {teams?.length === 0 ? (
          <div className="editorial-card p-6 rounded-2xl text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]">
            Your registration is currently awaiting Admin verification and doubles team assignment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div key={t._id} className="editorial-card p-5 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                  <div className="flex items-center gap-2">
                    <CategoryCoinPair category={t.category} />
                    <CategoryBadge category={t.category} />
                  </div>
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold text-[10px] font-mono">Approved ✓</span>
                </div>
                <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base truncate">{t.name}</h3>
                <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#7E7060] dark:text-[#817B72]">Bracket Ready</span>
                  <Link
                    href={`/brackets?category=${t.category}`}
                    className="text-[#E74C3C] font-bold hover:underline flex items-center gap-1 uppercase"
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

      {/* 3. My Scheduled Matches */}
      <div className="space-y-4">
        <div className="border-b border-[#E8E1D5] dark:border-[#2B3034] pb-3">
          <span className="eyebrow-label">Arena Schedule</span>
          <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
            My Tournament Matches ({matches?.length || 0})
          </h2>
        </div>

        {matches?.length === 0 ? (
          <div className="editorial-card p-8 rounded-2xl text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]">
            No matches scheduled for your teams yet. Check back once bracket draws are published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m._id} className="editorial-card p-5 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034] text-xs">
                  <CategoryBadge category={m.category} />
                  <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                </div>
                <div className="flex items-center justify-between font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">
                  <span>{m.team1?.name}</span>
                  <span className="text-[#7E7060] dark:text-[#817B72] font-mono px-2">vs</span>
                  <span>{m.team2?.name}</span>
                </div>
                <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">
                  <span>{m.roundName}</span>
                  <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Main Carrom Board</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


