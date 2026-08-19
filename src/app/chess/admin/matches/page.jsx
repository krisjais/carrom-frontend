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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col lg:flex-row font-sans text-[#111111] antialiased">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              PAIRING ENGINE & RESULT SUBMISSION
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              MATCH MANAGEMENT
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl px-3 py-2 text-xs font-bold text-[#111111]"
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
              className="bg-[#000000] hover:bg-[#222222] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs flex items-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" /> : <Swords className="w-4 h-4 text-[#C9A227]" />}
              <span>Generate Round {selectedRound}</span>
            </button>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-gray-50 text-[#666666] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4">Match ID</th>
                <th className="py-3.5 px-4 text-center">Round</th>
                <th className="py-3.5 px-4">Player 1</th>
                <th className="py-3.5 px-4">Player 2</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-[#666666]">Loading matches...</td></tr>
              ) : matches.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-[#666666]">No matches generated yet. Click "Generate Round 1" above.</td></tr>
              ) : (
                matches.map((m) => {
                  const p1 = m.player1?.fullName || 'BYE';
                  const p2 = m.player2?.fullName || 'BYE';
                  return (
                    <tr key={m._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-bold text-[#111111]">{m.matchId}</td>
                      <td className="py-3 px-4 text-center font-mono text-[#666666]">{m.round}</td>
                      <td className="py-3 px-4 font-bold text-[#111111] font-display">{p1}</td>
                      <td className="py-3 px-4 font-bold text-[#111111] font-display">{p2}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          m.status === 'live' ? 'badge-live' : m.status === 'completed' ? 'badge-completed' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#111111]">
                        {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {m.status === 'scheduled' && !m.isBye && (
                          <button
                            onClick={() => handleStartMatch(m._id)}
                            className="bg-[#000000] hover:bg-[#222222] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 text-[#C9A227]" />
                            Start
                          </button>
                        )}
                        {!m.isBye && (
                          <button
                            onClick={() => openResultModal(m)}
                            className="bg-[#C9A227] hover:bg-[#D4A94C] text-black text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
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
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
              <div className="border-b border-[#E5E5E5] pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold font-display text-[#111111]">
                  ENTER MATCH RESULT - {resultModalMatch.matchId}
                </h3>
                <button onClick={() => setResultModalMatch(null)} className="text-gray-500 hover:text-black">✕</button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4">
                {/* Captured counts player 1 */}
                <div className="bg-gray-50 p-3 rounded-xl border border-[#E5E5E5]">
                  <span className="font-bold text-[#111111] block mb-2">{resultModalMatch.player1?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#666666]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p1Captured[k]}
                          onChange={(e) => setP1Captured({ ...p1Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-white border border-[#E5E5E5] rounded-lg p-1 text-center font-bold text-[#111111]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Captured counts player 2 */}
                <div className="bg-gray-50 p-3 rounded-xl border border-[#E5E5E5]">
                  <span className="font-bold text-[#111111] block mb-2">{resultModalMatch.player2?.fullName} Captured Pieces:</span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['pawns', 'knights', 'bishops', 'rooks', 'queens'].map(k => (
                      <div key={k}>
                        <span className="text-[9px] uppercase font-mono block text-[#666666]">{k}</span>
                        <input
                          type="number"
                          min={0}
                          value={p2Captured[k]}
                          onChange={(e) => setP2Captured({ ...p2Captured, [k]: Number(e.target.value) })}
                          className="w-full bg-white border border-[#E5E5E5] rounded-lg p-1 text-center font-bold text-[#111111]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">Declare Winner</label>
                    <select
                      value={winnerChoice}
                      onChange={(e) => setWinnerChoice(e.target.value)}
                      className="w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-2 font-semibold"
                    >
                      <option value="none">Auto-Calculate from Material Score</option>
                      <option value="player1">Player 1 ({resultModalMatch.player1?.fullName})</option>
                      <option value="player2">Player 2 ({resultModalMatch.player2?.fullName})</option>
                      <option value="draw">Draw</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#111111] mb-1">Result Type</label>
                    <select
                      value={resultTypeChoice}
                      onChange={(e) => setResultTypeChoice(e.target.value)}
                      className="w-full bg-gray-50 border border-[#E5E5E5] rounded-xl p-2 font-semibold"
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
                    className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-gray-700 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-[#000000] text-white rounded-xl font-bold uppercase"
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
