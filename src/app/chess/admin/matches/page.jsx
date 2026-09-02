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
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex flex-col lg:flex-row font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] dark:text-[#D4AF37] uppercase tracking-widest block">
              PAIRING ENGINE & RESULT SUBMISSION
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
              MATCH MANAGEMENT
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
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
              className="bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-sm flex items-center gap-2 transition-all"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A227] dark:text-slate-950" /> : <Swords className="w-4 h-4 text-[#C9A227] dark:text-slate-950" />}
              <span>Generate Round {selectedRound}</span>
            </button>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#232A3B] bg-slate-50 dark:bg-[#1A2337] text-[#64748B] dark:text-[#94A3B8] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4">Match ID</th>
                <th className="py-3.5 px-4 text-center">Round</th>
                <th className="py-3.5 px-4">Player 1</th>
                <th className="py-3.5 px-4">Player 2</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#232A3B]">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]">Loading matches...</td></tr>
              ) : matches.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]">No matches generated yet. Click "Generate Round 1" above.</td></tr>
              ) : (
                matches.map((m) => {
                  const p1 = m.player1?.fullName || 'BYE';
                  const p2 = m.player2?.fullName || 'BYE';
                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{m.matchId}</td>
                      <td className="py-3 px-4 text-center font-mono text-[#64748B] dark:text-[#94A3B8]">{m.round}</td>
                      <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">{p1}</td>
                      <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">{p2}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          m.status === 'live' ? 'badge-live' : m.status === 'completed' ? 'badge-completed' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {m.status === 'scheduled' && !m.isBye && (
                          <button
                            onClick={() => handleStartMatch(m._id)}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Play className="w-3 h-3 text-[#C9A227] dark:text-amber-600" />
                            Start
                          </button>
                        )}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="bg-[#C9A227] hover:bg-[#D4A94C] text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs transition-colors"
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
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
              <div className="border-b border-[#E2E8F0] dark:border-[#232A3B] pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold font-display text-[#0F172A] dark:text-[#F8FAFC]">
                  ENTER MATCH RESULT - {resultModalMatch.matchId}
                </h3>
                <button onClick={() => setResultModalMatch(null)} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">✕</button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                {/* Captured counts player 1 */}
                <div className="bg-slate-50 dark:bg-[#1A2337] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#232A3B]">
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">{resultModalMatch.player1?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#64748B] dark:text-[#94A3B8]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p1Captured[k]}
                          onChange={(e) => setP1Captured({ ...p1Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-lg p-1 text-center font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Captured counts player 2 */}
                <div className="bg-slate-50 dark:bg-[#1A2337] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#232A3B]">
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">{resultModalMatch.player2?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#64748B] dark:text-[#94A3B8]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p2Captured[k]}
                          onChange={(e) => setP2Captured({ ...p2Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-lg p-1 text-center font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">Declare Winner</label>
                    <select
                      value={winnerChoice}
                      onChange={(e) => setWinnerChoice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl p-2 font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="none">Auto-Calculate from Material Score</option>
                      <option value="player1">Player 1 ({resultModalMatch.player1?.fullName})</option>
                      <option value="player2">Player 2 ({resultModalMatch.player2?.fullName})</option>
                      <option value="draw">Draw</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">Result Type</label>
                    <select
                      value={resultTypeChoice}
                      onChange={(e) => setResultTypeChoice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] rounded-xl p-2 font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="checkmate">Checkmate</option>
                      <option value="time_out">Time Out</option>
                      <option value="resignation">Resignation</option>
                      <option value="points">Points</option>
                      <option value="draw_agreed">Draw Agreed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResultModalMatch(null)}
                    className="px-4 py-2 border border-[#E2E8F0] dark:border-[#232A3B] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 rounded-xl font-bold uppercase transition-all shadow-xs"
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
