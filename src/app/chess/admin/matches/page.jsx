'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Swords, Play, CheckCircle2, XCircle, Trophy, Loader2, Plus, Trash2, Clock, ShieldCheck } from 'lucide-react';

export default function ChessAdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);
  const [startingMatchId, setStartingMatchId] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  // Result modal
  const [resultModalMatch, setResultModalMatch] = useState(null);
  const [p1Captured, setP1Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [p2Captured, setP2Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [winnerChoice, setWinnerChoice] = useState('none');
  const [resultTypeChoice, setResultTypeChoice] = useState('checkmate');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Manual Match Pairing Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualRound, setManualRound] = useState(1);
  const [manualP1, setManualP1] = useState('');
  const [manualP2, setManualP2] = useState('');
  const [creatingMatch, setCreatingMatch] = useState(false);

  async function loadData() {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router]);

  // Admin round generation
  const handleGeneratePairings = async () => {
    if (!confirm(`Are you sure you want to generate pairings for Round ${selectedRound}?`)) {
      return;
    }
    setGenerating(true);
    try {
      const res = await chessApi.generateMatches(selectedRound);
      if (res.success) {
        alert(res.message || `Round ${selectedRound} pairings generated successfully!`);
        await loadData();
      } else {
        alert(res.message || 'Failed to generate pairings.');
      }
    } catch (err) {
      alert(err.message || 'Error generating pairings.');
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
        alert('Match is now LIVE with a strict 10:00 timer!');
        await loadData();
      } else {
        alert(res.message || 'Failed to start match.');
      }
    } catch (err) {
      alert(err.message || 'Failed to start match.');
    } finally {
      setStartingMatchId(null);
    }
  };

  // Delete pairing
  const handleDeleteMatch = async (id, matchIdLabel) => {
    if (!confirm(`Delete match pairing ${matchIdLabel}?`)) return;
    setDeletingMatchId(id);
    try {
      const res = await chessApi.deleteMatch(id);
      if (res.success) {
        setMatches((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(res.message || 'Failed to delete match.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting match.');
    } finally {
      setDeletingMatchId(null);
    }
  };

  // Create manual match pairing
  const handleCreateManualMatch = async (e) => {
    e.preventDefault();
    if (!manualP1) {
      alert('Please select Player 1 (White pieces).');
      return;
    }
    if (manualP1 === manualP2) {
      alert('Player 1 and Player 2 cannot be the same contestant.');
      return;
    }

    setCreatingMatch(true);
    try {
      const res = await chessApi.createMatch({
        round: manualRound,
        player1Id: manualP1,
        player2Id: manualP2 || null,
        durationMinutes: 10
      });

      if (res.success) {
        alert('Manual match pairing created successfully!');
        setShowCreateModal(false);
        setManualP1('');
        setManualP2('');
        await loadData();
      } else {
        alert(res.message || 'Failed to create match pairing.');
      }
    } catch (err) {
      alert(err.message || 'Error creating manual match.');
    } finally {
      setCreatingMatch(false);
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
        await loadData();
      } else {
        alert(res.message || 'Result submission failed.');
      }
    } catch (err) {
      alert(err.message || 'Error submitting match result.');
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
                ADMIN CONTROLLED ROUNDS & 10-MINUTE BLITZ
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                <Clock className="w-3 h-3" />
                10:00 Per Match
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Match & Round Management
            </h1>
          </div>

          {/* Action Buttons: Auto-Generate Round or Manual Custom Pairing */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Create Custom Pairing Button */}
            <button
              onClick={() => {
                setManualRound(selectedRound);
                setShowCreateModal(true);
              }}
              className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Match</span>
            </button>

            {/* Round Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] transition-colors focus:outline-none"
              >
                <option value={1}>Round 1</option>
                <option value={2}>Round 2</option>
                <option value={3}>Round 3</option>
                <option value={4}>Round 4</option>
                <option value={5}>Round 5</option>
              </select>

              <button
                onClick={handleGeneratePairings}
                disabled={generating}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                <span>Generate Round {selectedRound}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Match ID</th>
                <th className="py-3.5 px-4 text-center font-semibold">Round</th>
                <th className="py-3.5 px-4 font-semibold">Player 1 (White)</th>
                <th className="py-3.5 px-4 font-semibold">Player 2 (Black)</th>
                <th className="py-3.5 px-4 text-center font-semibold">Clock</th>
                <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                <th className="py-3.5 px-4 text-center font-semibold">Score</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC5] dark:divide-[#262624]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">
                    Loading tournament matches...
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#77736B] dark:text-[#8E8E93]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                        No matches scheduled yet.
                      </p>
                      <p className="text-xs">
                        Rounds are created exclusively on demand by the admin. Use &quot;Generate Round {selectedRound}&quot; or click &quot;New Custom Match&quot; above to set up pairings.
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

                  return (
                    <tr key={m._id || m.matchId} className="hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {m.matchId}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[#77736B] dark:text-[#8E8E93]">
                        R{m.round}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {p1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">
                        {p2}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-[10px] bg-[#EFEAE1] dark:bg-[#1E1E1C] px-2 py-0.5 rounded border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#77736B] dark:text-[#8E8E93]">
                          {m.durationMinutes || 10}m
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Start Match Button (10:00 Clock) */}
                        {isScheduled && !m.isBye && (
                          <button
                            onClick={() => handleStartMatch(m._id)}
                            disabled={isStartingThis}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold px-3 py-1 rounded-lg uppercase inline-flex items-center gap-1 shadow-xs transition-colors"
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

                        {/* Enter Result Button */}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                          >
                            Result
                          </button>
                        )}

                        {/* Delete Pairing Button */}
                        {!isCompleted && (
                          <button
                            onClick={() => handleDeleteMatch(m._id, m.matchId)}
                            disabled={isDeletingThis}
                            className="p-1 rounded-lg text-[#77736B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors inline-block align-middle"
                            title="Delete this pairing"
                          >
                            {isDeletingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Create Manual Match Pairing Modal */}
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
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] text-[#77736B] dark:text-[#8E8E93] text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualMatch} className="space-y-4">
                <div>
                  <label className="block font-semibold text-[#171715] dark:text-[#FAF8F3] mb-1">
                    Tournament Round
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={manualRound}
                    onChange={(e) => setManualRound(Number(e.target.value))}
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] rounded-xl p-2.5 font-medium text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
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
                    className="px-4 py-2 border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] rounded-xl font-semibold hover:bg-[#E4DED5] dark:hover:bg-[#262624] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingMatch}
                    className="px-5 py-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] rounded-xl font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2"
                  >
                    {creatingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Create Pairing</span>
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
                  <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3] block mb-2">
                    {resultModalMatch.player1?.fullName} (White) Captured Pieces:
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map((k) => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#77736B] dark:text-[#8E8E93]">
                          {k}
                        </span>
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
                  <span className="font-bold font-serif text-[#171715] dark:text-[#FAF8F3] block mb-2">
                    {resultModalMatch.player2?.fullName} (Black) Captured Pieces:
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map((k) => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#77736B] dark:text-[#8E8E93]">
                          {k}
                        </span>
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
