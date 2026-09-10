'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { MatchTimer } from '@/components/chess/MatchTimer';
import { Swords, Play, CheckCircle2, XCircle, Trophy, Loader2, Plus, Minus, Trash2, Clock, ShieldCheck, Zap, CheckSquare, Square } from 'lucide-react';
import { useToast, useConfirm } from '@/context/ToastContext';

const PIECE_CONFIG = [
  { key: 'pawns', label: 'Pawns', symbol: '♟', val: 1, max: 8 },
  { key: 'knights', label: 'Knights', symbol: '♞', val: 3, max: 2 },
  { key: 'bishops', label: 'Bishops', symbol: '♝', val: 3, max: 2 },
  { key: 'rooks', label: 'Rooks', symbol: '♜', val: 5, max: 2 },
  { key: 'queens', label: 'Queen', symbol: '♛', val: 9, max: 1 },
  { key: 'kings', label: 'King', symbol: '♚', val: 0, max: 1 }
];

const PIECE_LIMITS = {
  pawns: 8,
  knights: 2,
  bishops: 2,
  rooks: 2,
  queens: 1,
  kings: 1
};

const PIECE_VALUES = {
  pawns: 1,
  knights: 3,
  bishops: 3,
  rooks: 5,
  queens: 9,
  kings: 0
};

const PIECE_ICONS = {
  pawns: '♟',
  knights: '♞',
  bishops: '♝',
  rooks: '♜',
  queens: '♛',
  kings: '♚'
};

function calcMaterial(captured) {
  if (!captured) return 0;
  return (
    (captured.pawns || 0) * 1 +
    (captured.knights || 0) * 3 +
    (captured.bishops || 0) * 3 +
    (captured.rooks || 0) * 5 +
    (captured.queens || 0) * 9 +
    (captured.kings || 0) * 0
  );
}

const ROUND_PRESETS = [
  { label: 'Grand Final', round: 5 },
  { label: 'Final', round: 5 },
  { label: 'Semi-Final', round: 4 },
  { label: 'Quarter-Final', round: 3 },
  { label: 'Round 3', round: 3 },
  { label: 'Round 2', round: 2 },
  { label: 'Round 1', round: 1 }
];

