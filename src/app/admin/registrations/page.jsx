'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserCheck, Search, Filter, Check, X, Shield, Users, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
        fetchRegistrations();
      }
    } catch (err) {
      alert(err.message || 'Failed to update registration status.');
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
          Total: <span className="text-gold-400 font-bold">{registrations.length}</span> registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="glass-card rounded-3xl p-6 border border-navy-800 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No registrations match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-navy-800 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold">Participant Details</th>
                  <th className="pb-3 font-semibold">Department & Roll</th>
                  <th className="pb-3 font-semibold">Requested Doubles Partner</th>
                  <th className="pb-3 font-semibold">Requested Mixed Partner</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {registrations.map((reg) => {
                  const p = reg.participantId;
                  if (!p) return null;

                  return (
                    <tr key={reg._id} className="hover:bg-navy-900/40">
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

                      <td className="py-3.5">
                        <span className="text-slate-200 font-medium bg-navy-950 px-2 py-1 rounded border border-navy-800">
                          {reg.doublesPartnerName || 'Not specified'}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span className="text-slate-200 font-medium bg-navy-950 px-2 py-1 rounded border border-navy-800">
                          {reg.mixedDoublesPartnerName || 'Not specified'}
                        </span>
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
