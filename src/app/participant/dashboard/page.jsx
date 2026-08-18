'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Shield, Trophy, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';

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
    return <div className="py-24 text-center text-xs text-[#D4DEEE]">Loading participant portal...</div>;
  }

  const { participant, registration, teams, matches } = dashboardData || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Profile Card */}
      <div className="sport-card p-6 sm:p-8 rounded-4xl border border-[#35538C] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD691] text-[#233A66] flex items-center justify-center font-display font-black text-2xl shadow-lg shadow-[#FFD691]/20">
            {participant?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-display text-white">
                {participant?.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                Active Athlete
              </span>
            </div>
            <p className="text-xs text-[#D4DEEE] font-mono mt-0.5">
              {participant?.studentId} • {participant?.department} • {participant?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-[#152442] border border-[#35538C] hover:border-rose-500/40 text-xs font-bold text-[#D4DEEE] hover:text-rose-300 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* 2. Approved Category Teams */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white">
          My Approved Teams ({teams?.length || 0})
        </h2>

        {teams?.length === 0 ? (
          <div className="sport-card p-6 rounded-3xl text-center text-xs text-[#D4DEEE]">
            Your registration is awaiting Admin verification and doubles team creation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div key={t._id} className="sport-card p-5 space-y-3 rounded-2xl border border-[#35538C]">
                <div className="flex items-center justify-between pb-2 border-b border-[#35538C]">
                  <CategoryBadge category={t.category} />
                  <span className="text-emerald-300 font-bold text-[10px]">Approved ✓</span>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{t.name}</h3>
                <div className="pt-2 border-t border-[#35538C] flex items-center justify-between text-xs">
                  <span className="text-[#D4DEEE]">Bracket Slot Ready</span>
                  <Link
                    href={`/brackets?category=${t.category}`}
                    className="text-[#FFD691] font-bold hover:underline flex items-center gap-1"
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
        <h2 className="text-xl font-bold font-display text-white">
          My Tournament Matches ({matches?.length || 0})
        </h2>

        {matches?.length === 0 ? (
          <div className="sport-card p-8 rounded-3xl text-center text-xs text-[#D4DEEE]">
            No matches scheduled for your teams yet. Check back once bracket draws are published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m._id} className="sport-card p-5 space-y-3 rounded-2xl border border-[#35538C]">
                <div className="flex items-center justify-between pb-2 border-b border-[#35538C] text-xs">
                  <CategoryBadge category={m.category} />
                  <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                </div>
                <div className="flex items-center justify-between font-bold text-white text-sm">
                  <span>{m.team1?.name}</span>
                  <span className="text-[#FFD691] font-mono px-2">vs</span>
                  <span>{m.team2?.name}</span>
                </div>
                <div className="pt-2 border-t border-[#35538C] flex items-center justify-between text-xs text-[#D4DEEE]">
                  <span className="font-mono">{m.roundName}</span>
                  <span className="font-mono text-[#FFD691]">Main Carrom Board</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
