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
  Timer
} from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { CategoryCoinPair } from '@/components/ui/CarromElements';

export default function AdminMatchesPage() {
  const router = useRouter();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [arenaState, setArenaState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Category Level Hierarchy: 'singles' | 'doubles' | 'mixed'
  const [mainTab, setMainTab] = useState('singles');
  const [activeCategory, setActiveCategory] = useState('boys_singles');
  const [selectedRoundStage, setSelectedRoundStage] = useState('all');

  // Scheduler Settings Modal
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    matchDurationMinutes: 30,
    breakTimeMinutes: 5,
    minRestTimeMinutes: 10
  });
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  // Adjust Single Match Estimated Time Modal
  const [editTimeModalOpen, setEditTimeModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [customTime, setCustomTime] = useState('');
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
      if (arenaRes.success) setArenaState(arenaRes);
      if (tournRes.success && tournRes.tournament?.scheduleSettings) {
        const s = tournRes.tournament.scheduleSettings;
        setScheduleSettings({
          startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          matchDurationMinutes: s.matchDurationMinutes || 30,
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

  const handleStartMatch = async (matchId) => {
    setStartingMatchId(matchId);
    try {
      const res = await api.startMatch(matchId);
      if (res.success) {
        router.push(`/admin/matches/${matchId}/score`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start match.');
      fetchMatchesAndTeams();
    } finally {
      setStartingMatchId(null);
    }
  };

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    setGeneratingSchedule(true);
    try {
      const res = await api.generateSchedule(scheduleSettings);
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
    setEditTimeModalOpen(true);
  };

  const handleSaveCustomTime = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSavingTime(true);
    try {
      const res = await api.scheduleMatch(selectedMatch._id, {
        scheduledTime: customTime ? new Date(customTime) : null
      });
      if (res.success) {
        toast.success('Match scheduled time updated.');
        setEditTimeModalOpen(false);
        fetchMatchesAndTeams();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update scheduled time.');
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
            Sequential timeline manager, cross-category player rest monitor, and live scoring control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSchedulerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-[#E74C3C]" />
            <span>Configure Schedule</span>
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
                    {rg.matches.map((m) => {
                      const isWaiting = m.status === 'pending' || (!m.team1 && !m.team2);
                      const isLive = m.status === 'live';
                      const isCompleted = m.status === 'completed';
                      const isReady = m.status === 'scheduled';

                      const isT1Win =
                        m.winnerTeam &&
                        (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
                      const isT2Win =
                        m.winnerTeam &&
                        (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

                      return (
                        <div
                          key={m._id}
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
                                  {m.queuePosition ? (
                                    <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Queue #{m.queuePosition}</span>
                                  ) : isCompleted ? (
                                    <span className="text-[#7E7060] dark:text-[#817B72]">Completed</span>
                                  ) : (
                                    <span className="text-[#E74C3C] dark:text-[#D4A94C] font-bold">In Play</span>
                                  )}
                                </div>
                                {m.scheduledTime ? (
                                  <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8]">
                                    Est. {new Date(m.scheduledTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-[#7E7060] dark:text-[#817B72] font-mono">Time TBD</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Contextual Action Button */}
                          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
                            {isLive ? (
                              <Link
                                href={`/admin/matches/${m._id}/score`}
                                className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                              >
                                <span>Open Scorekeeper Desk</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : isReady ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartMatch(m._id)}
                                  disabled={isBoardOccupied || startingMatchId === m._id}
                                  className="flex-1 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer uppercase"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isBoardOccupied ? 'Queued' : 'Start Match'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[11px] text-[#3E342B] dark:text-[#F5F1E8] font-mono cursor-pointer shadow-xs"
                                  title="Adjust estimated time"
                                >
                                  Time
                                </button>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors shadow-xs"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                                  ✓ Result Confirmed
                                </span>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="text-[11px] text-[#E74C3C] dark:text-[#D4A94C] hover:underline font-mono font-bold uppercase"
                                >
                                  Edit Winner →
                                </Link>
                              </div>
                            ) : (
                              <div className="text-center text-[11px] text-[#7E7060] dark:text-[#817B72] italic py-1 font-mono">
                                WAITING (Opponents TBD)
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
                      {rg.byes.map((m) => {
                        const advancingTeam = m.winnerTeam || m.team1;
                        return (
                          <div
                            key={m._id}
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

      {/* MODAL 1: Configure Sequential Schedule Settings */}
      <Modal
        isOpen={schedulerModalOpen}
        onClose={() => setSchedulerModalOpen(false)}
        title="Configure Sequential Schedule — Main Carrom Board"
      >
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1.5 text-[#7E7060] dark:text-[#B8B1A5] font-mono">
            <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">Single-Arena Sequential Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All matches are scheduled sequentially on the <strong>Main Carrom Board</strong>.</li>
              <li>Participant rest times are verified across all divisions.</li>
              <li>Only <strong>READY</strong> matches with determined opponents are queued.</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Tournament Match Start Time:
            </label>
            <input
              type="datetime-local"
              value={scheduleSettings.startTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Match Duration (min):
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={scheduleSettings.matchDurationMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, matchDurationMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Break Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.breakTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, breakTimeMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
                Min Rest Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.minRestTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, minRestTimeMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
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
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider"
            >
              {generatingSchedule ? 'Generating Sequential Schedule...' : 'Generate Sequential Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Adjust Single Match Estimated Time */}
      <Modal
        isOpen={editTimeModalOpen}
        onClose={() => setEditTimeModalOpen(false)}
        title={`Adjust Estimated Time — Match #${selectedMatch?.matchNumber}`}
      >
        <form onSubmit={handleSaveCustomTime} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs">
            <div className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mb-1 text-sm">{selectedMatch?.team1?.name} vs {selectedMatch?.team2?.name}</div>
            <div className="text-[#E74C3C] dark:text-[#D4A94C] font-mono font-bold">Queue Position: #{selectedMatch?.queuePosition || 'N/A'}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Estimated Scheduled Start Time:
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
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
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer uppercase tracking-wider"
            >
              {savingTime ? 'Saving...' : 'Save Time'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


