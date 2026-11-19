'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Edit3
} from 'lucide-react';

export const EditTeamModal = ({ isOpen, onClose, team, onSuccess }) => {
  const toast = useToast();

  const [teamName, setTeamName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [targetSlot, setTargetSlot] = useState('player2'); // 'player1' | 'player2'
  const [mode, setMode] = useState('custom'); // 'custom' | 'participant'
  const [reason, setReason] = useState('Partner replaced due to late schedule / non-attendance');
  const [saving, setSaving] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const isDoubles = team?.category?.includes('doubles');

  useEffect(() => {
    if (team) {
      setTeamName(team.name || '');
      setPartnerName(team.rawPartnerName || team.player2?.fullName || '');
      setSelectedParticipantId('');
      setTargetSlot(isDoubles ? 'player2' : 'player1');
      setMode('custom');
    }
  }, [team, isDoubles, isOpen]);

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
          console.error('Failed to load participants:', err);
        } finally {
          setLoadingParticipants(false);
        }
      };
      fetchParticipants();
    }
  }, [isOpen]);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return participants.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.studentId?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
    );
  }, [participants, searchQuery]);

  const selectedParticipant = useMemo(() => {
    return participants.find((p) => p._id === selectedParticipantId);
  }, [participants, selectedParticipantId]);

  const previewName = useMemo(() => {
    if (mode === 'custom') {
      if (teamName.trim()) return teamName.trim();
      const p1 = team?.player1?.fullName || 'Player 1';
      return partnerName.trim() ? `${p1} & ${partnerName.trim()}` : p1;
    } else {
      const p1 = team?.player1?.fullName || 'Player 1';
      if (!selectedParticipant) return team?.name || '';
      if (isDoubles) {
        if (targetSlot === 'player1') {
          const p2 = team?.player2?.fullName || team?.rawPartnerName || 'Partner';
          return `${selectedParticipant.fullName} & ${p2}`;
        }
        return `${p1} & ${selectedParticipant.fullName}`;
      }
      return selectedParticipant.fullName;
    }
  }, [mode, teamName, partnerName, team, selectedParticipant, isDoubles, targetSlot]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!team) return;

    setSaving(true);
    try {
      const payload = {
        reason: reason.trim() || 'Admin updated team/partner'
      };

      if (mode === 'custom') {
        payload.name = teamName.trim() || previewName;
        if (isDoubles) {
          payload.customPartnerName = partnerName.trim();
        }
      } else {
        if (!selectedParticipantId) {
          toast.error('Please select a registered student or switch to custom name.');
          setSaving(false);
          return;
        }
        payload.newParticipantId = selectedParticipantId;
        if (targetSlot === 'player1') {
          payload.player1Id = selectedParticipantId;
        } else {
          payload.player2Id = selectedParticipantId;
        }
        payload.name = previewName;
      }

      const res = await api.updateTeam(team._id, payload);
      if (res.success) {
        toast.success(res.message || 'Team and partner updated successfully!');
        if (onSuccess) onSuccess(res.team);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update team.');
    } finally {
      setSaving(false);
    }
  };

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Team: ${team.name}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase text-[10px] font-bold">
              Category
            </span>
            <span className="font-mono font-bold text-[#E74C3C] uppercase text-[11px]">
              {team.category?.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#3E342B] dark:text-[#F5F1E8]">
            <span>Current Roster:</span>
            <span className="font-semibold">
              {team.player1?.fullName} {team.player2 ? `& ${team.player2.fullName}` : ''}
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] p-1 border border-[#E8E1D5] dark:border-[#2B3034]">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'custom'
                ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                : 'text-[#7E7060] dark:text-[#B8B1A5]'
            }`}
          >
            ✍️ Custom Rename / Partner
          </button>
          <button
            type="button"
            onClick={() => setMode('participant')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'participant'
                ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                : 'text-[#7E7060] dark:text-[#B8B1A5]'
            }`}
          >
            📋 Swap with Registered Student
          </button>
        </div>

        {mode === 'custom' && (
          <div className="space-y-3.5">
            {isDoubles && (
              <div>
                <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                  New Partner Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => {
                    setPartnerName(e.target.value);
                    const p1 = team.player1?.fullName || 'Player 1';
                    setTeamName(e.target.value.trim() ? `${p1} & ${e.target.value.trim()}` : p1);
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-10 px-3.5 text-xs bg-white dark:bg-[#181C1F] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                Full Team Display Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Priya Patel & Rahul Sharma"
                className="w-full h-10 px-3.5 text-xs bg-white dark:bg-[#181C1F] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
              />
            </div>
          </div>
        )}

        {mode === 'participant' && (
          <div className="space-y-3.5">
            {isDoubles && (
              <div>
                <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
                  Slot to Replace
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetSlot('player2')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      targetSlot === 'player2'
                        ? 'border-[#E74C3C] bg-[#FDEDEC]/30 text-[#E74C3C]'
                        : 'border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060]'
                    }`}
                  >
                    Partner (Player 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSlot('player1')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      targetSlot === 'player1'
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-[#181C1F] rounded-lg border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] p-1 bg-white dark:bg-[#15191C]">
                {loadingParticipants ? (
                  <div className="p-3 text-center text-xs text-[#7E7060]">Loading...</div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#7E7060]">No matches found</div>
                ) : (
                  filteredParticipants.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => setSelectedParticipantId(p._id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        selectedParticipantId === p._id
                          ? 'bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] font-bold'
                          : 'hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8]'
                      }`}
                    >
                      <span className="truncate">{p.fullName} ({p.department || 'General'})</span>
                      <span className="text-[10px] text-[#7E7060] uppercase">{p.gender}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
            Reason / Notes
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-9 px-3 text-xs bg-white dark:bg-[#181C1F] rounded-lg border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
          />
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
            Updated Team Name Preview
          </span>
          <span className="font-bold text-emerald-950 dark:text-emerald-200">
            {previewName}
          </span>
        </div>

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
            disabled={saving}
            className="px-6 py-2 text-xs font-bold rounded-xl btn-primary shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
