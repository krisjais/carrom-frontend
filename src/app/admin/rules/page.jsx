'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Shield, Save, Settings, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

export default function AdminRulesPage() {
  const [tournament, setTournament] = useState(null);
  const [rulesContent, setRulesContent] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [title, setTitle] = useState('');
  const [edition, setEdition] = useState('');
  const [boardCount, setBoardCount] = useState(6);
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
        setBoardCount(t.boardCount || 6);
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
        api.updateTournamentSettings({ title, edition, boardCount })
      ]);
      setSavedMessage('Tournament rules and settings saved successfully.');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save tournament settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <span className="text-xs font-mono text-gold-400 font-bold uppercase tracking-widest">
            Tournament Directives & Configuration
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Rules & Settings</h1>
          <p className="text-xs text-slate-400">
            Configure Tournament Rules, registration phase, title, and physical Carrom board count.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Tournament Phase & Details */}
        <div className="glass-card rounded-3xl p-6 border border-navy-800 space-y-5">
          <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold-400" />
            <span>Tournament Status & General Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tournament Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Edition / Year
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tournament Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
              >
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="ongoing">Tournament Ongoing / Live</option>
                <option value="completed">Championship Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Physical Carrom Boards Available
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={boardCount}
                onChange={(e) => setBoardCount(Number(e.target.value))}
                className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* Tournament Rules Editor */}
        <div className="glass-card rounded-3xl p-6 border border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-400" />
              <span>Official Tournament Rules (Public Document)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Supports Markdown</span>
          </div>

          <textarea
            rows="14"
            value={rulesContent}
            onChange={(e) => setRulesContent(e.target.value)}
            className="w-full bg-navy-950 p-4 text-xs font-mono text-slate-200 rounded-2xl border border-navy-700 focus:outline-none focus:border-gold-400 leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm shadow-xl shadow-gold-500/20 hover:bg-gold-400 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings & Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
