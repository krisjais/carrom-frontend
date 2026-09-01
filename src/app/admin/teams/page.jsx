'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import {
  Users,
  Trash2,
  Shield,
  Plus,
  CheckCircle2,
  Calendar,
  GitFork,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { useToast, useConfirm } from '@/context/ToastContext';
import { CategoryCoinPair } from '@/components/ui/CarromElements';

export default function AdminTeamsPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [selectedCat, setSelectedCat] = useState('boys_singles');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scheduling, setScheduling] = useState(false);

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

  const handleAutoPopulate = async (category = '') => {
    setSyncing(true);
    try {
      const res = await api.autoPopulateTeams(category);
      if (res.success) {
        toast.success(res.message || 'Roster populated from approved registrations.');
        await fetchTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to sync approved registrations.');
    } finally {
      setSyncing(false);
    }
  };

  const handleRescheduleMatches = async () => {
    const isConfirmed = await confirm({
      title: 'Reschedule Arena Matches?',
      message: 'This will re-calculate the sequential queue times on the Main Carrom Board for all scheduled matches.',
      confirmText: 'Reschedule Matches',
      type: 'primary'
    });
    if (!isConfirmed) return;

    setScheduling(true);
    try {
      const res = await api.generateSchedule({});
      if (res.success) {
        toast.success('Sequential schedule generated successfully for Main Carrom Board!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate schedule.');
    } finally {
      setScheduling(false);
    }
  };

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
      message: `Are you sure you want to remove all ${teams.length} teams/players from ${catName}? Associated draws will also be unlocked.`,
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
      message: 'Are you sure you want to completely remove all approved players and teams across all 5 divisions? This will also unlock and reset all draws.',
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

  const currentCatName = CATEGORIES.find((c) => c.id === selectedCat)?.name || selectedCat;

  return (
    <div className="space-y-8 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header with Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#7E7060] dark:text-[#817B72] uppercase block">
            Approved Category Rosters
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3E342B] dark:text-[#F5F1E8] mt-1">Teams & Entries</h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            View approved singles entries and paired doubles teams for all 5 tournament divisions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleAutoPopulate('')}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Automatically populate teams from approved participant registrations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#E74C3C]' : 'text-[#E74C3C]'}`} />
            <span>{syncing ? 'Syncing...' : 'Sync from Registrations'}</span>
          </button>

          <Link
            href="/admin/draws"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            title="Go to dynamic knockout bracket draws"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Draws & Brackets</span>
          </Link>

          <button
            onClick={handleRescheduleMatches}
            disabled={scheduling}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            title="Generate and reschedule sequential match queue on Main Carrom Board"
          >
            <Calendar className={`w-3.5 h-3.5 ${scheduling ? 'animate-spin' : ''}`} />
            <span>{scheduling ? 'Scheduling...' : 'Reschedule Matches'}</span>
          </button>

          <button
            onClick={handleDeleteAllAcrossAllCategories}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FDEDEC] dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 text-[#E74C3C] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Delete all teams and entries across all categories"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? 'Deleting...' : 'Clear All'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`pill-tab ${
                isSelected
                  ? 'pill-tab-active'
                  : 'pill-tab-inactive'
              }`}
            >
              <CategoryCoinPair category={cat.id} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Teams Table & Action Card */}
      <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-2.5">
            <CategoryBadge category={selectedCat} />
            <h3 className="font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base">
              Roster ({teams.length} {teams.length === 1 ? 'Team' : 'Teams'})
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleAutoPopulate(selectedCat)}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-white dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#E74C3C]' : 'text-[#E74C3C]'}`} />
              <span>Sync {currentCatName}</span>
            </button>

            <Link
              href="/admin/draws"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Generate Draws & Matches</span>
            </Link>

            {teams.length > 0 && (
              <button
                onClick={handleDeleteAllInCurrentCategory}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FDEDEC] dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 text-[#E74C3C] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear {currentCatName} ({teams.length})</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-sm">Loading teams...</div>
        ) : teams.length === 0 ? (
          /* Rich Empty State Card with Direct Action Buttons */
          <div className="py-12 px-4 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto text-[#E74C3C] shadow-xs">
              <Users className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                No Approved Teams in {currentCatName}
              </h4>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                Approve registered participants in the Registrations console or click below to automatically sync paired teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleAutoPopulate(selectedCat)}
                disabled={syncing}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>{syncing ? 'Syncing Players...' : `Sync ${currentCatName} Roster`}</span>
              </button>

              <Link
                href="/admin/registrations"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#121517] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold transition-all shadow-2xs"
              >
                <span>View Registrations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/admin/draws"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Draws & Brackets</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-bold uppercase text-[11px]">
                <tr>
                  <th className="pb-3">#</th>
                  <th className="pb-3">Team / Athlete Name</th>
                  <th className="pb-3">Player 1</th>
                  <th className="pb-3">Player 2</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034]">
                {teams.map((t, idx) => (
                  <tr key={t._id} className="hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] transition-colors">
                    <td className="py-3.5 text-[#7E7060] dark:text-[#817B72] font-bold">{idx + 1}</td>
                    <td className="py-3.5 font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">{t.name}</td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{t.player1?.fullName}</span>
                        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block">
                          {t.player1?.department}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {t.player2 ? (
                        <div className="space-y-0.5">
                          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{t.player2?.fullName}</span>
                          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block">
                            {t.player2?.department}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#7E7060] dark:text-[#817B72] italic text-[11px]">Singles Entry</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Approved
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTeam(t._id, t.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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


