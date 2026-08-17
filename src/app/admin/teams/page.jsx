'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Users, Trash2, Shield, Plus, CheckCircle2 } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function AdminTeamsPage() {
  const [selectedCat, setSelectedCat] = useState('boys_singles');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.getTeams(selectedCat);
      if (res.success) setTeams(res.teams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [selectedCat]);

  const handleDeleteTeam = async (id, name) => {
    if (!confirm(`Delete team "${name}" from this category?`)) return;
    try {
      const res = await api.deleteTeam(id);
      if (res.success) {
        fetchTeams();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete team.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <span className="text-xs font-mono text-gold-400 font-bold uppercase tracking-widest">
            Approved Category Rosters
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Teams & Entries</h1>
          <p className="text-xs text-slate-400">
            View all approved singles entries and paired doubles teams for tournament draw generation.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-navy-800">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                isSelected
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-navy-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Teams Table */}
      <div className="glass-card rounded-3xl p-6 border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryBadge category={selectedCat} />
            <h3 className="font-bold text-white text-base">
              Roster ({teams.length} Teams)
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No approved teams found in this category. Approve registrations or create pairs in the Registrations tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-navy-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Team Name</th>
                  <th className="pb-3 font-semibold">Player 1</th>
                  <th className="pb-3 font-semibold">Player 2</th>
                  <th className="pb-3 font-semibold">Verification</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {teams.map((t, idx) => (
                  <tr key={t._id} className="hover:bg-navy-900/40">
                    <td className="py-3.5 font-mono text-slate-500 font-bold">{idx + 1}</td>
                    <td className="py-3.5 font-bold text-white text-xs">{t.name}</td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-slate-200">{t.player1?.fullName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {t.player1?.studentId} • {t.player1?.department}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {t.player2 ? (
                        <div className="space-y-0.5">
                          <span className="text-slate-200">{t.player2?.fullName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {t.player2?.studentId} • {t.player2?.department}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Singles Entry</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTeam(t._id, t.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
