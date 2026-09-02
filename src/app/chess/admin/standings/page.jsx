'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { RefreshCw, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ChessAdminStandingsPage() {
  const router = useRouter();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  async function loadStandings() {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    setLoading(true);
    try {
      const res = await chessApi.getStandings();
      if (res.success) {
        setStandings(res.data || []);
      }
    } catch (err) {
      console.error('Error loading standings:', err);
      showToast(err.message || 'Error loading standings', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings();
  }, [router]);

  const handleRecalculate = async () => {
    setRefreshing(true);
    try {
      const res = await chessApi.refreshStandings();
      if (res.success) {
        showToast('Standings recalculated successfully!');
        loadStandings();
      } else {
        showToast(res.message || 'Failed to refresh standings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error refreshing standings.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors relative">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 pb-20">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800' 
              : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              LEADERBOARD RECALCULATION & ENGINE
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              STANDINGS MANAGEMENT
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              disabled={refreshing}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-[#C9A227] dark:text-slate-950" />}
              <span>Recalculate Standings</span>
            </button>
          </div>
        </div>

        {/* Standings Table */}
        <StandingsTable standings={standings} loading={loading} />

      </main>
    </div>
  );
}