export default function ChessAdminMatchesPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedRoundName, setSelectedRoundName] = useState('Round 1');
  const [startingMatchId, setStartingMatchId] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  // Bulk Selection & Deletion
  const [selectedMatchIds, setSelectedMatchIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Live in-game scoring modal
  const [liveScoringMatch, setLiveScoringMatch] = useState(null);
  const [liveP1Captured, setLiveP1Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [liveP2Captured, setLiveP2Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [savingLiveScore, setSavingLiveScore] = useState(false);

  // Final Result modal
  const [resultModalMatch, setResultModalMatch] = useState(null);
  const [p1Captured, setP1Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [p2Captured, setP2Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [winnerChoice, setWinnerChoice] = useState('none');
  const [resultTypeChoice, setResultTypeChoice] = useState('checkmate');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Manual Match Pairing Modal with Custom Round Name
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualRound, setManualRound] = useState(1);
  const [manualRoundName, setManualRoundName] = useState('Grand Final');
  const [manualP1, setManualP1] = useState('');
  const [manualP2, setManualP2] = useState('');
  const [creatingMatch, setCreatingMatch] = useState(false);

  async function loadData(silent = false) {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [matchesRes, playersRes] = await Promise.allSettled([
        chessApi.getAdminMatches(),
        chessApi.getAdminPlayers()
      ]);

      if (matchesRes.status === 'fulfilled' && matchesRes.value?.success) {
        setMatches(matchesRes.value.data || []);
      }
      if (playersRes.status === 'fulfilled' && playersRes.value?.success) {
        setPlayers(playersRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading matches & players:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // Background polling every 4 seconds to keep live scores synced
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedMatchIds.length === matches.length) {
      setSelectedMatchIds([]);
    } else {
      setSelectedMatchIds(matches.map((m) => m._id));
    }
  };

  const handleToggleSelectMatch = (id) => {
    setSelectedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedMatchIds.length === 0) return;
    const isConfirmed = await confirm({
      title: 'Delete Selected Matches?',
      message: `Are you sure you want to permanently delete ${selectedMatchIds.length} selected match(es)?`,
      confirmText: `Delete ${selectedMatchIds.length} Matches`,
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await chessApi.bulkDeleteMatches(selectedMatchIds);
      if (res.success) {
        setMatches((prev) => prev.filter((m) => !selectedMatchIds.includes(m._id)));
        setSelectedMatchIds([]);
        toast.success(res.message || 'Matches deleted successfully.');
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to delete selected matches.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting matches.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Admin round generation (Knockout: losers eliminated, highest points gets bye)
  const handleGeneratePairings = async () => {
    const roundTitle = selectedRoundName || `Round ${selectedRound}`;
    const isConfirmed = await confirm({
      title: `Generate ${roundTitle} Pairings?`,
      message: `Generate pairings for ${roundTitle}? Note: In knockout format, players who lost earlier are excluded and the highest-points contestant receives any odd-player BYE.`,
      confirmText: 'Generate Pairings',
      cancelText: 'Cancel',
      type: 'primary'
    });
    if (!isConfirmed) {
      return;
    }
    setGenerating(true);
    try {
      const res = await chessApi.generateMatches(selectedRound, roundTitle);
      if (res.success) {
        toast.success(res.message || `${roundTitle} pairings generated successfully!`);
        await loadData();
      } else {
        toast.error(res.message || 'Failed to generate pairings.');
      }
    } catch (err) {
      toast.error(err.message || 'Error generating pairings.');
    } finally {
      setGenerating(false);
    }
  };

  // Start live match (10-minute clock starts)
  const handleStartMatch = async (id) => {
    setStartingMatchId(id);
    try {
      const res = await chessApi.startMatch(id);
      if (res.success) {
        // Optimistically update local matches state
        setMatches((prev) =>
          prev.map((m) =>
            m._id === id || m.matchId === id
              ? { ...m, status: 'live', actualStartTime: new Date(), durationMinutes: 10 }
              : m
          )
        );
        // Automatically open live scorer for this match!
        const started = matches.find(m => m._id === id || m.matchId === id);
        if (started) {
          openLiveScoring({ ...started, status: 'live', actualStartTime: new Date(), durationMinutes: 10 });
        }
        toast.success('Live match started successfully!');
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to start match.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start match.');
    } finally {
      setStartingMatchId(null);
    }
  };

  // Open Live In-Game Scoring Modal
  const openLiveScoring = (match) => {
    setLiveScoringMatch(match);
    setLiveP1Captured(match.player1Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, kings: 0 });
    setLiveP2Captured(match.player2Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, kings: 0 });
  };

  // Live capture increment / decrement with strict piece limits
  const handleAdjustLiveCapture = async (playerNum, pieceKey, delta) => {
    if (!liveScoringMatch) return;

    let updatedP1 = { ...liveP1Captured };
    let updatedP2 = { ...liveP2Captured };
    const maxLimit = PIECE_LIMITS[pieceKey] ?? 8;

    if (playerNum === 1) {
      const current = updatedP1[pieceKey] || 0;
      const nextVal = Math.max(0, Math.min(maxLimit, current + delta));
      if (nextVal === current) return;
      updatedP1[pieceKey] = nextVal;
      setLiveP1Captured(updatedP1);
    } else {
      const current = updatedP2[pieceKey] || 0;
      const nextVal = Math.max(0, Math.min(maxLimit, current + delta));
      if (nextVal === current) return;
      updatedP2[pieceKey] = nextVal;
      setLiveP2Captured(updatedP2);
    }

    // Optimistically update local matches list
    const newP1Score = calcMaterial(updatedP1);
    const newP2Score = calcMaterial(updatedP2);
    setMatches((prev) =>
      prev.map((m) =>
        m._id === liveScoringMatch._id
          ? {
              ...m,
              player1Captured: updatedP1,
              player2Captured: updatedP2,
              player1MaterialScore: newP1Score,
              player2MaterialScore: newP2Score
            }
          : m
      )
    );

    // Save live captures to backend asynchronously
    try {
      setSavingLiveScore(true);
      await chessApi.updateLiveCaptures(liveScoringMatch._id, {
        player1Captured: updatedP1,
        player2Captured: updatedP2
      });
    } catch (err) {
      console.error('Failed to sync live piece captures:', err);
    } finally {
      setSavingLiveScore(false);
    }
  };

  // Individual Match Delete
  const handleDeleteMatch = async (id, matchIdLabel) => {
    const isConfirmed = await confirm({
      title: 'Delete Match Pairing?',
      message: `Are you sure you want to permanently delete match pairing ${matchIdLabel}?`,
      confirmText: 'Delete Match',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setDeletingMatchId(id);
    try {
      const res = await chessApi.deleteMatch(id);
      if (res.success) {
        setMatches((prev) => prev.filter((m) => m._id !== id));
        setSelectedMatchIds((prev) => prev.filter((item) => item !== id));
        toast.success(`Match ${matchIdLabel} deleted.`);
      } else {
        toast.error(res.message || 'Failed to delete match.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting match.');
    } finally {
      setDeletingMatchId(null);
    }
  };

  // Create manual match pairing with custom round name
  const handleCreateManualMatch = async (e) => {
    e.preventDefault();
    if (!manualP1) {
      toast.warning('Please select Player 1 (White pieces).');
      return;
    }
    if (manualP1 === manualP2) {
      toast.warning('Player 1 and Player 2 cannot be the same contestant.');
      return;
    }

    setCreatingMatch(true);
    try {
      const finalRoundName = manualRoundName ? manualRoundName.trim() : `Round ${manualRound}`;
      const res = await chessApi.createMatch({
        round: manualRound,
        roundName: finalRoundName,
        player1Id: manualP1,
        player2Id: manualP2 || null,
        durationMinutes: 10
      });

      if (res.success) {
        toast.success(`Match pairing for "${finalRoundName}" created successfully!`);
        setShowCreateModal(false);
        setManualP1('');
        setManualP2('');
        await loadData();
      } else {
        toast.error(res.message || 'Failed to create match pairing.');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating manual match.');
    } finally {
      setCreatingMatch(false);
    }
  };

  const openResultModal = (match) => {
    setResultModalMatch(match);
    setP1Captured(match.player1Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, kings: 0 });
    setP2Captured(match.player2Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, kings: 0 });
    setWinnerChoice(match.winner || 'none');
    setResultTypeChoice(match.resultType || 'checkmate');
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!resultModalMatch) return;
    setSubmitLoading(true);

    try {
      const payload = {
        player1Captured: p1Captured,
        player2Captured: p2Captured,
        winner: winnerChoice,
        resultType: resultTypeChoice
      };
      const res = await chessApi.submitMatchResult(resultModalMatch._id, payload);
      if (res.success) {
        setResultModalMatch(null);
        if (liveScoringMatch && liveScoringMatch._id === resultModalMatch._id) {
          setLiveScoringMatch(null);
        }
        toast.success('Match result recorded and standings recalculated.');
        await loadData();
      } else {
        toast.error(res.message || 'Result submission failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting match result.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
                CUSTOM ROUND STAGES • BULK DELETE & CONTROLS
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                <Clock className="w-3 h-3" />
                10:00 Clocks
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Match & Round Management
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Create Custom Pairing Button */}
            <button
              onClick={() => {
                setManualRoundName('Grand Final');
                setShowCreateModal(true);
              }}
              className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Match</span>
            </button>

            {/* Round Generation Controls with Stage Name */}
            <div className="flex items-center gap-2">
              <select
                value={selectedRoundName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRoundName(val);
                  if (val.includes('1')) setSelectedRound(1);
                  else if (val.includes('2')) setSelectedRound(2);
                  else if (val.includes('3') || val.includes('Quarter')) setSelectedRound(3);
                  else if (val.includes('Semi')) setSelectedRound(4);
                  else if (val.includes('Final')) setSelectedRound(5);
                }}
                className="bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] transition-colors focus:outline-none"
              >
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
                <option value="Round 3">Round 3</option>
                <option value="Quarter-Finals">Quarter-Finals</option>
                <option value="Semi-Finals">Semi-Finals</option>
                <option value="Grand Final">Grand Final</option>
              </select>

              <button
                onClick={handleGeneratePairings}
                disabled={generating}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                <span>Generate {selectedRoundName}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BULK ACTIONS FLOATING BAR (Visible when 1 or more matches selected) */}
        {selectedMatchIds.length > 0 && (
          <div className="bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-[#383733] dark:border-[#D5CFC5] animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-rose-600 text-white px-3 py-1 rounded-full">
                {selectedMatchIds.length} Selected
              </span>
              <span className="text-xs font-medium font-sans">
                Matches ready for bulk operations
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMatchIds([])}
                className="text-xs px-3.5 py-1.5 rounded-xl border border-white/20 dark:border-black/20 hover:bg-white/10 dark:hover:bg-black/5 font-semibold transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Bulk Delete ({selectedMatchIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Matches Table */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={matches.length > 0 && selectedMatchIds.length === matches.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer accent-[#171715] dark:accent-[#FAF8F3]"
                    title="Select / Deselect all matches"
                  />
                </th>
                <th className="py-3.5 px-3 font-semibold">Match ID</th>
                <th className="py-3.5 px-4 font-semibold">Stage / Round</th>
                <th className="py-3.5 px-4 font-semibold">Player 1 (White)</th>
                <th className="py-3.5 px-4 font-semibold">Player 2 (Black)</th>
                <th className="py-3.5 px-3 text-center font-semibold">Clock</th>
                <th className="py-3.5 px-3 text-center font-semibold">Status</th>
                <th className="py-3.5 px-4 text-center font-semibold">Score</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC5] dark:divide-[#262624]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">
                    Loading tournament matches...
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#77736B] dark:text-[#8E8E93]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                        No matches scheduled yet.
                      </p>
                      <p className="text-xs">
                        Rounds are created exclusively on demand by the admin. Use &quot;Generate {selectedRoundName}&quot; or click &quot;New Custom Match&quot; above to name and set up pairings.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                matches.map((m) => {
                  const p1 = m.player1?.fullName || (m.isBye ? (m.byePlayer?.fullName || 'Player') : 'TBD');
                  const p2 = m.player2?.fullName || (m.isBye ? 'BYE' : 'TBD');
                  const isLive = m.status === 'live';
                  const isScheduled = m.status === 'scheduled';
                  const isCompleted = m.status === 'completed';
                  const isStartingThis = startingMatchId === m._id;
                  const isDeletingThis = deletingMatchId === m._id;
                  const isSelected = selectedMatchIds.includes(m._id);

                  // Stylized Round / Stage badge
                  const stageTitle = m.roundName || `Round ${m.round}`;
                  const isFinalStage = stageTitle.toLowerCase().includes('final');

                  return (
                    <tr
                      key={m._id || m.matchId}
                      className={`hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B]/50 transition-colors ${
                        isSelected ? 'bg-amber-50/60 dark:bg-amber-950/20' : isLive ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectMatch(m._id)}
                          className="w-4 h-4 rounded cursor-pointer accent-[#171715] dark:accent-[#FAF8F3]"
                        />
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {m.matchId}
                      </td>

                      {/* Custom Round Name Display */}
                      <td className="py-3.5 px-4 font-serif">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isFinalStage
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#2E2E2B]'
                          }`}
                        >
                          {isFinalStage && <span className="mr-1">👑</span>}
                          {stageTitle}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {p1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {p2}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-[10px] bg-[#EFEAE1] dark:bg-[#1E1E1C] px-2 py-0.5 rounded border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#77736B] dark:text-[#8E8E93]">
                          {m.durationMinutes || 10}m
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            isLive
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                              : isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                              : 'bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#4E4C47] dark:text-[#8E8E93] border border-[#D5CFC5] dark:border-[#262624]'
                          }`}
                        >
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-ping" />}
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                        {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Live Scoring Button (For active live matches) */}
                        {isLive && (
                          <button
                            onClick={() => openLiveScoring(m)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg uppercase inline-flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 animate-pulse cursor-pointer"
                            title="Log piece captures in real-time"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Live Scoring</span>
                          </button>
                        )}

                        {/* Start Match Button (10:00 Clock) */}
                        {isScheduled && !m.isBye && (
                          <button
                            onClick={() => handleStartMatch(m._id)}
                            disabled={isStartingThis}
                            className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-[10px] font-semibold px-3 py-1.5 rounded-lg uppercase inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            title="Start 10:00 live timer"
                          >
                            {isStartingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            <span>Start (10m)</span>
                          </button>
                        )}

                        {/* Final Result Button */}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] text-[10px] font-semibold px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer"
                          >
                            {isCompleted ? 'Edit Result' : 'Finalize Result'}
                          </button>
                        )}

                        {/* Dedicated Delete Button on EVERY match row */}
                        <button
                          onClick={() => handleDeleteMatch(m._id, m.matchId)}
                          disabled={isDeletingThis}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold text-[10px] uppercase align-middle"
                          title={`Delete match ${m.matchId}`}
                        >
                          {isDeletingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* LIVE IN-GAME PIECE CAPTURES CONTROLLER MODAL */}
        {liveScoringMatch && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-[#171715] dark:text-[#FAF8F3] max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header with Live Badge & Timer */}
              <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE MATCH SCORER
                    </span>
                    {savingLiveScore && (
                      <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] animate-pulse">
                        Syncing...
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                    {liveScoringMatch.matchId} • {liveScoringMatch.roundName || `Round ${liveScoringMatch.round}`}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#EFEAE1] dark:bg-[#1E1E1C] px-3 py-1.5 rounded-2xl border border-[#D5CFC5] dark:border-[#2E2E2B]">
                    <MatchTimer match={liveScoringMatch} durationMinutes={liveScoringMatch.durationMinutes || 10} />
                  </div>
                  <button
                    onClick={() => setLiveScoringMatch(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] text-[#77736B] dark:text-[#8E8E93] text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Material Scoreboard Summary */}
              <div className="grid grid-cols-2 gap-4 bg-[#EFEAE1]/60 dark:bg-[#1C1C1A] p-4 rounded-2xl border border-[#D5CFC5]/60 dark:border-[#2E2E2B] text-center">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    White: {liveScoringMatch.player1?.fullName}
                  </span>
                  <div className="text-3xl font-serif font-black text-[#171715] dark:text-[#FAF8F3] mt-1">
                    {calcMaterial(liveP1Captured)} pts
                  </div>
                </div>
                <div className="border-l border-[#D5CFC5]/60 dark:border-[#2E2E2B]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    Black: {liveScoringMatch.player2?.fullName}
                  </span>
                  <div className="text-3xl font-serif font-black text-[#171715] dark:text-[#FAF8F3] mt-1">
                    {calcMaterial(liveP2Captured)} pts
                  </div>
                </div>
              </div>

              {/* Two Column In-Game Piece Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Player 1 (White) Controls */}
                <div className="bg-[#FAF8F3] dark:bg-[#191917] border border-[#D5CFC5] dark:border-[#262624] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-2">
                    <span className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                      ⚪ {liveScoringMatch.player1?.fullName}
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      Pieces Captured
                    </span>
                  </div>

                  <div className="space-y-2">
                    {PIECE_CONFIG.map(({ key, label, symbol, val, max }) => {
                      const count = liveP1Captured[key] || 0;
                      const isMaxReached = count >= max;
                      const isMinReached = count <= 0;
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-[#F5F2EB] dark:bg-[#131312] border border-[#D5CFC5]/50 dark:border-[#262624]">
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">{symbol}</span>
                            <div>
                              <span className="font-semibold text-xs capitalize block text-[#171715] dark:text-[#FAF8F3]">{label}</span>
                              <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                                {key === 'kings' ? '0 pts (Checkmate)' : `+${val} pt${val > 1 ? 's' : ''}`} • Max {max}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustLiveCapture(1, key, -1)}
                              disabled={isMinReached}
                              className="w-7 h-7 rounded-lg bg-[#EFEAE1] dark:bg-[#222220] hover:bg-[#E4DED5] flex items-center justify-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-11 text-center font-mono font-bold text-xs text-[#171715] dark:text-[#FAF8F3]">
                              {count}/{max}
                            </span>
                            <button
                              onClick={() => handleAdjustLiveCapture(1, key, 1)}
                              disabled={isMaxReached}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                isMaxReached
                                  ? 'opacity-25 cursor-not-allowed bg-neutral-300 dark:bg-neutral-800 text-neutral-500'
                                  : 'bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black cursor-pointer'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Player 2 (Black) Controls */}
                <div className="bg-[#FAF8F3] dark:bg-[#191917] border border-[#D5CFC5] dark:border-[#262624] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-2">
                    <span className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                      ⚫ {liveScoringMatch.player2?.fullName}
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      Pieces Captured
                    </span>
                  </div>

                  <div className="space-y-2">
                    {PIECE_CONFIG.map(({ key, label, symbol, val, max }) => {
                      const count = liveP2Captured[key] || 0;
                      const isMaxReached = count >= max;
                      const isMinReached = count <= 0;
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-[#F5F2EB] dark:bg-[#131312] border border-[#D5CFC5]/50 dark:border-[#262624]">
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">{symbol}</span>
                            <div>
                              <span className="font-semibold text-xs capitalize block text-[#171715] dark:text-[#FAF8F3]">{label}</span>
                              <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                                {key === 'kings' ? '0 pts (Checkmate)' : `+${val} pt${val > 1 ? 's' : ''}`} • Max {max}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustLiveCapture(2, key, -1)}
                              disabled={isMinReached}
                              className="w-7 h-7 rounded-lg bg-[#EFEAE1] dark:bg-[#222220] hover:bg-[#E4DED5] flex items-center justify-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-11 text-center font-mono font-bold text-xs text-[#171715] dark:text-[#FAF8F3]">
                              {count}/{max}
                            </span>
                            <button
                              onClick={() => handleAdjustLiveCapture(2, key, 1)}
                              disabled={isMaxReached}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                isMaxReached
                                  ? 'opacity-25 cursor-not-allowed bg-neutral-300 dark:bg-neutral-800 text-neutral-500'
                                  : 'bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black cursor-pointer'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom Actions: Auto-Save Status & Declare Final Outcome */}
              <div className="border-t border-[#D5CFC5]/70 dark:border-[#262624] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                  ⚡ Live score broadcasts to spectator watch pages automatically.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const m = liveScoringMatch;
                      setLiveScoringMatch(null);
                      openResultModal(m);
                    }}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Finish Match & Submit Result
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CREATE MANUAL MATCH MODAL WITH CUSTOM ROUND NAME / GRAND FINAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs text-[#171715] dark:text-[#FAF8F3]">
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block">
                    MANUAL PAIRING CREATOR
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                    Schedule New Chess Match
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualMatch} className="space-y-4">
                {/* Custom Round Name & Stage */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3]">
                      Tournament Stage / Round Name *
                    </label>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      Click preset or type custom
                    </span>
                  </div>

                  {/* Preset quick selection pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ROUND_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setManualRoundName(p.label);
                          setManualRound(p.round);
                        }}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          manualRoundName === p.label
                            ? 'bg-[#22221F] text-white dark:bg-[#FAF8F3] dark:text-[#0D0D0D] border-transparent font-bold shadow-xs'
                            : 'bg-[#F5F2EB] dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#262624] text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Text input where admin can name the round like "Grand Final", "Final", etc. */}
                  <input
                    type="text"
                    value={manualRoundName}
                    onChange={(e) => setManualRoundName(e.target.value)}
                    placeholder="e.g. Grand Final, Final, Semi-Final, Round 1..."
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-bold text-sm text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">
                    Player 1 (White Pieces) *
                  </label>
                  <select
                    value={manualP1}
                    onChange={(e) => setManualP1(e.target.value)}
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    required
                  >
                    <option value="">Select White Player...</option>
                    {players.map((p) => (
                      <option key={p._id || p.playerId} value={p._id || p.playerId}>
                        {p.fullName} ({p.playerId} • {p.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">
                    Player 2 (Black Pieces)
                  </label>
                  <select
                    value={manualP2}
                    onChange={(e) => setManualP2(e.target.value)}
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                  >
                    <option value="">Select Black Player (or leave empty for Bye)...</option>
                    {players.map((p) => (
                      <option key={p._id || p.playerId} value={p._id || p.playerId}>
                        {p.fullName} ({p.playerId} • {p.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Match Duration Notice */}
                <div className="bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] p-3 rounded-xl border border-[#D5CFC5] dark:border-[#282826] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-[#171715] dark:text-[#FAF8F3] block">Match Duration</span>
                      <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">Strict official tournament speed clock</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                    10:00 Minutes
                  </span>
                </div>

                <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingMatch}
                    className="px-5 py-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {creatingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Create Pairing</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enter Final Result Modal */}
        {resultModalMatch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs text-[#171715] dark:text-[#FAF8F3]">
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block">
                    FINAL SCORING & DECISION
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                    Match Result — {resultModalMatch.matchId} ({resultModalMatch.roundName || `Round ${resultModalMatch.round}`})
                  </h3>
                </div>
                <button
                  onClick={() => setResultModalMatch(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                {/* Captured counts player 1 */}
                <div className="bg-[#F5F2EB] dark:bg-[#1D1D1B] p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                      ⚪ {resultModalMatch.player1?.fullName} (White) Captured Pieces:
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      {calcMaterial(p1Captured)} pts
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {PIECE_CONFIG.map(({ key, label, symbol, max }) => {
                      const count = p1Captured[key] || 0;
                      return (
                        <div key={key} className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5]/70 dark:border-[#262624] rounded-xl p-2 flex flex-col items-center">
                          <span className="text-base select-none">{symbol}</span>
                          <span className="text-[10px] font-bold block text-[#171715] dark:text-[#FAF8F3]">
                            {label}
                          </span>
                          <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93] mb-1">
                            Max {max}
                          </span>
                          <div className="flex items-center gap-1 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => setP1Captured(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }))}
                              disabled={count <= 0}
                              className="w-5 h-5 rounded bg-[#EFEAE1] dark:bg-[#222220] hover:bg-[#E4DED5] flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={max}
                              value={count}
                              onChange={(e) => {
                                const raw = Number(e.target.value) || 0;
                                setP1Captured(prev => ({ ...prev, [key]: Math.max(0, Math.min(max, raw)) }));
                              }}
                              className="w-8 bg-transparent text-center font-mono font-bold text-xs text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setP1Captured(prev => ({ ...prev, [key]: Math.min(max, (prev[key] || 0) + 1) }))}
                              disabled={count >= max}
                              className="w-5 h-5 rounded bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Captured counts player 2 */}
                <div className="bg-[#F5F2EB] dark:bg-[#1D1D1B] p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                      ⚫ {resultModalMatch.player2?.fullName} (Black) Captured Pieces:
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      {calcMaterial(p2Captured)} pts
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {PIECE_CONFIG.map(({ key, label, symbol, max }) => {
                      const count = p2Captured[key] || 0;
                      return (
                        <div key={key} className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5]/70 dark:border-[#262624] rounded-xl p-2 flex flex-col items-center">
                          <span className="text-base select-none">{symbol}</span>
                          <span className="text-[10px] font-bold block text-[#171715] dark:text-[#FAF8F3]">
                            {label}
                          </span>
                          <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93] mb-1">
                            Max {max}
                          </span>
                          <div className="flex items-center gap-1 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => setP2Captured(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }))}
                              disabled={count <= 0}
                              className="w-5 h-5 rounded bg-[#EFEAE1] dark:bg-[#222220] hover:bg-[#E4DED5] flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={max}
                              value={count}
                              onChange={(e) => {
                                const raw = Number(e.target.value) || 0;
                                setP2Captured(prev => ({ ...prev, [key]: Math.max(0, Math.min(max, raw)) }));
                              }}
                              className="w-8 bg-transparent text-center font-mono font-bold text-xs text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setP2Captured(prev => ({ ...prev, [key]: Math.min(max, (prev[key] || 0) + 1) }))}
                              disabled={count >= max}
                              className="w-5 h-5 rounded bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] hover:bg-black flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">
                      Declare Winner
                    </label>
                    <select
                      value={winnerChoice}
                      onChange={(e) => setWinnerChoice(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    >
                      <option value="none">Auto-Calculate from Material Score</option>
                      <option value="player1">Player 1 ({resultModalMatch.player1?.fullName})</option>
                      <option value="player2">Player 2 ({resultModalMatch.player2?.fullName})</option>
                      <option value="draw">Draw</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">
                      Result Type
                    </label>
                    <select
                      value={resultTypeChoice}
                      onChange={(e) => setResultTypeChoice(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    >
                      <option value="checkmate">Checkmate</option>
                      <option value="time_out">Time Out (10:00 Expired)</option>
                      <option value="resignation">Resignation</option>
                      <option value="points">Points Leader</option>
                      <option value="draw_agreed">Draw Agreed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setResultModalMatch(null)}
                    className="px-4 py-2 border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    {submitLoading ? 'Saving...' : 'Submit Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
