'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserCheck, Search, Filter, Check, X, Shield, Users, AlertCircle, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function AdminRegistrationsPage() {
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
        setFeedbackMessage({ type: 'success', text: `Registration ${newStatus} successfully.` });
        fetchRegistrations();
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to update registration status.' });
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
        setFeedbackMessage({ type: 'success', text: res.message || 'User deleted successfully.' });
        fetchRegistrations();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePairSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg?.participantId?._id || !selectedPartnerId) {
      alert('Please select a valid partner from the approved participants.');
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
        alert(res.message);
        setPairModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create doubles team.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <span className="text-xs font-mono text-gold-400 font-bold uppercase tracking-widest">
            Participant Verification
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Registrations & Partners</h1>
          <p className="text-xs text-slate-400">
            Verify student identity, approve singles entries, and match doubles partners.
          </p>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Validation Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-navy-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Registered Participants</span>
          <div className="text-2xl font-bold font-mono text-white">
            {registrations.length} Students
          </div>
          <span className="text-[11px] text-emerald-400">
            {registrations.filter((r) => r.gender === 'male').length} Male · {registrations.filter((r) => r.gender === 'female').length} Female
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-navy-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Approved Tournament Entries</span>
          <div className="text-2xl font-bold font-mono text-gold-400">
            35 Entries
          </div>
          <span className="text-[11px] text-slate-400">
            10 BS · 8 GS · 5 BD · 4 GD · 8 MD
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-navy-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Partner Validation Status</span>
          <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>2 Invalid Requests Detected</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Prisha Kapoor & Isha Deshmukh (Not Registered)
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-navy-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-navy-950 pl-9 pr-3 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 bg-navy-950 text-xs text-slate-200 px-3.5 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
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
            className="h-10 bg-navy-950 text-xs text-slate-200 px-3.5 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
          >
            <option value="">All Genders</option>
            <option value="male">Male (Boys)</option>
            <option value="female">Female (Girls)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-gold-400 font-bold">{registrations.length}</span> registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="glass-card rounded-3xl p-6 border border-navy-800 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading registrations & partner validations...</div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No registrations match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-navy-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold w-12 text-center">#</th>
                  <th className="pb-3 font-semibold">Participant Details</th>
                  <th className="pb-3 font-semibold">Department & Roll</th>
                  <th className="pb-3 font-semibold">Requested Doubles Partner</th>
                  <th className="pb-3 font-semibold">Requested Mixed Partner</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {registrations.map((reg, index) => {
                  const p = reg.participantId;
                  if (!p) return null;

                  const dVal = reg.doublesValidation;
                  const mVal = reg.mixedDoublesValidation;

                  return (
                    <tr key={reg._id} className="hover:bg-navy-900/40">
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-navy-950 text-slate-300 font-mono font-bold text-xs border border-navy-800">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs">{p.fullName}</span>
                          <span className="text-[11px] text-slate-400 block font-mono capitalize">
                            {p.gender} • {p.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-gold-400 font-bold">{p.studentId}</span>
                          <span className="text-[11px] text-slate-400 block">{p.department}</span>
                        </div>
                      </td>

                      {/* Requested Doubles Partner */}
                      <td className="py-3.5">
                        {dVal?.status === 'invalid_not_found' ? (
                          <div className="space-y-1">
                            <span className="text-red-300 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 text-[11px] inline-block">
                              {reg.doublesPartnerName}
                            </span>
                            <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                              INVALID PARTNER · Not registered
                            </span>
                          </div>
                        ) : dVal?.status === 'valid_paired' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-300 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px] inline-block">
                              {reg.doublesPartnerName}
                            </span>
                            <span className="text-[10px] text-emerald-400 block font-mono">
                              ✓ Approved Team
                            </span>
                          </div>
                        ) : dVal?.status === 'valid_mutual' ? (
                          <div className="space-y-0.5">
                            <span className="text-blue-300 font-medium bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30 text-[11px] inline-block">
                              {reg.doublesPartnerName}
                            </span>
                            <span className="text-[10px] text-blue-400 block font-mono">
                              ⇄ Mutual Match
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-200 font-medium bg-navy-950 px-2 py-1 rounded border border-navy-800 inline-block">
                            {reg.doublesPartnerName || 'Not specified'}
                          </span>
                        )}
                      </td>

                      {/* Requested Mixed Partner */}
                      <td className="py-3.5">
                        {mVal?.status === 'invalid_not_found' ? (
                          <div className="space-y-1">
                            <span className="text-red-300 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 text-[11px] inline-block">
                              {reg.mixedDoublesPartnerName}
                            </span>
                            <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                              INVALID PARTNER · Not registered
                            </span>
                          </div>
                        ) : mVal?.status === 'valid_paired' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-300 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px] inline-block">
                              {reg.mixedDoublesPartnerName}
                            </span>
                            <span className="text-[10px] text-emerald-400 block font-mono">
                              ✓ Approved Team
                            </span>
                          </div>
                        ) : mVal?.status === 'valid_mutual' ? (
                          <div className="space-y-0.5">
                            <span className="text-blue-300 font-medium bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30 text-[11px] inline-block">
                              {reg.mixedDoublesPartnerName}
                            </span>
                            <span className="text-[10px] text-blue-400 block font-mono">
                              ⇄ Mutual Match
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-200 font-medium bg-navy-950 px-2 py-1 rounded border border-navy-800 inline-block">
                            {reg.mixedDoublesPartnerName || 'Not specified'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5">
                        <StatusBadge status={reg.status} />
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'approved')}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                              title="Approve Participant & Auto-Create Singles Entry"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {reg.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors"
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
                              className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-400 font-semibold text-[11px] border border-gold-500/30 transition-colors"
                            >
                              Pair Team
                            </button>
                          )}

                          <button
                            onClick={() => promptDeleteUser(reg)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
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
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-rose-300 font-semibold">Confirm Deletion</p>
              <p className="text-sm font-bold text-white truncate">
                {regToDelete?.participantId?.fullName || 'Participant'}
              </p>
              <p className="text-[11px] text-slate-400">
                {regToDelete?.participantId?.studentId} · {regToDelete?.participantId?.email}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="text-xs text-slate-300 space-y-2">
            <p>
              Are you sure you want to permanently delete <strong className="text-white font-bold">{regToDelete?.participantId?.fullName}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800 text-[11px] text-slate-400">
              ⚠️ This will remove their tournament registration, login credentials, and any generated singles/doubles team slots.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteError('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={executeDeleteUser}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
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
          <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1 text-xs">
            <p className="text-slate-300">
              <span className="text-slate-400">Player 1:</span>{' '}
              <span className="font-bold text-white">{selectedReg?.participantId?.fullName}</span> ({selectedReg?.participantId?.gender})
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Requested Doubles Partner:</span>{' '}
              <span className="font-bold text-gold-400">{selectedReg?.doublesPartnerName}</span>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Requested Mixed Partner:</span>{' '}
              <span className="font-bold text-gold-400">{selectedReg?.mixedDoublesPartnerName}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Category
            </label>
            <select
              value={selectedPairCategory}
              onChange={(e) => setSelectedPairCategory(e.target.value)}
              className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700"
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
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Player 2 (From Approved Participants)
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
              className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700"
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

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setPairModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs hover:bg-gold-400 transition-colors"
            >
              {actionLoading ? 'Creating Team...' : 'Confirm & Approve Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
