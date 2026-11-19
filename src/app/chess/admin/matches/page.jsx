'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ChessBracketView } from '@/components/chess/ChessBracketView';
import { Swords, Play, CheckCircle2, XCircle, Trophy, Loader2, Plus, Minus, Trash2, Clock, ShieldCheck, Zap, CheckSquare, Square, ChevronDown, X, LayoutGrid, List, Crown } from 'lucide-react';
import { useToast, useConfirm } from '@/context/ToastContext';

const ROUND_PRESETS = [
  { label: 'Round 1', round: 1 },
  { label: 'Round 2', round: 2 },
  { label: 'Round 3', round: 3 },
  { label: 'Quarter-Final', round: 4 },
  { label: 'Semi-Final', round: 5 },
  { label: 'Final', round: 6 },
  { label: 'Grand Finals', round: 7 }
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
  const [deletingRound, setDeletingRound] = useState(false);
  const [deletingAllRounds, setDeletingAllRounds] = useState(false);
  const [startingMatchId, setStartingMatchId] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  // View Mode: 'bracket' (like Carrom) or 'table'
  const [viewMode, setViewMode] = useState('bracket');

  // Bulk Selection & Deletion
  const [selectedMatchIds, setSelectedMatchIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Declare Winner Modal
  const [resultModalMatch, setResultModalMatch] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Manual Match Pairing Modal with Custom Round Name
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualRound, setManualRound] = useState(1);
  const [manualRoundName, setManualRoundName] = useState('Round 1');
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
        const freshMatches = matchesRes.value.data || [];
        setMatches(freshMatches);

        // Keep active result modal synced with fresh data
        setResultModalMatch((prev) => {
          if (!prev) return null;
          return freshMatches.find(m => m._id === prev._id || m.matchId === prev.matchId) || prev;
        });
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
    // Fast polling every 2.5 seconds to keep live scores and clock turns synced
    const interval = setInterval(() => {
      loadData(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [router]);

  // Real-time tab-to-tab and instant broadcast listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const channel = new BroadcastChannel('chess_tournament_clock');
    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      // Instantly update active modal if it corresponds to this match
      setResultModalMatch((prev) => {
        if (!prev) return null;
        if (data.matchId && data.matchId !== prev._id && data.matchId !== prev.matchId) return prev;
        return {
          ...prev,
          activeTurn: data.activeTurn || prev.activeTurn,
          whiteTimeRemaining: typeof data.whiteSeconds === 'number' ? data.whiteSeconds : (typeof data.p1Time === 'number' ? data.p1Time : prev.whiteTimeRemaining),
          blackTimeRemaining: typeof data.blackSeconds === 'number' ? data.blackSeconds : (typeof data.p2Time === 'number' ? data.p2Time : prev.blackTimeRemaining),
          movesCount: typeof data.movesCount === 'number' ? data.movesCount : prev.movesCount,
          isClockRunning: typeof data.isClockRunning === 'boolean' ? data.isClockRunning : (typeof data.isRunning === 'boolean' ? data.isRunning : prev.isClockRunning),
          lastClockUpdate: new Date()
        };
      });

      // Update match row in matches table
      setMatches((prev) =>
        prev.map((m) => {
          if (data.matchId && data.matchId !== m._id && data.matchId !== m.matchId) return m;
          return {
            ...m,
            activeTurn: data.activeTurn || m.activeTurn,
            whiteTimeRemaining: typeof data.whiteSeconds === 'number' ? data.whiteSeconds : (typeof data.p1Time === 'number' ? data.p1Time : m.whiteTimeRemaining),
            blackTimeRemaining: typeof data.blackSeconds === 'number' ? data.blackSeconds : (typeof data.p2Time === 'number' ? data.p2Time : m.blackTimeRemaining),
            movesCount: typeof data.movesCount === 'number' ? data.movesCount : m.movesCount,
            isClockRunning: typeof data.isClockRunning === 'boolean' ? data.isClockRunning : (typeof data.isRunning === 'boolean' ? data.isRunning : m.isClockRunning),
            lastClockUpdate: new Date()
          };
        })
      );
    };

    return () => channel.close();
  }, []);

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

  // Delete an entire round of matches
  const handleDeleteRound = async () => {
    const roundMatches = matches.filter((m) => m.round === selectedRound);
    const count = roundMatches.length;
    const isConfirmed = await confirm({
      title: `Delete ${selectedRoundName}?`,
      message: `Are you sure you want to delete ${selectedRoundName}? This will permanently remove all ${count} fixture(s) in this round and re-compute standings.`,
      confirmText: `Delete ${selectedRoundName}`,
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setDeletingRound(true);
    try {
      const res = await chessApi.deleteRound(selectedRound);
      if (res.success) {
        toast.success(res.message || `${selectedRoundName} deleted successfully.`);
        await loadData();
      } else {
        toast.error(res.message || 'Failed to delete round.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting round.');
    } finally {
      setDeletingRound(false);
    }
  };

  // Delete all rounds and fixtures
  const handleDeleteAllRounds = async () => {
    const isConfirmed = await confirm({
      title: 'Delete ALL Rounds & Matches?',
      message: 'Are you sure you want to permanently delete ALL rounds and matches? This will reset the tournament back to Round 1 and zero all match statistics while keeping all registered players.',
      confirmText: 'Delete All Rounds',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setDeletingAllRounds(true);
    try {
      const res = await chessApi.deleteAllRounds();
      if (res.success) {
        toast.success(res.message || 'All rounds and matches deleted successfully.');
        await loadData();
      } else {
        toast.error(res.message || 'Failed to delete all rounds.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting all rounds.');
    } finally {
      setDeletingAllRounds(false);
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
  };

  // Admin directly clicks the name of who is the winner!
  const handleDeclareWinner = async (match, winnerChoice) => {
    if (!match) return;
    setSubmitLoading(true);

    try {
      const payload = {
        winner: winnerChoice,
        resultType: winnerChoice === 'draw' ? 'draw_agreed' : 'checkmate'
      };
      const res = await chessApi.submitMatchResult(match._id, payload);
      if (res.success) {
        setResultModalMatch(null);
        const winnerName = winnerChoice === 'player1'
          ? (match.player1?.fullName || 'Player 1 (White)')
          : winnerChoice === 'player2'
          ? (match.player2?.fullName || 'Player 2 (Black)')
          : 'Official Draw';
        toast.success(
          winnerChoice === 'draw'
            ? 'Match recorded as Draw!'
            : `Winner declared: ${winnerName}!`
        );
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
                setManualRoundName(`Round ${selectedRound}`);
                setShowCreateModal(true);
              }}
              className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Match</span>
            </button>

            {/* Round Generation Controls (Admin creates and names rounds like Round 1, Semi-Final, Final, Grand Finals) */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={selectedRoundName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRoundName(val);
                  const matchNum = val.match(/\d+/);
                  if (matchNum) {
                    setSelectedRound(parseInt(matchNum[0], 10));
                  } else if (val.toLowerCase().includes('grand final')) {
                    setSelectedRound(7);
                  } else if (val.toLowerCase().includes('final')) {
                    setSelectedRound(6);
                  } else if (val.toLowerCase().includes('semi')) {
                    setSelectedRound(5);
                  } else if (val.toLowerCase().includes('quarter')) {
                    setSelectedRound(4);
                  }
                }}
                placeholder="Stage name (e.g. Final, Grand Finals, Round 1)"
                className="w-56 sm:w-64 bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none shadow-xs transition-colors"
                title="Type any round name: Final, Grand Finals, Round 1, Semi-Final..."
              />

              <button
                onClick={handleGeneratePairings}
                disabled={generating}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                title={`Generate pairings for ${selectedRoundName || 'selected round'}`}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                <span>Generate {selectedRoundName || 'Pairings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stage Presets Bar */}
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] mr-1">
            Quick Stages:
          </span>
          {ROUND_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setSelectedRoundName(p.label);
                setSelectedRound(p.round);
              }}
              className={`text-[11px] font-sans px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedRoundName === p.label
                  ? 'bg-[#171715] text-white dark:bg-[#FAF8F3] dark:text-[#0D0D0D] border-transparent font-semibold shadow-xs'
                  : 'bg-[#FAF8F3] dark:bg-[#1A1A18] border-[#D5CFC5] dark:border-[#262624] text-[#6E685F] dark:text-[#A8A49C] hover:text-[#171715] dark:hover:text-[#FAF8F3] hover:border-[#171715]/40'
              }`}
            >
              {p.label}
            </button>
          ))}
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

        {/* Layout View Toggle (Bracket Tree vs Table View) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-3 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] mr-2">
              View Layout:
            </span>
            <button
              type="button"
              onClick={() => setViewMode('bracket')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'bracket'
                  ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                  : 'bg-[#EFEAE1]/60 dark:bg-[#1E1E1C] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bracket Tree View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                  : 'bg-[#EFEAE1]/60 dark:bg-[#1E1E1C] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View ({matches.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
            <span>Total: <strong className="text-[#171715] dark:text-[#FAF8F3]">{matches.length} Matches</strong></span>
            <span>•</span>
            <span>Live: <strong className="text-rose-600">{matches.filter((m) => m.status === 'live').length}</strong></span>
          </div>
        </div>

        {/* BRACKET VIEW (Knockout Bracket Tree Structure like Carrom) */}
        {viewMode === 'bracket' && (
          <ChessBracketView
            matches={matches}
            isAdmin={true}
            onStartMatch={handleStartMatch}
            onOpenLiveScoring={openLiveScoring}
            onOpenResultModal={openResultModal}
            onDeleteMatch={handleDeleteMatch}
            startingMatchId={startingMatchId}
            deletingMatchId={deletingMatchId}
          />
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
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
                <th className="py-3.5 px-4 text-center font-semibold">Winner / Result</th>
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
                          {isFinalStage && (
                            <svg className="w-3.5 h-3.5 mr-1 fill-current inline" viewBox="0 0 24 24">
                              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                            </svg>
                          )}
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
                      <td className="py-3.5 px-4 text-center font-serif font-bold text-xs">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800/60">
                            👑 {m.isBye ? `${p1} (BYE)` : m.winner === 'player1' ? p1 : m.winner === 'player2' ? p2 : 'Draw'}
                          </span>
                        ) : isLive ? (
                          <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-[11px] animate-pulse">
                            In Progress
                          </span>
                        ) : (
                          <span className="text-[#77736B] dark:text-[#8E8E93] font-mono text-[11px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
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

                        {/* Declare Winner Button (Click to declare winner directly) */}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Crown className="w-3 h-3 fill-current" />
                            <span>{isCompleted ? 'Edit Winner' : 'Declare Winner'}</span>
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
        )}

        {/* CREATE MANUAL MATCH MODAL WITH CUSTOM ROUND NAME / GRAND FINAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased">
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-[0.14em] block">
                    MANUAL PAIRING CREATOR
                  </span>
                  <h3 className="text-xl font-bold font-sans text-[#171715] dark:text-[#FAF8F3] mt-0.5 tracking-tight">
                    Schedule New Chess Match
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateManualMatch} className="space-y-4">
                {/* Custom Round Name & Stage */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#171715] dark:text-[#FAF8F3]">
                      Tournament Round / Stage <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-sans font-medium text-[#77736B] dark:text-[#8E8E93]">
                      Round {manualRound}
                    </span>
                  </div>

                  {/* Preset quick selection pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {ROUND_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setManualRoundName(p.label);
                          setManualRound(p.round);
                        }}
                        className={`text-[11px] font-sans font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          manualRoundName === p.label
                            ? 'bg-[#171715] text-white dark:bg-[#FAF8F3] dark:text-[#0D0D0D] border-transparent font-semibold shadow-xs'
                            : 'bg-[#F2ECE1]/80 dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#262624] text-[#6E685F] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Single Input: Custom Stage / Round Name */}
                  <div>
                    <label className="block text-[10px] font-medium text-[#77736B] dark:text-[#8E8E93] mb-1">
                      Stage / Match Title (e.g. Final, Grand Finals, Semi-Final, Round 1)
                    </label>
                    <input
                      type="text"
                      value={manualRoundName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualRoundName(val);
                        const matchNum = val.match(/\d+/);
                        if (matchNum) {
                          setManualRound(parseInt(matchNum[0], 10));
                        } else if (val.toLowerCase().includes('grand final')) {
                          setManualRound(7);
                        } else if (val.toLowerCase().includes('final')) {
                          setManualRound(6);
                        } else if (val.toLowerCase().includes('semi')) {
                          setManualRound(5);
                        } else if (val.toLowerCase().includes('quarter')) {
                          setManualRound(4);
                        }
                      }}
                      placeholder="e.g. Final, Grand Finals, Semi-Final, Round 1..."
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#2A2A28] focus:border-[#171715] dark:focus:border-[#FAF8F3] focus:ring-1 focus:ring-[#171715]/15 rounded-xl px-3.5 py-2.5 font-medium text-sm text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-xs text-[#171715] dark:text-[#FAF8F3] mb-1.5 flex items-center justify-between">
                    <span>Player 1 (White Pieces) <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-normal text-[#77736B] dark:text-[#8E8E93] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border border-current bg-white inline-block" />
                      <span>White moves first</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={manualP1}
                      onChange={(e) => setManualP1(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#2A2A28] focus:border-[#171715] dark:focus:border-[#FAF8F3] focus:ring-1 focus:ring-[#171715]/15 rounded-xl py-2.5 pl-3.5 pr-10 font-medium text-sm text-[#171715] dark:text-[#FAF8F3] appearance-none focus:outline-none cursor-pointer transition-all"
                      required
                    >
                      <option value="">Select White Player...</option>
                      {players.map((p) => (
                        <option key={p._id || p.playerId} value={p._id || p.playerId}>
                          {p.fullName} ({p.playerId} • {p.department})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-xs text-[#171715] dark:text-[#FAF8F3] mb-1.5 flex items-center justify-between">
                    <span>Player 2 (Black Pieces)</span>
                    <span className="text-[10px] font-normal text-[#77736B] dark:text-[#8E8E93] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-current inline-block" />
                      <span>Leave empty for Bye</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={manualP2}
                      onChange={(e) => setManualP2(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#2A2A28] focus:border-[#171715] dark:focus:border-[#FAF8F3] focus:ring-1 focus:ring-[#171715]/15 rounded-xl py-2.5 pl-3.5 pr-10 font-medium text-sm text-[#171715] dark:text-[#FAF8F3] appearance-none focus:outline-none cursor-pointer transition-all"
                    >
                      <option value="">Select Black Player (or leave empty for Bye)...</option>
                      {players.map((p) => (
                        <option key={p._id || p.playerId} value={p._id || p.playerId}>
                          {p.fullName} ({p.playerId} • {p.department})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Match Duration Notice */}
                <div className="bg-[#F0EBE0]/80 dark:bg-[#191917] p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#2A2A28] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#171715] dark:text-[#FAF8F3] block">Match Duration</span>
                      <span className="text-[11px] text-[#77736B] dark:text-[#8E8E93]">Strict official tournament speed clock</span>
                    </div>
                  </div>
                  <span className="font-sans font-bold text-xs bg-amber-500/15 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-400/40 dark:border-amber-600/30 shrink-0">
                    10:00 Minutes
                  </span>
                </div>

                <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 border border-[#D5CFC5] dark:border-[#2A2A28] bg-transparent hover:bg-[#EFEAE1] dark:hover:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingMatch}
                    className="px-6 py-2.5 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-white dark:text-[#0D0D0D] rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {creatingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Create Pairing</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Click-to-Declare Winner Modal (Direct, No Points / Piece Counts) */}
        {resultModalMatch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased">
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-[0.14em] block">
                    OFFICIAL MATCH DECISION
                  </span>
                  <h3 className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] mt-0.5 tracking-tight">
                    Declare Winner — {resultModalMatch.matchId}
                  </h3>
                  <span className="text-xs text-[#77736B] dark:text-[#8E8E93]">
                    {resultModalMatch.roundName || `Round ${resultModalMatch.round}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setResultModalMatch(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-sans text-[#77736B] dark:text-[#8E8E93]">
                  Click the contestant who won the match. The winner will be saved and automatically advanced to the next knockout round:
                </p>

                {/* Player 1 Card (White) */}
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(resultModalMatch, 'player1')}
                  disabled={submitLoading}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs ${
                    resultModalMatch.winner === 'player1'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'border-[#D5CFC5] dark:border-[#2A2A28] bg-white dark:bg-[#1A1A18] hover:border-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#171715] flex items-center justify-center font-bold text-2xl text-[#171715] shadow-2xs">
                      ♔
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                        White Pieces
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#171715] dark:text-[#FAF8F3] group-hover:text-amber-700 dark:group-hover:text-amber-400">
                        {resultModalMatch.player1?.fullName || 'Player 1 (White)'}
                      </h4>
                      <span className="text-xs text-[#77736B] dark:text-[#8E8E93]">
                        {resultModalMatch.player1?.department || 'Participant'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {resultModalMatch.winner === 'player1' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold inline-flex items-center gap-1 shadow-2xs">
                        ✓ WINNER
                      </span>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] text-xs font-mono font-bold uppercase tracking-wider group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                        {submitLoading ? 'Saving...' : 'Declare Winner 👑'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Player 2 Card (Black) */}
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(resultModalMatch, 'player2')}
                  disabled={submitLoading}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs ${
                    resultModalMatch.winner === 'player2'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'border-[#D5CFC5] dark:border-[#2A2A28] bg-white dark:bg-[#1A1A18] hover:border-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#171715] border-2 border-[#D5CFC5] flex items-center justify-center font-bold text-2xl text-white shadow-2xs">
                      ♚
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                        Black Pieces
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#171715] dark:text-[#FAF8F3] group-hover:text-amber-700 dark:group-hover:text-amber-400">
                        {resultModalMatch.player2?.fullName || 'Player 2 (Black)'}
                      </h4>
                      <span className="text-xs text-[#77736B] dark:text-[#8E8E93]">
                        {resultModalMatch.player2?.department || 'Participant'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {resultModalMatch.winner === 'player2' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold inline-flex items-center gap-1 shadow-2xs">
                        ✓ WINNER
                      </span>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] text-xs font-mono font-bold uppercase tracking-wider group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                        {submitLoading ? 'Saving...' : 'Declare Winner 👑'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Draw Option */}
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(resultModalMatch, 'draw')}
                  disabled={submitLoading}
                  className={`w-full py-3 px-4 rounded-xl border border-dashed text-center font-mono text-xs font-bold transition-all cursor-pointer ${
                    resultModalMatch.winner === 'draw'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-800'
                      : 'border-[#D5CFC5] dark:border-[#383733] hover:border-[#171715] dark:hover:border-white text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3]'
                  }`}
                >
                  🤝 Declare Match as Official Draw
                </button>
              </div>

              <div className="pt-2 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setResultModalMatch(null)}
                  className="px-5 py-2 border border-[#D5CFC5] dark:border-[#2A2A28] bg-transparent hover:bg-[#EFEAE1] dark:hover:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
