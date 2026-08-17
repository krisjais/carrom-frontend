'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  Trophy,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Disc,
  RotateCcw,
  Shield,
  Save,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export const LiveScoreKeeper = ({ match, onUpdate }) => {
  const [activeBoardIdx, setActiveBoardIdx] = useState(0);
  const [boards, setBoards] = useState(
    match.boards && match.boards.length === 3
      ? match.boards
      : [
          { boardNumber: 1, team1Score: 0, team2Score: 0, queenPocketedBy: 'none', queenCovered: false, team1Fouls: 0, team2Fouls: 0, boardWinner: null },
          { boardNumber: 2, team1Score: 0, team2Score: 0, queenPocketedBy: 'none', queenCovered: false, team1Fouls: 0, team2Fouls: 0, boardWinner: null },
          { boardNumber: 3, team1Score: 0, team2Score: 0, queenPocketedBy: 'none', queenCovered: false, team1Fouls: 0, team2Fouls: 0, boardWinner: null }
        ]
  );

  const [carromBoardNumber, setCarromBoardNumber] = useState(match.carromBoardNumber || 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');

  const currentBoard = boards[activeBoardIdx];

  // Evaluate boards won
  let team1Wins = 0;
  let team2Wins = 0;
  if (boards[0].boardWinner === 'team1') team1Wins++;
  if (boards[0].boardWinner === 'team2') team2Wins++;
  if (boards[1].boardWinner === 'team1') team1Wins++;
  if (boards[1].boardWinner === 'team2') team2Wins++;

  // Board 3 status
  const isBoard3Unlocked = team1Wins === 1 && team2Wins === 1;
  if (isBoard3Unlocked) {
    if (boards[2].boardWinner === 'team1') team1Wins++;
    if (boards[2].boardWinner === 'team2') team2Wins++;
  }

  const isMatchDecided = team1Wins >= 2 || team2Wins >= 2;
  const matchWinnerTeam = team1Wins >= 2 ? match.team1 : team2Wins >= 2 ? match.team2 : null;

  // Board Score Calculation (Coin=1, Queen covered=+3, Foul=-1, Max=25)
  const computeScore = (board, teamKey) => {
    let score = Number(teamKey === 'team1' ? board.team1Score : board.team2Score) || 0;
    // ensure within 0 to 25
    return Math.min(25, Math.max(0, score));
  };

  const updateCurrentBoard = (field, value) => {
    const updated = [...boards];
    updated[activeBoardIdx] = {
      ...updated[activeBoardIdx],
      [field]: value
    };
    setBoards(updated);
  };

  const handleScoreIncrement = (teamKey, delta) => {
    const field = teamKey === 'team1' ? 'team1Score' : 'team2Score';
    const current = Number(currentBoard[field]) || 0;
    const nextVal = Math.min(25, Math.max(0, current + delta));
    updateCurrentBoard(field, nextVal);
  };

  const handleFoulIncrement = (teamKey, delta) => {
    const field = teamKey === 'team1' ? 'team1Fouls' : 'team2Fouls';
    const current = Number(currentBoard[field]) || 0;
    const nextVal = Math.max(0, current + delta);
    updateCurrentBoard(field, nextVal);
  };

  const handleSetBoardWinner = (winnerKey) => {
    updateCurrentBoard('boardWinner', winnerKey);
  };

  // Save live board data
  const handleSaveScore = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.updateScore(match._id, {
        boards,
        carromBoardNumber: Number(carromBoardNumber),
        status: match.status === 'completed' ? 'completed' : 'live'
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Live board score saved successfully.' });
        if (onUpdate) onUpdate(res.match);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save score.' });
    } finally {
      setLoading(false);
    }
  };

  // Confirm Match Winner and auto advance
  const handleConfirmMatch = async () => {
    if (!isMatchDecided) {
      alert('A team must win 2 boards before confirming the match winner.');
      return;
    }

    if (!confirm(`Confirm ${matchWinnerTeam.name} as the match winner? This will automatically advance them to the next round in the bracket.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // first save boards
      await api.updateScore(match._id, { boards, carromBoardNumber: Number(carromBoardNumber) });
      // then confirm
      const res = await api.confirmMatch(match._id);
      if (res.success) {
        setMessage({ type: 'success', text: `Match completed! ${matchWinnerTeam.name} advanced to next round.` });
        if (onUpdate) onUpdate(res.match);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to confirm match winner.' });
    } finally {
      setLoading(false);
    }
  };

  // Correction confirmation
  const handleCorrectResult = async () => {
    if (!correctionReason.trim()) {
      alert('Please provide a reason for correcting the match result.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.correctMatch(match._id, boards, correctionReason.trim());
      if (res.success) {
        setIsCorrectModalOpen(false);
        setCorrectionReason('');
        setMessage({ type: 'success', text: 'Match result corrected and bracket updated.' });
        if (onUpdate) onUpdate(res.match);
      }
    } catch (err) {
      alert(err.message || 'Failed to correct match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">
            DISMISS
          </button>
        </div>
      )}

      {/* Match Overview & Boards Won Scoreboard */}
      <div className="glass-card rounded-2xl p-6 border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-navy-950 text-gold-400 border border-gold-500/30 font-mono font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            Main Carrom Board
          </span>
        </div>

        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold">
            {match.roundName} - Match #{match.matchNumber}
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">Live Scorekeeper Desk</h2>
          <p className="text-xs text-slate-400">
            Tournament Rules: Best of 3 Boards (2–0 or 2–1). Admin manually selects board winner.
          </p>
        </div>

        {/* Head to Head Boards Score */}
        <div className="grid grid-cols-3 items-center gap-4 max-w-2xl mx-auto bg-navy-950/80 p-4 rounded-xl border border-navy-800">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-white text-base truncate">{match.team1?.name || 'Team 1'}</h3>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-navy-900 text-slate-400">
              Team 1
            </span>
          </div>

          <div className="text-center space-y-1">
            <div className="font-mono text-3xl font-black tracking-wider text-gold-400 flex items-center justify-center gap-3">
              <span>{team1Wins}</span>
              <span className="text-slate-600">:</span>
              <span>{team2Wins}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Boards Won (Best of 3)
            </span>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-white text-base truncate">{match.team2?.name || 'Team 2'}</h3>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-navy-900 text-slate-400">
              Team 2
            </span>
          </div>
        </div>

        {/* Match Result Banner if decided */}
        {isMatchDecided && (
          <div className="mt-4 p-3 rounded-xl bg-gold-500/15 border border-gold-500/30 flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-gold-300 text-sm font-bold">
              <Trophy className="w-5 h-5 text-gold-400" />
              <span>{matchWinnerTeam.name} leads {team1Wins}–{team2Wins}</span>
            </div>
            {match.status !== 'completed' ? (
              <button
                onClick={handleConfirmMatch}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-gold-500 text-navy-950 font-bold text-xs shadow-md hover:bg-gold-400 transition-colors"
              >
                Confirm Match Winner & Advance
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Match Confirmed & Completed
                </span>
                <Link
                  href="/admin"
                  className="px-3.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs transition-colors"
                >
                  Arena Desk (Next Match) →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board Selector Tabs (Board 1, Board 2, Board 3) */}
      <div className="flex items-center justify-center gap-3">
        {[0, 1, 2].map((idx) => {
          const bNum = idx + 1;
          const bData = boards[idx];
          const isLockedBoard = idx === 2 && !isBoard3Unlocked && !isMatchDecided;
          const isCurrent = activeBoardIdx === idx;

          return (
            <button
              key={bNum}
              onClick={() => {
                if (!isLockedBoard) setActiveBoardIdx(idx);
              }}
              disabled={isLockedBoard}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm transition-all ${
                isCurrent
                  ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20 scale-105'
                  : isLockedBoard
                  ? 'bg-navy-950/40 text-slate-600 border border-navy-900 cursor-not-allowed'
                  : 'bg-navy-900 text-slate-300 hover:text-white border border-navy-800'
              }`}
            >
              <span>Board {bNum}</span>
              {bData.boardWinner && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isCurrent ? 'bg-navy-950 text-gold-400' : 'bg-gold-500/20 text-gold-400'
                  }`}
                >
                  {bData.boardWinner === 'team1' ? 'T1' : 'T2'} Win
                </span>
              )}
              {isLockedBoard && (
                <span className="text-[10px] text-slate-500 font-normal">(Only if 1–1)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Board Scoring Controls Card */}
      <div className="glass-card rounded-2xl p-6 border border-navy-700 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Board {currentBoard.boardNumber} Scoring Controls
            </h3>
            <p className="text-xs text-slate-400">
              Coin = 1 pt | Queen = 3 pts (if covered) | Striker pocketed = -1 pt | Max board = 25 pts
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Current Board Winner:</span>
            <div className="font-bold text-sm text-gold-400">
              {currentBoard.boardWinner === 'team1'
                ? match.team1?.name
                : currentBoard.boardWinner === 'team2'
                ? match.team2?.name
                : 'Not Declared'}
            </div>
          </div>
        </div>

        {/* 2-Column Scoring Desk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team 1 Box */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              currentBoard.boardWinner === 'team1'
                ? 'bg-navy-900 border-gold-500/50 shadow-md shadow-gold-500/10'
                : 'bg-navy-950/60 border-navy-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-base">{match.team1?.name || 'Team 1'}</h4>
                <span className="text-xs text-slate-400">Player / Team 1</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Board Points</span>
                <div className="text-2xl font-black font-mono text-gold-400">
                  {currentBoard.team1Score} <span className="text-xs text-slate-500">/ 25</span>
                </div>
              </div>
            </div>

            {/* Points / Coins Incrementer */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Coins Scored (1 pt each):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScoreIncrement('team1', -1)}
                    className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-lg border border-navy-700 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={currentBoard.team1Score}
                    onChange={(e) => updateCurrentBoard('team1Score', Math.min(25, Math.max(0, Number(e.target.value))))}
                    className="flex-1 h-10 bg-navy-900 text-center font-mono font-bold text-lg rounded-xl border border-navy-700 text-white focus:outline-none focus:border-gold-400"
                  />
                  <button
                    onClick={() => handleScoreIncrement('team1', 1)}
                    className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-lg border border-navy-700 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fouls Counter */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Striker Fouls (-1 pt each):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFoulIncrement('team1', -1)}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold border border-navy-700 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-red-400 px-3">
                    {currentBoard.team1Fouls} Fouls
                  </span>
                  <button
                    onClick={() => handleFoulIncrement('team1', 1)}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold border border-navy-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Manual Board Winner Button */}
              <button
                onClick={() => handleSetBoardWinner('team1')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  currentBoard.boardWinner === 'team1'
                    ? 'bg-gold-500 text-navy-950 shadow-md'
                    : 'bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 border border-navy-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {currentBoard.boardWinner === 'team1'
                  ? 'Selected as Board Winner'
                  : 'Declare Team 1 Board Winner'}
              </button>
            </div>
          </div>

          {/* Team 2 Box */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              currentBoard.boardWinner === 'team2'
                ? 'bg-navy-900 border-gold-500/50 shadow-md shadow-gold-500/10'
                : 'bg-navy-950/60 border-navy-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-base">{match.team2?.name || 'Team 2'}</h4>
                <span className="text-xs text-slate-400">Player / Team 2</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Board Points</span>
                <div className="text-2xl font-black font-mono text-gold-400">
                  {currentBoard.team2Score} <span className="text-xs text-slate-500">/ 25</span>
                </div>
              </div>
            </div>

            {/* Points / Coins Incrementer */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Coins Scored (1 pt each):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScoreIncrement('team2', -1)}
                    className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-lg border border-navy-700 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={currentBoard.team2Score}
                    onChange={(e) => updateCurrentBoard('team2Score', Math.min(25, Math.max(0, Number(e.target.value))))}
                    className="flex-1 h-10 bg-navy-900 text-center font-mono font-bold text-lg rounded-xl border border-navy-700 text-white focus:outline-none focus:border-gold-400"
                  />
                  <button
                    onClick={() => handleScoreIncrement('team2', 1)}
                    className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-lg border border-navy-700 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fouls Counter */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Striker Fouls (-1 pt each):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFoulIncrement('team2', -1)}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold border border-navy-700 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-red-400 px-3">
                    {currentBoard.team2Fouls} Fouls
                  </span>
                  <button
                    onClick={() => handleFoulIncrement('team2', 1)}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold border border-navy-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Manual Board Winner Button */}
              <button
                onClick={() => handleSetBoardWinner('team2')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  currentBoard.boardWinner === 'team2'
                    ? 'bg-gold-500 text-navy-950 shadow-md'
                    : 'bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 border border-navy-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {currentBoard.boardWinner === 'team2'
                  ? 'Selected as Board Winner'
                  : 'Declare Team 2 Board Winner'}
              </button>
            </div>
          </div>
        </div>

        {/* Queen Recording Module */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-board-red flex items-center justify-center shadow-lg shadow-red-600/30 queen-glow text-white">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Queen Status (3 Points)</h5>
              <p className="text-[11px] text-slate-400">Awarded only if Queen is successfully covered with another coin.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Pocketed By:</span>
              <select
                value={currentBoard.queenPocketedBy}
                onChange={(e) => updateCurrentBoard('queenPocketedBy', e.target.value)}
                className="bg-navy-900 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-navy-700"
              >
                <option value="none">None / On Board</option>
                <option value="team1">Team 1 ({match.team1?.name?.split(' ')[0]})</option>
                <option value="team2">Team 2 ({match.team2?.name?.split(' ')[0]})</option>
              </select>
            </div>

            {currentBoard.queenPocketedBy !== 'none' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gold-300 bg-navy-900 px-3 py-1.5 rounded-lg border border-gold-500/30">
                <input
                  type="checkbox"
                  checked={currentBoard.queenCovered}
                  onChange={(e) => updateCurrentBoard('queenCovered', e.target.checked)}
                  className="rounded text-gold-500 focus:ring-gold-400"
                />
                <span>Queen Covered (+3 pts)</span>
              </label>
            )}
          </div>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-navy-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveScore}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Live Board Score</span>
            </button>
            <button
              onClick={() => handleSetBoardWinner(null)}
              className="px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              Reset Winner
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isMatchDecided && match.status !== 'completed' && (
              <button
                onClick={handleConfirmMatch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Match Winner</span>
              </button>
            )}

            {match.status === 'completed' && (
              <button
                onClick={() => setIsCorrectModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/30 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Correct Match Result</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result Correction Modal */}
      <Modal
        isOpen={isCorrectModalOpen}
        onClose={() => setIsCorrectModalOpen(false)}
        title="Admin Match Result Correction"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <p className="font-bold mb-1">Audit Notice</p>
            <p>
              Correcting a completed match will update downstream bracket links if the winner changes and will be recorded in the permanent audit logs with your reason.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reason for Result Correction (Mandatory):
            </label>
            <textarea
              rows="3"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g., Scorekeeper coin miscount on Board 2 verified by tournament referee."
              className="w-full bg-navy-950 text-slate-200 text-sm p-3 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsCorrectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCorrectResult}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 text-navy-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              Confirm Correction & Update Bracket
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
