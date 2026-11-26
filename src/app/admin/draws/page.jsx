'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { BracketView } from '@/components/bracket/BracketView';
import {
  GitFork,
  Shield,
  Sparkles,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Plus,
  Trash2
} from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CategoryCoinPair } from '@/components/ui/CarromElements';

function AdminDrawsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'boys_singles';

  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [bracketData, setBracketData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [manualMatchModalOpen, setManualMatchModalOpen] = useState(false);
  const [creatingManualMatch, setCreatingManualMatch] = useState(false);
  const [manualTeam1Id, setManualTeam1Id] = useState('');
  const [manualTeam2Id, setManualTeam2Id] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // In-app Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    action: null
  });

  const fetchCategoryData = async () => {
    setLoading(true);
    setBracketData(null);
    setTeams([]);
    try {
      try {
        await api.attachLateMatchesToActiveRound(selectedCat);
      } catch (err) {
        console.warn('Could not attach legacy late matches to the active bracket round:', err);
      }
      const [bRes, tRes] = await Promise.all([
        api.getBracketTree(selectedCat),
        api.getTeams(selectedCat)
      ]);
      if (bRes.success) setBracketData(bRes);
      if (tRes.success) setTeams(tRes.teams || []);
    } catch (err) {
      console.error(err);
      setBracketData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [selectedCat]);

  const N = teams.filter((team) => team.isApproved).length;
  const hasGeneratedBracket = (bracketData?.rawMatches?.length || 0) > 0;
  const firstRoundMatches = (bracketData?.rawMatches || []).filter((match) => match.roundNumber === 1);
  const bracketEntryIds = new Set(
    firstRoundMatches
      .flatMap((match) => [match.team1?._id || match.team1, match.team2?._id || match.team2])
      .filter(Boolean)
      .map((teamId) => String(teamId))
  );
  const pairingEntryCount = firstRoundMatches.length > 0 ? bracketEntryIds.size : N;
  const assignedTeamIds = new Set(
    (bracketData?.rawMatches || [])
      .flatMap((match) => [match.team1?._id || match.team1, match.team2?._id || match.team2])
      .filter(Boolean)
      .map((teamId) => String(teamId))
  );
  const availableLateTeams = teams.filter((team) => team.isApproved && !assignedTeamIds.has(String(team._id)));
  const r1Matches = pairingEntryCount >= 2 ? Math.floor(pairingEntryCount / 2) : 0;
  const r1Byes = pairingEntryCount >= 2 ? pairingEntryCount % 2 : 0;
  const r2Advancing = pairingEntryCount >= 2 ? r1Matches + r1Byes : 0;

  const handleGenerateDraw = () => {
    if (N < 2) {
      setFeedbackMessage({
        type: 'error',
        text: `At least 2 approved teams are required to generate a draw. Currently have ${N}.`
      });
      return;
    }

    if (bracketData?.isLocked) {
      setFeedbackMessage({
        type: 'error',
        text: 'This draw is already locked and cannot be regenerated.'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Generate Random Draw?',
      message: `This will randomly shuffle all ${N} approved entries in ${selectedCat.replace('_', ' ').toUpperCase()} and create the single-elimination tournament matchups.`,
      confirmText: 'Generate Draw',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.generateCategoryDraw(selectedCat);
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to generate draw.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePublishAndLock = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Publish & Lock Draw?',
      message: `Lock the draw for ${selectedCat.replace('_', ' ').toUpperCase()}? Once locked, the tournament draw cannot be regenerated.`,
      confirmText: 'Lock & Publish',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.publishAndLockDraw(selectedCat);
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to lock draw.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteAllMatches = () => {
    const matchCount = bracketData?.rawMatches?.length || 0;
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Matches?',
      message: `Permanently delete all ${matchCount} matches, scores, and results in ${selectedCat.replace('_', ' ').toUpperCase()}? This will unlock and unpublish the draw so you can generate it again. This action cannot be undone, and it is blocked while a match in this category is live.`,
      confirmText: 'Delete All Matches',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.deleteCategoryMatches(selectedCat);
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            await fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to delete matches.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCreateAdditionalMatch = async (e) => {
    e.preventDefault();
    if (!manualTeam1Id) return;
    if (manualTeam1Id === manualTeam2Id) return;
    if (hasGeneratedBracket && availableLateTeams.length > 1 && !manualTeam2Id) return;
    if (!hasGeneratedBracket && (availableLateTeams.length < 2 || !manualTeam2Id)) return;

    setCreatingManualMatch(true);
    try {
      const res = await api.createAdditionalMatch({
        category: selectedCat,
        team1Id: manualTeam1Id,
        team2Id: manualTeam2Id || null
      });
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        setManualMatchModalOpen(false);
        setManualTeam1Id('');
        setManualTeam2Id('');
        await fetchCategoryData();
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to add the match.' });
    } finally {
      setCreatingManualMatch(false);
    }
  };

  const handleAwardWalkover = (match, winnerTeam) => {
    if (!match || !winnerTeam) return;
    const winnerName = winnerTeam.name || 'the remaining entry';
    setConfirmModal({
      isOpen: true,
      title: 'Award Walkover Win?',
      message: `Confirm that the opponent in Match #${match.matchNumber} is absent or deleted. This will award ${winnerName} the win and advance them when the round is ready.`,
      confirmText: 'Award Walkover',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.confirmMatch(match._id, { winnerTeamId: winnerTeam._id || winnerTeam });
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            await fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to award the walkover.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-mono'
              : 'bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 font-mono'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold px-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="eyebrow-label">
            KNOCKOUT DRAW ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">Bracket & Draw Manager</h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Single-game knockout tournament bracket. Winners advance automatically to the next round as each match is played.
          </p>
        </div>

        {/* Generate / Lock Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {(hasGeneratedBracket || N >= 2) && (
            <button
              type="button"
              onClick={() => {
                setManualTeam1Id('');
                setManualTeam2Id('');
                setManualMatchModalOpen(true);
              }}
              disabled={actionLoading || creatingManualMatch}
              title={hasGeneratedBracket ? 'Add approved late entries to the active bracket round.' : 'Choose the first manual pairing before creating the bracket.'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-[#E74C3C]" aria-hidden="true" />
              <span>{hasGeneratedBracket
                ? (availableLateTeams.length > 0 ? 'Add Manual Match' : 'Add Late Match')
                : 'Create Manual Match'}</span>
            </button>
          )}

          {bracketData?.rawMatches?.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllMatches}
              disabled={actionLoading}
              title={`Delete all ${selectedCat.replace('_', ' ')} matches and unlock this draw for regeneration.`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#15191C] border border-red-300 dark:border-red-900/60 hover:border-red-500 dark:hover:border-red-700 text-xs font-bold text-red-700 dark:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Delete All Matches</span>
            </button>
          )}

          {!bracketData?.isLocked && (
            <button
              onClick={handleGenerateDraw}
              disabled={actionLoading || N < 2}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>{actionLoading ? 'Generating...' : 'Generate Random Draw'}</span>
            </button>
          )}

          {bracketData?.rawMatches?.length > 0 && !bracketData?.isLocked && (
            <button
              onClick={handlePublishAndLock}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>Publish & Lock Draw</span>
            </button>
          )}

          {bracketData?.isLocked && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold font-mono">
              <Shield className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C]" />
              <span>DRAW LOCKED & PUBLISHED</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`pill-tab cursor-pointer flex items-center gap-2 ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
            >
              <CategoryCoinPair category={cat.id} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Pairing Summary Parameters */}
      <div className="editorial-card p-6 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-2.5">
            <CategoryBadge category={selectedCat} />
            <span className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">Tournament Pairing Parameters ({N} Approved Entries)</span>
          </div>
          <span className="font-mono text-[#7E7060] dark:text-[#817B72] text-xs font-bold">Single-Elimination Knockout</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block uppercase">Approved Entries (N)</span>
            <span className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xl">{N}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block uppercase">Round 1 Matches</span>
            <span className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xl">{r1Matches} Matches</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block uppercase">Round 1 Byes (N % 2)</span>
            <span className="font-serif font-bold text-[#E74C3C] dark:text-[#D4A94C] text-xl">{r1Byes} Bye</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block uppercase">Advancing to Round 2</span>
            <span className="font-serif font-bold text-emerald-800 dark:text-emerald-300 text-xl">{r2Advancing} Entries</span>
          </div>
        </div>
      </div>

      {/* Bracket Tree View */}
      {loading ? (
        <div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
          <span>Loading bracket tree...</span>
        </div>
      ) : (
        <BracketView
          rounds={bracketData?.rounds || []}
          category={selectedCat}
          isLocked={bracketData?.isLocked}
          isPublished={bracketData?.isPublished}
          onMatchUpdated={fetchCategoryData}
          onAwardWalkover={handleAwardWalkover}
        />
      )}

      <Modal
        isOpen={manualMatchModalOpen}
        onClose={() => setManualMatchModalOpen(false)}
        title={hasGeneratedBracket
          ? (availableLateTeams.length > 0 ? 'Add Manual Match to Active Round' : 'Add Late Match to Active Round')
          : 'Create Manual Match'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAdditionalMatch} className="space-y-5">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
            <div className="flex items-center gap-2">
              <CategoryBadge category={selectedCat} />
              <span className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                {!hasGeneratedBracket
                  ? 'First-round manual pairing'
                : availableLateTeams.length === 1
                    ? 'Manual BYE advancement'
                    : 'Manual bracket match'}
              </span>
            </div>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
              {!hasGeneratedBracket
                ? 'Choose two approved entries for Match #1. This creates only this match; other entries stay unpaired until you add their matches. Winners advance when the round is ready.'
                : availableLateTeams.length === 1
                  ? 'Only one approved entry is left. Add it with an automatic BYE; it will advance when the active round is ready. Any live match keeps running.'
                  : 'Choose two approved entries not already assigned. Only this match is added to the active round; its winner advances when the round is ready.'}
            </p>
          </div>

          {availableLateTeams.length === 0 ? (
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
              <span>{hasGeneratedBracket
                ? 'No approved entries are currently available to add. Register and approve a late entry first. '
                : 'There are no approved entries available for a manual match. '}</span>
              <Link href="/admin/teams" className="font-bold underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-amber-600 rounded-sm">
                Open Teams & Entries
              </Link>
            </div>
          ) : !hasGeneratedBracket && availableLateTeams.length < 2 ? (
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
              At least two approved entries are needed to create the first manual match. Add and approve another entry first.
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${availableLateTeams.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
              <div className="space-y-1.5">
                <label htmlFor="late-match-team-1" className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8]">Entry 1</label>
                <select
                  id="late-match-team-1"
                  required
                  value={manualTeam1Id}
                  onChange={(e) => setManualTeam1Id(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50"
                >
                  <option value="">Select entry</option>
                  {availableLateTeams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
                </select>
              </div>
              {availableLateTeams.length > 1 && (
                <div className="space-y-1.5">
                  <label htmlFor="late-match-team-2" className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8]">Entry 2</label>
                  <select
                    id="late-match-team-2"
                    required
                    value={manualTeam2Id}
                    onChange={(e) => setManualTeam2Id(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50"
                  >
                    <option value="">Select entry</option>
                    {availableLateTeams.filter((team) => team._id !== manualTeam1Id).map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setManualMatchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                creatingManualMatch
                || availableLateTeams.length === 0
                || !manualTeam1Id
                || (!hasGeneratedBracket && (availableLateTeams.length < 2 || !manualTeam2Id))
                || (availableLateTeams.length > 1 && (!manualTeam2Id || manualTeam1Id === manualTeam2Id))
              }
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{creatingManualMatch
                ? (hasGeneratedBracket ? 'Adding...' : 'Creating...')
                : !hasGeneratedBracket
                  ? 'Create Match'
                  : availableLateTeams.length === 1
                    ? 'Add with BYE'
                    : 'Add Match'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* In-App Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-1">
          <p className="text-xs text-[#4A4238] dark:text-[#F5F1E8] leading-relaxed">
            {confirmModal.message}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              onClick={confirmModal.action}
              disabled={actionLoading}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider"
            >
              {actionLoading ? 'Processing...' : confirmModal.confirmText}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminDrawsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">Loading admin draws...</div>}>
      <AdminDrawsContent />
    </Suspense>
  );
}


