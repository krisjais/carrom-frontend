'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import {
  Activity,
  Calendar,
  Clock,
  ExternalLink,
  Crown,
  Trophy,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Layers,
  Sparkles,
  Settings,
  Play,
  Timer,
  Square,
  Save,
  Users,
  Plus,
  Trash2,
  Radio,
  LayoutGrid
} from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast, useConfirm } from '@/context/ToastContext';
import { CategoryCoinPair } from '@/components/ui/CarromElements';
import { CarromMatchTimer, formatMatchDurationTaken } from '@/components/common/CarromMatchTimer';
import { SubstitutePartnerModal } from '@/components/admin/SubstitutePartnerModal';

export default function AdminMatchesPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [arenaState, setArenaState] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [substituteMatch, setSubstituteMatch] = useState(null);

  // Multi-Board Carrom Arena Management
  const [addBoardModalOpen, setAddBoardModalOpen] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardData, setNewBoardData] = useState({
    name: '',
    boardNumber: '',
    assignedCategory: 'all',
    adminInCharge: ''
  });
  const [boardSelectMatch, setBoardSelectMatch] = useState(null);
  const [launchOnCourt, setLaunchOnCourt] = useState(null);
  const [courtModalCategory, setCourtModalCategory] = useState('all');

  // Category Level Hierarchy: 'singles' | 'doubles' | 'mixed'
  const [mainTab, setMainTab] = useState('singles');
  const [activeCategory, setActiveCategory] = useState('boys_singles');
  const [selectedRoundStage, setSelectedRoundStage] = useState('all');

  // Scheduler Settings Modal
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    matchDurationMinutes: 20,
    roundDurationMinutes: 20,
    breakTimeMinutes: 5,
    minRestTimeMinutes: 10
  });
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  // Adjust Single Match Estimated Time Modal
  const [editTimeModalOpen, setEditTimeModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [customTime, setCustomTime] = useState('');
  const [customDuration, setCustomDuration] = useState(20);
  const [savingTime, setSavingTime] = useState(false);

  // View Scorecard Modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [viewMatch, setViewMatch] = useState(null);
  const [startingMatchId, setStartingMatchId] = useState(null);

  const fetchMatchesAndTeams = async () => {
    setLoading(true);
    try {
      const [matchesRes, teamsRes, arenaRes, tournRes] = await Promise.all([
        api.getMatches(),
        api.getTeams(activeCategory),
        api.getLiveMatches(),
        api.getCurrentTournament()
      ]);
      if (matchesRes.success) setMatches(matchesRes.matches || []);
      if (teamsRes.success) setTeams(teamsRes.teams || []);
      if (arenaRes.success) {
        setArenaState(arenaRes);
        if (arenaRes.boards) setBoards(arenaRes.boards);
      }
      if (tournRes.success && tournRes.tournament?.scheduleSettings) {
        const s = tournRes.tournament.scheduleSettings;
        setScheduleSettings({
          startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          matchDurationMinutes: s.roundDurationMinutes || s.matchDurationMinutes || 20,
          roundDurationMinutes: s.roundDurationMinutes || s.matchDurationMinutes || 20,
          breakTimeMinutes: s.breakTimeMinutes || 5,
          minRestTimeMinutes: s.minRestTimeMinutes || 10
        });
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesAndTeams();
  }, [activeCategory]);

  const [stoppingMatchId, setStoppingMatchId] = useState(null);

  const handleStartMatch = async (matchId) => {
    // If multiple available boards exist, prompt admin to choose which board
    const availableBoards = boards.filter((b) => b.status === 'available');
    if (availableBoards.length > 1) {
      const matchObj = matches.find((m) => m._id === matchId);
      if (matchObj) {
        setBoardSelectMatch(matchObj);
        return;
      }
    }
    const targetBoard = availableBoards[0] || boards[0];
    handleStartMatchOnBoard(matchId, targetBoard?.boardNumber || 1, targetBoard?.name || 'Carrom Board 1');
  };

  const handleStartMatchOnBoard = async (matchId, boardNumber = 1, boardName = '', forceStart = false) => {
    setStartingMatchId(matchId);
    try {
      const res = await api.startMatch(matchId, {
        carromBoardNumber: boardNumber,
        boardName: boardName || `Carrom Board ${boardNumber}`,
        roundDurationMinutes: scheduleSettings.roundDurationMinutes || 20,
        forceStart
      });
      if (res.success) {
        setBoardSelectMatch(null);
        setLaunchOnCourt(null);
        toast.success(res.message || `Match launched on Board #${boardNumber}!`);
        router.push(`/admin/matches/${matchId}/score`);
      }
    } catch (err) {
      if (!forceStart && (err.data?.isPlayerConflict || err.message?.includes('cannot participate in two concurrent matches') || err.message?.includes('currently playing live'))) {
        const forceIt = await confirm({
          title: 'Contestant Conflict Overlap',
          message: `${err.message}\n\nDo you want to override and FORCE LAUNCH this match on Board #${boardNumber} anyway as Tournament Admin?`,
          confirmText: 'Force Launch Anyway',
          cancelText: 'Cancel'
        });
        if (forceIt) {
          return handleStartMatchOnBoard(matchId, boardNumber, boardName, true);
        }
      } else {
        toast.error(err.message || 'Failed to start match.');
      }
      fetchMatchesAndTeams();
    } finally {
      setStartingMatchId(null);
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await api.getBoards();
      if (res?.success) setBoards(res.boards || []);
    } catch (err) {
      console.warn('Failed to load boards:', err);
    }
  };

  const handleAddBoard = async (e) => {
    e.preventDefault();
    setCreatingBoard(true);
    try {
      const res = await api.createBoard(newBoardData);
      if (res.success) {
        toast.success(res.message || 'New Carrom Board added successfully!');
        setAddBoardModalOpen(false);
        setNewBoardData({ name: '', boardNumber: '', assignedCategory: 'all', adminInCharge: '' });
        fetchMatchesAndTeams();
        fetchBoards();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create board.');
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleDeleteBoard = async (board) => {
    const isConfirmed = await confirm({
      title: `Delete ${board.name}?`,
      message: `Are you sure you want to remove Board #${board.boardNumber}? This court will be removed from tournament management.`,
      confirmText: 'Delete Board',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      const res = await api.deleteBoard(board._id);
      if (res.success) {
        toast.success(res.message || 'Board deleted.');
        fetchMatchesAndTeams();
        fetchBoards();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete board.');
    }
  };

  const handleStopLive = async (matchId) => {
    const isConfirmed = await confirm({
      title: 'Stop Live Match?',
      message: 'Are you sure you want to stop this live match? It will be reverted back to Scheduled queue and free up the Main Carrom Board.',
      confirmText: 'Stop Live Match',
      cancelText: 'Cancel',
      type: 'warning'
    });
    if (!isConfirmed) {
      return;
    }
    setStoppingMatchId(matchId);
    try {
      const res = await api.stopLiveMatch(matchId);
      if (res.success) {
        toast.success(res.message || 'Match stopped from LIVE and reverted to scheduled queue.');
        fetchMatchesAndTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to stop live match.');
    } finally {
      setStoppingMatchId(null);
    }
  };


  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    setGeneratingSchedule(true);
    try {
      const res = await api.generateSchedule({
        ...scheduleSettings,
        roundDurationMinutes: scheduleSettings.roundDurationMinutes || scheduleSettings.matchDurationMinutes
      });
      if (res.success) {
        toast.success('Sequential schedule generated successfully for Main Carrom Board!');
        setSchedulerModalOpen(false);
        fetchMatchesAndTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate schedule.');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const handleOpenEditTime = (m) => {
    setSelectedMatch(m);
    setCustomTime(m.scheduledTime ? new Date(m.scheduledTime).toISOString().slice(0, 16) : '');
    setCustomDuration(m.roundDurationMinutes || m.durationMinutes || scheduleSettings.roundDurationMinutes || 20);
    setEditTimeModalOpen(true);
  };

  const handleSaveCustomTime = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSavingTime(true);
    try {
      const dur = Math.max(1, Number(customDuration) || 20);
      const res = await api.scheduleMatch(selectedMatch._id, {
        scheduledTime: customTime ? new Date(customTime) : null,
        roundDurationMinutes: dur,
        durationMinutes: dur
      });

      // If match is currently live, also update its running referee timer duration
      if (selectedMatch.status === 'live') {
        await api.updateMatchTimer(selectedMatch._id, {
          action: 'set_duration',
          roundDurationMinutes: dur,
          durationMinutes: dur
        });
      }

      if (res.success) {
        toast.success(`Match #${selectedMatch.matchNumber} time duration set to ${dur} minutes!`);
        setEditTimeModalOpen(false);
        fetchMatchesAndTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update match time.');
    } finally {
      setSavingTime(false);
    }
  };

  const handleMainTabChange = (tab) => {
    setMainTab(tab);
    setSelectedRoundStage('all');
    if (tab === 'singles') setActiveCategory('boys_singles');
    else if (tab === 'doubles') setActiveCategory('boys_doubles');
    else if (tab === 'mixed') setActiveCategory('mixed_doubles');
  };

  const handleSubCategoryChange = (catId) => {
    setActiveCategory(catId);
    setSelectedRoundStage('all');
  };

  const tabCategories = useMemo(() => {
    if (mainTab === 'singles') {
      return [
        { id: 'boys_singles', name: 'Boys Singles' },
        { id: 'girls_singles', name: 'Girls Singles' }
      ];
    } else if (mainTab === 'doubles') {
      return [
        { id: 'boys_doubles', name: 'Boys Doubles' },
        { id: 'girls_doubles', name: 'Girls Doubles' }
      ];
    } else {
      return [{ id: 'mixed_doubles', name: 'Mixed Doubles' }];
    }
  }, [mainTab]);

  const categoryMatches = useMemo(() => {
    return matches.filter((m) => m.category === activeCategory);
  }, [matches, activeCategory]);

  const roundGroups = useMemo(() => {
    const map = {};
    categoryMatches.forEach((m) => {
      if (!map[m.roundNumber]) {
        map[m.roundNumber] = {
          roundNumber: m.roundNumber,
          roundName: m.roundName,
          matches: [],
          byes: []
        };
      }
      if (m.isBye || m.status === 'bye') {
        map[m.roundNumber].byes.push(m);
      } else {
        map[m.roundNumber].matches.push(m);
      }
    });

    return Object.values(map).sort((a, b) => a.roundNumber - b.roundNumber);
  }, [categoryMatches]);

  const categoryStats = useMemo(() => {
    const totalPlayable = categoryMatches.filter((m) => !m.isBye && m.status !== 'bye');
    const live = totalPlayable.filter((m) => m.status === 'live').length;
    const ready = totalPlayable.filter((m) => m.status === 'scheduled').length;
    const completed = totalPlayable.filter((m) => m.status === 'completed').length;
    const waiting = totalPlayable.filter((m) => m.status === 'pending').length;
    const byesCount = categoryMatches.filter((m) => m.isBye || m.status === 'bye').length;

    return {
      totalPlayers: teams.length,
      totalMatches: totalPlayable.length,
      live,
      ready,
      completed,
      waiting,
      byesCount
    };
  }, [categoryMatches, teams]);

  const currentMatch = arenaState?.currentMatch;
  const isBoardOccupied = Boolean(currentMatch);

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* 1. Standard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="eyebrow-label">
              SEQUENTIAL ARENA SCHEDULER
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
            Matches & Fixtures Manager
          </h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Sequential timeline manager and live scoring control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSchedulerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer shadow-xs"
            title="Set default time for matches"
          >
            <Clock className="w-3.5 h-3.5 text-[#E74C3C]" />
            <span>Default Match Time</span>
          </button>

          <button
            onClick={fetchMatchesAndTeams}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E74C3C]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1.5 MULTI-BOARD CARROM ARENA MANAGEMENT */}
      <div className="editorial-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-ping" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#E74C3C]">
                Multi-Court Arena Control
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#B8B1A5]">
                {boards.length} Boards Total • {boards.filter((b) => b.status === 'live').length} Live
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
              Carrom Boards & Live Courts
            </h2>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
              Multiple arbiters can manage and score different boards simultaneously (e.g. Board 1 = Boys Singles, Board 2 = Girls Singles or Doubles).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextNum = boards.reduce((max, b) => Math.max(max, b.boardNumber || 0), 0) + 1;
                setNewBoardData({
                  name: `Carrom Board ${nextNum}`,
                  boardNumber: nextNum,
                  assignedCategory: 'all',
                  adminInCharge: ''
                });
                setAddBoardModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
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
                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] border-[#E74C3C] ring-2 ring-[#E74C3C]/20 shadow-sm'
                    : isMaintenance
                    ? 'bg-[#FAF9F6]/50 dark:bg-[#181C1F]/40 border-amber-300 dark:border-amber-800/40 opacity-75'
                    : 'bg-[#FAF9F6] dark:bg-[#181C1F] border-[#E8E1D5] dark:border-[#2B3034]'
                }`}
              >
                {/* Board Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8]">
                      COURT #{String(b.boardNumber).padStart(2, '0')}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8] truncate max-w-[140px]">
                      {b.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E74C3C]" />
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
                      <div className="flex items-center gap-1 text-[#E74C3C] font-bold">
                        <span>M#{currentM.matchNumber}</span>
                        <span>•</span>
                        <span>{currentM.roundName}</span>
                      </div>
                      <CategoryBadge category={currentM.category} />
                    </div>

                    {/* Teams and Current Score */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold truncate max-w-[140px] text-[#3E342B] dark:text-[#F5F1E8]">
                          {currentM.team1?.name || 'Team 1'}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">
                          {currentM.boards?.[0]?.team1Score ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold truncate max-w-[140px] text-[#3E342B] dark:text-[#F5F1E8]">
                          {currentM.team2?.name || 'Team 2'}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">
                          {currentM.boards?.[0]?.team2Score ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <CarromMatchTimer match={currentM} variant="compact" />
                      {b.adminInCharge && (
                        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72]">
                          Arbiter: {b.adminInCharge}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2 text-[#7E7060] dark:text-[#817B72]">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold font-mono">
                      {b.boardNumber}
                    </div>
                    <p className="text-xs font-mono">Court is vacant and ready</p>
                    {b.assignedCategory && b.assignedCategory !== 'all' && (
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] text-[#5A3E28] dark:text-[#D4A94C]">
                        Focus: {CATEGORIES.find((c) => c.id === b.assignedCategory)?.name || b.assignedCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Board Card Action Footer */}
                <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between gap-2">
                  {isLive && currentM ? (
                    <>
                      <Link
                        href={`/admin/matches/${currentM?._id}/score`}
                        className="flex-1 py-1.5 px-3 rounded-lg btn-primary text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                        title="Open live score desk for this board"
                      >
                        <span>Score Desk</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleStopLive(currentM?._id)}
                        disabled={stoppingMatchId === currentM?._id}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#15191C] hover:bg-[#FDEDEC] dark:hover:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 text-[11px] font-mono font-bold cursor-pointer transition-colors shadow-2xs"
                        title="Stop match and vacate this board"
                      >
                        <Square className="w-3 h-3 fill-current" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setLaunchOnCourt(b);
                          setCourtModalCategory(b?.assignedCategory || 'all');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer shadow-2xs"
                      >
                        <Play className="w-3 h-3 fill-current text-[#E74C3C]" />
                        <span>Launch Match</span>
                      </button>

                      {boards?.length > 1 && (
                        <button
                          onClick={() => handleDeleteBoard(b)}
                          className="p-1.5 rounded-lg text-[#7E7060] hover:text-[#E74C3C] hover:bg-[#FDEDEC] dark:hover:bg-[#E74C3C]/10 transition-colors cursor-pointer"
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

      {/* 2. CATEGORY PILL TABS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E8E1D5] dark:border-[#2B3034] pb-2">
          <button
            onClick={() => handleMainTabChange('singles')}
            className={`pill-tab cursor-pointer ${mainTab === 'singles' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            SINGLES
          </button>

          <button
            onClick={() => handleMainTabChange('doubles')}
            className={`pill-tab cursor-pointer ${mainTab === 'doubles' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            DOUBLES
          </button>

          <button
            onClick={() => handleMainTabChange('mixed')}
            className={`pill-tab cursor-pointer ${mainTab === 'mixed' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            MIXED DOUBLES
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {tabCategories.map((c) => {
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSubCategoryChange(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] border-2 border-[#3E342B] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                    : 'bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8]'
                }`}
              >
                <CategoryCoinPair category={c.id} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATEGORY STATS BANNER */}
      <div className="editorial-card p-6 space-y-5 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-3">
            <CategoryBadge category={activeCategory} />
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                {CATEGORIES.find((c) => c.id === activeCategory)?.name}
              </h2>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono mt-0.5">
                {categoryStats.totalPlayers} Approved Entries • {roundGroups.length} Knockout Rounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="px-4 py-2 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-[#3E342B] dark:text-[#F5F1E8] font-bold transition-colors flex items-center gap-1.5 font-mono uppercase text-xs"
            >
              <span>View Bracket Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] uppercase font-bold block">Total Entries</span>
            <span className="text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">{categoryStats.totalPlayers}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-[#3E342B] dark:text-[#F5F1E8] uppercase font-bold block">READY in Queue</span>
            <span className="text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">{categoryStats.ready}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold block">WAITING (TBD)</span>
            <span className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-400">{categoryStats.waiting}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold block">Completed</span>
            <span className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">{categoryStats.completed}</span>
          </div>
        </div>

        {roundGroups.length > 0 && (
          <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <div className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-bold mb-2 uppercase font-mono tracking-wider">Tournament Stages:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedRoundStage('all')}
                className={`pill-tab cursor-pointer ${selectedRoundStage === 'all' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
              >
                All Rounds ({roundGroups.length})
              </button>

              {roundGroups.map((rg) => {
                const isSelected = selectedRoundStage === String(rg.roundNumber);
                return (
                  <button
                    key={rg.roundNumber}
                    onClick={() => setSelectedRoundStage(String(rg.roundNumber))}
                    className={`pill-tab cursor-pointer flex items-center gap-1.5 ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
                  >
                    <span>{rg.roundName}</span>
                    <span className="font-mono text-[10px] opacity-80">({rg.matches.length})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. ROUND-BY-ROUND FIXTURES BREAKDOWN */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
          <span>Loading tournament rounds...</span>
        </div>
      ) : roundGroups.length === 0 ? (
        <div className="p-12 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl space-y-3">
          <Calendar className="w-8 h-8 text-[#7E7060] dark:text-[#817B72] mx-auto mb-2 opacity-70" />
          <h3 className="text-base font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">No Draw Generated for {activeCategory.replace('_', ' ').toUpperCase()}</h3>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] max-w-sm mx-auto">
            Please generate and publish the knockout draw in the Draws section to create the bracket and match fixtures.
          </p>
          <div className="mt-4">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <span>Generate Draw Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {roundGroups
            .filter((rg) => selectedRoundStage === 'all' || String(rg.roundNumber) === selectedRoundStage)
            .map((rg) => (
              <div key={rg.roundNumber} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3E342B] dark:bg-[#D4A94C]" />
                    <h3 className="text-lg font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                      {rg.roundName}
                    </h3>
                    <span className="text-xs text-[#7E7060] dark:text-[#817B72] font-mono">
                      (Round {rg.roundNumber} of {roundGroups.length})
                    </span>
                  </div>

                  <div className="text-xs text-[#7E7060] dark:text-[#817B72] font-mono flex items-center gap-3">
                    <span>
                      <strong className="text-[#3E342B] dark:text-[#F5F1E8]">{rg.matches.length}</strong> Playable Matches
                    </span>
                    {rg.byes.length > 0 && (
                      <span className="text-[#E74C3C] dark:text-[#D4A94C]">
                        <strong className="text-[#E74C3C] dark:text-[#D4A94C]">{rg.byes.length}</strong> Automatic Advances
                      </span>
                    )}
                  </div>
                </div>

                {rg.matches.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(rg.matches || []).filter(Boolean).map((m, mIdx) => {
                      const isWaiting = m?.status === 'pending' || (!m?.team1 && !m?.team2);
                      const isLive = m?.status === 'live';
                      const isCompleted = m?.status === 'completed';
                      const isReady = m?.status === 'scheduled';

                      const winnerId = (m?.winnerTeam?._id || m?.winnerTeam)?.toString();
                      const t1Id = (m?.team1?._id || m?.team1)?.toString();
                      const t2Id = (m?.team2?._id || m?.team2)?.toString();
                      const isT1Win = Boolean(winnerId && winnerId === t1Id);
                      const isT2Win = Boolean(winnerId && winnerId === t2Id);

                      return (
                        <div
                          key={m?._id || mIdx}
                          className={`editorial-card p-5 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] flex flex-col justify-between transition-all border shadow-xs ${
                            isLive
                              ? 'border-[#E74C3C] ring-1 ring-[#E74C3C]/30'
                              : isCompleted
                              ? 'border-[#D5C4A1] dark:border-[#2B3034]'
                              : isWaiting
                              ? 'opacity-70 bg-[#FAF9F6] dark:bg-[#181C1F] border-[#E8E1D5] dark:border-[#2B3034]'
                              : 'border-[#E8E1D5] dark:border-[#2B3034]'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] text-[11px]">
                                  M#{m.matchNumber}
                                </span>
                                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                              </div>
                              <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72]">
                                Main Board
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Team 1 */}
                              <div
                                className={`p-3 rounded-xl flex items-center justify-between border ${
                                  isT1Win
                                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-bold border-[#3E342B] dark:border-[#D4A94C]'
                                    : m.team1
                                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-serif font-bold border-[#E8E1D5] dark:border-[#2B3034]'
                                    : 'bg-[#FAF9F6]/50 dark:bg-[#181C1F]/50 text-[#7E7060] dark:text-[#817B72] italic border-[#E8E1D5] dark:border-[#2B3034]'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team1 ? m.team1.name : 'Waiting for winner...'}</span>
                                {isT1Win && <span className="font-mono text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-bold">✓ WINNER</span>}
                              </div>

                              <div className="text-center text-[10px] text-[#7E7060] dark:text-[#817B72] font-bold font-mono">VS</div>

                              {/* Team 2 */}
                              <div
                                className={`p-3 rounded-xl flex items-center justify-between border ${
                                  isT2Win
                                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-bold border-[#3E342B] dark:border-[#D4A94C]'
                                    : m.team2
                                    ? 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-serif font-bold border-[#E8E1D5] dark:border-[#2B3034]'
                                    : 'bg-[#FAF9F6]/50 dark:bg-[#181C1F]/50 text-[#7E7060] dark:text-[#817B72] italic border-[#E8E1D5] dark:border-[#2B3034]'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team2 ? m.team2.name : 'Waiting for winner...'}</span>
                                {isT2Win && <span className="font-mono text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-bold">✓ WINNER</span>}
                              </div>
                            </div>

                            {/* Schedule Time & Queue Info */}
                            {!isWaiting && (
                              <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-[11px] text-[#7E7060] dark:text-[#817B72]">
                                <div className="font-mono">
                                  {isLive ? (
                                    <CarromMatchTimer match={m} variant="compact" />
                                  ) : m.queuePosition ? (
                                    <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Queue #{m.queuePosition}</span>
                                  ) : isCompleted ? (
                                    <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#E74C3C]" />
                                      <span>Took {formatMatchDurationTaken(m)}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[#E74C3C] dark:text-[#D4A94C] font-bold">In Play</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTime(m)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-[#E8E1D5]/60 dark:hover:bg-[#2B3034] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer"
                                  title="Click to change how much time this match will take"
                                >
                                  <Clock className="w-3 h-3 text-[#E74C3C]" />
                                  <span>{isCompleted ? formatMatchDurationTaken(m) : `${m.roundDurationMinutes || m.durationMinutes || 20}m`}</span>
                                  <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-normal">✎</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Contextual Action Button */}
                          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
                            {isLive ? (
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                                >
                                  <span>Open Scorekeeper Desk</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer shadow-xs"
                                  title="Adjust match duration"
                                >
                                  <Clock className="w-3.5 h-3.5 text-[#E74C3C]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStopLive(m._id)}
                                  disabled={stoppingMatchId === m._id}
                                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FDEDEC] dark:hover:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                                  title="Stop live match if started mistakenly"
                                >
                                  <Square className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            ) : isReady ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const availableBoards = boards?.filter((b) => b?.status === 'available') || [];
                                    if (availableBoards.length === 0) {
                                      toast.error('All carrom boards are currently occupied! Add another board or wait for a match to conclude.');
                                    } else if (availableBoards.length === 1) {
                                      const tb = availableBoards[0];
                                      handleStartMatchOnBoard(m._id, tb?.boardNumber || 1, tb?.name || 'Board');
                                    } else {
                                      setBoardSelectMatch(m);
                                    }
                                  }}
                                  disabled={startingMatchId === m._id}
                                  className="flex-1 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{startingMatchId === m._id ? 'Starting...' : 'Start Match'}</span>
                                </button>
                                <button
                                  onClick={() => setSubstituteMatch(m)}
                                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold cursor-pointer shadow-xs flex items-center gap-1"
                                  title="Substitute partner or update match names"
                                >
                                  <Users className="w-3 h-3 text-[#E74C3C]" />
                                  <span>Partner</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold cursor-pointer shadow-xs flex items-center gap-1"
                                  title="Set how much time this match will take"
                                >
                                  <Clock className="w-3 h-3 text-[#E74C3C]" />
                                  <span>Set Time</span>
                                </button>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors shadow-xs flex items-center justify-center"
                                  title="Open scorekeeper desk"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Result Confirmed ({formatMatchDurationTaken(m)})</span>
                                </div>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="text-[11px] text-[#E74C3C] dark:text-[#D4A94C] hover:underline font-mono font-bold uppercase"
                                >
                                  Edit Winner →
                                </Link>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] italic font-mono truncate">
                                  WAITING (TBD)
                                </span>
                                <button
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[10px] text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                                  title="Pre-set time duration for this match"
                                >
                                  <Clock className="w-2.5 h-2.5 text-[#E74C3C]" />
                                  <span>{m.roundDurationMinutes || m.durationMinutes || 20}m (Set Time)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Byes / Automatic Advances in this Round */}
                {rg.byes.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-[#3E342B] dark:text-[#F5F1E8] font-bold font-mono">
                      <Crown className="w-3.5 h-3.5 text-[#E74C3C]" />
                      <span>Automatic Advances in {rg.roundName} ({rg.byes.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(rg.byes || []).filter(Boolean).map((m, mIdx) => {
                        const advancingTeam = m?.winnerTeam || m?.team1;
                        return (
                          <div
                            key={m?._id || mIdx}
                            className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] font-bold text-[10px] uppercase font-mono border border-[#D5C4A1] dark:border-[#2B3034]">
                                BYE
                              </span>
                              <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono">
                                Slot #{m.matchNumber}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xs truncate">
                                {advancingTeam?.name || 'Advancing Team'}
                              </h4>
                              <p className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                                BYE — Automatically Advanced
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* MODAL 1: Default Tournament Match Duration */}
      <Modal
        isOpen={schedulerModalOpen}
        onClose={() => setSchedulerModalOpen(false)}
        title="Default Match Duration & Schedule Generator"
      >
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1.5 text-[#7E7060] dark:text-[#B8B1A5] font-mono">
            <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">Single-Arena Match Timing:</p>
            <p>Set how long each match will take. This sets the countdown clock duration for all matches on the Main Carrom Board.</p>
          </div>

          {/* Round Duration with Quick Select Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E74C3C]" />
                <span>How much time per match?</span>
              </label>
              <span className="text-xs font-mono font-bold text-[#E74C3C] dark:text-[#D4A94C] bg-[#FDEDEC] dark:bg-[#E74C3C]/10 px-2 py-0.5 rounded-md">
                {scheduleSettings.roundDurationMinutes || scheduleSettings.matchDurationMinutes || 20} Min / Match
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[10, 15, 20, 25, 30, 45].map((mins) => {
                const isSelected = (scheduleSettings.roundDurationMinutes || scheduleSettings.matchDurationMinutes) === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setScheduleSettings({
                      ...scheduleSettings,
                      roundDurationMinutes: mins,
                      matchDurationMinutes: mins
                    })}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-[#3E342B] dark:bg-[#D4A94C] text-white dark:text-[#15191C] shadow-xs scale-[1.02]'
                        : 'bg-white dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] hover:border-[#3E342B]'
                    }`}
                  >
                    <span className="text-sm">{mins}m</span>
                    <span className="text-[9px] opacity-70 uppercase">min</span>
                  </button>
                );
              })}
            </div>

            <div className="relative pt-1">
              <input
                type="number"
                min="1"
                max="180"
                value={scheduleSettings.roundDurationMinutes || scheduleSettings.matchDurationMinutes || 20}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 20);
                  setScheduleSettings({
                    ...scheduleSettings,
                    roundDurationMinutes: val,
                    matchDurationMinutes: val
                  });
                }}
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 pr-16 text-sm font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
                placeholder="20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#7E7060] dark:text-[#817B72]">
                MINUTES
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <label className="text-[11px] font-bold text-[#7E7060] dark:text-[#817B72] block mb-1.5 uppercase font-mono">
              Optional: Tournament Match Start Time:
            </label>
            <input
              type="datetime-local"
              value={scheduleSettings.startTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
              className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setSchedulerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generatingSchedule}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{generatingSchedule ? 'Saving...' : 'Apply Default Duration'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Set Match Time / Duration for this specific match */}
      <Modal
        isOpen={editTimeModalOpen}
        onClose={() => setEditTimeModalOpen(false)}
        title={`Set Match Time — Match #${selectedMatch?.matchNumber}`}
      >
        <form onSubmit={handleSaveCustomTime} className="space-y-5">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1">
            <div className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72] uppercase font-bold">
              Match #{selectedMatch?.matchNumber} • {selectedMatch?.roundName || 'Knockout Round'}
            </div>
            <div className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">
              {selectedMatch?.team1?.name || 'TBD'} vs {selectedMatch?.team2?.name || 'TBD'}
            </div>
          </div>

          {/* Primary Section: Match Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E74C3C]" />
                <span>How much time will this match take?</span>
              </label>
              <span className="text-xs font-mono font-bold text-[#E74C3C] dark:text-[#D4A94C] bg-[#FDEDEC] dark:bg-[#E74C3C]/10 px-2 py-0.5 rounded-md">
                {customDuration} Minutes
              </span>
            </div>

            <p className="text-[11px] text-[#7E7060] dark:text-[#817B72]">
              Select a duration preset or enter custom minutes for this match&apos;s timer:
            </p>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[10, 15, 20, 25, 30, 45].map((mVal) => {
                const isSelected = Number(customDuration) === mVal;
                return (
                  <button
                    key={mVal}
                    type="button"
                    onClick={() => setCustomDuration(mVal)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-[#3E342B] dark:bg-[#D4A94C] text-white dark:text-[#15191C] shadow-xs scale-[1.02]'
                        : 'bg-white dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] hover:border-[#3E342B]'
                    }`}
                  >
                    <span className="text-sm">{mVal}m</span>
                    <span className="text-[9px] opacity-70 uppercase">min</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Input */}
            <div className="relative pt-1">
              <input
                type="number"
                min="1"
                max="180"
                value={customDuration}
                onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="Enter custom minutes"
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 pr-16 text-sm font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#7E7060] dark:text-[#817B72]">
                MINUTES
              </span>
            </div>
          </div>

          {/* Optional: Scheduled Start Time (Collapsible / Secondary) */}
          <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <label className="text-[11px] font-bold text-[#7E7060] dark:text-[#817B72] block mb-1.5 uppercase font-mono">
              Optional Scheduled Start Time (Clock):
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setEditTimeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTime}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingTime ? 'Saving...' : `SAVE MATCH TIME (${customDuration} MIN)`}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Add New Carrom Board */}
      <Modal
        isOpen={addBoardModalOpen}
        onClose={() => setAddBoardModalOpen(false)}
        title="Add New Carrom Board"
      >
        <form onSubmit={handleAddBoard} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1 font-mono text-[#7E7060] dark:text-[#B8B1A5]">
            <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">Multi-Board Management:</p>
            <p>Create another Carrom board so multiple arbiters can run and score matches simultaneously across different categories.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono block mb-1">
                Board Number:
              </label>
              <input
                type="number"
                min="1"
                required
                value={newBoardData.boardNumber}
                onChange={(e) => setNewBoardData({ ...newBoardData, boardNumber: e.target.value })}
                className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono block mb-1">
                Board Name / Arena Label:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Carrom Board 3 - Arena C"
                value={newBoardData.name}
                onChange={(e) => setNewBoardData({ ...newBoardData, name: e.target.value })}
                className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono block mb-1">
                Preferred Category (Optional):
              </label>
              <select
                value={newBoardData.assignedCategory}
                onChange={(e) => setNewBoardData({ ...newBoardData, assignedCategory: e.target.value })}
                className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              >
                <option value="all">All Categories (Flexible)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono block mb-1">
                Arbiter / Admin In Charge (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Admin Rohit"
                value={newBoardData.adminInCharge}
                onChange={(e) => setNewBoardData({ ...newBoardData, adminInCharge: e.target.value })}
                className="w-full h-10 bg-white dark:bg-[#181C1F] px-3 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setAddBoardModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingBoard}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingBoard ? 'Adding Board...' : 'Create Board'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Select Board to Start Match */}
      <Modal
        isOpen={Boolean(boardSelectMatch)}
        onClose={() => setBoardSelectMatch(null)}
        title={`Choose Board — Match #${boardSelectMatch?.matchNumber}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#E74C3C] uppercase font-bold">
                Match #{boardSelectMatch?.matchNumber} • {boardSelectMatch?.roundName}
              </span>
              {boardSelectMatch?.category && (
                <CategoryBadge category={boardSelectMatch.category} />
              )}
            </div>
            <div className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base">
              {boardSelectMatch?.team1?.name || 'TBD'} vs {boardSelectMatch?.team2?.name || 'TBD'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase font-mono block">
              Select available Carrom Board court:
            </label>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {boardSelectMatch && boards?.filter(Boolean).map((b) => {
                const isAvailable = b?.status === 'available';
                const isLive = b?.status === 'live';

                return (
                  <div
                    key={b?._id || b?.boardNumber}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isAvailable
                        ? 'bg-white dark:bg-[#15191C] border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#E74C3C]'
                        : 'bg-[#FAF9F6]/60 dark:bg-[#181C1F]/40 border-[#E8E1D5] dark:border-[#2B3034] opacity-70'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8]">
                          Court #{b?.boardNumber}
                        </span>
                        <span className="font-serif font-bold text-xs text-[#3E342B] dark:text-[#F5F1E8]">
                          {b?.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72]">
                        {isLive
                          ? `Occupied by Match #${b?.currentMatch?.matchNumber || 'Live'}`
                          : 'Ready & Available'}
                      </p>
                    </div>

                    {isAvailable ? (
                      <button
                        onClick={() => handleStartMatchOnBoard(boardSelectMatch?._id, b?.boardNumber, b?.name)}
                        disabled={startingMatchId === boardSelectMatch?._id}
                        className="px-3.5 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Launch Here</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#E74C3C] font-bold uppercase px-2 py-1 rounded bg-[#E74C3C]/10 border border-[#E74C3C]/30">
                        In Use
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setBoardSelectMatch(null)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Choose Match to Launch on Court */}
      <Modal
        isOpen={Boolean(launchOnCourt)}
        onClose={() => setLaunchOnCourt(null)}
        title={`Launch Match on Court #${launchOnCourt?.boardNumber} (${launchOnCourt?.name})`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034] text-xs">
            <span className="font-mono text-[#7E7060] dark:text-[#817B72]">
              Select which match to launch on this court:
            </span>
            {launchOnCourt?.assignedCategory && launchOnCourt?.assignedCategory !== 'all' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800/60">
                Focus: {CATEGORIES.find((c) => c.id === launchOnCourt.assignedCategory)?.name || launchOnCourt.assignedCategory}
              </span>
            )}
          </div>

          {/* Category Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCourtModalCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                courtModalCategory === 'all'
                  ? 'bg-[#3E342B] text-white dark:bg-[#D4A94C] dark:text-[#15191C]'
                  : 'bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8]'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCourtModalCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  courtModalCategory === cat.id
                    ? 'bg-[#3E342B] text-white dark:bg-[#D4A94C] dark:text-[#15191C]'
                    : 'bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Scheduled Matches Selection List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(() => {
              const liveMatches = matches.filter((m) => m?.status === 'live');
              const livePlayerIds = new Set();
              liveMatches.forEach((m) => {
                const ids = [
                  m?.team1?.player1?._id || m?.team1?.player1,
                  m?.team1?.player2?._id || m?.team1?.player2,
                  m?.team2?.player1?._id || m?.team2?.player1,
                  m?.team2?.player2?._id || m?.team2?.player2
                ].filter(Boolean).map((id) => id.toString());
                ids.forEach((id) => livePlayerIds.add(id));
              });

              const filtered = matches.filter((m) => {
                if (m?.status !== 'scheduled' || m?.isBye || !m?.team1 || !m?.team2) return false;
                if (courtModalCategory !== 'all' && m.category !== courtModalCategory) return false;
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-[#7E7060] dark:text-[#817B72] border border-dashed border-[#D5C4A1] dark:border-[#2B3034] rounded-xl font-mono">
                    No scheduled matches waiting in this category.
                  </div>
                );
              }

              return filtered.map((m) => {
                const matchPlayerIds = [
                  m?.team1?.player1?._id || m?.team1?.player1,
                  m?.team1?.player2?._id || m?.team1?.player2,
                  m?.team2?.player1?._id || m?.team2?.player1,
                  m?.team2?.player2?._id || m?.team2?.player2
                ].filter(Boolean).map((id) => id.toString());

                const hasConflict = matchPlayerIds.some((id) => livePlayerIds.has(id));
                const conflictingLiveMatch = hasConflict ? liveMatches.find((lm) => {
                  const lmIds = [
                    lm?.team1?.player1?._id || lm?.team1?.player1,
                    lm?.team1?.player2?._id || lm?.team1?.player2,
                    lm?.team2?.player1?._id || lm?.team2?.player1,
                    lm?.team2?.player2?._id || lm?.team2?.player2
                  ].filter(Boolean).map((id) => id.toString());
                  return matchPlayerIds.some((id) => lmIds.includes(id));
                }) : null;

                return (
                  <div
                    key={m._id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      hasConflict
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/40'
                        : 'bg-white dark:bg-[#15191C] border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#E74C3C]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                        <span className="font-bold text-[#E74C3C]">M#{m.matchNumber}</span>
                        <span>•</span>
                        <span className="font-semibold">{m.roundName}</span>
                        <CategoryBadge category={m.category} />
                      </div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#3E342B] dark:text-[#F5F1E8] truncate">
                        {m.team1?.name} vs {m.team2?.name}
                      </div>
                      {hasConflict && (
                        <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <span>⚠️ Contestant playing on Board #{conflictingLiveMatch?.carromBoardNumber || 1} (M#{conflictingLiveMatch?.matchNumber})</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartMatchOnBoard(m._id, launchOnCourt?.boardNumber || 1, launchOnCourt?.name || 'Board', hasConflict)}
                        disabled={startingMatchId === m._id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                          hasConflict
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'btn-primary'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{hasConflict ? 'Force Launch' : 'Launch'}</span>
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setLaunchOnCourt(null)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Substitute Partner Modal */}
      <SubstitutePartnerModal
        isOpen={Boolean(substituteMatch)}
        match={substituteMatch}
        onClose={() => setSubstituteMatch(null)}
        onSuccess={() => fetchMatchesAndTeams()}
      />
    </div>
  );
}


