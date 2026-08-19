'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Users, Trash2, Shield, Plus, CheckCircle2 } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { useToast, useConfirm } from '@/context/ToastContext';

export default function AdminTeamsPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [selectedCat, setSelectedCat] = useState('boys_singles');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

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
    const isConfirmed = await confirm({
      title: 'Delete Team Entry',
      message: `Delete team "${name}" from this category?`,
      confirmText: 'Delete Team',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const res = await api.deleteTeam(id);
      if (res.success) {
        toast.success(`Team "${name}" deleted successfully.`);
        fetchTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete team.');
    }
  };

  const handleDeleteAllInCurrentCategory = async () => {
    if (teams.length === 0) return;
    const catName = CATEGORIES.find((c) => c.id === selectedCat)?.name || selectedCat;

    const isConfirmed = await confirm({
      title: `Delete All Players in ${catName}?`,
      message: `Are you sure you want to remove all ${teams.length} teams/players from ${catName}? This cannot be undone.`,
      confirmText: `Delete All (${teams.length} Players)`,
      type: 'danger'
    });
    if (!isConfirmed) return;

    setClearing(true);
    try {
      const res = await api.deleteAllTeams(selectedCat);
      if (res.success) {
        toast.success(res.message || `Deleted all players in ${catName}.`);
        fetchTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete players.');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAllAcrossAllCategories = async () => {
    const isConfirmed = await confirm({
      title: 'Delete ALL Players Across ALL Categories?',
      message: 'Are you sure you want to completely remove all approved players and teams across all 5 divisions? This cannot be undone.',
      confirmText: 'Clear Entire Tournament Roster',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setClearing(true);
    try {
      const res = await api.deleteAllTeams();
      if (res.success) {
        toast.success(res.message || 'All players across all categories have been removed.');
        fetchTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear roster.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <span className="eyebrow-label">
            Approved Category Rosters
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">Teams & Entries</h1>
          <p className="text-xs text-[#D4DEEE]">
            View all approved singles entries and paired doubles teams for tournament draw generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteAllAcrossAllCategories}
            disabled={clearing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Delete all teams and entries across all categories"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? 'Deleting...' : 'Delete All Players'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#35538C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-display font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                  : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Teams Table */}
      <div className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#35538C]">
          <div className="flex items-center gap-2.5">
            <CategoryBadge category={selectedCat} />
            <h3 className="font-bold text-white text-base">
              Roster ({teams.length} {teams.length === 1 ? 'Team' : 'Teams'})
            </h3>
          </div>

          {teams.length > 0 && (
            <button
              onClick={handleDeleteAllInCurrentCategory}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear {CATEGORIES.find((c) => c.id === selectedCat)?.name || 'Category'} ({teams.length})</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#D4DEEE] text-sm">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="py-16 text-center text-[#D4DEEE] text-sm">
            No approved teams found in this category. Approve registrations or create pairs in the Registrations tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#35538C] text-[#D4DEEE] font-bold uppercase text-[11px] font-mono">
                <tr>
                  <th className="pb-3">#</th>
                  <th className="pb-3">Team / Athlete Name</th>
                  <th className="pb-3">Player 1</th>
                  <th className="pb-3">Player 2</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35538C]/60">
                {teams.map((t, idx) => (
                  <tr key={t._id} className="hover:bg-[#1E3258]/40 transition-colors">
                    <td className="py-3.5 font-mono text-[#FFD691] font-bold">{idx + 1}</td>
                    <td className="py-3.5 font-bold text-white text-xs font-display uppercase tracking-wide">{t.name}</td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-bold">{t.player1?.fullName}</span>
                        <span className="text-[10px] text-[#D4DEEE] block font-mono">
                          {t.player1?.department}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {t.player2 ? (
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold">{t.player2?.fullName}</span>
                          <span className="text-[10px] text-[#D4DEEE] block font-mono">
                            {t.player2?.department}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-mono text-[11px]">Singles Entry</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTeam(t._id, t.name)}
                        className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
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
