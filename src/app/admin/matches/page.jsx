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

export default function AdminMatchesPage() {
  const router = useRouter();
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
      alert(err.message || 'Failed to start match.');
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
        alert('Sequential schedule generated successfully for Main Carrom Board!');
        setSchedulerModalOpen(false);
        fetchMatchesAndTeams();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate schedule.');
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
        setEditTimeModalOpen(false);
        fetchMatchesAndTeams();
      }
    } catch (err) {
      alert(err.message || 'Failed to update scheduled time.');
    } finally {
      setSavingTime(false);
    }
  };

  // Sync sub-category when main tier changes
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1C2B48]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase tracking-widest">
              Sequential Arena Scheduler
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Matches & Fixtures Manager</h1>
          <p className="text-xs text-[#94A3B8]">
            Sequential timeline manager, cross-category player rest monitor, and live scoring control.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSchedulerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E1626] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-xs font-semibold text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Configure Sequential Schedule</span>
          </button>

          <button
            onClick={fetchMatchesAndTeams}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E1626] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1C2B48] pb-2">
          <button
            onClick={() => handleMainTabChange('singles')}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
              mainTab === 'singles'
                ? 'bg-[#D4AF37] text-[#070B16] shadow-sm'
                : 'bg-[#0E1626] text-[#94A3B8] hover:text-white hover:bg-[#141F36]'
            }`}
          >
            SINGLES
          </button>

          <button
            onClick={() => handleMainTabChange('doubles')}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
              mainTab === 'doubles'
                ? 'bg-[#D4AF37] text-[#070B16] shadow-sm'
                : 'bg-[#0E1626] text-[#94A3B8] hover:text-white hover:bg-[#141F36]'
            }`}
          >
            DOUBLES
          </button>

          <button
            onClick={() => handleMainTabChange('mixed')}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
              mainTab === 'mixed'
                ? 'bg-[#D4AF37] text-[#070B16] shadow-sm'
                : 'bg-[#0E1626] text-[#94A3B8] hover:text-white hover:bg-[#141F36]'
            }`}
          >
            MIXED DOUBLES
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {tabCategories.map((c) => {
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSubCategoryChange(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[#0E1626] border-[#D4AF37] text-white shadow-sm'
                    : 'bg-[#070B16] border-[#1C2B48] text-[#94A3B8] hover:text-white hover:border-[#2D426B]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATEGORY STATS BANNER */}
      <div className="sport-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1C2B48]">
          <div className="flex items-center gap-3">
            <CategoryBadge category={activeCategory} />
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                {CATEGORIES.find((c) => c.id === activeCategory)?.name}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {categoryStats.totalPlayers} Approved Entries • {roundGroups.length} Knockout Rounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="px-3.5 py-1.5 rounded-xl bg-[#070B16] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-[#D4AF37] font-semibold transition-colors flex items-center gap-1"
            >
              <span>View Bracket Tree</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Total Entries</span>
            <span className="text-2xl font-bold font-mono text-white">{categoryStats.totalPlayers}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[10px] text-blue-400 uppercase font-semibold block">READY in Queue</span>
            <span className="text-2xl font-bold font-mono text-blue-400">{categoryStats.ready}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">WAITING (TBD)</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{categoryStats.waiting}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Completed</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{categoryStats.completed}</span>
          </div>
        </div>

        {roundGroups.length > 0 && (
          <div className="pt-2 border-t border-[#1C2B48]/80">
            <div className="text-[11px] text-[#94A3B8] font-semibold mb-2">Tournament Stages:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedRoundStage('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedRoundStage === 'all'
                    ? 'bg-[#D4AF37] text-[#070B16]'
                    : 'bg-[#070B16] text-[#94A3B8] hover:text-white border border-[#1C2B48]'
                }`}
              >
                All Rounds ({roundGroups.length})
              </button>

              {roundGroups.map((rg) => {
                const isSelected = selectedRoundStage === String(rg.roundNumber);
                return (
                  <button
                    key={rg.roundNumber}
                    onClick={() => setSelectedRoundStage(String(rg.roundNumber))}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#070B16]'
                        : 'bg-[#070B16] text-[#94A3B8] hover:text-white border border-[#1C2B48]'
                    }`}
                  >
                    <span>{rg.roundName}</span>
                    <span className="font-mono text-[10px] opacity-80">({rg.matches.length} matches)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. ROUND-BY-ROUND FIXTURES BREAKDOWN */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Loading tournament rounds...</span>
        </div>
      ) : roundGroups.length === 0 ? (
        <div className="p-12 text-center sport-card">
          <Calendar className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No Draw Generated for {activeCategory.replace('_', ' ').toUpperCase()}</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Please generate and publish the knockout draw in the Draws section to create the bracket and match fixtures.
          </p>
          <div className="mt-4">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#070B16] font-bold text-xs shadow-sm"
            >
              Generate Draw Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {roundGroups
            .filter((rg) => selectedRoundStage === 'all' || String(rg.roundNumber) === selectedRoundStage)
            .map((rg) => (
              <div key={rg.roundNumber} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1C2B48]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <h3 className="text-lg font-bold font-display text-white">
                      {rg.roundName}
                    </h3>
                    <span className="text-xs text-[#94A3B8] font-mono">
                      (Round {rg.roundNumber} of {roundGroups.length})
                    </span>
                  </div>

                  <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-3">
                    <span>
                      <strong className="text-white">{rg.matches.length}</strong> Playable Matches
                    </span>
                    {rg.byes.length > 0 && (
                      <span className="text-purple-300">
                        <strong className="text-purple-300">{rg.byes.length}</strong> Automatic Advances
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
                          className={`sport-card p-5 space-y-4 flex flex-col justify-between transition-all ${
                            isLive
                              ? 'border-emerald-500/50 bg-[#0E1626]'
                              : isCompleted
                              ? 'border-blue-500/30'
                              : isWaiting
                              ? 'opacity-70 bg-[#070B16]/60 border-[#1C2B48]'
                              : 'border-[#1C2B48]'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1C2B48]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#D4AF37] text-[11px]">
                                  M#{m.matchNumber}
                                </span>
                                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Main Carrom Board
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              {/* Team 1 */}
                              <div
                                className={`p-2.5 rounded-lg flex items-center justify-between ${
                                  isT1Win
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20'
                                    : m.team1
                                    ? 'bg-[#070B16] text-white font-medium'
                                    : 'bg-[#070B16]/50 text-[#64748B] italic'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team1 ? m.team1.name : 'Waiting for winner...'}</span>
                                {isCompleted && (
                                  <span className="font-mono font-bold">{m.finalScore?.team1BoardsWon || 0}</span>
                                )}
                              </div>

                              <div className="text-center text-[10px] text-[#64748B] uppercase font-semibold">VS</div>

                              {/* Team 2 */}
                              <div
                                className={`p-2.5 rounded-lg flex items-center justify-between ${
                                  isT2Win
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20'
                                    : m.team2
                                    ? 'bg-[#070B16] text-white font-medium'
                                    : 'bg-[#070B16]/50 text-[#64748B] italic'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team2 ? m.team2.name : 'Waiting for winner...'}</span>
                                {isCompleted && (
                                  <span className="font-mono font-bold">{m.finalScore?.team2BoardsWon || 0}</span>
                                )}
                              </div>
                            </div>

                            {/* Schedule Time & Queue Info */}
                            {!isWaiting && (
                              <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[11px] text-[#94A3B8]">
                                <div className="font-mono">
                                  {m.queuePosition ? (
                                    <span className="text-blue-300 font-semibold">Queue #{m.queuePosition}</span>
                                  ) : isCompleted ? (
                                    <span className="text-slate-400">Completed</span>
                                  ) : (
                                    <span className="text-emerald-400">In Play</span>
                                  )}
                                </div>
                                {m.scheduledTime ? (
                                  <span className="font-mono text-slate-200">
                                    Est. {new Date(m.scheduledTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-[#64748B]">Time TBD</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Contextual Action Button */}
                          <div className="pt-3 border-t border-[#1C2B48]">
                            {isLive ? (
                              <Link
                                href={`/admin/matches/${m._id}/score`}
                                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <span>Open Scorekeeper Desk</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : isReady ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartMatch(m._id)}
                                  disabled={isBoardOccupied || startingMatchId === m._id}
                                  className="flex-1 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] disabled:bg-[#141F36] disabled:text-[#64748B] text-[#070B16] font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isBoardOccupied ? 'Queued' : 'Start Match'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-2.5 py-2 rounded-xl bg-[#070B16] hover:bg-[#141F36] border border-[#1C2B48] text-[11px] text-slate-300 font-mono"
                                  title="Adjust estimated time"
                                >
                                  Time
                                </button>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="px-2.5 py-2 rounded-xl bg-[#070B16] hover:bg-[#141F36] border border-[#1C2B48] text-xs font-semibold text-[#D4AF37] transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    setViewMatch(m);
                                    setResultModalOpen(true);
                                  }}
                                  className="text-xs font-semibold text-blue-400 hover:underline"
                                >
                                  View Scorecard →
                                </button>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="text-[11px] text-[#94A3B8] hover:text-[#D4AF37] font-mono"
                                >
                                  Edit / Correct
                                </Link>
                              </div>
                            ) : (
                              <div className="text-center text-[11px] text-[#64748B] italic py-1">
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
                    <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
                      <Crown className="w-3.5 h-3.5 text-purple-400" />
                      <span>Automatic Advances in {rg.roundName} ({rg.byes.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rg.byes.map((m) => {
                        const advancingTeam = m.winnerTeam || m.team1;
                        return (
                          <div
                            key={m._id}
                            className="p-4 rounded-xl bg-[#0E1626]/80 border border-purple-500/30 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase font-mono">
                                BYE
                              </span>
                              <span className="text-[10px] text-[#64748B] font-mono">
                                Slot #{m.matchNumber}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-white text-xs truncate">
                                {advancingTeam?.name || 'Advancing Team'}
                              </h4>
                              <p className="text-[11px] text-purple-300">
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
          <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48] text-xs space-y-1.5 text-[#94A3B8]">
            <p className="font-bold text-white">Single-Arena Sequential Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All matches are scheduled sequentially on the <strong>Main Carrom Board</strong>.</li>
              <li>Participant rest times are verified across all categories (both doubles players checked).</li>
              <li>Only <strong>READY</strong> matches with determined opponents are scheduled.</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
              Tournament Match Start Time:
            </label>
            <input
              type="datetime-local"
              value={scheduleSettings.startTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
              className="w-full h-10 bg-[#070B16] px-3 text-xs text-slate-200 rounded-xl border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Match Duration (min):
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={scheduleSettings.matchDurationMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, matchDurationMinutes: Number(e.target.value) })}
                className="w-full h-10 bg-[#070B16] px-3 text-xs text-slate-200 rounded-xl border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Break Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.breakTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, breakTimeMinutes: Number(e.target.value) })}
                className="w-full h-10 bg-[#070B16] px-3 text-xs text-slate-200 rounded-xl border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Min Rest Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.minRestTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, minRestTimeMinutes: Number(e.target.value) })}
                className="w-full h-10 bg-[#070B16] px-3 text-xs text-slate-200 rounded-xl border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C2B48]">
            <button
              type="button"
              onClick={() => setSchedulerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generatingSchedule}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-colors"
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
          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] text-xs">
            <div className="font-bold text-white mb-1">{selectedMatch?.team1?.name} vs {selectedMatch?.team2?.name}</div>
            <div className="text-[#94A3B8] font-mono">Queue Position: #{selectedMatch?.queuePosition || 'N/A'}</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
              Estimated Scheduled Start Time:
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full h-10 bg-[#070B16] px-3 text-xs text-slate-200 rounded-xl border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C2B48]">
            <button
              type="button"
              onClick={() => setEditTimeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTime}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-colors"
            >
              {savingTime ? 'Saving...' : 'Save Time'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: View Detailed Scorecard */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={`Match Result Scorecard — Match #${viewMatch?.matchNumber}`}
      >
        {viewMatch && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] text-center space-y-2">
              <div className="text-xs font-mono text-[#D4AF37] font-bold">
                {viewMatch.roundName}
              </div>
              <div className="flex items-center justify-center gap-4 text-base font-bold text-white">
                <span className={viewMatch.winnerTeam?._id === viewMatch.team1?._id ? 'text-[#D4AF37]' : ''}>
                  {viewMatch.team1?.name}
                </span>
                <span className="font-mono text-2xl text-[#D4AF37]">
                  {viewMatch.finalScore?.team1BoardsWon} - {viewMatch.finalScore?.team2BoardsWon}
                </span>
                <span className={viewMatch.winnerTeam?._id === viewMatch.team2?._id ? 'text-[#D4AF37]' : ''}>
                  {viewMatch.team2?.name}
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Winner: {viewMatch.winnerTeam?.name} (Advanced)
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Board-by-Board Breakdown
              </h4>
              <div className="space-y-2">
                {viewMatch.boards?.map((b) => (
                  <div
                    key={b.boardNumber}
                    className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">Board {b.boardNumber}</span>
                      <span className="text-[#94A3B8] block text-[11px]">
                        Queen: {b.queenPocketedBy === 'none' ? 'None' : b.queenPocketedBy} {b.queenCovered ? '(Covered)' : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#D4AF37] text-sm">
                        {b.team1Score} - {b.team2Score}
                      </span>
                      <span className="text-[#94A3B8] block text-[11px]">
                        Winner: {b.boardWinner === 'team1' ? viewMatch.team1?.name : b.boardWinner === 'team2' ? viewMatch.team2?.name : 'Tied/None'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
