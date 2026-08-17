'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Shield, Trophy, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge, CategoryBadge, BoardNumberBadge } from '@/components/ui/Badge';

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
    return <div className="py-24 text-center text-xs text-[#94A3B8]">Loading participant portal...</div>;
  }

  const { participant, registration, teams, matches } = dashboardData || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Profile Card */}
      <div className="sport-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#070B16] flex items-center justify-center font-display font-extrabold text-xl">
            {participant?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">
                {participant?.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                Active Participant
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              {participant?.studentId} • {participant?.department} • {participant?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-[#070B16] border border-[#1C2B48] hover:border-red-500/40 text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors"
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
          <div className="sport-card p-6 text-center text-xs text-[#94A3B8]">
            Your registration is awaiting Admin verification and doubles team creation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div key={t._id} className="sport-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2B48]">
                  <CategoryBadge category={t.category} />
                  <span className="text-emerald-400 font-semibold text-[10px]">Approved</span>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{t.name}</h3>
                <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Bracket Slot Ready</span>
                  <Link
                    href={`/brackets?category=${t.category}`}
                    className="text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Bracket</span>
                    <ArrowRight className="w-3 h-3" />
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
          My Upcoming Fixtures ({matches?.length || 0})
        </h2>

        {matches?.length === 0 ? (
          <div className="sport-card p-6 text-center text-xs text-[#94A3B8]">
            No active or scheduled matches for your teams yet. Check back when your category bracket is drawn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m._id} className="sport-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2B48] text-xs">
                  <CategoryBadge category={m.category} />
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#D4AF37]">{m.roundName} • Match #{m.matchNumber}</span>
                  <span className="text-slate-400">Main Carrom Board</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="truncate max-w-[150px]">{m.team1?.name}</span>
                  <span className="font-mono text-sm text-[#D4AF37]">
                    {m.finalScore?.team1BoardsWon || 0} - {m.finalScore?.team2BoardsWon || 0}
                  </span>
                  <span className="truncate max-w-[150px] text-right">
                    {m.isBye ? 'BYE Advance' : m.team2?.name}
                  </span>
                </div>

                {m.scheduledTime && (
                  <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[10px] text-[#94A3B8]">
                    <span>
                      Est. Start: {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.queuePosition && (
                      <span className="font-mono text-blue-300 font-semibold">Queue #{m.queuePosition}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
