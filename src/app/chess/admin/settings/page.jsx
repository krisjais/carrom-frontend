'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ConfirmationModal } from '@/components/chess/ConfirmationModal';
import { Settings, Save, RotateCcw, AlertTriangle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChessAdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [settings, setSettings] = useState({
    matchDuration: 10,
    currentRound: 1,
    registrationOpen: true,
    piecePoints: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 },
    tournamentPoints: { win: 3, draw: 1, loss: 0 }
  });

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    async function loadSettings() {
      if (!chessApi.isAdminAuthenticated()) {
        router.push('/chess/admin/login');
        return;
      }
      try {
        const res = await chessApi.getSettings();
        if (res.success && res.data) {
          setSettings({
            matchDuration: res.data.matchDuration || 10,
            currentRound: res.data.currentRound || 1,
            registrationOpen: res.data.registrationOpen ?? true,
            piecePoints: res.data.piecePoints || { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 },
            tournamentPoints: res.data.tournamentPoints || { win: 3, draw: 1, loss: 0 }
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        showToast(err.message || 'Error loading settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await chessApi.updateSettings(settings);
      if (res.success) {
        showToast('Tournament settings updated successfully!');
      } else {
        showToast(res.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setResetLoading(true);
    try {
      const res = await chessApi.resetTournamentData();
      if (res.success) {
        showToast(res.message || 'Tournament reset successfully.');
        setIsResetModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast(res.message || 'Failed to reset tournament data.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error resetting tournament.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors relative">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
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
              TOURNAMENT RULEBOOK & CONFIGURATION
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              PORTAL SETTINGS
            </h1>
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Tournament Data</span>
          </button>
        </div>

        {/* Settings Form */}
        {loading ? (
          <div className="text-center py-16 text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#141B2D] rounded-2xl border border-[#E2E8F0] dark:border-[#232A3B]">
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm max-w-3xl">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase border-b border-[#E2E8F0] dark:border-[#232A3B] pb-2">
                1. GENERAL TOURNAMENT RULES
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Match Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.matchDuration}
                    onChange={(e) => setSettings({ ...settings, matchDuration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl p-2.5 font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Current Active Round</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.currentRound}
                    onChange={(e) => setSettings({ ...settings, currentRound: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl p-2.5 font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Piece Points */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase border-b border-[#E2E8F0] dark:border-[#232A3B] pb-2">
                2. CHESS PIECE MATERIAL SCORING WEIGHTS
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {['pawn', 'knight', 'bishop', 'rook', 'queen'].map((piece) => (
                  <div key={piece}>
                    <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1 capitalize">{piece}</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.piecePoints[piece]}
                      onChange={(e) => setSettings({
                        ...settings,
                        piecePoints: { ...settings.piecePoints, [piece]: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl p-2 font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">King (Locked)</label>
                  <input
                    type="number"
                    disabled
                    value={0}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl p-2 font-bold font-mono text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A3B]">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm flex items-center gap-2 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A227] dark:text-slate-950" /> : <Save className="w-4 h-4 text-[#C9A227] dark:text-slate-950" />}
                <span>Save Tournament Configuration</span>
              </button>
            </div>

          </form>
        )}

      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset All Tournament Data"
        message="CAUTION: Are you sure you want to RESET ALL TOURNAMENT DATA? This will permanently clear all player registrations, match pairings, and leaderboard standings. This action CANNOT be undone."
        confirmText="Reset Tournament"
        cancelText="Cancel"
        isDestructive={true}
        loading={resetLoading}
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />

    </div>
  );
}
