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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row font-sans text-[#111111] antialiased">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              MANAGEMENT CONTROL CENTER
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              ADMIN DASHBOARD
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              Overview of registrations, round match pairings, live timing, and standings.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/chess/admin/players"
              className="bg-[#000000] hover:bg-[#222222] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs"
            >
              Manage Players
            </Link>

            <Link
              href="/chess/admin/matches"
              className="border border-[#E5E5E5] hover:bg-gray-50 text-[#111111] font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider"
            >
              Generate Pairings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Loading dashboard data...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#666666]">
                <span className="text-xs font-mono font-bold uppercase">Total Registrations</span>
                <Users className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#111111]">
                {stats?.totalRegistrations || stats?.totalPlayers || 0}
              </div>
              <span className="text-[10px] text-[#666666] block">
                Pending Approval: <strong className="text-[#C9A227]">{stats?.pendingRegistrations || stats?.pendingPlayers || 0}</strong>
              </span>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#666666]">
                <span className="text-xs font-mono font-bold uppercase">Total Matches</span>
                <Swords className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#111111]">
                {stats?.totalMatches || 0}
              </div>
              <span className="text-[10px] text-[#666666] block">
                Completed: <strong className="text-emerald-600">{stats?.completedMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-red-600">
                <span className="text-xs font-mono font-bold uppercase">Live Games</span>
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-red-600">
                {stats?.liveMatches || 0}
              </div>
              <span className="text-[10px] text-[#666666] block">
                Scheduled: <strong className="text-[#111111]">{stats?.scheduledMatches || 0}</strong>
              </span>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#666666]">
                <span className="text-xs font-mono font-bold uppercase">Current Round</span>
                <Trophy className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#111111]">
                Round {stats?.currentRound || 1}
              </div>
              <span className="text-[10px] text-[#666666] block">
                Registration: <strong className="text-emerald-600">OPEN</strong>
              </span>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
