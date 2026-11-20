'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Users, Swords, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ChessAdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!chessApi.isAdminAuthenticated()) {
        router.push('/chess/admin/login');
        return;
      }
      try {
        const res = await chessApi.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              MANAGEMENT CONTROL CENTER
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Admin Dashboard
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] mt-1">
              Overview of registrations, round match pairings, live timing, and tournament status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center">
            <Link
              href="/chess/admin/players"
              className="text-center bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95"
            >
              Manage Players
            </Link>

            <Link
              href="/chess/admin/matches"
              className="text-center border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Generate Pairings
            </Link>
          </div>
        </div>

        {/* Stats Grid: 2 columns on phone, 4 on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#FAF8F3]/60 dark:bg-[#151514]/60 border border-[#D5CFC5]/60 dark:border-[#262624]/60 rounded-2xl p-4 sm:p-5 h-28 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="w-16 h-3 bg-[#E8E1D5] dark:bg-[#262624] rounded-md" />
                  <div className="w-4 h-4 bg-[#E8E1D5] dark:bg-[#262624] rounded-full" />
                </div>
                <div className="w-14 h-7 bg-[#E8E1D5] dark:bg-[#262624] rounded-lg" />
                <div className="w-20 h-2.5 bg-[#E8E1D5] dark:bg-[#262624] rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 chess-content-fade-in">
            
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5 flex flex-col justify-between hover:border-[#D5CFC5]/80 transition-all duration-200">
              <div className="flex items-center justify-between text-[#77736B] dark:text-[#8E8E93]">
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider truncate">Registrations</span>
                <Users className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3] shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                {stats?.totalRegistrations || stats?.totalPlayers || 0}
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#77736B] dark:text-[#8E8E93] block truncate">
                Pending: <strong className="text-amber-600 dark:text-amber-400 font-mono">{stats?.pendingRegistrations || stats?.pendingPlayers || 0}</strong>
              </span>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5 flex flex-col justify-between hover:border-[#D5CFC5]/80 transition-all duration-200">
              <div className="flex items-center justify-between text-[#77736B] dark:text-[#8E8E93]">
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider truncate">Matches</span>
                <Swords className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3] shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                {stats?.totalMatches || 0}
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#77736B] dark:text-[#8E8E93] block truncate">
                Completed: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{stats?.completedMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5 flex flex-col justify-between hover:border-[#D5CFC5]/80 transition-all duration-200">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider truncate">Live Games</span>
                <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-rose-600 dark:text-rose-400">
                {stats?.liveMatches || 0}
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#77736B] dark:text-[#8E8E93] block truncate">
                Scheduled: <strong className="text-[#171715] dark:text-[#FAF8F3] font-mono">{stats?.scheduledMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5 flex flex-col justify-between hover:border-[#D5CFC5]/80 transition-all duration-200">
              <div className="flex items-center justify-between text-[#77736B] dark:text-[#8E8E93]">
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider truncate">Stage</span>
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                Round {stats?.currentRound || 1}
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#77736B] dark:text-[#8E8E93] block truncate">
                Reg: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Open</strong>
              </span>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
