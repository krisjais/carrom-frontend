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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-[#FFD691] font-bold uppercase tracking-widest">
              Sequential Arena Scheduler
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white">Matches & Fixtures Manager</h1>
          <p className="text-xs text-[#D4DEEE]">
            Sequential timeline manager, cross-category player rest monitor, and live scoring control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSchedulerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3258] border border-[#35538C] hover:border-[#D7A859] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#FFD691]" />
            <span>Configure Schedule</span>
          </button>

          <button
            onClick={fetchMatchesAndTeams}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E3258] border border-[#35538C] hover:border-[#D7A859] text-xs font-bold text-[#D4DEEE] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD691]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#35538C] pb-2">
          <button
            onClick={() => handleMainTabChange('singles')}
            className={`px-5 py-2.5 rounded-full font-display font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              mainTab === 'singles'
                ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
            }`}
          >
            SINGLES
          </button>

          <button
            onClick={() => handleMainTabChange('doubles')}
            className={`px-5 py-2.5 rounded-full font-display font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              mainTab === 'doubles'
                ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
            }`}
          >
            DOUBLES
          </button>

          <button
            onClick={() => handleMainTabChange('mixed')}
            className={`px-5 py-2.5 rounded-full font-display font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              mainTab === 'mixed'
                ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
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
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E3258] border-[#FFD691] text-white shadow-sm'
                    : 'bg-[#152442] border-[#35538C] text-[#D4DEEE] hover:text-white hover:border-[#FFD691]/50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATEGORY STATS BANNER */}
      <div className="sport-card p-6 space-y-5 rounded-3xl border border-[#35538C]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#35538C]">
          <div className="flex items-center gap-3">
            <CategoryBadge category={activeCategory} />
            <div>
              <h2 className="text-xl font-black font-display text-white">
                {CATEGORIES.find((c) => c.id === activeCategory)?.name}
              </h2>
              <p className="text-xs text-[#D4DEEE]">
                {categoryStats.totalPlayers} Approved Entries • {roundGroups.length} Knockout Rounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="px-4 py-2 rounded-xl bg-[#152442] border border-[#35538C] hover:border-[#D7A859] text-[#FFD691] font-bold transition-colors flex items-center gap-1.5"
            >
              <span>View Bracket Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[10px] text-[#D4DEEE] uppercase font-bold block">Total Entries</span>
            <span className="text-2xl font-black font-mono text-white">{categoryStats.totalPlayers}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[10px] text-[#FFD691] uppercase font-bold block">READY in Queue</span>
            <span className="text-2xl font-black font-mono text-[#FFD691]">{categoryStats.ready}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">WAITING (TBD)</span>
            <span className="text-2xl font-black font-mono text-amber-300">{categoryStats.waiting}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Completed</span>
            <span className="text-2xl font-black font-mono text-emerald-300">{categoryStats.completed}</span>
          </div>
        </div>

        {roundGroups.length > 0 && (
          <div className="pt-2 border-t border-[#35538C]">
            <div className="text-[11px] text-[#D4DEEE] font-bold mb-2 uppercase tracking-wider">Tournament Stages:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedRoundStage('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedRoundStage === 'all'
                    ? 'bg-[#FFD691] text-[#233A66] font-black'
                    : 'bg-[#152442] text-[#D4DEEE] hover:text-white border border-[#35538C]'
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
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD691] text-[#233A66] font-black'
                        : 'bg-[#152442] text-[#D4DEEE] hover:text-white border border-[#35538C]'
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
        <div className="py-20 text-center text-xs text-[#D4DEEE] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFD691]" />
          <span>Loading tournament rounds...</span>
        </div>
      ) : roundGroups.length === 0 ? (
        <div className="p-12 text-center sport-card rounded-3xl space-y-3">
          <Calendar className="w-8 h-8 text-[#FFD691] mx-auto mb-2 opacity-70" />
          <h3 className="text-base font-black text-white font-display">No Draw Generated for {activeCategory.replace('_', ' ').toUpperCase()}</h3>
          <p className="text-xs text-[#D4DEEE] max-w-sm mx-auto">
            Please generate and publish the knockout draw in the Draws section to create the bracket and match fixtures.
          </p>
          <div className="mt-4">
            <Link
              href={`/admin/draws?category=${activeCategory}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl btn-cream font-black text-xs shadow-md"
            >
              Generate Draw Now →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {roundGroups
            .filter((rg) => selectedRoundStage === 'all' || String(rg.roundNumber) === selectedRoundStage)
            .map((rg) => (
              <div key={rg.roundNumber} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#35538C]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD691]" />
                    <h3 className="text-lg font-black font-display text-white">
                      {rg.roundName}
                    </h3>
                    <span className="text-xs text-[#D4DEEE] font-mono">
                      (Round {rg.roundNumber} of {roundGroups.length})
                    </span>
                  </div>

                  <div className="text-xs text-[#D4DEEE] font-mono flex items-center gap-3">
                    <span>
                      <strong className="text-white">{rg.matches.length}</strong> Playable Matches
                    </span>
                    {rg.byes.length > 0 && (
                      <span className="text-[#FFD691]">
                        <strong className="text-[#FFD691]">{rg.byes.length}</strong> Automatic Advances
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
                          className={`sport-card p-5 space-y-4 rounded-3xl flex flex-col justify-between transition-all ${
                            isLive
                              ? 'border-emerald-500/60 bg-[#1E3258]'
                              : isCompleted
                              ? 'border-[#FFD691]/40'
                              : isWaiting
                              ? 'opacity-70 bg-[#152442]/60 border-[#35538C]'
                              : 'border-[#35538C]'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#35538C]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-[#FFD691] text-[11px]">
                                  M#{m.matchNumber}
                                </span>
                                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                              </div>
                              <span className="text-[10px] font-mono text-[#D4DEEE]">
                                Main Carrom Board
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Team 1 */}
                              <div
                                className={`p-3 rounded-2xl flex items-center justify-between ${
                                  isT1Win
                                    ? 'bg-[#FFD691]/20 text-[#FFD691] font-black border border-[#FFD691]/40'
                                    : m.team1
                                    ? 'bg-[#152442] text-white font-bold'
                                    : 'bg-[#152442]/50 text-slate-400 italic'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team1 ? m.team1.name : 'Waiting for winner...'}</span>
                                {isT1Win && <span className="font-mono text-[10px] text-[#FFD691] font-bold">✓ WINNER</span>}
                              </div>

                              <div className="text-center text-[10px] text-[#D4DEEE] font-black font-mono">VS</div>

                              {/* Team 2 */}
                              <div
                                className={`p-3 rounded-2xl flex items-center justify-between ${
                                  isT2Win
                                    ? 'bg-[#FFD691]/20 text-[#FFD691] font-black border border-[#FFD691]/40'
                                    : m.team2
                                    ? 'bg-[#152442] text-white font-bold'
                                    : 'bg-[#152442]/50 text-slate-400 italic'
                                }`}
                              >
                                <span className="truncate pr-2">{m.team2 ? m.team2.name : 'Waiting for winner...'}</span>
                                {isT2Win && <span className="font-mono text-[10px] text-[#FFD691] font-bold">✓ WINNER</span>}
                              </div>
                            </div>

                            {/* Schedule Time & Queue Info */}
                            {!isWaiting && (
                              <div className="pt-2 border-t border-[#35538C] flex items-center justify-between text-[11px] text-[#D4DEEE]">
                                <div className="font-mono">
                                  {m.queuePosition ? (
                                    <span className="text-[#FFD691] font-bold">Queue #{m.queuePosition}</span>
                                  ) : isCompleted ? (
                                    <span className="text-slate-300">Completed</span>
                                  ) : (
                                    <span className="text-emerald-300 font-bold">In Play</span>
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
                                  <span className="text-[#D4DEEE]/60">Time TBD</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Contextual Action Button */}
                          <div className="pt-3 border-t border-[#35538C]">
                            {isLive ? (
                              <Link
                                href={`/admin/matches/${m._id}/score`}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span>Open Scorekeeper Desk</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : isReady ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartMatch(m._id)}
                                  disabled={isBoardOccupied || startingMatchId === m._id}
                                  className="flex-1 py-2 rounded-xl btn-cream text-xs font-black shadow-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isBoardOccupied ? 'Queued' : 'Start Match'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditTime(m)}
                                  className="px-3 py-2 rounded-xl bg-[#152442] hover:bg-[#1E3258] border border-[#35538C] text-[11px] text-[#D4DEEE] font-mono cursor-pointer"
                                  title="Adjust estimated time"
                                >
                                  Time
                                </button>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="px-3 py-2 rounded-xl bg-[#152442] hover:bg-[#1E3258] border border-[#35538C] text-xs font-bold text-[#FFD691] transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-300 font-bold">
                                  ✓ Result Confirmed
                                </span>
                                <Link
                                  href={`/admin/matches/${m._id}/score`}
                                  className="text-[11px] text-[#FFD691] hover:underline font-mono font-bold"
                                >
                                  Edit Winner →
                                </Link>
                              </div>
                            ) : (
                              <div className="text-center text-[11px] text-[#D4DEEE]/60 italic py-1">
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
                    <div className="flex items-center gap-2 text-xs text-[#FFD691] font-bold">
                      <Crown className="w-3.5 h-3.5 text-[#FFD691]" />
                      <span>Automatic Advances in {rg.roundName} ({rg.byes.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rg.byes.map((m) => {
                        const advancingTeam = m.winnerTeam || m.team1;
                        return (
                          <div
                            key={m._id}
                            className="p-4 rounded-2xl bg-[#152442] border border-[#D7A859]/30 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#D7A859]/20 text-[#FFECC7] font-bold text-[10px] uppercase font-mono">
                                BYE
                              </span>
                              <span className="text-[10px] text-[#D4DEEE] font-mono">
                                Slot #{m.matchNumber}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-white text-xs truncate">
                                {advancingTeam?.name || 'Advancing Team'}
                              </h4>
                              <p className="text-[11px] text-[#FFECC7]">
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
          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] text-xs space-y-1.5 text-[#D4DEEE]">
            <p className="font-bold text-white">Single-Arena Sequential Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All matches are scheduled sequentially on the <strong>Main Carrom Board</strong>.</li>
              <li>Participant rest times are verified across all categories.</li>
              <li>Only <strong>READY</strong> matches with determined opponents are scheduled.</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Tournament Match Start Time:
            </label>
            <input
              type="datetime-local"
              value={scheduleSettings.startTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Match Duration (min):
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={scheduleSettings.matchDurationMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, matchDurationMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Break Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.breakTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, breakTimeMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
                Min Rest Time (min):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={scheduleSettings.minRestTimeMinutes}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, minRestTimeMinutes: Number(e.target.value) })}
                className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#35538C]">
            <button
              type="button"
              onClick={() => setSchedulerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#D4DEEE] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generatingSchedule}
              className="px-6 py-2.5 rounded-xl btn-cream text-xs font-black shadow-md transition-all cursor-pointer"
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
          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] text-xs">
            <div className="font-black text-white mb-1">{selectedMatch?.team1?.name} vs {selectedMatch?.team2?.name}</div>
            <div className="text-[#FFD691] font-mono font-bold">Queue Position: #{selectedMatch?.queuePosition || 'N/A'}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Estimated Scheduled Start Time:
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#35538C]">
            <button
              type="button"
              onClick={() => setEditTimeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#D4DEEE] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTime}
              className="px-6 py-2.5 rounded-xl btn-cream text-xs font-black shadow-md transition-all cursor-pointer"
            >
              {savingTime ? 'Saving...' : 'Save Time'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
