'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ChessBracketView } from '@/components/chess/ChessBracketView';
import { Swords, Play, Pause, CheckCircle2, XCircle, Trophy, Loader2, Plus, Minus, Trash2, Clock, ShieldCheck, Zap, CheckSquare, Square, ChevronDown, X, LayoutGrid, List, Crown, Sparkles, ArrowRightLeft, RotateCcw, Timer, Save } from 'lucide-react';
import { useToast, useConfirm } from '@/context/ToastContext';
import { getSocket, subscribeToChessLive } from '@/lib/socket';

/**
 * Dynamic Round & Stage Calculator
 * Calculates dynamic round progression and naming based on active contestants,
 * exactly like the Carrom draw engine (N = 2 -> Final, N <= 4 -> Semi-Final, etc.)
 */
const getDynamicRoundPlan = (activePlayersCount, currentRoundNumber = 1) => {
  const N = Math.max(0, activePlayersCount);
  if (N <= 1) {
    return {
      stageName: 'Final',
      realMatches: Math.floor(N / 2),
      byes: N % 2,
      totalRounds: 1
    };
  }

  const plan = [];
  let curr = N;
  let rNum = currentRoundNumber;

  while (curr > 1) {
    const realMatches = Math.floor(curr / 2);
    const byes = curr % 2;
    const nextEntries = realMatches + byes;
    plan.push({
      roundNumber: rNum,
      entriesCount: curr,
      realMatches,
      byes,
      nextEntries
    });
    curr = nextEntries;
    rNum++;
  }

  const currentPlan = plan[0] || { realMatches: Math.floor(N / 2), byes: N % 2, entriesCount: N };
  let stageName = `Round ${currentRoundNumber}`;
  if (currentPlan.entriesCount === 2) stageName = 'Final';
  else if (currentPlan.entriesCount <= 4) stageName = 'Semi-Final';
  else if (currentPlan.entriesCount <= 8) stageName = 'Quarter-Final';
  else if (currentPlan.entriesCount <= 16) stageName = 'Round of 16';
  else if (currentPlan.entriesCount <= 32) stageName = 'Round of 32';

  return {
    stageName,
    roundNumber: currentRoundNumber,
    activePlayers: N,
    realMatches: currentPlan.realMatches,
    byes: currentPlan.byes,
    totalRounds: plan.length
  };
};

function formatClockTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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
  const [restartingMatchId, setRestartingMatchId] = useState(null);

  // View Mode: 'bracket' (like Carrom) or 'table'
  const [viewMode, setViewMode] = useState('bracket');

  // Match Details & Arbiter Modal
  const [matchModalMatch, setMatchModalMatch] = useState(null);

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

  // Set Match Time / Duration Modal (like Carrom)
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [selectedMatchForTime, setSelectedMatchForTime] = useState(null);
  const [customDurationMinutes, setCustomDurationMinutes] = useState(10);
  const [savingTime, setSavingTime] = useState(false);

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
          return freshMatches.find(m => (m?._id === prev?._id || m?.matchId === prev?.matchId)) || prev;
        });

        // Keep match detail modal synced with fresh data
        setMatchModalMatch((prev) => {
          if (!prev) return null;
          return freshMatches.find(m => (m?._id === prev?._id || m?.matchId === prev?.matchId)) || prev;
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

  // Calculate dynamic tournament progression and stage based on actual active players (adapts like Carrom)
  const dynamicProgression = useMemo(() => {
    const approvedPlayers = players.filter(p => ['Approved', 'Active', 'approved', 'active'].includes(p.status));
    if (matches.length === 0) {
      const plan = getDynamicRoundPlan(approvedPlayers.length, 1);
      return {
        targetRound: 1,
        suggestedName: plan.stageName,
        activePlayersCount: approvedPlayers.length,
        realMatches: plan.realMatches,
        byes: plan.byes,
        isNewTournament: true,
        allCompleted: false
      };
    }

    const maxRound = Math.max(...matches.map(m => m.round || 1));
    const currentRoundMatches = matches.filter(m => m.round === maxRound);
    const uncompleted = currentRoundMatches.filter(m => m.status !== 'completed');

    if (uncompleted.length > 0) {
      return {
        targetRound: maxRound,
        suggestedName: currentRoundMatches[0]?.roundName || `Round ${maxRound}`,
        activePlayersCount: currentRoundMatches.length * 2,
        realMatches: currentRoundMatches.filter(m => !m.isBye).length,
        byes: currentRoundMatches.filter(m => m.isBye).length,
        isNewTournament: false,
        allCompleted: false,
        uncompletedCount: uncompleted.length
      };
    }

    // Current round finished -> advancing pool
    const advancingIds = new Set();
    currentRoundMatches.filter(Boolean).forEach(m => {
      const p1Id = (m?.player1?._id || m?.player1 || m?.byePlayer?._id || m?.byePlayer)?.toString();
      const p2Id = (m?.player2?._id || m?.player2)?.toString();
      if (m?.isBye) {
        if (p1Id) advancingIds.add(p1Id);
      } else if (m?.winner === 'player1') {
        if (p1Id) advancingIds.add(p1Id);
      } else if (m?.winner === 'player2') {
        if (p2Id) advancingIds.add(p2Id);
      } else if (m?.winnerPlayer) {
        const wId = (m.winnerPlayer?._id || m.winnerPlayer)?.toString();
        if (wId) advancingIds.add(wId);
      }
    });

    const advancingCount = advancingIds.size;
    const nextRoundNum = maxRound + 1;
    const plan = getDynamicRoundPlan(advancingCount, nextRoundNum);

    return {
      targetRound: nextRoundNum,
      suggestedName: plan.stageName,
      activePlayersCount: advancingCount,
      realMatches: plan.realMatches,
      byes: plan.byes,
      isNewTournament: false,
      allCompleted: true
    };
  }, [matches, players]);

  // Sync default round name when dynamicProgression changes
  useEffect(() => {
    if (dynamicProgression?.suggestedName) {
      setSelectedRoundName((prev) => {
        if (!prev || prev.startsWith('Round ') || ['Final', 'Grand Finals', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32'].includes(prev)) {
          return dynamicProgression.suggestedName;
        }
        return prev;
      });
      setSelectedRound(dynamicProgression.targetRound || 1);
    }
  }, [dynamicProgression]);

  useEffect(() => {
    loadData();
    // Fast polling every 2.5 seconds to keep live scores and clock turns synced
    const interval = setInterval(() => {
      loadData(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [router]);

  // Real-time tab-to-tab and multi-device listener via Socket.io & BroadcastChannel
  useEffect(() => {
    let channel = null;

    const handleEventData = (data) => {
      if (!data) return;

      // Instantly update active result modal if it corresponds to this match
      setResultModalMatch((prev) => {
        if (!prev) return null;
        if (data.matchId && data.matchId !== (prev._id || prev.matchId)) return prev;
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

      // Instantly update active match modal if it corresponds to this match
      setMatchModalMatch((prev) => {
        if (!prev) return null;
        if (data.matchId && data.matchId !== (prev._id || prev.matchId)) return prev;
        return {
          ...prev,
          activeTurn: data.activeTurn || prev.activeTurn,
          whiteTimeRemaining: typeof data.whiteSeconds === 'number' ? data.whiteSeconds : (typeof data.p1Time === 'number' ? data.p1Time : prev.whiteTimeRemaining),
          blackTimeRemaining: typeof data.blackSeconds === 'number' ? data.blackSeconds : (typeof data.p2Time === 'number' ? data.p2Time : prev.blackTimeRemaining),
          movesCount: typeof data.movesCount === 'number' ? data.movesCount : prev.movesCount,
          isClockRunning: typeof data.isClockRunning === 'boolean' ? data.isClockRunning : (typeof data.isRunning === 'boolean' ? data.isRunning : prev.isClockRunning),
          lastClockUpdate: new Date(),
          ...(data.match || {})
        };
      });

      // Update match row in matches table
      setMatches((prev) =>
        (prev || []).filter(Boolean).map((m) => {
          if (!m) return m;
          if (data.matchId && data.matchId !== (m?._id || m?.matchId)) return m;
          return {
            ...m,
            activeTurn: data.activeTurn || m.activeTurn,
            whiteTimeRemaining: typeof data.whiteSeconds === 'number' ? data.whiteSeconds : (typeof data.p1Time === 'number' ? data.p1Time : m.whiteTimeRemaining),
            blackTimeRemaining: typeof data.blackSeconds === 'number' ? data.blackSeconds : (typeof data.p2Time === 'number' ? data.p2Time : m.blackTimeRemaining),
            movesCount: typeof data.movesCount === 'number' ? data.movesCount : m.movesCount,
            isClockRunning: typeof data.isClockRunning === 'boolean' ? data.isClockRunning : (typeof data.isRunning === 'boolean' ? data.isRunning : m.isClockRunning),
            lastClockUpdate: new Date(),
            ...(data.match || {})
          };
        })
      );
    };

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      channel = new BroadcastChannel('chess_tournament_clock');
      channel.onmessage = (event) => handleEventData(event.data);
    }

    const unsubscribeSocket = subscribeToChessLive((data) => {
      handleEventData(data);
      if (data?.type === 'match_created' || data?.type === 'match_started' || data?.type === 'result_submitted') {
        fetchMatches();
      }
    });

    return () => {
      if (channel) channel.close();
      unsubscribeSocket();
    };
  }, []);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedMatchIds.length === matches.length) {
      setSelectedMatchIds([]);
    } else {
      setSelectedMatchIds(matches.filter(Boolean).map((m) => m?._id || m?.matchId).filter(Boolean));
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

  // Start live match (10-minute clock starts from White's first turn)
  const handleStartMatch = async (id) => {
    setStartingMatchId(id);
    try {
      const res = await chessApi.startMatch(id);
      if (res.success) {
        // Optimistically update local matches state
        setMatches((prev) =>
          (prev || []).filter(Boolean).map((m) =>
            m && ((m?._id && m?._id === id) || (m?.matchId && m?.matchId === id))
              ? {
                  ...m,
                  status: 'live',
                  actualStartTime: new Date(),
                  durationMinutes: 10,
                  activeTurn: 'white',
                  isClockRunning: true,
                  whiteTimeRemaining: 600,
                  blackTimeRemaining: 600,
                  movesCount: 0,
                  lastClockUpdate: new Date()
                }
              : m
          )
        );

        // Broadcast to all devices and player tabs instantly
        try {
          if (typeof window !== 'undefined' && window.BroadcastChannel) {
            const bc = new BroadcastChannel('chess_tournament_clock');
            bc.postMessage({
              matchId: id,
              activeTurn: 'white',
              isClockRunning: true,
              whiteSeconds: 600,
              blackSeconds: 600,
              movesCount: 0,
              timestamp: Date.now()
            });
            bc.close();
          }
          const socket = getSocket();
          if (socket && socket.connected) {
            socket.emit('chess:turn_switch', {
              matchId: id,
              activeTurn: 'white',
              isClockRunning: true,
              whiteSeconds: 600,
              blackSeconds: 600,
              movesCount: 0,
              timestamp: Date.now()
            });
          }
        } catch {}

        toast.success('Match started! Clock active with White opening turn.');
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

  // Pause / Resume Live Match Clock
  const handlePauseResumeMatch = async (match) => {
    if (!match) return;
    const mId = match._id || match.matchId;
    const willPause = match.isClockRunning !== false; // default true if live
    const nextRunning = !willPause;

    // Calculate current remaining seconds accounting for elapsed time if running
    let wSec = typeof match.whiteTimeRemaining === 'number' ? match.whiteTimeRemaining : 600;
    let bSec = typeof match.blackTimeRemaining === 'number' ? match.blackTimeRemaining : 600;
    const turn = match.activeTurn && match.activeTurn !== 'none' ? match.activeTurn : 'white';

    if (willPause && match.lastClockUpdate) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(match.lastClockUpdate).getTime()) / 1000));
      if (turn === 'white') wSec = Math.max(0, wSec - elapsed);
      else if (turn === 'black') bSec = Math.max(0, bSec - elapsed);
    }

    // Optimistic local state update
    setMatches((prev) =>
      (prev || []).filter(Boolean).map((m) =>
        m && ((m?._id && m?._id === mId) || (m?.matchId && m?.matchId === mId))
          ? {
              ...m,
              isClockRunning: nextRunning,
              whiteTimeRemaining: wSec,
              blackTimeRemaining: bSec,
              activeTurn: turn,
              lastClockUpdate: new Date()
            }
          : m
      )
    );

    // Instant zero-latency Broadcast to player dashboards & audience
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('chess_tournament_clock');
        bc.postMessage({
          matchId: mId,
          isClockRunning: nextRunning,
          isRunning: nextRunning,
          activeTurn: turn,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          timestamp: Date.now()
        });
        bc.close();
      }
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chess:turn_switch', {
          matchId: mId,
          isClockRunning: nextRunning,
          isRunning: nextRunning,
          activeTurn: turn,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          timestamp: Date.now()
        });
      }
    } catch {}

    // Persist to server
    try {
      await chessApi.syncMatchClock(mId, {
        isClockRunning: nextRunning,
        whiteTimeRemaining: wSec,
        blackTimeRemaining: bSec,
        activeTurn: turn,
        status: 'live'
      });
      toast.success(nextRunning ? 'Match clock resumed ▶️' : 'Match clock paused ⏸️');
      await loadData(true);
    } catch (err) {
      toast.error('Failed to sync pause state with server.');
    }
  };

  // Admin Turn Switch Tap (Admin taps to switch turn between White and Black live!)
  const handleAdminSwitchTurn = async (match) => {
    if (!match) return;
    const mId = match._id || match.matchId;
    const currentTurn = match.activeTurn && match.activeTurn !== 'none' ? match.activeTurn : 'white';
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';

    let wSec = typeof match.whiteTimeRemaining === 'number' ? match.whiteTimeRemaining : 600;
    let bSec = typeof match.blackTimeRemaining === 'number' ? match.blackTimeRemaining : 600;

    if (match.isClockRunning && match.lastClockUpdate) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(match.lastClockUpdate).getTime()) / 1000));
      if (currentTurn === 'white') wSec = Math.max(0, wSec - elapsed);
      else if (currentTurn === 'black') bSec = Math.max(0, bSec - elapsed);
    }
    const nextMoves = (match.movesCount || 0) + 1;

    // Optimistic local update
    setMatches((prev) =>
      (prev || []).filter(Boolean).map((m) =>
        m && ((m?._id && m?._id === mId) || (m?.matchId && m?.matchId === mId))
          ? {
              ...m,
              activeTurn: nextTurn,
              whiteTimeRemaining: wSec,
              blackTimeRemaining: bSec,
              movesCount: nextMoves,
              isClockRunning: true,
              lastClockUpdate: new Date()
            }
          : m
      )
    );

    // Broadcast live over BroadcastChannel & Socket.io
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('chess_tournament_clock');
        bc.postMessage({
          matchId: mId,
          activeTurn: nextTurn,
          isClockRunning: true,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          movesCount: nextMoves,
          timestamp: Date.now()
        });
        bc.close();
      }
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chess:turn_switch', {
          matchId: mId,
          activeTurn: nextTurn,
          isClockRunning: true,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          movesCount: nextMoves,
          timestamp: Date.now()
        });
      }
    } catch {}

    // Persist to server
    try {
      await chessApi.syncMatchClock(mId, {
        activeTurn: nextTurn,
        isClockRunning: true,
        whiteTimeRemaining: wSec,
        blackTimeRemaining: bSec,
        movesCount: nextMoves,
        status: 'live'
      });
      toast.success(`Turn passed to ${nextTurn.toUpperCase()} by Admin tap! ⚡`);
      await loadData(true);
    } catch (err) {
      toast.error('Failed to sync turn switch.');
    }
  };

  // Quick Time Extension (+1m, +2m, +5m buttons)
  const handleQuickAddTime = async (match, minutesToAdd) => {
    if (!match) return;
    const mId = match._id || match.matchId;
    const extraSec = Math.round(minutesToAdd * 60);

    const wSec = (match.whiteTimeRemaining || 600) + extraSec;
    const bSec = (match.blackTimeRemaining || 600) + extraSec;
    const newDur = (match.durationMinutes || 10) + Math.round(minutesToAdd);

    // Optimistic update
    setMatches((prev) =>
      (prev || []).filter(Boolean).map((m) =>
        m && ((m?._id && m?._id === mId) || (m?.matchId && m?.matchId === mId))
          ? {
              ...m,
              whiteTimeRemaining: wSec,
              blackTimeRemaining: bSec,
              durationMinutes: newDur,
              lastClockUpdate: new Date()
            }
          : m
      )
    );

    // Broadcast
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('chess_tournament_clock');
        bc.postMessage({
          matchId: mId,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          durationMinutes: newDur,
          timestamp: Date.now()
        });
        bc.close();
      }
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chess:turn_switch', {
          matchId: mId,
          whiteSeconds: wSec,
          blackSeconds: bSec,
          durationMinutes: newDur,
          timestamp: Date.now()
        });
      }
    } catch {}

    // Save to server
    try {
      await chessApi.syncMatchClock(mId, {
        addMinutes: minutesToAdd
      });
      toast.success(`+${minutesToAdd}m added to Match #${match.matchNumber || match.matchId}! ⏱️`);
      await loadData(true);
    } catch (err) {
      toast.error('Failed to increase match time.');
    }
  };

  const handleOpenTimeModal = (match) => {
    setSelectedMatchForTime(match);
    setCustomDurationMinutes(match.durationMinutes || 10);
    setTimeModalOpen(true);
  };

  const handleSaveCustomDuration = async (e) => {
    e.preventDefault();
    if (!selectedMatchForTime) return;
    setSavingTime(true);
    const mId = selectedMatchForTime._id || selectedMatchForTime.matchId;
    const dur = Math.max(1, Number(customDurationMinutes) || 10);
    const totalSec = dur * 60;

    // Optimistic update
    setMatches((prev) =>
      (prev || []).filter(Boolean).map((m) =>
        m && ((m?._id && m?._id === mId) || (m?.matchId && m?.matchId === mId))
          ? {
              ...m,
              durationMinutes: dur,
              whiteTimeRemaining: totalSec,
              blackTimeRemaining: totalSec,
              lastClockUpdate: new Date()
            }
          : m
      )
    );

    // Broadcast
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('chess_tournament_clock');
        bc.postMessage({
          matchId: mId,
          durationMinutes: dur,
          whiteSeconds: totalSec,
          blackSeconds: totalSec,
          timestamp: Date.now()
        });
        bc.close();
      }
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chess:turn_switch', {
          matchId: mId,
          durationMinutes: dur,
          whiteSeconds: totalSec,
          blackSeconds: totalSec,
          timestamp: Date.now()
        });
      }
    } catch {}

    try {
      await chessApi.syncMatchClock(mId, {
        durationMinutes: dur,
        whiteTimeRemaining: totalSec,
        blackTimeRemaining: totalSec
      });
      toast.success(`Match #${selectedMatchForTime.matchNumber || selectedMatchForTime.matchId} duration set to ${dur} minutes! ⏱️`);
      setTimeModalOpen(false);
      await loadData(true);
    } catch (err) {
      toast.error('Failed to update match duration.');
    } finally {
      setSavingTime(false);
    }
  };

  // Dedicated Restart Match Action
  const handleRestartMatch = async (match) => {
    if (!match) return;
    const mId = match._id || match.matchId;
    const p1Name = match.player1?.fullName || 'Player 1';
    const p2Name = match.player2?.fullName || 'Player 2';

    const confirmed = await confirm({
      title: 'Restart Chess Match?',
      message: `Are you sure you want to RESTART Match ${match.matchId} (${p1Name} vs ${p2Name})?\n\nThis will reset both player timers to initial ${(match.durationMinutes || 10)}:00, reset moves to 0, reset active turn to White, and clear any declared winner. Both player phones and spectator screens will reset instantly.`,
      confirmText: 'Restart Match',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setRestartingMatchId(mId);
    try {
      const initialSec = (match.durationMinutes || 10) * 60;
      const resetObj = {
        status: 'scheduled',
        winner: null,
        winnerPlayer: null,
        resultType: null,
        activeTurn: 'white',
        isClockRunning: false,
        whiteTimeRemaining: initialSec,
        blackTimeRemaining: initialSec,
        movesCount: 0
      };

      setMatches((prev) =>
        (prev || []).filter(Boolean).map((m) =>
          ((m?._id && m._id === mId) || (m?.matchId && m.matchId === mId)) ? { ...m, ...resetObj } : m
        )
      );

      setMatchModalMatch((prev) =>
        prev && ((prev?._id && prev._id === mId) || (prev?.matchId && prev.matchId === mId))
          ? { ...prev, ...resetObj }
          : prev
      );

      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        try {
          const bc = new BroadcastChannel('chess_tournament_clock');
          bc.postMessage({
            matchId: mId,
            action: 'restart',
            activeTurn: 'white',
            whiteSeconds: initialSec,
            blackSeconds: initialSec,
            isClockRunning: false,
            movesCount: 0
          });
          bc.close();
        } catch {}
      }

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chess:turn_switch', {
          matchId: mId,
          activeTurn: 'white',
          whiteSeconds: initialSec,
          blackSeconds: initialSec,
          isClockRunning: false,
          movesCount: 0
        });
      }

      const res = await chessApi.restartMatch(mId);
      if (res.success) {
        toast.success(`Match ${match.matchId} restarted successfully!`);
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to restart match.');
      }
    } catch (err) {
      toast.error(err.message || 'Error restarting match.');
    } finally {
      setRestartingMatchId(null);
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
        setMatches((prev) => prev.filter((m) => m && m._id !== id && m.matchId !== id));
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

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
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
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Match & Round Management
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            {/* Create Custom Pairing Button */}
            <button
              onClick={() => {
                setManualRoundName(`Round ${selectedRound}`);
                setShowCreateModal(true);
              }}
              className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Match</span>
            </button>

            {/* Round Generation Controls (Admin creates and names rounds like Round 1, Semi-Final, Final, Grand Finals) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
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
                className="flex-1 sm:w-60 bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none shadow-xs transition-colors"
                title="Type any round name: Final, Grand Finals, Round 1, Semi-Final..."
              />

              <button
                onClick={handleGeneratePairings}
                disabled={generating}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-3.5 sm:px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                title={`Generate pairings for ${selectedRoundName || 'selected round'}`}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tournament Stage Info Strip (Adapts based on entries, like Carrom) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#FAF8F3] dark:bg-[#1A1A18] border border-[#E2DDD5] dark:border-[#282826] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#77736B] dark:text-[#8E8E93]">
              Dynamic Stage Plan:
            </span>
            <span className="font-serif font-bold text-[#171715] dark:text-[#FAF8F3] text-sm">
              {dynamicProgression.suggestedName}
            </span>
            <span className="text-[11px] font-mono text-[#8C867A] dark:text-[#8E8E93] bg-[#EFEAE1]/70 dark:bg-[#252522] px-2 py-0.5 rounded-md border border-[#D5CFC5]/50 dark:border-[#383733]">
              {dynamicProgression.activePlayersCount} Active Players • {dynamicProgression.realMatches} Match{dynamicProgression.realMatches !== 1 ? 'es' : ''}
              {dynamicProgression.byes > 0 ? ' + 1 BYE Nomination' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
              {dynamicProgression.byes > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Odd player gets nominated to next round (BYE)
                </span>
              ) : (
                <span>Even contestant draw • No byes needed</span>
              )}
            </span>
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
            onPauseResumeMatch={handlePauseResumeMatch}
            onSwitchTurnMatch={handleAdminSwitchTurn}
            onQuickAddTime={handleQuickAddTime}
            onOpenTimeModal={handleOpenTimeModal}
            onOpenMatchModal={(m) => setMatchModalMatch(m)}
            onRestartMatch={handleRestartMatch}
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
                matches.filter(Boolean).map((m) => {
                  const p1 = m?.player1?.fullName || (m?.isBye ? (m?.byePlayer?.fullName || 'Player') : 'TBD');
                  const p2 = m?.player2?.fullName || (m?.isBye ? 'BYE' : 'TBD');
                  const isLive = m?.status === 'live';
                  const isScheduled = m?.status === 'scheduled';
                  const isCompleted = m?.status === 'completed';
                  const isStartingThis = startingMatchId === m?._id;
                  const isDeletingThis = deletingMatchId === m?._id;
                  const isSelected = selectedMatchIds.includes(m?._id);

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
                            m.isBye
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                              : isLive
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                              : isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                              : 'bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#4E4C47] dark:text-[#8E8E93] border border-[#D5CFC5] dark:border-[#262624]'
                          }`}
                        >
                          {m.isBye ? (
                            <span className="inline-flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              <span>BYE NOMINATION</span>
                            </span>
                          ) : (
                            <>
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-ping" />}
                              {m.status}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-serif font-bold text-xs">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800/60">
                            👑 {m.isBye ? `${p1} — Nominated to Next Round (BYE)` : m.winner === 'player1' ? p1 : m.winner === 'player2' ? p2 : 'Draw'}
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

                        {/* Pause / Resume Button for Live Matches */}
                        {isLive && (
                          <button
                            onClick={() => handlePauseResumeMatch(m)}
                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              m.isClockRunning !== false
                                ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-black'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                            }`}
                            title={m.isClockRunning !== false ? 'Pause match timer' : 'Resume match timer'}
                          >
                            {m.isClockRunning !== false ? (
                              <>
                                <Pause className="w-3 h-3 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>Resume</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Switch Turn Button (Admin can tap to pass turn!) */}
                        {isLive && (
                          <button
                            onClick={() => handleAdminSwitchTurn(m)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            title={`Tap to switch turn from ${m.activeTurn || 'white'} to ${m.activeTurn === 'black' ? 'WHITE' : 'BLACK'}`}
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Switch ({m.activeTurn === 'black' ? 'White' : 'Black'})</span>
                          </button>
                        )}

                        {/* Quick Time Extension & Duration Presets (like Carrom) */}
                        {isLive && (
                          <div className="inline-flex items-center rounded-lg border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] p-0.5 gap-0.5">
                            <button
                              onClick={() => handleQuickAddTime(m, 1)}
                              className="px-1.5 py-1 rounded text-[10px] font-mono font-bold text-[#171715] dark:text-[#FAF8F3] hover:bg-white dark:hover:bg-[#282826] transition-colors cursor-pointer"
                              title="Add 1 minute to both clocks"
                            >
                              +1m
                            </button>
                            <button
                              onClick={() => handleQuickAddTime(m, 2)}
                              className="px-1.5 py-1 rounded text-[10px] font-mono font-bold text-[#171715] dark:text-[#FAF8F3] hover:bg-white dark:hover:bg-[#282826] transition-colors cursor-pointer"
                              title="Add 2 minutes to both clocks"
                            >
                              +2m
                            </button>
                            <button
                              onClick={() => handleQuickAddTime(m, 5)}
                              className="px-1.5 py-1 rounded text-[10px] font-mono font-bold text-[#171715] dark:text-[#FAF8F3] hover:bg-white dark:hover:bg-[#282826] transition-colors cursor-pointer"
                              title="Add 5 minutes to both clocks"
                            >
                              +5m
                            </button>
                            <button
                              onClick={() => handleOpenTimeModal(m)}
                              className="px-1.5 py-1 rounded text-[10px] font-mono font-bold text-[#77736B] dark:text-[#A8A49C] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Set Custom Match Duration / Time"
                            >
                              <Clock className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* For scheduled matches, allow setting match duration before start */}
                        {!isLive && !isCompleted && !m.isBye && (
                          <button
                            onClick={() => handleOpenTimeModal(m)}
                            className="px-2 py-1 rounded-lg border border-[#D5CFC5] dark:border-[#262624] text-[10px] font-mono font-semibold text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] inline-flex items-center gap-1 cursor-pointer"
                            title="Set match duration"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{m.durationMinutes || 10}m</span>
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

                        {/* Dedicated Restart Button on Live/Completed rows */}
                        {(isLive || isCompleted) && !m.isBye && (
                          <button
                            onClick={() => handleRestartMatch(m)}
                            disabled={restartingMatchId === (m?._id || m?.matchId)}
                            className="bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            title={`Restart match ${m.matchId} (reset clocks & score)`}
                          >
                            {restartingMatchId === (m?._id || m?.matchId) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            <span>Restart</span>
                          </button>
                        )}

                        {/* Open Match Modal */}
                        <button
                          onClick={() => setMatchModalMatch(m)}
                          className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#D5CFC5]/50 dark:hover:bg-[#2A2A28] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Open Match Control & Arbiter Modal"
                        >
                          <span>Open ↗</span>
                        </button>

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

                  {/* Dynamic Stage Quick Fill Button */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                      Dynamic Stage:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setManualRoundName(dynamicProgression.suggestedName);
                        setManualRound(dynamicProgression.targetRound);
                      }}
                      className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-lg border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#1A1A18] hover:bg-[#171715] hover:text-white dark:hover:bg-[#FAF8F3] dark:hover:text-[#0D0D0D] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{dynamicProgression.suggestedName} (Round {dynamicProgression.targetRound})</span>
                    </button>
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
                      {(players || []).filter(Boolean).map((p, pIdx) => (
                        <option key={p?._id || p?.playerId || pIdx} value={p?._id || p?.playerId}>
                          {p?.fullName || 'Player'} ({p?.playerId || '-'} • {p?.department || '-'})
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
                      {(players || []).filter(Boolean).map((p, pIdx) => (
                        <option key={p?._id || p?.playerId || pIdx} value={p?._id || p?.playerId}>
                          {p?.fullName || 'Player'} ({p?.playerId || '-'} • {p?.department || '-'})
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

      {/* ADJUST MATCH TIME / DURATION MODAL (Like Carrom) */}
      {timeModalOpen && selectedMatchForTime && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all">
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3]">
            <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    MATCH TIMER CONTROL
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                    Set Match Time Duration
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTimeModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match info pill */}
            <div className="p-3.5 rounded-xl bg-[#EFEAE1]/60 dark:bg-[#1D1D1B] border border-[#D5CFC5]/80 dark:border-[#262624] text-xs space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  Match #{selectedMatchForTime.matchNumber || selectedMatchForTime.matchId} • {selectedMatchForTime.roundName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedMatchForTime.status === 'live' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}>
                  {selectedMatchForTime.status}
                </span>
              </div>
              <div className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                {selectedMatchForTime.player1?.fullName || 'White'} vs {selectedMatchForTime.player2?.fullName || 'Black'}
              </div>
            </div>

            <form onSubmit={handleSaveCustomDuration} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] uppercase font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>How much time will this match take?</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {customDurationMinutes} Minutes
                  </span>
                </div>

                <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] mb-3">
                  Select a duration preset or enter custom minutes for each competitor&apos;s rapid chess clock:
                </p>

                {/* Quick preset buttons (like Carrom) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[5, 10, 15, 20, 25, 30].map((mVal) => {
                    const isSelected = Number(customDurationMinutes) === mVal;
                    return (
                      <button
                        key={mVal}
                        type="button"
                        onClick={() => setCustomDurationMinutes(mVal)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] shadow-xs scale-[1.02]'
                            : 'bg-[#EFEAE1]/60 dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3] hover:border-[#171715]'
                        }`}
                      >
                        <span className="text-sm">{mVal}m</span>
                        <span className="text-[9px] opacity-70 uppercase">min</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Minutes Input */}
                <div className="relative pt-3">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDurationMinutes}
                    onChange={(e) => setCustomDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="Enter custom minutes"
                    className="w-full h-11 bg-white dark:bg-[#1D1D1B] px-4 pr-20 text-sm font-mono font-bold text-[#171715] dark:text-[#FAF8F3] rounded-xl border border-[#D5CFC5] dark:border-[#262624] focus:outline-none focus:border-amber-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pt-3 text-xs font-mono font-bold text-[#77736B] pointer-events-none">
                    MINUTES
                  </span>
                </div>
              </div>

              {/* If match is live, note quick add option */}
              {selectedMatchForTime.status === 'live' && (
                <div className="pt-2 border-t border-[#D5CFC5] dark:border-[#262624]">
                  <span className="text-[11px] font-mono text-[#77736B] block mb-1.5">
                    Or instantly extend running clocks right now:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickAddTime(selectedMatchForTime, 1);
                        setTimeModalOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg border border-[#D5CFC5] dark:border-[#262624] font-mono text-xs font-bold hover:bg-[#EFEAE1] dark:hover:bg-[#20201E]"
                    >
                      +1 Min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickAddTime(selectedMatchForTime, 2);
                        setTimeModalOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg border border-[#D5CFC5] dark:border-[#262624] font-mono text-xs font-bold hover:bg-[#EFEAE1] dark:hover:bg-[#20201E]"
                    >
                      +2 Min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickAddTime(selectedMatchForTime, 5);
                        setTimeModalOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg border border-[#D5CFC5] dark:border-[#262624] font-mono text-xs font-bold hover:bg-[#EFEAE1] dark:hover:bg-[#20201E]"
                    >
                      +5 Min
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTimeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CFC5] dark:border-[#262624] text-xs font-mono text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTime}
                  className="bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-white dark:text-[#0D0D0D] px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingTime ? 'Saving...' : `Save Duration (${customDurationMinutes}m)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH DETAIL & ARBITER CONTROL MODAL */}
      {matchModalMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D5CFC5] dark:border-[#262624]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3] tracking-wider">
                      {matchModalMatch.matchId}
                    </span>
                    <span>•</span>
                    <span className="text-[#77736B] dark:text-[#8E8E93]">
                      {matchModalMatch.roundName || `Round ${matchModalMatch.round}`}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3] leading-tight">
                    Match Dossier & Arbiter Desk
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  matchModalMatch.status === 'live'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 inline-flex items-center gap-1.5'
                    : matchModalMatch.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-[#EFEAE1] dark:bg-[#1E1E1C] text-neutral-600 dark:text-neutral-300 border border-[#D5CFC5] dark:border-neutral-700'
                }`}>
                  {matchModalMatch.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                  {matchModalMatch.status}
                </span>
                <button
                  type="button"
                  onClick={() => setMatchModalMatch(null)}
                  className="p-1.5 rounded-full hover:bg-[#EFEAE1] dark:hover:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93] cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Competitor Arena Cards & Live Clocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* White Competitor */}
              <div className={`p-4 rounded-2xl border transition-all ${
                matchModalMatch.status === 'live' && matchModalMatch.activeTurn === 'white'
                  ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-[#1A1A18] border-[#D5CFC5] dark:border-[#2A2A28]'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-mono pb-2 mb-2 border-b border-[#D5CFC5]/50 dark:border-[#262624]">
                  <span className="font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <span>♔</span> White Pieces
                  </span>
                  {matchModalMatch.status === 'live' && matchModalMatch.activeTurn === 'white' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] animate-pulse">
                      Active Turn
                    </span>
                  )}
                </div>
                <div className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3] truncate">
                  {matchModalMatch.player1?.fullName || matchModalMatch.byePlayer?.fullName || 'Player 1 (White)'}
                </div>
                <div className="text-xs text-[#77736B] dark:text-[#8E8E93] truncate">
                  {matchModalMatch.player1?.department || 'Department TBD'}
                </div>

                {/* White Clock Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#121210] border border-[#D5CFC5] dark:border-[#2A2A28] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#77736B] block">Time Remaining</span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[#171715] dark:text-[#FAF8F3]">
                    {formatClockTime(matchModalMatch.whiteTimeRemaining ?? ((matchModalMatch.durationMinutes || 10) * 60))}
                  </span>
                </div>
              </div>

              {/* Black Competitor */}
              <div className={`p-4 rounded-2xl border transition-all ${
                matchModalMatch.status === 'live' && matchModalMatch.activeTurn === 'black'
                  ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-[#1A1A18] border-[#D5CFC5] dark:border-[#2A2A28]'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-mono pb-2 mb-2 border-b border-[#D5CFC5]/50 dark:border-[#262624]">
                  <span className="font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <span>♚</span> Black Pieces
                  </span>
                  {matchModalMatch.status === 'live' && matchModalMatch.activeTurn === 'black' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] animate-pulse">
                      Active Turn
                    </span>
                  )}
                </div>
                <div className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3] truncate">
                  {matchModalMatch.player2?.fullName || (matchModalMatch.isBye ? 'BYE' : 'Player 2 (Black)')}
                </div>
                <div className="text-xs text-[#77736B] dark:text-[#8E8E93] truncate">
                  {matchModalMatch.player2?.department || (matchModalMatch.isBye ? 'Automatic Advance' : 'Department TBD')}
                </div>

                {/* Black Clock Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#121210] border border-[#D5CFC5] dark:border-[#2A2A28] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#77736B] block">Time Remaining</span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-[#171715] dark:text-[#FAF8F3]">
                    {formatClockTime(matchModalMatch.blackTimeRemaining ?? ((matchModalMatch.durationMinutes || 10) * 60))}
                  </span>
                </div>
              </div>
            </div>

            {/* Arbiter Actions */}
            <div className="space-y-3 pt-2 border-t border-[#D5CFC5] dark:border-[#262624]">
              <div className="text-[11px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93]">
                Game Control & Arbiter Actions
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Start / Pause / Resume */}
                {matchModalMatch.status === 'scheduled' && !matchModalMatch.isBye ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleStartMatch(matchModalMatch._id || matchModalMatch.matchId);
                    }}
                    disabled={startingMatchId === (matchModalMatch._id || matchModalMatch.matchId)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-900 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current text-emerald-400" />
                    <span>Start Match</span>
                  </button>
                ) : matchModalMatch.status === 'live' ? (
                  <button
                    type="button"
                    onClick={() => handlePauseResumeMatch(matchModalMatch)}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all ${
                      matchModalMatch.isClockRunning !== false
                        ? 'bg-neutral-800 text-white hover:bg-black'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                    }`}
                  >
                    {matchModalMatch.isClockRunning !== false ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause Timer</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Resume Timer</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 font-mono text-xs text-center font-bold">
                    Match Completed
                  </div>
                )}

                {/* Switch Turn Button */}
                {matchModalMatch.status === 'live' ? (
                  <button
                    type="button"
                    onClick={() => handleAdminSwitchTurn(matchModalMatch)}
                    className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Switch ({matchModalMatch.activeTurn === 'black' ? 'White' : 'Black'})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 font-mono text-xs font-semibold cursor-not-allowed text-center"
                  >
                    Turn Inactive
                  </button>
                )}

                {/* Dedicated Restart Button */}
                <button
                  type="button"
                  onClick={() => handleRestartMatch(matchModalMatch)}
                  disabled={restartingMatchId === (matchModalMatch._id || matchModalMatch.matchId)}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  {restartingMatchId === (matchModalMatch._id || matchModalMatch.matchId) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  <span>Restart Match</span>
                </button>
              </div>

              {/* Quick Time Extension & Duration Presets */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 bg-[#EFEAE1]/60 dark:bg-[#1A1A18] p-3 rounded-2xl border border-[#D5CFC5]/70 dark:border-[#262624]">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">Quick Time Add:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAddTime(matchModalMatch, 1)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#333] font-mono text-xs font-bold hover:border-amber-600 transition-colors cursor-pointer"
                  >
                    +1 Min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddTime(matchModalMatch, 2)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#333] font-mono text-xs font-bold hover:border-amber-600 transition-colors cursor-pointer"
                  >
                    +2 Min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddTime(matchModalMatch, 5)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#333] font-mono text-xs font-bold hover:border-amber-600 transition-colors cursor-pointer"
                  >
                    +5 Min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenTimeModal(matchModalMatch);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#333] font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Custom</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex flex-wrap items-center justify-between gap-3">
              <a
                href={`/chess/matches/${matchModalMatch._id || matchModalMatch.matchId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Open Full Match View ↗</span>
              </a>

              <div className="flex items-center gap-2">
                {!matchModalMatch.isBye && (
                  <button
                    type="button"
                    onClick={() => openResultModal(matchModalMatch)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{matchModalMatch.status === 'completed' ? 'Edit Winner' : 'Declare Winner'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMatchModalMatch(null)}
                  className="px-4 py-2 rounded-xl border border-[#D5CFC5] dark:border-[#262624] text-xs font-mono text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
