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
    <div className="space-y-8 max-w-5xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="eyebrow-label">
            TOURNAMENT DIRECTIVES & CONFIGURATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">Rules & Settings</h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Configure official tournament regulations, metadata, and arena settings.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Tournament Phase & Details */}
        <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-5 shadow-xs">
          <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base flex items-center gap-2 uppercase tracking-wide">
            <Settings className="w-4 h-4 text-[#E74C3C]" />
            <span>Tournament Status & General Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Tournament Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="College Carrom Championship"
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Edition / Year
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="2026"
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Tournament Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              >
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="ongoing">Ongoing Matches</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Equipment Arena
              </label>
              <div className="h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] flex items-center">
                1 Main Carrom Board
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Rules Text Editor */}
        <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base flex items-center gap-2 uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-[#E74C3C]" />
            <span>Official Rulebook Text</span>
          </h3>

          <div>
            <textarea
              rows="8"
              value={rulesContent}
              onChange={(e) => setRulesContent(e.target.value)}
              placeholder="Enter official tournament rules and regulations..."
              className="w-full bg-white dark:bg-[#181C1F] p-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs font-bold px-8 py-3.5 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'SAVE ALL SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}


