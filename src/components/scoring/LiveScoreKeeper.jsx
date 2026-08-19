'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Edit3,
  RotateCcw,
  Play,
  Check
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CarromCoin } from '@/components/ui/CarromElements';

export const LiveScoreKeeper = ({ match, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // In-App Confirmation Modal state for declaring match winner
  const [pendingWinner, setPendingWinner] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Edit / Change Winner Modal state
  const [isEditWinnerModalOpen, setIsEditWinnerModalOpen] = useState(false);

  // Post Match Next Match Modal state
  const [postMatchData, setPostMatchData] = useState(null);
  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);

  const isMatchCompleted = match.status === 'completed' && Boolean(match.winnerTeam);
  const winnerTeamObj = match.winnerTeam;

  // Open confirmation modal when clicking a team's winner button
  const handleDeclareWinnerClick = (winnerTeam) => {
    if (!winnerTeam) return;
    setPendingWinner({
      id: winnerTeam._id,
      name: winnerTeam.name || 'Winner'
    });
    setIsConfirmModalOpen(true);
  };

  // Execute Winner Confirmation
  const executeConfirmWinner = async (overrideTeam = null) => {
    const target = overrideTeam || pendingWinner;
    if (!target) return;
    const winnerId = target.id;

    setLoading(true);
    setMessage(null);

    try {
      // 1. Update match board record (1 single game)
      const singleBoardData = [
        {
          boardNumber: 1,
          team1Score: winnerId === match.team1?._id ? 25 : 0,
          team2Score: winnerId === match.team2?._id ? 25 : 0,
          boardWinner: winnerId === match.team1?._id ? 'team1' : 'team2'
        }
      ];

      await api.updateScore(match._id, {
        boards: singleBoardData,
        carromBoardNumber: 1,
        status: 'completed'
      });

      // 2. Confirm match winner and advance in bracket
      const res = await api.confirmMatch(match._id, { winnerTeamId: winnerId });
      if (res.success) {
        setIsConfirmModalOpen(false);
        setIsEditWinnerModalOpen(false);
        setPendingWinner(null);
        setPostMatchData(res);
        setIsPostMatchModalOpen(true);
        setMessage({
          type: 'success',
          text: `${target.name} confirmed as match winner and advanced in the bracket.`
        });
        if (onUpdate) onUpdate(res.match);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to record match winner.' });
      setIsConfirmModalOpen(false);
      setIsEditWinnerModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Reset Match Result back to In-Progress / Live
  const handleResetMatchToLive = async () => {
    setLoading(true);
    try {
      const singleBoardData = [
        {
          boardNumber: 1,
          team1Score: 0,
          team2Score: 0,
          boardWinner: null
        }
      ];
      const res = await api.correctMatch(match._id, singleBoardData, 'Admin reset match to change winner');
      if (res.success) {
        setIsEditWinnerModalOpen(false);
        setMessage({ type: 'success', text: 'Match result reset. You can now select the new winner.' });
        if (onUpdate) onUpdate(res.match);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset match.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Feedback Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
              : 'bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-[#E74C3C]" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold px-2 cursor-pointer">
            Close
          </button>
        </div>
      )}

      {/* Main Match Arena Card */}
      <div className="editorial-card rounded-2xl p-6 sm:p-8 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] text-center space-y-6 shadow-xs relative overflow-hidden">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] font-mono font-bold text-xs tracking-wider shadow-2xs">
              <span className="live-dot" />
              MAIN CARROM BOARD · LIVE
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3E342B] dark:text-[#F5F1E8]">
              {match.category?.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-[#7E7060] dark:text-[#817B72] font-mono block">
              {match.roundName} · Match #{match.matchNumber}
            </span>
          </div>
        </div>

        {/* Matchup Teams Display */}
        <div className="py-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Team 1 */}
            <div className="flex-1 text-center md:text-right">
              <span className="text-xs font-mono text-[#7E7060] dark:text-[#817B72] uppercase font-bold block mb-1">Team 1</span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
                {match.team1?.name || 'TBD'}
              </h2>
            </div>

            {/* VS Badge */}
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center shadow-xs shrink-0">
              VS
            </div>

            {/* Team 2 */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-mono text-[#7E7060] dark:text-[#817B72] uppercase font-bold block mb-1">Team 2</span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
                {match.team2?.name || 'TBD'}
              </h2>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[11px] font-mono text-[#7E7060] dark:text-[#817B72]">
            <span>Single-Game Knockout · 1 Game Decides the Match</span>
          </div>
        </div>
      </div>

      {/* --- ACTION SECTION --- */}
      {!isMatchCompleted ? (
        /* Winner Declaration Desk */
        <div className="editorial-card rounded-2xl p-6 sm:p-8 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-6 shadow-xs text-center">
          <div>
            <span className="eyebrow-label">
              Official Match Referee Desk
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1 uppercase tracking-wide">
              DECLARE MATCH WINNER
            </h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1 max-w-md mx-auto">
              Select the winning team on the Main Carrom Board. The winner will advance to the next round immediately.
            </p>
          </div>

          {/* TWO LARGE WINNER ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Team 1 Winner Button */}
            <button
              onClick={() => handleDeclareWinnerClick(match.team1)}
              disabled={loading || !match.team1}
              className="group relative p-6 sm:p-8 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-white dark:hover:bg-[#15191C] border-2 border-[#E8E1D5] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px] cursor-pointer disabled:opacity-50"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#7E7060] dark:text-[#817B72] uppercase tracking-wider block">
                  Team 1 Win Selection
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] group-hover:text-[#E74C3C] dark:group-hover:text-[#D4A94C] transition-colors leading-tight">
                  {match.team1?.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] group-hover:border-[#3E342B]/30 dark:group-hover:border-[#D4A94C]/30">
                <span className="text-xs font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1.5 font-mono uppercase">
                  <Trophy className="w-4 h-4" />
                  <span>Declare Winner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#7E7060] dark:text-[#817B72] group-hover:text-[#E74C3C] dark:group-hover:text-[#D4A94C] group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Team 2 Winner Button */}
            <button
              onClick={() => handleDeclareWinnerClick(match.team2)}
              disabled={loading || !match.team2}
              className="group relative p-6 sm:p-8 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-white dark:hover:bg-[#15191C] border-2 border-[#E8E1D5] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px] cursor-pointer disabled:opacity-50"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#7E7060] dark:text-[#817B72] uppercase tracking-wider block">
                  Team 2 Win Selection
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] group-hover:text-[#E74C3C] dark:group-hover:text-[#D4A94C] transition-colors leading-tight">
                  {match.team2?.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] group-hover:border-[#3E342B]/30 dark:group-hover:border-[#D4A94C]/30">
                <span className="text-xs font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1.5 font-mono uppercase">
                  <Trophy className="w-4 h-4" />
                  <span>Declare Winner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#7E7060] dark:text-[#817B72] group-hover:text-[#E74C3C] dark:group-hover:text-[#D4A94C] group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Match Completed Spotlight Card with Edit Winner Button */
        <div className="editorial-card rounded-2xl p-8 sm:p-10 border-2 border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#15191C] text-center space-y-6 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] dark:text-[#D4A94C] flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E74C3C] dark:text-[#D4A94C]">
              MATCH COMPLETED · WINNER CONFIRMED
            </span>
            <h3 className="text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
              {winnerTeamObj?.name || 'Winner Confirmed'}
            </h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] max-w-md mx-auto">
              Result recorded on the Main Carrom Board. The winner has been advanced in the knockout bracket.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-lg mx-auto">
            <a
              href="/admin/matches"
              className="w-full py-3 px-5 rounded-xl btn-primary text-xs shadow-xs transition-all text-center cursor-pointer font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Next Scheduled Match</span>
            </a>

            <button
              onClick={() => setIsEditWinnerModalOpen(true)}
              className="w-full py-3 px-5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs font-mono uppercase"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Winner</span>
            </button>

            <a
              href={`/admin/draws?category=${match.category}`}
              className="w-full py-3 px-5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-white dark:hover:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] font-bold text-xs transition-colors text-center cursor-pointer font-mono uppercase shadow-xs"
            >
              View Bracket
            </a>
          </div>
        </div>
      )}

      {/* --- IN-APP CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!loading) setIsConfirmModalOpen(false);
        }}
        title="Confirm Match Winner"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 py-1">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034]">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#15191C] text-[#E74C3C] dark:text-[#D4A94C] flex items-center justify-center shrink-0 border border-[#D5C4A1] dark:border-[#2B3034]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7E7060] dark:text-[#817B72] block">
                Selected Winner
              </span>
              <h4 className="text-base font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                {pendingWinner?.name}
              </h4>
              <p className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                Match #{match.matchNumber} · {match.category?.replace('_', ' ').toUpperCase()} · Main Board
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#4A4238] dark:text-[#F5F1E8] leading-relaxed">
            <p>
              Confirm <strong className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{pendingWinner?.name}</strong> as the official winner of this match on the Main Carrom Board?
            </p>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
              The winner will be advanced to the next round in the knockout bracket.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => executeConfirmWinner()}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider flex items-center gap-2"
            >
              {loading ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Advance Winner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* --- EDIT / CHANGE WINNER MODAL --- */}
      <Modal
        isOpen={isEditWinnerModalOpen}
        onClose={() => {
          if (!loading) setIsEditWinnerModalOpen(false);
        }}
        title="Edit / Change Match Winner"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5 py-2">
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
            Current Winner: <strong className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{winnerTeamObj?.name || 'None'}</strong>.
            <br />
            Select the new winning team below to update this match and adjust the bracket:
          </p>

          <div className="space-y-3">
            {/* Choose Team 1 */}
            <button
              onClick={() => executeConfirmWinner({ id: match.team1?._id, name: match.team1?.name })}
              disabled={loading || !match.team1}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                winnerTeamObj?._id === match.team1?._id
                  ? 'bg-[#FAF9F6] dark:bg-[#181C1F] border-[#3E342B] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#F5F1E8]'
                  : 'bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72] block uppercase font-bold">Team 1</span>
                <span className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">{match.team1?.name}</span>
              </div>
              <span className="text-xs font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1 font-mono uppercase">
                <Trophy className="w-4 h-4" />
                <span>{winnerTeamObj?._id === match.team1?._id ? 'Current Winner' : 'Set as Winner'}</span>
              </span>
            </button>

            {/* Choose Team 2 */}
            <button
              onClick={() => executeConfirmWinner({ id: match.team2?._id, name: match.team2?.name })}
              disabled={loading || !match.team2}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                winnerTeamObj?._id === match.team2?._id
                  ? 'bg-[#FAF9F6] dark:bg-[#181C1F] border-[#3E342B] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#F5F1E8]'
                  : 'bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72] block uppercase font-bold">Team 2</span>
                <span className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">{match.team2?.name}</span>
              </div>
              <span className="text-xs font-bold text-[#E74C3C] dark:text-[#D4A94C] flex items-center gap-1 font-mono uppercase">
                <Trophy className="w-4 h-4" />
                <span>{winnerTeamObj?._id === match.team2?._id ? 'Current Winner' : 'Set as Winner'}</span>
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between">
            <button
              onClick={handleResetMatchToLive}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] font-bold cursor-pointer font-mono uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to In-Progress</span>
            </button>

            <button
              onClick={() => setIsEditWinnerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] transition-colors cursor-pointer font-mono"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* --- POST MATCH MODAL --- */}
      <Modal
        isOpen={isPostMatchModalOpen}
        onClose={() => setIsPostMatchModalOpen(false)}
        title="Match Completed & Confirmed"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] dark:text-[#D4A94C] flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
              Match #{match.matchNumber} Completed
            </h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
              Winner confirmed and recorded. The tournament bracket has been updated automatically.
            </p>
          </div>

          {postMatchData?.roundAdvanced && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Round Progression Completed</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                All matches for this round are complete. Advancing winners have been paired for the next round and queued on the Main Carrom Board!
              </p>
            </div>
          )}

          {postMatchData?.nextReadyMatch && (
            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-left space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                Next Scheduled Match on Main Carrom Board:
              </span>
              <div className="flex items-center justify-between text-xs font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                <span className="truncate">{postMatchData.nextReadyMatch.team1?.name}</span>
                <span className="text-[#E74C3C] dark:text-[#D4A94C] font-mono px-2">vs</span>
                <span className="truncate">{postMatchData.nextReadyMatch.team2?.name}</span>
              </div>
              <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block font-mono">
                {postMatchData.nextReadyMatch.category.replace('_', ' ').toUpperCase()} · Match #{postMatchData.nextReadyMatch.matchNumber} ({postMatchData.nextReadyMatch.roundName})
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {postMatchData?.nextReadyMatch && (
              <a
                href={`/admin/matches/${postMatchData.nextReadyMatch._id}/score`}
                className="w-full py-3 rounded-xl btn-primary text-xs font-bold shadow-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Next Match Scorekeeper</span>
              </a>
            )}

            <a
              href="/admin/matches"
              className="w-full py-2.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] font-bold text-xs transition-colors text-center uppercase tracking-wider"
            >
              Return to Match List
            </a>

            <a
              href={`/admin/draws?category=${match.category}`}
              className="w-full py-2 rounded-xl text-[#7E7060] dark:text-[#817B72] hover:text-[#E74C3C] dark:hover:text-[#D4A94C] text-xs font-bold transition-colors text-center font-mono uppercase"
            >
              View Updated Bracket →
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};


