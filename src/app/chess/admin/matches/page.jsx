'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { ChessBracketView } from '@/components/chess/ChessBracketView';
import { Swords, Play, Pause, CheckCircle2, XCircle, Trophy, Loader2, Plus, Minus, Trash2, Clock, ShieldCheck, Zap, CheckSquare, Square, ChevronDown, X, LayoutGrid, List, Crown, Sparkles, ArrowRightLeft, RotateCcw, Timer, Save, CalendarClock, Calendar, ArrowRight, Shield } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Reschedule & Restart Match Modal (Upper action button & modal)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState('');
  const [rescheduleScope, setRescheduleScope] = useState('single'); // 'single' | 'round'
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleBoard, setRescheduleBoard] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState(10);
  const [rescheduling, setRescheduling] = useState(false);

  // Round Selector Deletion Modal
  const [showDeleteRoundModal, setShowDeleteRoundModal] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState(null);

  // Multi-Board Arena Control States (Just like Carrom)
  const [boards, setBoards] = useState([]);
  const [addBoardModalOpen, setAddBoardModalOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState({
    boardNumber: '',
    name: '',
    adminInCharge: ''
  });
  const [launchOnBoard, setLaunchOnBoard] = useState(null);
  const [stoppingBoardId, setStoppingBoardId] = useState(null);
  const [boardSelectMatch, setBoardSelectMatch] = useState(null);
  const [launchingMatchId, setLaunchingMatchId] = useState(null);

  // Bulletproof Player Display Name Resolver (Handles populated objects, string IDs, fullName/name fallbacks)
  const getPlayerDisplayName = (playerOrId, fallback = 'Player') => {
    if (!playerOrId) return fallback;
    if (typeof playerOrId === 'object') {
      if (playerOrId.fullName && playerOrId.fullName.trim()) return playerOrId.fullName.trim();
      if (playerOrId.name && playerOrId.name.trim()) return playerOrId.name.trim();
      if (playerOrId.username && playerOrId.username.trim()) return playerOrId.username.trim();
      const id = (playerOrId._id || playerOrId.playerId || playerOrId.id)?.toString();
      if (id && Array.isArray(players) && players.length > 0) {
        const found = players.find((p) => p && ((p._id && p._id.toString() === id) || (p.playerId && p.playerId.toString() === id)));
        if (found?.fullName && found.fullName.trim()) return found.fullName.trim();
        if (found?.name && found.name.trim()) return found.name.trim();
      }
    } else if (typeof playerOrId === 'string') {
      if (Array.isArray(players) && players.length > 0) {
        const found = players.find((p) => p && ((p._id && p._id.toString() === playerOrId) || (p.playerId && p.playerId.toString() === playerOrId)));
        if (found?.fullName && found.fullName.trim()) return found.fullName.trim();
        if (found?.name && found.name.trim()) return found.name.trim();
      }
      return playerOrId;
    }
    return fallback;
  };

  const getPlayerDeptName = (playerOrId, fallback = '') => {
    if (!playerOrId) return fallback;
    if (typeof playerOrId === 'object') {
      if (playerOrId.department && playerOrId.department.trim()) return playerOrId.department.trim();
      const id = (playerOrId._id || playerOrId.playerId || playerOrId.id)?.toString();
      if (id && Array.isArray(players) && players.length > 0) {
        const found = players.find((p) => p && ((p._id && p._id.toString() === id) || (p.playerId && p.playerId.toString() === id)));
        if (found?.department) return found.department;
      }
    } else if (typeof playerOrId === 'string' && Array.isArray(players) && players.length > 0) {
      const found = players.find((p) => p && ((p._id && p._id.toString() === playerOrId) || (p.playerId && p.playerId.toString() === playerOrId)));
      if (found?.department) return found.department;
    }
    return fallback;
  };

  // Lock body scroll and enable Escape key to close whenever ANY modal is open
  const isAnyModalOpen = Boolean(
    matchModalMatch || showRescheduleModal || showCreateModal || resultModalMatch || timeModalOpen || showDeleteRoundModal || addBoardModalOpen || Boolean(launchOnBoard) || Boolean(boardSelectMatch)
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMatchModalMatch(null);
          setShowRescheduleModal(false);
          setShowCreateModal(false);
          setResultModalMatch(null);
          setTimeModalOpen(false);
          setShowDeleteRoundModal(false);
          setAddBoardModalOpen(false);
          setLaunchOnBoard(null);
          setBoardSelectMatch(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isAnyModalOpen]);

  async function loadData(silent = false) {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [matchesRes, playersRes, boardsRes] = await Promise.allSettled([
        chessApi.getAdminMatches(),
        chessApi.getAdminPlayers(),
        chessApi.getAdminBoards()
      ]);

      if (matchesRes.status === 'fulfilled' && matchesRes.value?.success) {
        const freshMatches = matchesRes.value.data || [];
        setMatches((prevMatches) => {
          return freshMatches.map((fresh) => {
            const existing = (prevMatches || []).find(
              (p) => p && (p._id === fresh._id || p.matchId === fresh.matchId)
            );
            if (fresh.status === 'live' && fresh.isClockRunning !== false) {
              const turn = fresh.activeTurn || existing?.activeTurn || 'white';
              let w = typeof fresh.whiteTimeRemaining === 'number' ? fresh.whiteTimeRemaining : 600;
              let b = typeof fresh.blackTimeRemaining === 'number' ? fresh.blackTimeRemaining : 600;
              if (fresh.lastClockUpdate) {
                const elapsed = Math.max(0, Math.floor((Date.now() - new Date(fresh.lastClockUpdate).getTime()) / 1000));
                if (turn === 'white') w = Math.max(0, w - elapsed);
                else if (turn === 'black') b = Math.max(0, b - elapsed);
              }
              if (existing && existing.status === 'live' && existing.isClockRunning !== false) {
                if (turn === 'white' && Math.abs((existing.whiteTimeRemaining || 0) - w) <= 2) {
                  w = existing.whiteTimeRemaining;
                }
                if (turn === 'black' && Math.abs((existing.blackTimeRemaining || 0) - b) <= 2) {
                  b = existing.blackTimeRemaining;
                }
              }
              return {
                ...fresh,
                whiteTimeRemaining: w,
                blackTimeRemaining: b
              };
            }
            return fresh;
          });
        });

        // Keep active result modal synced with fresh data
        setResultModalMatch((prev) => {
          if (!prev) return null;
          return freshMatches.find(m => (m?._id === prev?._id || m?.matchId === prev?.matchId)) || prev;
        });

        // Keep match detail modal synced with fresh data without jumping
        setMatchModalMatch((prev) => {
          if (!prev) return null;
          const fresh = freshMatches.find((m) => m?._id === prev?._id || m?.matchId === prev?.matchId);
          if (!fresh) return prev;
          if (fresh.status === 'live' && fresh.isClockRunning !== false) {
            const turn = fresh.activeTurn || prev.activeTurn || 'white';
            let w = typeof fresh.whiteTimeRemaining === 'number' ? fresh.whiteTimeRemaining : (prev.whiteTimeRemaining || 600);
            let b = typeof fresh.blackTimeRemaining === 'number' ? fresh.blackTimeRemaining : (prev.blackTimeRemaining || 600);
            if (fresh.lastClockUpdate) {
              const elapsed = Math.max(0, Math.floor((Date.now() - new Date(fresh.lastClockUpdate).getTime()) / 1000));
              if (turn === 'white') w = Math.max(0, w - elapsed);
              else if (turn === 'black') b = Math.max(0, b - elapsed);
            }
            if (turn === 'white' && Math.abs((prev.whiteTimeRemaining || 0) - w) <= 2) {
              w = prev.whiteTimeRemaining;
            }
            if (turn === 'black' && Math.abs((prev.blackTimeRemaining || 0) - b) <= 2) {
              b = prev.blackTimeRemaining;
            }
            return {
              ...fresh,
              whiteTimeRemaining: w,
              blackTimeRemaining: b
            };
          }
          return fresh;
        });
      }
      if (playersRes.status === 'fulfilled' && playersRes.value?.success) {
        setPlayers(playersRes.value.data || []);
      }
      if (boardsRes.status === 'fulfilled' && boardsRes.value?.success) {
        setBoards(boardsRes.value.boards || []);
      }
    } catch (err) {
      console.error('Error loading matches, players & boards:', err);
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

  // 1-second live countdown ticker for all running matches (bracket view + match dossier modal)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // 1. Tick active live matches in bracket / table view
      setMatches((prevMatches) => {
        if (!prevMatches || prevMatches.length === 0) return prevMatches;
        let hasActive = false;
        const next = prevMatches.map((m) => {
          if (!m || m.status !== 'live' || m.isClockRunning === false) return m;
          hasActive = true;
          const turn = m.activeTurn && m.activeTurn !== 'none' ? m.activeTurn : 'white';
          if (turn === 'white') {
            const cur = typeof m.whiteTimeRemaining === 'number' ? m.whiteTimeRemaining : ((m.durationMinutes || 10) * 60);
            return { ...m, whiteTimeRemaining: Math.max(0, cur - 1) };
          } else {
            const cur = typeof m.blackTimeRemaining === 'number' ? m.blackTimeRemaining : ((m.durationMinutes || 10) * 60);
            return { ...m, blackTimeRemaining: Math.max(0, cur - 1) };
          }
        });
        return hasActive ? next : prevMatches;
      });

      // 2. Tick matchModalMatch if open and clock is running
      setMatchModalMatch((prev) => {
        if (!prev || prev.status !== 'live' || prev.isClockRunning === false) return prev;
        const turn = prev.activeTurn && prev.activeTurn !== 'none' ? prev.activeTurn : 'white';
        if (turn === 'white') {
          const cur = typeof prev.whiteTimeRemaining === 'number' ? prev.whiteTimeRemaining : ((prev.durationMinutes || 10) * 60);
          return { ...prev, whiteTimeRemaining: Math.max(0, cur - 1) };
        } else {
          const cur = typeof prev.blackTimeRemaining === 'number' ? prev.blackTimeRemaining : ((prev.durationMinutes || 10) * 60);
          return { ...prev, blackTimeRemaining: Math.max(0, cur - 1) };
        }
      });

      // 3. Tick live matches on boards
      setBoards((prevBoards) => {
        if (!prevBoards || prevBoards.length === 0) return prevBoards;
        let hasLive = false;
        const next = prevBoards.map((b) => {
          if (!b || b.status !== 'live' || !b.currentMatch || b.currentMatch.isClockRunning === false) return b;
          hasLive = true;
          const m = b.currentMatch;
          const turn = m.activeTurn && m.activeTurn !== 'none' ? m.activeTurn : 'white';
          if (turn === 'white') {
            const cur = typeof m.whiteTimeRemaining === 'number' ? m.whiteTimeRemaining : ((m.durationMinutes || 10) * 60);
            return {
              ...b,
              currentMatch: {
                ...m,
                whiteTimeRemaining: Math.max(0, cur - 1)
              }
            };
          } else {
            const cur = typeof m.blackTimeRemaining === 'number' ? m.blackTimeRemaining : ((m.durationMinutes || 10) * 60);
            return {
              ...b,
              currentMatch: {
                ...m,
                blackTimeRemaining: Math.max(0, cur - 1)
              }
            };
          }
        });
        return hasLive ? next : prevBoards;
      });
    }, 1000);

    return () => clearInterval(tickInterval);
  }, []);

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
      if (data?.type === 'match_created' || data?.type === 'match_started' || data?.type === 'result_submitted' || data?.type === 'board_updated') {
        loadData(true);
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

  // Active stages dynamically computed from matches
  const activeStages = useMemo(() => {
    const stageMap = new Map();
    (matches || []).forEach((m) => {
      const r = m.round || 1;
      const name = m.roundName || `Round ${r}`;
      if (!stageMap.has(r)) {
        stageMap.set(r, { round: r, name, count: 0 });
      }
      stageMap.get(r).count++;
    });
    return Array.from(stageMap.values()).sort((a, b) => a.round - b.round);
  }, [matches]);

  // Delete a specific tournament round / stage
  const handleDeleteStage = async (roundNumber, roundName, count) => {
    const stageTitle = roundName || `Round ${roundNumber}`;
    const matchCount = count !== undefined ? count : (matches.filter((m) => m.round === roundNumber).length);
    const isConfirmed = await confirm({
      title: `Delete ${stageTitle}?`,
      message: `Are you sure you want to delete ${stageTitle}? This will permanently remove all ${matchCount} match fixture(s) in this round and automatically recalculate tournament standings.`,
      confirmText: `Delete ${stageTitle}`,
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setDeletingRound(true);
    try {
      const res = await chessApi.deleteRound(roundNumber, roundName);
      if (res.success) {
        toast.success(res.message || `${stageTitle} deleted successfully.`);
        setShowDeleteRoundModal(false);
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

  // Header "Delete Round" action: opens round selector modal or deletes if single round
  const handleDeleteRound = async () => {
    if (activeStages.length === 0) {
      toast.info('No active tournament rounds exist to delete.');
      return;
    }
    if (activeStages.length === 1) {
      const single = activeStages[0];
      await handleDeleteStage(single.round, single.name, single.count);
      return;
    }
    // Multiple rounds: preselect matching round or latest round and open modal
    const matched = activeStages.find((s) => s.round === selectedRound || s.name.toLowerCase() === selectedRoundName.toLowerCase());
    setRoundToDelete(matched || activeStages[activeStages.length - 1]);
    setShowDeleteRoundModal(true);
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

  // Multi-Board Management Handlers
  const handleAddBoard = async (e) => {
    e.preventDefault();
    try {
      const res = await chessApi.createBoard(newBoardData);
      if (res.success) {
        toast.success(res.message || 'Chess board created successfully!');
        setAddBoardModalOpen(false);
        setNewBoardData({ boardNumber: '', name: '', adminInCharge: '' });
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to create board.');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating board.');
    }
  };

  const handleDeleteBoard = async (board) => {
    const isConfirmed = await confirm({
      title: `Delete ${board.name}?`,
      message: `Are you sure you want to remove Board #${board.boardNumber}? This desk will be removed from the tournament arena.`,
      confirmText: 'Delete Board',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const res = await chessApi.deleteBoard(board._id || board.boardNumber);
      if (res.success) {
        toast.success(res.message || `${board.name} removed successfully.`);
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to delete board.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting board.');
    }
  };

  const handleLaunchMatchOnBoard = async (board, match) => {
    if (!board || !match) return;
    setLaunchingMatchId(match._id || match.matchId);
    try {
      const res = await chessApi.launchMatchOnBoard(board._id || board.boardNumber, match._id || match.matchId);
      if (res.success) {
        toast.success(res.message || `Match launched on ${board.name}!`);
        setLaunchOnBoard(null);
        setBoardSelectMatch(null);
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to launch match on board.');
      }
    } catch (err) {
      toast.error(err.message || 'Error launching match on board.');
    } finally {
      setLaunchingMatchId(null);
    }
  };

  const handleStopBoard = async (board) => {
    const isConfirmed = await confirm({
      title: `Vacate ${board.name}?`,
      message: `Are you sure you want to vacate ${board.name}? The active match will be paused and reverted to scheduled status so another match can take this board.`,
      confirmText: 'Vacate Board',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setStoppingBoardId(board._id || board.boardNumber);
    try {
      const res = await chessApi.stopMatchOnBoard(board._id || board.boardNumber);
      if (res.success) {
        toast.success(res.message || `${board.name} vacated.`);
        await loadData(true);
      } else {
        toast.error(res.message || 'Failed to vacate board.');
      }
    } catch (err) {
      toast.error(err.message || 'Error vacating board.');
    } finally {
      setStoppingBoardId(null);
    }
  };

  // Start live match (10-minute clock starts from White's first turn) with board selection
  const handleStartMatch = async (id, boardNumber = null, boardName = null) => {
    const availableBoards = boards.filter((b) => b?.status === 'available');

    // If multiple boards are available and none was specified, prompt arbiter to choose board
    if (!boardNumber && availableBoards.length > 1) {
      const targetMatch = matches.find((m) => m?._id === id || m?.matchId === id);
      if (targetMatch) {
        setBoardSelectMatch(targetMatch);
        return;
      }
    }

    const targetBoard = boardNumber
      ? boards.find((b) => b.boardNumber === boardNumber)
      : (availableBoards[0] || boards[0]);

    const assignedNum = boardNumber || targetBoard?.boardNumber || 1;
    const assignedTitle = boardName || targetBoard?.name || `Chess Board ${assignedNum}`;

    setStartingMatchId(id);
    try {
      const res = await chessApi.startMatch(id, assignedNum, assignedTitle);
      if (res.success) {
        // Optimistically update local matches state
        setMatches((prev) =>
          (prev || []).filter(Boolean).map((m) =>
            m && ((m?._id && m?._id === id) || (m?.matchId && m?.matchId === id))
              ? {
                  ...m,
                  status: 'live',
                  boardNumber: assignedNum,
                  boardName: assignedTitle,
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

        toast.success(`Match started on ${assignedTitle}! Clock active with White opening turn.`);
        setBoardSelectMatch(null);
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

    setMatchModalMatch((prev) => {
      if (!prev || (prev._id !== mId && prev.matchId !== mId)) return prev;
      return {
        ...prev,
        isClockRunning: nextRunning,
        whiteTimeRemaining: wSec,
        blackTimeRemaining: bSec,
        activeTurn: turn,
        lastClockUpdate: new Date()
      };
    });

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

    setMatchModalMatch((prev) => {
      if (!prev || (prev._id !== mId && prev.matchId !== mId)) return prev;
      return {
        ...prev,
        activeTurn: nextTurn,
        whiteTimeRemaining: wSec,
        blackTimeRemaining: bSec,
        movesCount: nextMoves,
        isClockRunning: true,
        lastClockUpdate: new Date()
      };
    });

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

    setMatchModalMatch((prev) => {
      if (!prev || (prev._id !== mId && prev.matchId !== mId)) return prev;
      return {
        ...prev,
        whiteTimeRemaining: wSec,
        blackTimeRemaining: bSec,
        durationMinutes: newDur,
        lastClockUpdate: new Date()
      };
    });

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

  // Open Reschedule Modal with default or target match
  const openRescheduleModal = (target = null) => {
    const candidate = target || matches.find(m => !m.isBye) || matches[0];
    if (candidate) {
      setRescheduleTargetId(candidate._id || candidate.matchId);
      setRescheduleDuration(candidate.durationMinutes || 10);
      setRescheduleBoard(candidate.boardNumber !== undefined && candidate.boardNumber !== null ? candidate.boardNumber : '');
      if (candidate.scheduledTime) {
        try {
          const d = new Date(candidate.scheduledTime);
          setRescheduleDate(d.toISOString().slice(0, 16));
        } catch {
          setRescheduleDate('');
        }
      } else {
        setRescheduleDate('');
      }
    } else {
      setRescheduleTargetId('');
      setRescheduleDuration(10);
      setRescheduleBoard('');
      setRescheduleDate('');
    }
    setRescheduleScope('single');
    setShowRescheduleModal(true);
  };

  // Submit Reschedule / Restart
  const handleRescheduleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (rescheduleScope === 'single') {
      if (!rescheduleTargetId) {
        toast.error('Please select a match to reschedule.');
        return;
      }
      const targetMatch = matches.find(m => m._id === rescheduleTargetId || m.matchId === rescheduleTargetId);
      if (!targetMatch) {
        toast.error('Match not found.');
        return;
      }

      setRescheduling(true);
      try {
        const payload = {
          action: 'reschedule',
          durationMinutes: Number(rescheduleDuration) || targetMatch.durationMinutes || 10,
          boardNumber: rescheduleBoard !== '' ? Number(rescheduleBoard) : targetMatch.boardNumber,
          scheduledTime: rescheduleDate ? new Date(rescheduleDate).toISOString() : targetMatch.scheduledTime
        };

        const res = await chessApi.rescheduleMatch(targetMatch._id || targetMatch.matchId, payload);
        if (res.success) {
          toast.success(`Match ${targetMatch.matchId} rescheduled and clocks reset successfully!`);
          setShowRescheduleModal(false);
          await loadData(true);
        } else {
          toast.error(res.message || 'Failed to reschedule match.');
        }
      } catch (err) {
        toast.error(err.message || 'Error rescheduling match.');
      } finally {
        setRescheduling(false);
      }
    } else {
      setRescheduling(true);
      try {
        const payload = {
          durationMinutes: Number(rescheduleDuration) || 10,
          scheduledTime: rescheduleDate ? new Date(rescheduleDate).toISOString() : undefined,
          roundName: selectedRoundName
        };

        const res = await chessApi.rescheduleRound(selectedRound, payload);
        if (res.success) {
          toast.success(`All matches in ${selectedRoundName || `Round ${selectedRound}`} rescheduled & clocks reset!`);
          setShowRescheduleModal(false);
          await loadData(true);
        } else {
          toast.error(res.message || 'Failed to reschedule round.');
        }
      } catch (err) {
        toast.error(err.message || 'Error rescheduling round.');
      } finally {
        setRescheduling(false);
      }
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

  // Players already assigned in the manually selected round
  const alreadyAssignedInSelectedRound = useMemo(() => {
    const roundMatches = (matches || []).filter(
      (m) =>
        m.round === manualRound ||
        (manualRoundName && (m.roundName || '').toLowerCase() === manualRoundName.trim().toLowerCase())
    );
    const ids = new Set();
    const names = new Set();
    roundMatches.forEach((m) => {
      [m.player1, m.player2, m.byePlayer].filter(Boolean).forEach((p) => {
        const idStr = (p._id || p.playerId || p).toString();
        ids.add(idStr);
        if (p.fullName) names.add(p.fullName.trim().toLowerCase());
      });
    });
    return { ids, names };
  }, [matches, manualRound, manualRoundName]);

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

    const p1Obj = players.find((p) => (p._id || p.playerId) === manualP1);
    const p2Obj = manualP2 ? players.find((p) => (p._id || p.playerId) === manualP2) : null;
    const p1Name = (p1Obj?.fullName || '').trim().toLowerCase();
    const p2Name = (p2Obj?.fullName || '').trim().toLowerCase();

    if (alreadyAssignedInSelectedRound.ids.has(manualP1) || (p1Name && alreadyAssignedInSelectedRound.names.has(p1Name))) {
      toast.error(`"${p1Obj?.fullName || 'Player 1'}" is already scheduled in this round! A contestant cannot play multiple matches in the same round.`);
      return;
    }

    if (manualP2 && (alreadyAssignedInSelectedRound.ids.has(manualP2) || (p2Name && alreadyAssignedInSelectedRound.names.has(p2Name)))) {
      toast.error(`"${p2Obj?.fullName || 'Player 2'}" is already scheduled in this round! A contestant cannot play multiple matches in the same round.`);
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
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
          {/* Top Row: Title & Badges + Quick Action Controls */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
                  CHESS ARBITER & TOURNAMENT DESK
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Clock className="w-3 h-3" />
                  10:00 Rapid
                </span>
                <span className="text-[10px] font-mono font-bold text-[#77736B] dark:text-[#8E8E93]">
                  • {matches.length} Total Match{matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
                Match & Round Management
              </h1>
            </div>

            {/* Primary Action Buttons: New Match, Reschedule, Delete Round / Reset */}
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
              {/* New Custom Match Button */}
              <button
                type="button"
                onClick={() => {
                  setManualRoundName(`Round ${selectedRound}`);
                  setShowCreateModal(true);
                }}
                className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Custom Match</span>
              </button>

              {/* Reschedule Match Button */}
              <button
                type="button"
                onClick={() => openRescheduleModal()}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Reschedule match date/time, board number, or restart round"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Reschedule Match</span>
              </button>

              {/* Delete Round Button (Available when matches exist) */}
              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteRound}
                  disabled={deletingRound}
                  className="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title={`Delete all matches in ${selectedRoundName || `Round ${selectedRound}`}`}
                >
                  {deletingRound ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Delete Round</span>
                </button>
              )}

              {/* Delete All Rounds Button */}
              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllRounds}
                  disabled={deletingAllRounds}
                  className="bg-neutral-100 dark:bg-neutral-900 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-neutral-300 dark:border-neutral-800 text-neutral-600 hover:text-rose-700 dark:text-neutral-400 dark:hover:text-rose-400 font-semibold px-3 py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Reset & Delete ALL matches in tournament"
                >
                  {deletingAllRounds ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <RotateCcw className="w-4 h-4" />}
                  <span className="hidden sm:inline text-[11px] font-mono">Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row / Toolbar: Stage Pairing Generator Box */}
          <div className="pt-3 border-t border-[#D5CFC5]/60 dark:border-[#262624] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#77736B] dark:text-[#A8A49C] font-mono">
              <span className="font-bold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3]">
                Pairing Stage:
              </span>
              <span>Name any round (e.g. Final, Semi-Final, Round 1) and generate pairings.</span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
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
                placeholder="Stage name (e.g. Final, Round 1)"
                className="flex-1 md:w-56 bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none shadow-xs transition-colors"
                title="Type any round name: Final, Grand Finals, Round 1, Semi-Final..."
              />

              <button
                type="button"
                onClick={handleGeneratePairings}
                disabled={generating}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
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

        {/* MULTI-BOARD CHESS ARENA MANAGEMENT (Simultaneous Multi-Match Arena Desks) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-[#262624]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                  Multi-Board Arena Control
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#383733] text-[#77736B] dark:text-[#8E8E93]">
                  {boards.length} Board{boards.length !== 1 ? 's' : ''} Total • {boards.filter((b) => b.status === 'live').length} Live
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                Chess Boards & Live Arena Desks
              </h2>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93]">
                Arbiters can simultaneously conduct multiple chess games across separate boards with dedicated dual chess clocks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextNum = boards.reduce((max, b) => Math.max(max, b.boardNumber || 0), 0) + 1;
                  setNewBoardData({
                    name: `Chess Board ${nextNum}`,
                    boardNumber: nextNum,
                    adminInCharge: ''
                  });
                  setAddBoardModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold shadow-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Board</span>
              </button>
            </div>
          </div>

          {/* Dynamic Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards?.filter(Boolean).map((b) => {
              const isLive = b?.status === 'live' && b?.currentMatch;
              const currentM = b?.currentMatch;
              const isMaintenance = b?.status === 'maintenance';

              return (
                <div
                  key={b?._id || b?.boardNumber}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isLive
                      ? 'bg-white dark:bg-[#1A1A18] border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : isMaintenance
                      ? 'bg-neutral-100 dark:bg-[#1E1E1C]/60 border-neutral-300 dark:border-neutral-800 opacity-75'
                      : 'bg-white dark:bg-[#1A1A18] border-[#D5CFC5] dark:border-[#262624]'
                  }`}
                >
                  {/* Board Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-[#282826]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F3] dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#383733] text-[#171715] dark:text-[#FAF8F3] shrink-0">
                        BOARD #{String(b.boardNumber).padStart(2, '0')}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] truncate">
                        {b.name}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>LIVE IN PLAY</span>
                        </span>
                      ) : isMaintenance ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60">
                          MAINTENANCE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>AVAILABLE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Board Card Content */}
                  {isLive && currentM ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold truncate">
                          <span>{currentM.matchId || `M#${currentM.matchNumber || 1}`}</span>
                          <span>•</span>
                          <span>{currentM.roundName || 'Round'}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          currentM.activeTurn === 'white' 
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                            : 'bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-900'
                        }`}>
                          {currentM.activeTurn === 'white' ? "White's Turn" : "Black's Turn"}
                        </span>
                      </div>

                      {/* Players and Dual Clocks */}
                      <div className="p-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#151514] border border-[#E2DDD5] dark:border-[#282826] space-y-2">
                        {/* White Player */}
                        <div className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                          currentM.activeTurn === 'white' && currentM.isClockRunning !== false
                            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50'
                            : 'bg-white dark:bg-[#1E1E1C] border border-[#D5CFC5]/40 dark:border-[#383733]/40'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">♔</span>
                            <span className="font-semibold text-xs text-[#171715] dark:text-[#FAF8F3] truncate max-w-[130px]">
                              {getPlayerDisplayName(currentM.player1, 'White Player')}
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            (currentM.whiteTimeRemaining ?? 600) <= 60 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse font-extrabold'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-[#171715] dark:text-[#FAF8F3]'
                          }`}>
                            {formatClockTime(currentM.whiteTimeRemaining ?? 600)}
                          </span>
                        </div>

                        {/* Black Player */}
                        <div className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                          currentM.activeTurn === 'black' && currentM.isClockRunning !== false
                            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50'
                            : 'bg-white dark:bg-[#1E1E1C] border border-[#D5CFC5]/40 dark:border-[#383733]/40'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">♚</span>
                            <span className="font-semibold text-xs text-[#171715] dark:text-[#FAF8F3] truncate max-w-[130px]">
                              {getPlayerDisplayName(currentM.player2, 'Black Player')}
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            (currentM.blackTimeRemaining ?? 600) <= 60 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse font-extrabold'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-[#171715] dark:text-[#FAF8F3]'
                          }`}>
                            {formatClockTime(currentM.blackTimeRemaining ?? 600)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-[#77736B] dark:text-[#8E8E93]">
                        <span>Moves: {currentM.movesCount ?? 0}</span>
                        {b.adminInCharge ? (
                          <span className="text-[10px] truncate max-w-[120px]">
                            Arbiter: {b.adminInCharge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Live Game
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2 text-[#77736B] dark:text-[#8E8E93]">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold font-mono">
                        {b.boardNumber}
                      </div>
                      <p className="text-xs font-mono font-medium">Board is vacant & ready</p>
                      {b.adminInCharge && (
                        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F3] dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#383733]">
                          Arbiter: {b.adminInCharge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Board Card Action Footer */}
                  <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#282826] flex items-center justify-between gap-1.5">
                    {isLive && currentM ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setMatchModalMatch(currentM)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold font-mono shadow-xs flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer transition-colors"
                          title="Open Arbiter Dossier & Clock Desk"
                        >
                          <span>Arbiter Desk</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAdminSwitchTurn(currentM)}
                          className="px-2 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#252522] hover:bg-neutral-200 dark:hover:bg-[#333330] border border-[#D5CFC5] dark:border-[#383733] text-[11px] font-mono font-bold text-[#171715] dark:text-[#FAF8F3] cursor-pointer transition-colors shadow-2xs"
                          title={`Switch turn to ${currentM.activeTurn === 'white' ? 'Black' : 'White'}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePauseResumeMatch(currentM)}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono font-bold cursor-pointer transition-colors shadow-2xs ${
                            currentM.isClockRunning !== false
                              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 border-transparent hover:bg-black'
                              : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 animate-pulse'
                          }`}
                          title={currentM.isClockRunning !== false ? 'Pause Clock' : 'Resume Clock'}
                        >
                          {currentM.isClockRunning !== false ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStopBoard(b)}
                          disabled={stoppingBoardId === (b._id || b.boardNumber)}
                          className="px-2 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#252522] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900/40 text-[11px] font-mono font-bold cursor-pointer transition-colors shadow-2xs"
                          title="Vacate board (clear current game from this board)"
                        >
                          {stoppingBoardId === (b._id || b.boardNumber) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Square className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setLaunchOnBoard(b)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#FAF8F3] dark:bg-[#1E1E1C] hover:bg-neutral-200 dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#383733] text-[11px] font-bold font-mono text-[#171715] dark:text-[#FAF8F3] flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current text-emerald-600 dark:text-emerald-400" />
                          <span>Launch Match</span>
                        </button>

                        {boards?.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBoard(b)}
                            className="p-1.5 rounded-lg text-[#77736B] dark:text-[#8E8E93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete this board"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
            onDeleteRound={handleDeleteStage}
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
            <tbody className="divide-y divide-[#D5CFC5] dark:divide-[#262624] chess-content-fade-in">
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
                        <button
                          type="button"
                          onClick={() => setMatchModalMatch(m)}
                          className="hover:text-amber-700 dark:hover:text-amber-400 hover:underline cursor-pointer flex items-center gap-1.5"
                          title="Open Match Dossier & Arbiter Desk"
                        >
                          <span>{m.matchId}</span>
                          {m.boardNumber && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF8F3] dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#383733] text-[#77736B] dark:text-[#8E8E93]">
                              B#{m.boardNumber}
                            </span>
                          )}
                        </button>
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
                            <svg className="w-3.5 h-3.5 mr-1 fill-current inline shrink-0" width="14" height="14" style={{ width: '14px', height: '14px', maxWidth: '14px', maxHeight: '14px' }} viewBox="0 0 24 24">
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
        {showCreateModal && mounted && typeof document !== 'undefined' && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
            }}
            onClick={() => setShowCreateModal(false)}
            className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
          >
            <div 
              style={{ position: 'relative', zIndex: 1000000 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased cursor-default my-auto"
            >
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
                      {(players || []).filter(Boolean).map((p, pIdx) => {
                        const pIdStr = (p?._id || p?.playerId || '').toString();
                        const pName = (p?.fullName || '').trim().toLowerCase();
                        const isAssigned = alreadyAssignedInSelectedRound.ids.has(pIdStr) || (pName && alreadyAssignedInSelectedRound.names.has(pName));
                        return (
                          <option 
                            key={p?._id || p?.playerId || pIdx} 
                            value={p?._id || p?.playerId}
                            disabled={isAssigned}
                          >
                            {p?.fullName || 'Player'} ({p?.playerId || '-'} • {p?.department || '-'}){isAssigned ? ` [Already in ${manualRoundName || `Round ${manualRound}`}]` : ''}
                          </option>
                        );
                      })}
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
                      {(players || []).filter(Boolean).map((p, pIdx) => {
                        const pIdStr = (p?._id || p?.playerId || '').toString();
                        const pName = (p?.fullName || '').trim().toLowerCase();
                        const isAssigned = alreadyAssignedInSelectedRound.ids.has(pIdStr) || (pName && alreadyAssignedInSelectedRound.names.has(pName));
                        return (
                          <option 
                            key={p?._id || p?.playerId || pIdx} 
                            value={p?._id || p?.playerId}
                            disabled={isAssigned}
                          >
                            {p?.fullName || 'Player'} ({p?.playerId || '-'} • {p?.department || '-'}){isAssigned ? ` [Already in ${manualRoundName || `Round ${manualRound}`}]` : ''}
                          </option>
                        );
                      })}
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
          </div>,
          document.body
        )}

        {/* ROUND SELECTION DELETION MODAL */}
        {showDeleteRoundModal && mounted && typeof document !== 'undefined' && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
            }}
            onClick={() => setShowDeleteRoundModal(false)}
            className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
          >
            <div 
              style={{ position: 'relative', zIndex: 1000000 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased cursor-default my-auto"
            >
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-sans font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.14em] block">
                    STAGE MANAGEMENT
                  </span>
                  <h3 className="text-xl font-bold font-sans text-[#171715] dark:text-[#FAF8F3] mt-0.5 tracking-tight flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                    <span>Delete Tournament Round</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteRoundModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
                  Select which knockout stage you wish to remove. Deleting a round permanently clears its fixtures and recalculates player points:
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeStages.map((stg) => {
                    const isSelected = roundToDelete?.round === stg.round;
                    return (
                      <div
                        key={stg.round}
                        onClick={() => setRoundToDelete(stg)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-400 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                            : 'bg-[#F5F2EB] dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#2A2A28] text-[#171715] dark:text-[#FAF8F3] hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="roundToDeleteRadio"
                            checked={isSelected}
                            onChange={() => setRoundToDelete(stg)}
                            className="w-4 h-4 accent-rose-600 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-xs block">
                              {stg.name}
                            </span>
                            <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">
                              Round {stg.round}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#121212] border border-[#D5CFC5] dark:border-[#282826]">
                          {stg.count} match{stg.count === 1 ? '' : 'es'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteRoundModal(false)}
                  className="px-4 py-2.5 border border-[#D5CFC5] dark:border-[#2A2A28] bg-transparent hover:bg-[#EFEAE1] dark:hover:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!roundToDelete || deletingRound}
                  onClick={() => {
                    if (roundToDelete) {
                      handleDeleteStage(roundToDelete.round, roundToDelete.name, roundToDelete.count);
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deletingRound ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Delete {roundToDelete?.name || 'Round'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* RESCHEDULE & RESTART MATCH MODAL */}
        {showRescheduleModal && mounted && typeof document !== 'undefined' && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
            }}
            onClick={() => setShowRescheduleModal(false)}
            className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
          >
            <div 
              style={{ position: 'relative', zIndex: 1000000 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased max-h-[90vh] overflow-y-auto cursor-default my-auto"
            >
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-[0.14em] block">
                    MATCH SCHEDULING & CLOCK RESTORATION
                  </span>
                  <h3 className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-0.5">
                    Reschedule & Restart Match
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scope Switcher: Single Match vs Entire Stage */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFEAE1]/60 dark:bg-[#1E1E1C] rounded-xl border border-[#D5CFC5]/60 dark:border-[#2E2E2B]">
                <button
                  type="button"
                  onClick={() => setRescheduleScope('single')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    rescheduleScope === 'single'
                      ? 'bg-[#FAF8F3] dark:bg-[#2A2A27] text-[#171715] dark:text-[#FAF8F3] shadow-xs'
                      : 'text-[#77736B] hover:text-[#171715] dark:text-[#8E8E93] dark:hover:text-[#FAF8F3]'
                  }`}
                >
                  Single Match
                </button>
                <button
                  type="button"
                  onClick={() => setRescheduleScope('round')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    rescheduleScope === 'round'
                      ? 'bg-[#FAF8F3] dark:bg-[#2A2A27] text-[#171715] dark:text-[#FAF8F3] shadow-xs'
                      : 'text-[#77736B] hover:text-[#171715] dark:text-[#8E8E93] dark:hover:text-[#FAF8F3]'
                  }`}
                >
                  Entire Stage / Round
                </button>
              </div>

              {rescheduleScope === 'single' ? (
                <div className="space-y-4">
                  {/* Match Selector */}
                  <div>
                    <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                      Select Match
                    </label>
                    <select
                      value={rescheduleTargetId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        setRescheduleTargetId(mId);
                        const m = matches.find(item => item._id === mId || item.matchId === mId);
                        if (m) {
                          setRescheduleDuration(m.durationMinutes || 10);
                          setRescheduleBoard(m.boardNumber !== undefined && m.boardNumber !== null ? m.boardNumber : '');
                          if (m.scheduledTime) {
                            try {
                              setRescheduleDate(new Date(m.scheduledTime).toISOString().slice(0, 16));
                            } catch {
                              setRescheduleDate('');
                            }
                          } else {
                            setRescheduleDate('');
                          }
                        }
                      }}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none focus:border-[#171715] dark:focus:border-[#FAF8F3]"
                    >
                      {matches.length === 0 && <option value="">No matches available</option>}
                      {matches.map((m) => {
                        const p1 = m.player1?.fullName || 'TBD';
                        const p2 = m.player2?.fullName || 'TBD';
                        const stage = m.stageName || `Round ${m.round}`;
                        const statusTag = (m.status || 'scheduled').toUpperCase();
                        return (
                          <option key={m._id || m.matchId} value={m._id || m.matchId}>
                            {m.matchId}: {p1} vs {p2} ({stage}) [{statusTag}]
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Selected Match Quick Summary Card */}
                  {(() => {
                    const selMatch = matches.find(m => m._id === rescheduleTargetId || m.matchId === rescheduleTargetId);
                    if (!selMatch) return null;
                    return (
                      <div className="p-3 bg-[#EFEAE1]/50 dark:bg-[#1B1B19] rounded-xl border border-[#D5CFC5]/70 dark:border-[#282826] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                            {selMatch.matchId} • {selMatch.stageName || `Round ${selMatch.round}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            selMatch.status === 'live'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                              : selMatch.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            {selMatch.status || 'scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#77736B] dark:text-[#A8A49C]">
                          <span>White: <strong className="text-[#171715] dark:text-[#FAF8F3]">{selMatch.player1?.fullName || 'Player 1'}</strong></span>
                          <span>Black: <strong className="text-[#171715] dark:text-[#FAF8F3]">{selMatch.player2?.fullName || 'Player 2'}</strong></span>
                        </div>
                        {selMatch.winner && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            Current Winner: {selMatch.winner === 'player1' ? selMatch.player1?.fullName : selMatch.player2?.fullName || selMatch.winner} (cleared on restart)
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Reschedule Date & Time */}
                  <div>
                    <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                      Scheduled Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none focus:border-[#171715] dark:focus:border-[#FAF8F3]"
                    />
                    <p className="text-[10px] text-[#77736B] dark:text-[#8E8E93] mt-1">
                      Leave empty to make it available for immediate match start.
                    </p>
                  </div>

                  {/* Board Number & Duration Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                        Board / Table #
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1"
                        value={rescheduleBoard}
                        onChange={(e) => setRescheduleBoard(e.target.value)}
                        className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                        Duration (Minutes)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[10, 15, 20].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setRescheduleDuration(mins)}
                            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                              rescheduleDuration === mins
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3]'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Round Scope */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Reschedule All Matches in {selectedRoundName || `Round ${selectedRound}`}
                    </p>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      This will reset clocks to {rescheduleDuration}:00, clear results, and return all matches in this stage to &quot;Scheduled&quot; status.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                      Stage Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-sans font-bold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block mb-1.5">
                      Clock Duration per Match
                    </label>
                    <div className="flex items-center gap-2">
                      {[5, 10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setRescheduleDuration(mins)}
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                            rescheduleDuration === mins
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2.5 border border-[#D5CFC5] dark:border-[#2A2A28] bg-transparent hover:bg-[#EFEAE1] dark:hover:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {rescheduleScope === 'single' && (
                  <button
                    type="button"
                    onClick={() => {
                      const m = matches.find(item => item._id === rescheduleTargetId || item.matchId === rescheduleTargetId);
                      if (m) {
                        setShowRescheduleModal(false);
                        handleRestartMatch(m);
                      }
                    }}
                    disabled={rescheduling || !rescheduleTargetId}
                    className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Quick Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRescheduleSubmit}
                  disabled={rescheduling}
                  className="px-5 py-2.5 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {rescheduling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarClock className="w-4 h-4" />
                  )}
                  <span>{rescheduleScope === 'single' ? 'Save & Reschedule' : 'Reschedule Stage'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Click-to-Declare Winner Modal (Direct, No Points / Piece Counts) */}
        {resultModalMatch && mounted && typeof document !== 'undefined' && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
            }}
            onClick={() => setResultModalMatch(null)}
            className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
          >
            <div 
              style={{ position: 'relative', zIndex: 1000000 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] antialiased cursor-default my-auto"
            >
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
          </div>,
          document.body
        )}

      {/* ADJUST MATCH TIME / DURATION MODAL (Like Carrom) */}
      {timeModalOpen && selectedMatchForTime && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
          }}
          onClick={() => setTimeModalOpen(false)}
          className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            style={{ position: 'relative', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#2B2B28] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-[#171715] dark:text-[#FAF8F3] cursor-default my-auto"
          >
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
        </div>,
        document.body
      )}

      {/* MATCH DETAIL & ARBITER CONTROL MODAL */}
      {matchModalMatch && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
          }}
          onClick={() => setMatchModalMatch(null)}
          className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            style={{ position: 'relative', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D5CFC5] dark:border-[#262624]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                    <span className="font-bold text-[#171715] dark:text-[#FAF8F3] tracking-wider">
                      {matchModalMatch.matchId}
                    </span>
                    <span>•</span>
                    <span className="text-[#77736B] dark:text-[#8E8E93]">
                      {matchModalMatch.roundName || `Round ${matchModalMatch.round}`}
                    </span>
                    {matchModalMatch.boardNumber && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
                          Board #{matchModalMatch.boardNumber}
                        </span>
                      </>
                    )}
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

                {/* Reschedule Match Button */}
                <button
                  type="button"
                  onClick={() => {
                    const m = matchModalMatch;
                    setMatchModalMatch(null);
                    openRescheduleModal(m);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>

                {/* Delete Match Button */}
                <button
                  type="button"
                  onClick={() => {
                    const m = matchModalMatch;
                    setMatchModalMatch(null);
                    handleDeleteMatch(m._id || m.matchId, m.matchId);
                  }}
                  disabled={deletingMatchId === (matchModalMatch._id || matchModalMatch.matchId)}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  title="Permanently delete this match pairing"
                >
                  {deletingMatchId === (matchModalMatch._id || matchModalMatch.matchId) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Match</span>
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
              <div className="flex items-center gap-3">
                <a
                  href={`/chess/matches/${matchModalMatch._id || matchModalMatch.matchId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Match View ↗</span>
                </a>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const m = matchModalMatch;
                    setMatchModalMatch(null);
                    handleDeleteMatch(m._id || m.matchId, m.matchId);
                  }}
                  className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Match</span>
                </button>
              </div>

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
        </div>,
        document.body
      )}

      {/* MODAL 1: ADD NEW CHESS BOARD */}
      {addBoardModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
          onClick={() => setAddBoardModalOpen(false)}
          className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div
            style={{ position: 'relative', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] dark:bg-[#171715] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 max-w-md w-full shadow-2xl cursor-default space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5] dark:border-[#282826]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Crown className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
                    Add Chess Board
                  </h3>
                  <p className="text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                    Expand the multi-match tournament arena
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddBoardModalOpen(false)}
                className="p-1 rounded-lg text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBoard} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] uppercase font-mono block mb-1">
                    Board Number:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBoardData.boardNumber}
                    onChange={(e) => setNewBoardData({ ...newBoardData, boardNumber: e.target.value })}
                    className="w-full h-10 bg-white dark:bg-[#1E1E1C] px-3 text-xs text-[#171715] dark:text-[#FAF8F3] rounded-xl border border-[#D5CFC5] dark:border-[#383733] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] uppercase font-mono block mb-1">
                    Board Name / Desk Label:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chess Board 3 - Arena C"
                    value={newBoardData.name}
                    onChange={(e) => setNewBoardData({ ...newBoardData, name: e.target.value })}
                    className="w-full h-10 bg-white dark:bg-[#1E1E1C] px-3 text-xs text-[#171715] dark:text-[#FAF8F3] rounded-xl border border-[#D5CFC5] dark:border-[#383733] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] uppercase font-mono block mb-1">
                    Arbiter / Admin In Charge (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arbiter Rohit"
                    value={newBoardData.adminInCharge}
                    onChange={(e) => setNewBoardData({ ...newBoardData, adminInCharge: e.target.value })}
                    className="w-full h-10 bg-white dark:bg-[#1E1E1C] px-3 text-xs text-[#171715] dark:text-[#FAF8F3] rounded-xl border border-[#D5CFC5] dark:border-[#383733] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2DDD5] dark:border-[#282826]">
                <button
                  type="button"
                  onClick={() => setAddBoardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBoard}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-mono px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                >
                  {creatingBoard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{creatingBoard ? 'Adding Board...' : 'Create Board'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: SELECT BOARD TO START MATCH (Prompted when multiple boards available) */}
      {boardSelectMatch && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
          onClick={() => setBoardSelectMatch(null)}
          className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div
            style={{ position: 'relative', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] dark:bg-[#171715] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 max-w-lg w-full shadow-2xl cursor-default space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5] dark:border-[#282826]">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">
                  Select Match Arena
                </span>
                <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
                  Choose Board for {boardSelectMatch.matchId || `Match #${boardSelectMatch.matchNumber || 1}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBoardSelectMatch(null)}
                className="p-1 rounded-lg text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match Card Preview */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#383733] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {boardSelectMatch.matchId || 'Match'} • {boardSelectMatch.roundName || 'Round'}
                </span>
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[#77736B] dark:text-[#8E8E93]">
                  10:00 Rapid
                </span>
              </div>
              <div className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] flex items-center justify-between">
                <span>♔ {getPlayerDisplayName(boardSelectMatch.player1, 'Player 1 (White)')}</span>
                <span className="text-xs font-mono text-[#77736B]">vs</span>
                <span>♚ {getPlayerDisplayName(boardSelectMatch.player2, 'Player 2 (Black)')}</span>
              </div>
            </div>

            {/* Boards Selection List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] uppercase font-mono block">
                Select available Chess Board desk:
              </label>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {boards?.filter(Boolean).map((b) => {
                  const isAvailable = b?.status === 'available';
                  const isLive = b?.status === 'live';

                  return (
                    <div
                      key={b?._id || b?.boardNumber}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isAvailable
                          ? 'bg-white dark:bg-[#1E1E1C] border-[#D5CFC5] dark:border-[#383733] hover:border-amber-500'
                          : 'bg-neutral-100 dark:bg-[#151514] border-[#E2DDD5] dark:border-[#262624] opacity-70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F3] dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#383733] text-[#171715] dark:text-[#FAF8F3]">
                            Board #{b?.boardNumber}
                          </span>
                          <span className="font-serif font-bold text-xs text-[#171715] dark:text-[#FAF8F3]">
                            {b?.name}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                          {isLive
                            ? `Occupied by ${b?.currentMatch?.matchId || 'Live Match'}`
                            : 'Ready & Available'}
                        </p>
                      </div>

                      {isAvailable ? (
                        <button
                          type="button"
                          onClick={() => handleStartMatch(boardSelectMatch._id || boardSelectMatch.matchId, b.boardNumber, b.name)}
                          disabled={startingMatchId === (boardSelectMatch._id || boardSelectMatch.matchId)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch Here</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30">
                          In Use
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2DDD5] dark:border-[#282826]">
              <button
                type="button"
                onClick={() => setBoardSelectMatch(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer font-mono"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: CHOOSE MATCH TO LAUNCH ON BOARD (With Smart Contestant Conflict Detection) */}
      {launchOnBoard && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
          onClick={() => setLaunchOnBoard(null)}
          className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div
            style={{ position: 'relative', zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] dark:bg-[#171715] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 max-w-2xl w-full shadow-2xl cursor-default space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5] dark:border-[#282826]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF8F3] dark:bg-[#252522] border border-[#D5CFC5] dark:border-[#383733] text-[#171715] dark:text-[#FAF8F3]">
                    BOARD #{launchOnBoard.boardNumber}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                    Vacant Desk Ready
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
                  Launch Match on {launchOnBoard.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLaunchOnBoard(null)}
                className="p-1 rounded-lg text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match Selection List with Conflict Check */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(() => {
                const liveMatches = matches.filter((m) => m?.status === 'live');
                const livePlayerIds = new Set();
                liveMatches.forEach((lm) => {
                  const p1 = lm?.player1?._id || lm?.player1;
                  const p2 = lm?.player2?._id || lm?.player2;
                  if (p1) livePlayerIds.add(String(p1));
                  if (p2) livePlayerIds.add(String(p2));
                });

                const scheduledMatches = matches.filter((m) => {
                  if (m?.status !== 'scheduled' || m?.isBye || !m?.player1 || !m?.player2) return false;
                  return true;
                });

                if (scheduledMatches.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-[#77736B] dark:text-[#8E8E93] border border-dashed border-[#D5CFC5] dark:border-[#262624] rounded-xl font-mono">
                      No scheduled matches waiting to be played.
                    </div>
                  );
                }

                const readyList = [];
                const conflictList = [];

                scheduledMatches.forEach((m) => {
                  const p1Id = m?.player1?._id || m?.player1;
                  const p2Id = m?.player2?._id || m?.player2;
                  const hasConflict = (p1Id && livePlayerIds.has(String(p1Id))) || (p2Id && livePlayerIds.has(String(p2Id)));

                  const conflictingLiveMatch = hasConflict
                    ? liveMatches.find((lm) => {
                        const lmP1 = lm?.player1?._id || lm?.player1;
                        const lmP2 = lm?.player2?._id || lm?.player2;
                        return (p1Id && (String(p1Id) === String(lmP1) || String(p1Id) === String(lmP2))) ||
                               (p2Id && (String(p2Id) === String(lmP1) || String(p2Id) === String(lmP2)));
                      })
                    : null;

                  if (hasConflict) {
                    conflictList.push({ match: m, conflictingLiveMatch });
                  } else {
                    readyList.push({ match: m });
                  }
                });

                return (
                  <div className="space-y-4">
                    {/* Ready Matches */}
                    {readyList.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 px-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>AVAILABLE TO LAUNCH ON BOARD #{launchOnBoard.boardNumber} ({readyList.length})</span>
                        </div>

                        {readyList.map(({ match: m }, idx) => (
                          <div
                            key={m?._id || m?.matchId || idx}
                            className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                                <span className="font-bold text-amber-700 dark:text-amber-400">{m?.matchId || `M#${idx + 1}`}</span>
                                <span>•</span>
                                <span className="font-semibold">{m?.roundName || 'Round'}</span>
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                  Ready to Play
                                </span>
                              </div>
                              <div className="font-serif font-bold text-xs sm:text-sm text-[#171715] dark:text-[#FAF8F3] truncate">
                                ♔ {getPlayerDisplayName(m?.player1, 'Player 1 (White)')} vs ♚ {getPlayerDisplayName(m?.player2, 'Player 2 (Black)')}
                              </div>
                              <div className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] flex items-center gap-2 flex-wrap">
                                <span>♔ White: {getPlayerDisplayName(m?.player1, 'Player 1')}{getPlayerDeptName(m?.player1) ? ` (${getPlayerDeptName(m?.player1)})` : ''}</span>
                                <span>•</span>
                                <span>♚ Black: {getPlayerDisplayName(m?.player2, 'Player 2')}{getPlayerDeptName(m?.player2) ? ` (${getPlayerDeptName(m?.player2)})` : ''}</span>
                              </div>
                              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                ✓ Both contestants free & available right now
                              </div>
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => handleLaunchMatchOnBoard(launchOnBoard, m)}
                                disabled={launchingMatchId === (m?._id || m?.matchId)}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                              >
                                {launchingMatchId === (m?._id || m?.matchId) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current" />
                                )}
                                <span>Launch Match</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conflict Matches */}
                    {conflictList.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E2DDD5] dark:border-[#282826]">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 px-1">
                          <span>⚠️ CONTESTANT CURRENTLY IN MATCH ON ANOTHER BOARD ({conflictList.length})</span>
                        </div>

                        {conflictList.map(({ match: m, conflictingLiveMatch }, idx) => (
                          <div
                            key={m?._id || m?.matchId || idx}
                            className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                                <span className="font-bold text-amber-700 dark:text-amber-400">{m?.matchId || `M#${idx + 1}`}</span>
                                <span>•</span>
                                <span className="font-semibold">{m?.roundName || 'Round'}</span>
                              </div>
                              <div className="font-serif font-bold text-xs sm:text-sm text-[#171715] dark:text-[#FAF8F3] truncate">
                                ♔ {getPlayerDisplayName(m?.player1, 'Player 1 (White)')} vs ♚ {getPlayerDisplayName(m?.player2, 'Player 2 (Black)')}
                              </div>
                              <div className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] flex items-center gap-2 flex-wrap">
                                <span>♔ White: {getPlayerDisplayName(m?.player1, 'Player 1')}{getPlayerDeptName(m?.player1) ? ` (${getPlayerDeptName(m?.player1)})` : ''}</span>
                                <span>•</span>
                                <span>♚ Black: {getPlayerDisplayName(m?.player2, 'Player 2')}{getPlayerDeptName(m?.player2) ? ` (${getPlayerDeptName(m?.player2)})` : ''}</span>
                              </div>
                              <div className="text-[10px] font-mono text-amber-800 dark:text-amber-300 font-semibold">
                                ⚠️ Contestant is live on Board #{conflictingLiveMatch?.boardNumber || 1} ({conflictingLiveMatch?.matchId}). Wait for board to finish or Force Launch.
                              </div>
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => handleLaunchMatchOnBoard(launchOnBoard, m)}
                                disabled={launchingMatchId === (m?._id || m?.matchId)}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                              >
                                {launchingMatchId === (m?._id || m?.matchId) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current" />
                                )}
                                <span>Force Launch</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2DDD5] dark:border-[#282826]">
              <button
                type="button"
                onClick={() => setLaunchOnBoard(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] cursor-pointer font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      </main>
    </div>
  );
}
