'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Swords, Play, CheckCircle2, XCircle, Trophy, Loader2, Plus, Sparkles, AlertCircle } from 'lucide-react';

export default function ChessAdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);
  const [filterRound, setFilterRound] = useState('all');
  const [resultModalMatch, setResultModalMatch] = useState(null);

  // Create Round Modal State
  const [isCreateRoundModalOpen, setIsCreateRoundModalOpen] = useState(false);
  const [roundNameInput, setRoundNameInput] = useState('');
  const [createRoundLoading, setCreateRoundLoading] = useState(false);

  const [p1Captured, setP1Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [p2Captured, setP2Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [winnerChoice, setWinnerChoice] = useState('none');
  const [resultTypeChoice, setResultTypeChoice] = useState('checkmate');
  const [submitLoading, setSubmitLoading] = useState(false);

  async function loadRounds() {
    try {
      const res = await chessApi.getAdminRounds();
      if (res.success && Array.isArray(res.data)) {
        setRounds(res.data);
        if (res.data.length > 0) {
          setSelectedRound((prev) => {
            const exists = res.data.some((r) => r.roundNumber === prev);
            return exists ? prev : res.data[res.data.length - 1].roundNumber;
          });
        }
      }
    } catch (err) {
      console.error('Error loading rounds:', err);
    }
  }

  async function loadMatches() {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    setLoading(true);
    try {
      const res = await chessApi.getAdminMatches();
      if (res.success) {
        setMatches(res.data || []);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRounds();
    loadMatches();
  }, [router]);

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!roundNameInput.trim()) {
      alert('Please enter a round name.');
      return;
    }

    setCreateRoundLoading(true);
    try {
      const res = await chessApi.createRound({ name: roundNameInput.trim() });
      if (res.success) {
        alert(res.message || 'Round created successfully!');
        const createdRoundNum = res.data?.roundNumber;
        setRoundNameInput('');
        setIsCreateRoundModalOpen(false);
        await loadRounds();
        if (createdRoundNum) {
          setSelectedRound(createdRoundNum);
        }
      } else {
        alert(res.message || 'Failed to create round.');
      }
    } catch (err) {
      alert(err.message || 'Error creating round.');
    } finally {
      setCreateRoundLoading(false);
    }
  };

  const handleGeneratePairings = async () => {
    if (!selectedRound) {
      alert('Please select or create a round first.');
      return;
    }

    setGenerating(true);
    try {
      const res = await chessApi.generateMatches(selectedRound);
      if (res.success) {
        alert(res.message || 'Match pairings generated successfully!');
        await loadMatches();
        await loadRounds();
      } else {
        alert(res.message || 'Failed to generate pairings.');
      }
    } catch (err) {
      alert(err.message || 'Error generating pairings.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartMatch = async (id) => {
    try {
      const res = await chessApi.startMatch(id);
      if (res.success) {
        loadMatches();
      }
    } catch (err) {
      alert(err.message || 'Failed to start match.');
    }
  };

  const openResultModal = (match) => {
    setResultModalMatch(match);
    setP1Captured(match.player1Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
    setP2Captured(match.player2Captured || { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
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
        loadMatches();
      } else {
        alert(res.message || 'Result submission failed.');
      }
    } catch (err) {
      alert(err.message || 'Error submitting match result.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const nextAutoRoundNumber = rounds.length > 0 
    ? Math.max(...rounds.map((r) => r.roundNumber || 0)) + 1 
    : 1;

  const currentRoundObj = rounds.find((r) => r.roundNumber === selectedRound);

  const filteredMatches = matches.filter((m) => {
    if (filterRound === 'all') return true;
    return m.round === Number(filterRound);
  });

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              PAIRING ENGINE & ROUND SCHEDULING
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Rounds & Match Management
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] mt-1">
              Create custom rounds by name, generate fair pairings with automatic top-scorer BYE advances for odd players.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Create Round Button */}
            <button
              onClick={() => setIsCreateRoundModalOpen(true)}
              className="border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Make Round</span>
            </button>

            {/* Select Round to Generate */}
            {rounds.length > 0 ? (
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] transition-colors focus:outline-none"
              >
                {rounds.map((r) => (
                  <option key={r.roundNumber} value={r.roundNumber}>
                    Round {r.roundNumber}: {r.name} {r.matchesCount ? `(${r.matchesCount} matches)` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93] bg-[#EFEAE1] dark:bg-[#1D1D1B] px-3 py-2 rounded-xl border border-[#D5CFC5] dark:border-[#262624]">
                No rounds created yet
              </span>
            )}

            {/* Generate Pairings Button */}
            <button
              onClick={handleGeneratePairings}
              disabled={generating || rounds.length === 0}
              className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
              <span>
                {currentRoundObj ? `Generate ${currentRoundObj.name}` : `Generate Round ${selectedRound}`}
              </span>
            </button>
          </div>
        </div>

        {/* Rounds Banner / Odd Player Notice */}
        <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Automatic Top-Point Bye Rule:</span> When an odd number of players are eligible for pairing, the player with the <strong>highest tournament points</strong> automatically advances directly to the next round with a win reward (+3 pts) and will not participate in a 1-on-1 match during this round.
          </div>
        </div>

        {/* Filter and Overview Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] px-5 py-3.5 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] font-semibold">
              Filter View:
            </span>
            <select
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className="bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
            >
              <option value="all">All Rounds ({matches.length} matches)</option>
              {rounds.map((r) => (
                <option key={r.roundNumber} value={r.roundNumber}>
                  Round {r.roundNumber}: {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
            Showing <strong className="text-[#171715] dark:text-[#FAF8F3]">{filteredMatches.length}</strong> matches
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Match ID</th>
                <th className="py-3.5 px-4 text-center font-semibold">Round</th>
                <th className="py-3.5 px-4 font-semibold">Player 1</th>
                <th className="py-3.5 px-4 font-semibold">Player 2</th>
                <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                <th className="py-3.5 px-4 text-center font-semibold">Score / Advancement</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC5] dark:divide-[#262624]">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">Loading tournament matches...</td></tr>
              ) : filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93] space-y-2">
                    <p>No matches generated yet for the selected filter.</p>
                    {rounds.length === 0 ? (
                      <button
                        onClick={() => setIsCreateRoundModalOpen(true)}
                        className="text-amber-600 dark:text-amber-400 font-semibold underline text-xs"
                      >
                        Click here to create Round 1
                      </button>
                    ) : (
                      <p className="text-[11px] font-mono">Select a round and click "Generate" above.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => {
                  const p1 = m.player1?.fullName || 'BYE';
                  const p2 = m.player2?.fullName || 'BYE';
                  const matchRoundObj = rounds.find((r) => r.roundNumber === m.round);
                  const roundDisplayName = matchRoundObj ? `R${m.round} (${matchRoundObj.name})` : `R${m.round}`;

                  return (
                    <tr key={m._id} className="hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">{m.matchId}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-[#77736B] dark:text-[#8E8E93] text-[11px]">
                        {roundDisplayName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        <div className="flex items-center gap-2">
                          <span>{p1}</span>
                          {m.isBye && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 font-bold">
                              ★ Top Scorer BYE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {m.isBye ? (
                          <span className="text-[#77736B] dark:text-[#8E8E93] italic font-sans font-normal text-xs">
                            — No Opponent (Auto Advance) —
                          </span>
                        ) : (
                          p2
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          m.isBye
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                            : m.status === 'live'
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                            : m.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#4E4C47] dark:text-[#8E8E93] border border-[#D5CFC5] dark:border-[#262624]'
                        }`}>
                          {m.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-ping" />}
                          {m.isBye ? 'Completed (BYE)' : m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {m.isBye ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                            Advanced to Next Round (+3 pts)
                          </span>
                        ) : (
                          `${m.player1MaterialScore || 0} - ${m.player2MaterialScore || 0}`
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {m.isBye ? (
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-lg inline-block font-semibold">
                            Direct Advance
                          </span>
                        ) : (
                          <>
                            {m.status === 'scheduled' && (
                              <button
                                onClick={() => handleStartMatch(m._id)}
                                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Play className="w-3 h-3 text-amber-400" />
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => openResultModal(m)}
                              className="border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                            >
                              Enter Result
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Make / Create New Round (ONLY requires round name) */}
        {isCreateRoundModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-xs text-[#171715] dark:text-[#FAF8F3]">
              
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block">
                    TOURNAMENT ROUND CREATION
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                    Make New Round
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateRoundModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRound} className="space-y-4">
                <div className="bg-[#F5F2EB] dark:bg-[#1D1D1B] p-3 rounded-xl border border-[#D5CFC5] dark:border-[#262624] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-mono font-bold text-sm">
                    {nextAutoRoundNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">
                      Auto-Assigned Number
                    </span>
                    <span className="font-semibold text-xs text-[#171715] dark:text-[#FAF8F3]">
                      Round {nextAutoRoundNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1.5 text-xs">
                    Round Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Round 1, Preliminary Stage, Quarter-Finals, Semi-Finals, Finals..."
                    value={roundNameInput}
                    onChange={(e) => setRoundNameInput(e.target.value)}
                    autoFocus
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] mt-1.5">
                    As administrator, you only need to enter the name of the round. The sequence and pairings will be managed automatically.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateRoundModalOpen(false)}
                    className="px-4 py-2 border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={createRoundLoading}
                    className="px-5 py-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {createRoundLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Round</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Enter Result Modal */}
        {resultModalMatch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs text-[#171715] dark:text-[#FAF8F3]">
              
              <div className="border-b border-[#D5CFC5] dark:border-[#262624] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-wider block">
                    FINAL SCORING & DECISION
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                    Match Result — {resultModalMatch.matchId}
                  </h3>
                </div>
                <button
                  onClick={() => setResultModalMatch(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                {/* Captured counts player 1 */}
                <div className="bg-[#F5F2EB] dark:bg-[#1D1D1B] p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624]">
                  <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3] block mb-2">{resultModalMatch.player1?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#77736B] dark:text-[#8E8E93]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p1Captured[k]}
                          onChange={(e) => setP1Captured({ ...p1Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-lg p-1.5 text-center font-bold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Captured counts player 2 */}
                <div className="bg-[#F5F2EB] dark:bg-[#1D1D1B] p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624]">
                  <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3] block mb-2">{resultModalMatch.player2?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#77736B] dark:text-[#8E8E93]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p2Captured[k]}
                          onChange={(e) => setP2Captured({ ...p2Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-lg p-1.5 text-center font-bold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">Declare Winner</label>
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
                    <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">Result Type</label>
                    <select
                      value={resultTypeChoice}
                      onChange={(e) => setResultTypeChoice(e.target.value)}
                      className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
                    >
                      <option value="checkmate">Checkmate</option>
                      <option value="time_out">Time Out</option>
                      <option value="resignation">Resignation</option>
                      <option value="points">Points</option>
                      <option value="draw_agreed">Draw Agreed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setResultModalMatch(null)}
                    className="px-4 py-2 border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold uppercase tracking-wider transition-all shadow-xs"
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
