'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Users, Swords, Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              MANAGEMENT CONTROL CENTER
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              ADMIN DASHBOARD
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              Overview of registrations, round match pairings, live timing, and standings.
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link
              href="/chess/admin/players"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm transition-all"
            >
              Manage Players
            </Link>

            <Link
              href="/chess/admin/matches"
              className="border border-[#E2E8F0] dark:border-[#232A3B] bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#26334D] text-[#0F172A] dark:text-[#F8FAFC] font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-all"
            >
              Generate Pairings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#141B2D] rounded-2xl border border-[#E2E8F0] dark:border-[#232A3B]">
            Loading dashboard data...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-mono font-bold uppercase">Total Registrations</span>
                <Users className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                {stats?.totalRegistrations || stats?.totalPlayers || 0}
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                Pending Approval: <strong className="text-[#C9A227] dark:text-[#D4AF37]">{stats?.pendingRegistrations || stats?.pendingPlayers || 0}</strong>
              </span>
            </div>

            <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-mono font-bold uppercase">Total Matches</span>
                <Swords className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                {stats?.totalMatches || 0}
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                Completed: <strong className="text-emerald-600 dark:text-emerald-400">{stats?.completedMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span className="text-xs font-mono font-bold uppercase">Live Games</span>
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                {stats?.liveMatches || 0}
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                Scheduled: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{stats?.scheduledMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-mono font-bold uppercase">Current Round</span>
                <Trophy className="w-4 h-4 text-[#C9A227] dark:text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                Round {stats?.currentRound || 1}
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                Registration: <strong className="text-emerald-600 dark:text-emerald-400">OPEN</strong>
              </span>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
