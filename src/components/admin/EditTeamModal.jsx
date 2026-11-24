'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PartnerSearchSelect } from '@/components/common/PartnerSearchSelect';
import {
  CheckCircle2,
  RefreshCw,
  Shield
} from 'lucide-react';

export const EditTeamModal = ({ isOpen, onClose, team, onSuccess }) => {
  const toast = useToast();

  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [selectedParticipantName, setSelectedParticipantName] = useState('');
  const [targetSlot, setTargetSlot] = useState('player2'); // 'player1' | 'player2'
  const [reason, setReason] = useState('Partner replaced from registered participants');
  const [saving, setSaving] = useState(false);

  const isDoubles = team?.category?.includes('doubles');

  useEffect(() => {
    if (team) {
      setSelectedParticipantId('');
      setSelectedParticipantName('');
      setTargetSlot(isDoubles ? 'player2' : 'player1');
    }
  }, [team, isDoubles, isOpen]);

  // Determine the partner gender constraint based on category and the retained slot's player gender
  const retainedPlayer = useMemo(() => {
    if (!team) return null;
    if (!isDoubles) return null;
    return targetSlot === 'player1' ? team.player2 : team.player1;
  }, [team, isDoubles, targetSlot]);

  const effectivePlayerGender = useMemo(() => {
    if (!team) return 'male';
    if (team.category === 'boys_singles' || team.category === 'boys_doubles') return 'male';
    if (team.category === 'girls_singles' || team.category === 'girls_doubles') return 'female';
    // For mixed_doubles, PartnerSearchSelect filters to opposite of playerGender, so pass retainedPlayer.gender
    return retainedPlayer?.gender || team.player1?.gender || 'male';
  }, [team, retainedPlayer]);

  const excludeId = useMemo(() => {
    if (!team) return '';
    if (isDoubles) {
      return retainedPlayer?._id || '';
    }
    return team.player1?._id || '';
  }, [team, isDoubles, retainedPlayer]);

  const previewName = useMemo(() => {
    const p1 = team?.player1?.fullName || 'Player 1';
    const p2 = team?.player2?.fullName || 'Partner';
    if (!selectedParticipantName) return team?.name || '';
    if (isDoubles) {
      return targetSlot === 'player1'
        ? `${selectedParticipantName} & ${p2}`
        : `${p1} & ${selectedParticipantName}`;
    }
    return selectedParticipantName;
  }, [team, selectedParticipantName, isDoubles, targetSlot]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!team) return;

    if (!selectedParticipantId) {
      toast.error('Please search and select an existing registered participant.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        reason: reason.trim() || 'Admin updated team/partner from registered participants',
        newParticipantId: selectedParticipantId,
        name: previewName
      };

      if (targetSlot === 'player1') {
        payload.player1Id = selectedParticipantId;
      } else {
        payload.player2Id = selectedParticipantId;
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

        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            Selection is strictly linked to existing registered participants matching category gender and availability rules.
          </span>
        </div>

        {isDoubles && (
          <div>
            <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1">
              Slot to Replace
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTargetSlot('player2');
                  setSelectedParticipantId('');
                  setSelectedParticipantName('');
                }}
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
                onClick={() => {
                  setTargetSlot('player1');
                  setSelectedParticipantId('');
                  setSelectedParticipantName('');
                }}
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
          <label className="text-xs font-bold uppercase font-mono text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5">
            Search & Select Registered Participant *
          </label>
          <PartnerSearchSelect
            category={team.category === 'boys_singles' || team.category === 'girls_singles' ? (team.category === 'boys_singles' ? 'boys_doubles' : 'girls_doubles') : team.category}
            playerGender={effectivePlayerGender}
            excludeId={excludeId}
            valueId={selectedParticipantId}
            valueName={selectedParticipantName}
            required
            onChange={(candidate) => {
              setSelectedParticipantId(candidate?._id || '');
              setSelectedParticipantName(candidate?.fullName || '');
            }}
            placeholder="Search participant by name or department..."
          />
        </div>

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
            disabled={saving || !selectedParticipantId}
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
