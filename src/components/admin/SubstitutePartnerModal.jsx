'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Users,
  UserCheck,
  UserPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Edit3
} from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';

export const SubstitutePartnerModal = ({
  isOpen,
  onClose,
  match,
  initialSlot = 'team1',
  onSuccess
}) => {
  const toast = useToast();

  const [selectedSlot, setSelectedSlot] = useState(initialSlot); // 'team1' | 'team2'
  const [subMode, setSubMode] = useState('custom'); // 'custom' | 'participant'
  const [customPartnerName, setCustomPartnerName] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [targetPlayerSlot, setTargetPlayerSlot] = useState('player2'); // 'player1' | 'player2'
  const [reason, setReason] = useState('Partner could not attend / went home early');
  const [saving, setSaving] = useState(false);

  // Registered participants list for quick dropdown selection
  const [participants, setParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (initialSlot) {
      setSelectedSlot(initialSlot);
    }
  }, [initialSlot, isOpen]);

  const activeTeam = selectedSlot === 'team1' ? match?.team1 : match?.team2;
  const isDoubles = match?.category?.includes('doubles');

  // Reset fields when active team changes
  useEffect(() => {
    if (activeTeam) {
      setCustomTeamName(activeTeam.name || '');
      setCustomPartnerName(activeTeam.rawPartnerName || activeTeam.player2?.fullName || '');
      setSelectedParticipantId('');
      setTargetPlayerSlot(isDoubles ? 'player2' : 'player1');
    }
  }, [activeTeam, isDoubles, isOpen]);

  // Fetch approved participants when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        try {
          const res = await api.getAllRegistrations({ limit: 200 });
          if (res.success && res.registrations) {
            const list = res.registrations
              .map((r) => r.participant)
              .filter(Boolean);
            setParticipants(list);
          }
        } catch (err) {
          console.error('Failed to load participants for substitution dropdown:', err);
        } finally {
          setLoadingParticipants(false);
        }
      };
      fetchParticipants();
    }
  }, [isOpen]);

  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return participants.slice(0, 30);
    const q = participantSearch.toLowerCase();
    return participants.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.studentId?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
    );
  }, [participants, participantSearch]);

  const selectedParticipant = useMemo(() => {
    return participants.find((p) => p._id === selectedParticipantId);
  }, [participants, selectedParticipantId]);

  // Compute live preview of what the team name will become
  const previewName = useMemo(() => {
    if (subMode === 'custom') {
      if (customTeamName.trim()) return customTeamName.trim();
      const p1 = activeTeam?.player1?.fullName || 'Player 1';
      return customPartnerName.trim() ? `${p1} & ${customPartnerName.trim()}` : p1;
    } else {
      const p1 = activeTeam?.player1?.fullName || 'Player 1';
      if (!selectedParticipant) return activeTeam?.name || 'No changes';
      if (isDoubles) {
        if (targetPlayerSlot === 'player1') {
          const p2 = activeTeam?.player2?.fullName || activeTeam?.rawPartnerName || 'Partner';
          return `${selectedParticipant.fullName} & ${p2}`;
        }
        return `${p1} & ${selectedParticipant.fullName}`;
      }
      return selectedParticipant.fullName;
    }
  }, [subMode, customTeamName, customPartnerName, activeTeam, selectedParticipant, isDoubles, targetPlayerSlot]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!match || !activeTeam) {
      toast.error('No valid team selected for substitution.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slot: selectedSlot,
        reason: reason.trim() || 'Partner substitution requested by admin',
        matchNumber: match.matchNumber,
        category: match.category,
        targetTeamId: activeTeam?._id || activeTeam
      };

      if (subMode === 'custom') {
        if (customTeamName.trim()) {
          payload.newName = customTeamName.trim();
        }
        if (customPartnerName.trim()) {
          payload.newPartnerName = customPartnerName.trim();
        }
      } else {
        if (!selectedParticipantId) {
          toast.error('Please select a registered participant or switch to custom name.');
          setSaving(false);
          return;
        }
        payload.newParticipantId = selectedParticipantId;
        payload.targetPlayerSlot = targetPlayerSlot;
        payload.newName = previewName;
      }

      const res = await api.substituteMatchPartner(match._id || match.id || 'lookup', payload);
      if (res.success) {
        toast.success(res.message || 'Partner updated and match name synchronized!');
        if (onSuccess) {
          onSuccess(res.match);
        }
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update partner in match.');
    } finally {
      setSaving(false);
    }
  };

  if (!match) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Substitute Partner / Update Match Name"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Match Header Info */}
        <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#E74C3C] block">
              {match.roundName || `ROUND ${match.roundNumber}`}
            </span>
            <span className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">
              Match #{match.matchNumber}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold">
            {match.category?.replace('_', ' ')}
          </span>
        </div>

        {/* Slot Selector: Team 1 vs Team 2 */}
        <div>
          <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-2">
            Select Slot to Update
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedSlot('team1')}
              disabled={!match.team1}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedSlot === 'team1'
                  ? 'border-[#E74C3C] bg-[#FDEDEC]/30 dark:bg-[#E74C3C]/10 ring-1 ring-[#E74C3C]'
                  : 'border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] hover:border-[#D5C4A1]'
              } ${!match.team1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold mb-1">
                <CarromCoin type="white" size="xs" />
                <span>Slot 1 (Team 1)</span>
              </div>
              <div className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                {match.team1?.name || 'TBD (Empty Slot)'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSlot('team2')}
              disabled={!match.team2}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedSlot === 'team2'
                  ? 'border-[#E74C3C] bg-[#FDEDEC]/30 dark:bg-[#E74C3C]/10 ring-1 ring-[#E74C3C]'
                  : 'border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] hover:border-[#D5C4A1]'
              } ${!match.team2 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold mb-1">
                <CarromCoin type="black" size="xs" />
                <span>Slot 2 (Team 2)</span>
              </div>
              <div className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                {match.team2?.name || (match.isBye ? 'BYE' : 'TBD (Empty Slot)')}
              </div>
            </button>
          </div>
        </div>

        {/* Current Active Team Information */}
        {activeTeam && (
          <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#7E7060] dark:text-[#B8B1A5]">
              <span className="font-mono text-[11px] font-semibold">Current Name:</span>
              <span className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">{activeTeam.name}</span>
            </div>
            {isDoubles && (
              <div className="flex items-center justify-between text-[#7E7060] dark:text-[#B8B1A5] text-[11px]">
                <span>Athletes:</span>
                <span className="font-mono">
                  {activeTeam.player1?.fullName || 'Player 1'} &{' '}
                  <span className="text-[#E74C3C] font-semibold">
                    {activeTeam.player2?.fullName || activeTeam.rawPartnerName || 'Unassigned Partner'}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mode Selector: Custom Typing vs Registered Participant */}
        <div>
          <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-2">
            Substitution Method
          </label>
          <div className="flex rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] p-1 border border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setSubMode('custom')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                subMode === 'custom'
                  ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                  : 'text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B]'
              }`}
            >
              ✍️ Type New Partner / Team Name
            </button>
            <button
              type="button"
              onClick={() => setSubMode('participant')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                subMode === 'participant'
                  ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                  : 'text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B]'
              }`}
            >
              📋 Pick Registered Student
            </button>
          </div>
        </div>

        {/* Mode A: Custom Partner Name & Team Name */}
        {subMode === 'custom' && (
          <div className="space-y-4">
            {isDoubles && (
              <div>
                <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                  New / Substitute Partner Name
                </label>
                <input
                  type="text"
                  value={customPartnerName}
                  onChange={(e) => {
                    setCustomPartnerName(e.target.value);
                    const p1 = activeTeam?.player1?.fullName || 'Player 1';
                    setCustomTeamName(e.target.value.trim() ? `${p1} & ${e.target.value.trim()}` : p1);
                  }}
                  placeholder="e.g. Aisha Khan (Substitute)"
                  className="w-full h-10 px-3.5 text-xs bg-white dark:bg-[#181C1F] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
                />
                <span className="text-[10px] text-[#7E7060] dark:text-[#B8B1A5] mt-1 block">
                  Replaces partner in doubles while keeping the primary player intact.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                Full Match Display Name
              </label>
              <input
                type="text"
                value={customTeamName}
                onChange={(e) => setCustomTeamName(e.target.value)}
                placeholder="e.g. Priya Patel & Aisha Khan"
                className="w-full h-10 px-3.5 text-xs bg-white dark:bg-[#181C1F] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
              />
              <span className="text-[10px] text-[#7E7060] dark:text-[#B8B1A5] mt-1 block">
                This exact text will appear on the bracket tree, scoreboard, and live queue.
              </span>
            </div>
          </div>
        )}

        {/* Mode B: Pick Registered Participant */}
        {subMode === 'participant' && (
          <div className="space-y-4">
            {isDoubles && (
              <div>
                <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                  Which Position to Replace?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetPlayerSlot('player2')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      targetPlayerSlot === 'player2'
                        ? 'border-[#E74C3C] bg-[#FDEDEC]/30 text-[#E74C3C]'
                        : 'border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060]'
                    }`}
                  >
                    Partner (Player 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPlayerSlot('player1')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      targetPlayerSlot === 'player1'
                        ? 'border-[#E74C3C] bg-[#FDEDEC]/30 text-[#E74C3C]'
                        : 'border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060]'
                    }`}
                  >
                    Primary Player (Player 1)
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                Select Replacement Student
              </label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7E7060]" />
                <input
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Search student name, ID, or department..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-[#181C1F] rounded-lg border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] p-1 bg-white dark:bg-[#15191C]">
                {loadingParticipants ? (
                  <div className="p-4 text-center text-xs text-[#7E7060]">Loading students...</div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#7E7060]">No matching students found</div>
                ) : (
                  (filteredParticipants || []).filter(Boolean).map((p, pIdx) => (
                    <button
                      key={p?._id || pIdx}
                      type="button"
                      onClick={() => setSelectedParticipantId(p?._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedParticipantId === p?._id
                          ? 'bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] font-bold'
                          : 'hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8]'
                      }`}
                    >
                      <div className="truncate">
                        <span>{p?.fullName}</span>
                        {p?.department && (
                          <span className="text-[10px] text-[#7E7060] dark:text-[#B8B1A5] ml-2">
                            ({p?.department})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#7E7060] uppercase shrink-0">
                        {p.gender}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reason for Audit Log */}
        <div>
          <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
            Reason for Substitution
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Original partner could not attend / went home early"
            className="w-full h-9 px-3 text-xs bg-white dark:bg-[#181C1F] rounded-lg border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
          />
        </div>

        {/* Live Preview Box */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
            Bracket Preview: Updated Match Lineup
          </span>
          <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{previewName}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] text-[#7E7060] dark:text-[#B8B1A5] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !activeTeam}
            className="px-6 py-2 text-xs font-bold rounded-xl btn-primary shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save & Update Match</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
