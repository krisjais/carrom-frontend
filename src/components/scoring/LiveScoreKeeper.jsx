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
  RotateCcw
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

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
          text: `🏆 ${target.name} confirmed as match winner and advanced in the bracket!`
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Feedback Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 shadow-md ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Match Arena Card */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 border border-[#FFBA00]/40 bg-gradient-to-br from-[#2C0854] to-[#140129] text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#4A138C]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#140129] border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs tracking-wider shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              MAIN CARROM BOARD · LIVE
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFBA00]">
              {match.category?.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-[#D8C7F0] font-mono block">
              {match.roundName} · Match #{match.matchNumber}
            </span>
          </div>
        </div>

        {/* Matchup Teams Display */}
        <div className="py-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Team 1 */}
            <div className="flex-1 text-center md:text-right">
              <span className="text-xs font-mono text-[#FDB095] uppercase font-bold block mb-1">Team 1</span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                {match.team1?.name || 'TBD'}
              </h2>
            </div>

            {/* VS Badge */}
            <div className="w-14 h-14 rounded-full bg-[#140129] border border-[#FFBA00]/40 text-xs font-mono font-black text-[#FFBA00] flex items-center justify-center shadow-inner shrink-0">
              VS
            </div>

            {/* Team 2 */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-mono text-[#FDB095] uppercase font-bold block mb-1">Team 2</span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                {match.team2?.name || 'TBD'}
              </h2>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#140129] border border-[#4A138C] text-[11px] font-mono text-[#D8C7F0]">
            <span>Single-Game Knockout · 1 Game Decides the Match</span>
          </div>
        </div>
      </div>

      {/* --- ACTION SECTION --- */}
      {!isMatchCompleted ? (
        /* Winner Declaration Desk */
        <div className="sport-card rounded-4xl p-6 sm:p-8 border border-[#4A138C] space-y-6 shadow-xl text-center">
          <div>
            <span className="text-xs font-mono font-bold text-[#FFBA00] uppercase tracking-widest block">
              Official Match Referee Desk
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
              DECLARE MATCH WINNER
            </h3>
            <p className="text-xs text-[#D8C7F0] mt-1 max-w-md mx-auto">
              Select the winning team on the Main Carrom Board. The winner will advance to the next round immediately.
            </p>
          </div>

          {/* TWO LARGE WINNER ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Team 1 Winner Button */}
            <button
              onClick={() => handleDeclareWinnerClick(match.team1)}
              disabled={loading || !match.team1}
              className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#140129] to-[#2C0854] hover:from-[#380E6B] hover:to-[#210440] border-2 border-[#4A138C] hover:border-[#FFBA00] text-left transition-all duration-200 shadow-lg hover:shadow-[#FFBA00]/15 flex flex-col justify-between min-h-[160px] cursor-pointer disabled:opacity-50"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#FDB095] uppercase tracking-wider block">
                  Team 1 Win Selection
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-[#FFBA00] transition-colors leading-tight">
                  {match.team1?.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#4A138C] group-hover:border-[#FFBA00]/40">
                <span className="text-xs font-bold text-[#FFBA00] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Declare as Match Winner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FFBA00] group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Team 2 Winner Button */}
            <button
              onClick={() => handleDeclareWinnerClick(match.team2)}
              disabled={loading || !match.team2}
              className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#140129] to-[#2C0854] hover:from-[#380E6B] hover:to-[#210440] border-2 border-[#4A138C] hover:border-[#FFBA00] text-left transition-all duration-200 shadow-lg hover:shadow-[#FFBA00]/15 flex flex-col justify-between min-h-[160px] cursor-pointer disabled:opacity-50"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#FDB095] uppercase tracking-wider block">
                  Team 2 Win Selection
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-[#FFBA00] transition-colors leading-tight">
                  {match.team2?.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#4A138C] group-hover:border-[#FFBA00]/40">
                <span className="text-xs font-bold text-[#FFBA00] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Declare as Match Winner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FFBA00] group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Match Completed Spotlight Card with Edit Winner Button */
        <div className="glass-card rounded-4xl p-8 sm:p-10 border-2 border-[#FFBA00]/60 bg-gradient-to-b from-[#2C0854] via-[#210440] to-[#140129] text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#FFBA00]/20 border border-[#FFBA00]/40 text-[#FFBA00] flex items-center justify-center mx-auto shadow-lg shadow-[#FFBA00]/20">
            <Trophy className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFBA00]">
              MATCH COMPLETED · WINNER CONFIRMED
            </span>
            <h3 className="text-3xl font-black font-display text-white">
              {winnerTeamObj?.name || 'Winner Confirmed'}
            </h3>
            <p className="text-xs text-[#D8C7F0] max-w-md mx-auto">
              Result recorded on the Main Carrom Board. The winner has been advanced in the knockout bracket.
            </p>
          </div>

          {/* Action Buttons: Next Match, View Bracket, and EDIT/CHANGE WINNER */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-lg mx-auto">
            <a
              href="/admin/matches"
              className="w-full py-3 px-5 rounded-xl btn-gold text-xs shadow-lg transition-all text-center cursor-pointer font-black"
            >
              ▶ Next Scheduled Match
            </a>

            <button
              onClick={() => setIsEditWinnerModalOpen(true)}
              className="w-full py-3 px-5 rounded-xl bg-[#2C0854] hover:bg-[#380E6B] border border-[#FFBA00]/40 text-[#FFBA00] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit / Change Winner</span>
            </button>

            <a
              href={`/admin/draws?category=${match.category}`}
              className="w-full py-3 px-5 rounded-xl bg-[#140129] hover:bg-[#2C0854] border border-[#4A138C] text-[#D8C7F0] font-bold text-xs transition-colors text-center cursor-pointer"
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
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFBA00]/15 border border-[#FFBA00]/30">
            <div className="w-12 h-12 rounded-xl bg-[#FFBA00]/20 text-[#FFBA00] flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#FFBA00] block">
                Selected Winner
              </span>
              <h4 className="text-base font-black text-white font-display">
                {pendingWinner?.name}
              </h4>
              <p className="text-[11px] text-[#D8C7F0]">
                Match #{match.matchNumber} · {match.category?.replace('_', ' ').toUpperCase()} · Main Carrom Board
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
            <p>
              Confirm <strong className="text-white font-bold">{pendingWinner?.name}</strong> as the official winner of this match on the Main Carrom Board?
            </p>
            <div className="p-3 rounded-xl bg-[#140129] border border-[#4A138C] text-[11px] text-[#D8C7F0]">
              ⚡ The winner will be advanced to the next round in the knockout bracket.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#D8C7F0] hover:text-white hover:bg-[#2C0854] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => executeConfirmWinner()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gold text-xs font-black shadow-lg transition-all disabled:opacity-50 cursor-pointer"
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
          <p className="text-xs text-[#D8C7F0]">
            Current Winner: <strong className="text-[#FFBA00] font-bold">{winnerTeamObj?.name || 'None'}</strong>.
            <br />
            Select the new winning team below to update this match and fix the bracket:
          </p>

          <div className="space-y-3">
            {/* Choose Team 1 */}
            <button
              onClick={() => executeConfirmWinner({ id: match.team1?._id, name: match.team1?.name })}
              disabled={loading || !match.team1}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                winnerTeamObj?._id === match.team1?._id
                  ? 'bg-[#FFBA00]/20 border-[#FFBA00] text-white'
                  : 'bg-[#140129] hover:bg-[#2C0854] border-[#4A138C] text-[#D8C7F0]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#FDB095] block uppercase font-bold">Team 1</span>
                <span className="text-sm font-bold">{match.team1?.name}</span>
              </div>
              <span className="text-xs font-bold text-[#FFBA00] flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{winnerTeamObj?._id === match.team1?._id ? 'Current Winner' : 'Set as Winner'}</span>
              </span>
            </button>

            {/* Choose Team 2 */}
            <button
              onClick={() => executeConfirmWinner({ id: match.team2?._id, name: match.team2?.name })}
              disabled={loading || !match.team2}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                winnerTeamObj?._id === match.team2?._id
                  ? 'bg-[#FFBA00]/20 border-[#FFBA00] text-white'
                  : 'bg-[#140129] hover:bg-[#2C0854] border-[#4A138C] text-[#D8C7F0]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#FDB095] block uppercase font-bold">Team 2</span>
                <span className="text-sm font-bold">{match.team2?.name}</span>
              </div>
              <span className="text-xs font-bold text-[#FFBA00] flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{winnerTeamObj?._id === match.team2?._id ? 'Current Winner' : 'Set as Winner'}</span>
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#4A138C] flex items-center justify-between">
            <button
              onClick={handleResetMatchToLive}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-[#FDB095] hover:text-[#FFBA00] font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Match to In-Progress</span>
            </button>

            <button
              onClick={() => setIsEditWinnerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#D8C7F0] hover:text-white transition-colors"
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
        title="🏆 Match Completed & Confirmed"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FFBA00]/20 border border-[#FFBA00]/40 text-[#FFBA00] flex items-center justify-center mx-auto shadow-lg shadow-[#FFBA00]/10">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-white">
              Match #{match.matchNumber} Completed!
            </h3>
            <p className="text-xs text-[#D8C7F0]">
              Winner confirmed and recorded. The tournament bracket has been updated automatically.
            </p>
          </div>

          {postMatchData?.roundAdvanced && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFBA00]/20 to-emerald-500/20 border border-[#FFBA00]/40 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFBA00]">
                <Sparkles className="w-4 h-4" />
                <span>Round Progression Completed!</span>
              </div>
              <p className="text-[11px] text-slate-200">
                All matches for this round are complete. Advancing winners have been paired for the next round and queued on the Main Carrom Board!
              </p>
            </div>
          )}

          {postMatchData?.nextReadyMatch && (
            <div className="p-4 rounded-xl bg-[#140129] border border-[#4A138C] text-left space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#FFBA00]">
                Next Scheduled Match on Main Carrom Board:
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate">{postMatchData.nextReadyMatch.team1?.name}</span>
                <span className="text-[#FFBA00] font-mono px-2">vs</span>
                <span className="truncate">{postMatchData.nextReadyMatch.team2?.name}</span>
              </div>
              <span className="text-[10px] text-[#D8C7F0] block">
                {postMatchData.nextReadyMatch.category.replace('_', ' ').toUpperCase()} · Match #{postMatchData.nextReadyMatch.matchNumber} ({postMatchData.nextReadyMatch.roundName})
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {postMatchData?.nextReadyMatch && (
              <a
                href={`/admin/matches/${postMatchData.nextReadyMatch._id}/score`}
                className="w-full py-3 rounded-xl btn-gold text-xs font-black shadow-lg flex items-center justify-center gap-2"
              >
                <span>▶ Start Next Match Scorekeeper</span>
              </a>
            )}

            <a
              href="/admin/matches"
              className="w-full py-2.5 rounded-xl bg-[#2C0854] hover:bg-[#380E6B] border border-[#4A138C] text-slate-200 font-bold text-xs transition-colors text-center"
            >
              Return to Match List
            </a>

            <a
              href={`/admin/draws?category=${match.category}`}
              className="w-full py-2 rounded-xl text-[#D8C7F0] hover:text-[#FFBA00] text-xs font-semibold transition-colors text-center"
            >
              View Updated Bracket →
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
