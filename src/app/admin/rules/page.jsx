'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Shield, Save, Settings, CheckCircle2 } from 'lucide-react';
import { StatusBadge, MainBoardBadge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';

export default function AdminRulesPage() {
  const toast = useToast();

  const [tournament, setTournament] = useState(null);
  const [rulesContent, setRulesContent] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [title, setTitle] = useState('');
  const [edition, setEdition] = useState('');
  const [boardCount, setBoardCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);

  const fetchTournament = async () => {
    setLoading(true);
    try {
      const res = await api.getCurrentTournament();
      if (res.success && res.tournament) {
        const t = res.tournament;
        setTournament(t);
        setRulesContent(t.rulesContent || '');
        setStatus(t.status || 'ongoing');
        setTitle(t.title || '');
        setEdition(t.edition || '2026');
        setBoardCount(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);
    try {
      await Promise.all([
        api.updateTournamentRules(rulesContent),
        api.updateTournamentStatus(status),
        api.updateTournamentSettings({ title, edition, boardCount: 1 })
      ]);
      toast.success('Tournament rules and arena settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save tournament settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest">
            Tournament Directives & Configuration
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">Rules & Settings</h1>
          <p className="text-xs text-[#D4DEEE]">
            Configure tournament rules, title, and arena settings.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Tournament Phase & Details */}
        <div className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-5">
          <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FFD691]" />
            <span>Tournament Status & General Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Tournament Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Annual Inter-College Carrom Championship"
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Edition / Year
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="2026"
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Tournament Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C]"
              >
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="ongoing">Ongoing Matches</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Equipment Arena
              </label>
              <div className="h-11 bg-[#152442] px-4 text-xs text-[#FFD691] font-mono font-bold rounded-xl border border-[#35538C] flex items-center">
                1 Main Carrom Board
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Rules Text Editor */}
        <div className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-4">
          <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#FFD691]" />
            <span>Official Rulebook Text</span>
          </h3>

          <div>
            <textarea
              rows="8"
              value={rulesContent}
              onChange={(e) => setRulesContent(e.target.value)}
              placeholder="Enter official tournament rules and regulations..."
              className="w-full bg-[#152442] p-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl btn-cream text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'SAVE ALL SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
