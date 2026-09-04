'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

export default function ChessAdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    matchDuration: 10,
    currentRound: 1,
    registrationOpen: true,
    piecePoints: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 },
    tournamentPoints: { win: 3, draw: 1, loss: 0 }
  });

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
        alert('Tournament settings updated successfully!');
      } else {
        alert(res.message || 'Failed to update settings.');
      }
    } catch (err) {
      alert(err.message || 'Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('CAUTION: Are you sure you want to RESET ALL TOURNAMENT DATA? This clears all registrations and match records.')) return;
    try {
      const res = await chessApi.resetTournamentData();
      if (res.success) {
        alert(res.message || 'Tournament reset successfully.');
        window.location.reload();
      }
    } catch (err) {
      alert(err.message || 'Error resetting tournament.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              TOURNAMENT RULEBOOK & CONFIGURATION
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Portal Settings
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] mt-1">
              Configure round parameters, time controls, and piece scoring weights.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Tournament Data</span>
          </button>
        </div>

        {/* Settings Form */}
        {loading ? (
          <div className="text-center py-16 text-[#77736B] dark:text-[#8E8E93] bg-[#FAF8F3] dark:bg-[#151514] rounded-2xl border border-[#D5CFC5] dark:border-[#262624]">
            Loading tournament configuration...
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-serif text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider border-b border-[#D5CFC5] dark:border-[#262624] pb-2">
                1. General Tournament Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                    Match Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.matchDuration}
                    onChange={(e) => setSettings({ ...settings, matchDuration: Number(e.target.value) })}
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-bold font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                    Current Active Round
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.currentRound}
                    onChange={(e) => setSettings({ ...settings, currentRound: Number(e.target.value) })}
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-bold font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Piece Points */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold font-serif text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider border-b border-[#D5CFC5] dark:border-[#262624] pb-2">
                2. Chess Piece Material Scoring Weights
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {['pawn', 'knight', 'bishop', 'rook', 'queen'].map((piece) => (
                  <div key={piece}>
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider mb-1.5 capitalize font-mono text-[11px]">
                      {piece}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.piecePoints[piece]}
                      onChange={(e) => setSettings({
                        ...settings,
                        piecePoints: { ...settings.piecePoints, [piece]: Number(e.target.value) }
                      })}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2 font-bold font-mono text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block font-semibold text-[#77736B] dark:text-[#8E8E93] uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                    King (Locked)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={0}
                    className="w-full bg-[#EFEAE1]/50 dark:bg-[#1D1D1B]/50 border border-[#D5CFC5] dark:border-[#262624] rounded-xl p-2 font-bold font-mono text-[#77736B] dark:text-[#8E8E93] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-[#D5CFC5] dark:border-[#262624]">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Tournament Configuration</span>
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
