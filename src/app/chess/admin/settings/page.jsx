'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Settings, Save, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row font-sans text-[#111111] antialiased">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              TOURNAMENT RULEBOOK & CONFIGURATION
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              PORTAL SETTINGS
            </h1>
          </div>

          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Tournament Data</span>
          </button>
        </div>

        {/* Settings Form */}
        {loading ? (
          <div className="text-center py-16 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-display text-[#111111] uppercase border-b border-[#E5E5E5] pb-2">
                1. GENERAL TOURNAMENT RULES
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#111111] uppercase mb-1">Match Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.matchDuration}
                    onChange={(e) => setSettings({ ...settings, matchDuration: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-2.5 font-bold font-mono text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] uppercase mb-1">Current Active Round</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.currentRound}
                    onChange={(e) => setSettings({ ...settings, currentRound: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-2.5 font-bold font-mono text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Piece Points */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold font-display text-[#111111] uppercase border-b border-[#E5E5E5] pb-2">
                2. CHESS PIECE MATERIAL SCORING WEIGHTS
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {['pawn', 'knight', 'bishop', 'rook', 'queen'].map((piece) => (
                  <div key={piece}>
                    <label className="block font-bold text-[#111111] uppercase mb-1 capitalize">{piece}</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.piecePoints[piece]}
                      onChange={(e) => setSettings({
                        ...settings,
                        piecePoints: { ...settings.piecePoints, [piece]: Number(e.target.value) }
                      })}
                      className="w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-2 font-bold font-mono text-[#111111]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block font-bold text-[#666666] uppercase mb-1">King (Locked)</label>
                  <input
                    type="number"
                    disabled
                    value={0}
                    className="w-full bg-gray-100 border border-[#E5E5E5] rounded-xl p-2 font-bold font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#000000] hover:bg-[#222222] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" /> : <Save className="w-4 h-4 text-[#C9A227]" />}
                <span>Save Tournament Configuration</span>
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
