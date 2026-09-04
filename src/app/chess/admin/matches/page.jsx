'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import { Swords, Play, CheckCircle2, XCircle, Trophy, Loader2 } from 'lucide-react';

export default function ChessAdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);
  const [resultModalMatch, setResultModalMatch] = useState(null);

  const [p1Captured, setP1Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [p2Captured, setP2Captured] = useState({ pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 });
  const [winnerChoice, setWinnerChoice] = useState('none');
  const [resultTypeChoice, setResultTypeChoice] = useState('checkmate');
  const [submitLoading, setSubmitLoading] = useState(false);

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
    loadMatches();
  }, [router]);

  const handleGeneratePairings = async () => {
    setGenerating(true);
    try {
      const res = await chessApi.generateMatches(selectedRound);
      if (res.success) {
        alert(res.message || 'Match pairings generated successfully!');
        loadMatches();
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

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
              PAIRING ENGINE & RESULT SUBMISSION
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Match Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
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
                <th className="py-3.5 px-4 text-center font-semibold">Score</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC5] dark:divide-[#262624]">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">Loading tournament matches...</td></tr>
              ) : matches.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-[#77736B] dark:text-[#8E8E93]">No matches generated yet. Click "Generate Round 1" above.</td></tr>
              ) : (
                matches.map((m) => {
                  const p1 = m.player1?.fullName || 'BYE';
                  const p2 = m.player2?.fullName || 'BYE';
                  return (
                    <tr key={m._id} className="hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">{m.matchId}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-[#77736B] dark:text-[#8E8E93]">R{m.round}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">{p1}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171715] dark:text-[#FAF8F3] font-serif">{p2}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          m.status === 'live'
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                            : m.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#4E4C47] dark:text-[#8E8E93] border border-[#D5CFC5] dark:border-[#262624]'
                        }`}>
                          {m.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-ping" />}
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                        {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {m.status === 'scheduled' && !m.isBye && (
                          <button
                            onClick={() => handleStartMatch(m._id)}
                            className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Play className="w-3 h-3 text-amber-400" />
                            Start
                          </button>
                        )}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
                          >
                            Enter Result
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
