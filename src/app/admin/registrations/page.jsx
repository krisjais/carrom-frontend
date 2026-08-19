'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserCheck, Search, Filter, Check, X, Shield, Users, AlertCircle, Trash2, Trophy } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminRegistrationsPage() {
  const toast = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Delete user modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [regToDelete, setRegToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Pair creation modal
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedPairCategory, setSelectedPairCategory] = useState('boys_doubles');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (genderFilter) params.gender = genderFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.getAllRegistrations(params);
      if (res.success) setRegistrations(res.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter, genderFilter, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.updateRegistrationStatus(id, newStatus);
      if (res.success) {
        toast.success(`Registration ${newStatus} successfully.`);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update registration status.');
    } finally {
      setActionLoading(false);
    }
  };

  const promptDeleteUser = (reg) => {
    setRegToDelete(reg);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDeleteUser = async () => {
    if (!regToDelete) return;
    setActionLoading(true);
    setDeleteError('');
    try {
      const res = await api.deleteRegistration(regToDelete._id);
      if (res.success) {
        setDeleteModalOpen(false);
        setRegToDelete(null);
        toast.success(res.message || 'User deleted successfully.');
        fetchRegistrations();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user.');
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePairSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg?.participantId?._id || !selectedPartnerId) {
      toast.warning('Please select a valid partner from the approved participants.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.createDoublesPair({
        player1Id: selectedReg.participantId._id,
        player2Id: selectedPartnerId,
        category: selectedPairCategory
      });
      if (res.success) {
        toast.success(res.message || 'Doubles team created successfully.');
        setPairModalOpen(false);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create doubles team.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest">
            Participant Verification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">Registrations & Partners</h1>
          <p className="text-xs text-[#D4DEEE]">
            Verify student identity, approve singles entries, and match verified doubles partners.
          </p>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Validation Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="sport-card p-5 rounded-2xl border border-[#35538C] space-y-1">
          <span className="text-[10px] text-[#D4DEEE] font-mono uppercase font-bold">Registered Athletes</span>
          <div className="text-2xl font-black font-mono text-white">
            {registrations.length} Students
          </div>
          <span className="text-[11px] text-emerald-300 font-semibold">
            {registrations.filter((r) => r.gender === 'male').length} Male · {registrations.filter((r) => r.gender === 'female').length} Female
          </span>
        </div>

        <div className="sport-card p-5 rounded-2xl border border-[#35538C] space-y-1">
          <span className="text-[10px] text-[#D4DEEE] font-mono uppercase font-bold">Approved Status</span>
          <div className="text-2xl font-black font-mono text-[#FFD691]">
            {registrations.filter((r) => r.status === 'approved').length} Approved
          </div>
          <span className="text-[11px] text-[#D4DEEE]">
            {registrations.filter((r) => r.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="sport-card p-5 rounded-2xl border border-[#35538C] space-y-1">
          <span className="text-[10px] text-[#D4DEEE] font-mono uppercase font-bold">Partner Validation Status</span>
          <div className="text-sm font-bold text-[#FFD691] flex items-center gap-1.5 pt-1">
            <Shield className="w-4 h-4 text-[#FFD691] shrink-0" />
            <span>Admin Partner Verification Active</span>
          </div>
          <span className="text-[10px] text-[#D4DEEE]/80 block font-mono">
            Requires exact full name match
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sport-card p-4 rounded-2xl border border-[#35538C] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-[#D4DEEE] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-[#152442] pl-10 pr-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 bg-[#152442] text-xs text-white px-4 rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-11 bg-[#152442] text-xs text-white px-4 rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          >
            <option value="">All Genders</option>
            <option value="male">Male (Boys)</option>
            <option value="female">Female (Girls)</option>
          </select>
        </div>

        <div className="text-xs text-[#D4DEEE] font-mono">
          Showing <span className="text-[#FFD691] font-bold">{registrations.length}</span> registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-4">
        {loading ? (
          <div className="py-16 text-center text-[#D4DEEE] text-sm">Loading registrations & partner validations...</div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-[#D4DEEE] text-sm">No registrations match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#35538C] text-[#D4DEEE] font-bold uppercase text-[11px]">
                <tr>
                  <th className="pb-3 w-12 text-center">#</th>
                  <th className="pb-3">Participant Details</th>
                  <th className="pb-3">Department & Roll</th>
                  <th className="pb-3">Requested Doubles Partner</th>
                  <th className="pb-3">Requested Mixed Partner</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35538C]/60">
                {registrations.map((reg, index) => {
                  const p = reg.participantId;
                  if (!p) return null;

                  return (
                    <tr key={reg._id} className="hover:bg-[#1E3258]/40 transition-colors">
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-[#152442] text-[#FFD691] font-mono font-bold text-xs border border-[#35538C]">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs">{p.fullName}</span>
                          <span className="text-[11px] text-[#D4DEEE] block font-mono capitalize">
                            {p.gender} • {p.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[#FFD691] font-bold">{p.studentId}</span>
                          <span className="text-[11px] text-[#D4DEEE] block">{p.department}</span>
                        </div>
                      </td>

                      {/* Requested Doubles Partner */}
                      <td className="py-3.5">
                        <span className="text-slate-200 font-bold bg-[#152442] px-3 py-1 rounded-xl border border-[#35538C] inline-block">
                          {reg.doublesPartnerName || 'Not specified'}
                        </span>
                      </td>

                      {/* Requested Mixed Partner */}
                      <td className="py-3.5">
                        <span className="text-slate-200 font-bold bg-[#152442] px-3 py-1 rounded-xl border border-[#35538C] inline-block">
                          {reg.mixedDoublesPartnerName || 'Not specified'}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <StatusBadge status={reg.status} />
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {reg.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'approved')}
                              disabled={actionLoading}
                              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors cursor-pointer"
                              title="Approve Participant & Auto-Create Singles Entry"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {reg.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                              disabled={actionLoading}
                              className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors cursor-pointer"
                              title="Reject Registration"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {reg.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedReg(reg);
                                setSelectedPairCategory(p.gender === 'male' ? 'boys_doubles' : 'girls_doubles');
                                setPairModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1E3258] hover:bg-[#2A457A] text-[#FFD691] font-bold text-[11px] border border-[#FFD691]/40 transition-colors cursor-pointer"
                            >
                              Pair Team
                            </button>
                          )}

                          <button
                            onClick={() => promptDeleteUser(reg)}
                            disabled={actionLoading}
                            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                            title={`Delete ${p.fullName} and registration`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User In-App Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setDeleteModalOpen(false);
            setDeleteError('');
          }
        }}
        title="Delete Participant & Registration"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-rose-300 font-bold">Confirm Deletion</p>
              <p className="text-sm font-black text-white truncate">
                {regToDelete?.participantId?.fullName || 'Participant'}
              </p>
              <p className="text-[11px] text-[#D4DEEE]">
                {regToDelete?.participantId?.studentId} · {regToDelete?.participantId?.email}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="text-xs text-slate-200 space-y-2">
            <p>
              Are you sure you want to permanently delete <strong className="text-white font-bold">{regToDelete?.participantId?.fullName}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-[#152442] border border-[#35538C] text-[11px] text-[#D4DEEE]">
              ⚠️ This will remove their tournament registration, login credentials, and any generated singles/doubles team slots.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#35538C]">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteError('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#D4DEEE] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={executeDeleteUser}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pair Team Modal */}
      <Modal
        isOpen={pairModalOpen}
        onClose={() => setPairModalOpen(false)}
        title={`Pair Doubles Team for ${selectedReg?.participantId?.fullName}`}
      >
        <form onSubmit={handleCreatePairSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] space-y-1 text-xs">
            <p className="text-[#D4DEEE]">
              <span className="text-slate-400 font-bold">Player 1:</span>{' '}
              <span className="font-bold text-white">{selectedReg?.participantId?.fullName}</span> ({selectedReg?.participantId?.gender})
            </p>
            <p className="text-[#D4DEEE]">
              <span className="text-slate-400 font-bold">Requested Doubles Partner:</span>{' '}
              <span className="font-bold text-[#FFD691]">{selectedReg?.doublesPartnerName}</span>
            </p>
            <p className="text-[#D4DEEE]">
              <span className="text-slate-400 font-bold">Requested Mixed Partner:</span>{' '}
              <span className="font-bold text-[#FFD691]">{selectedReg?.mixedDoublesPartnerName}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Category
            </label>
            <select
              value={selectedPairCategory}
              onChange={(e) => setSelectedPairCategory(e.target.value)}
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C]"
            >
              {selectedReg?.participantId?.gender === 'male' && (
                <option value="boys_doubles">Boys Doubles</option>
              )}
              {selectedReg?.participantId?.gender === 'female' && (
                <option value="girls_doubles">Girls Doubles</option>
              )}
              <option value="mixed_doubles">Mixed Doubles</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Select Player 2 (From Approved Participants)
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C]"
            >
              <option value="">-- Choose Partner --</option>
              {registrations
                .filter((r) => r.status === 'approved' && r.participantId?._id !== selectedReg?.participantId?._id)
                .map((r) => (
                  <option key={r.participantId._id} value={r.participantId._id}>
                    {r.participantId.fullName} ({r.participantId.gender}, {r.participantId.studentId})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#35538C]">
            <button
              type="button"
              onClick={() => setPairModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#D4DEEE] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl btn-cream font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              {actionLoading ? 'Creating Team...' : 'Confirm & Approve Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
