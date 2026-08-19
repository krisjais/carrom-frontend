'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  UserCheck,
  Search,
  Filter,
  Check,
  X,
  Shield,
  Users,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Trophy,
  CheckCircle2,
  Clock,
  XCircle,
  UserPlus,
  Edit3,
  Lock
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast, useConfirm } from '@/context/ToastContext';

export default function AdminRegistrationsPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete user modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [regToDelete, setRegToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Pair creation modal
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedPairCategory, setSelectedPairCategory] = useState('boys_doubles');

  // Admin Edit Override modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    department: '',
    doublesPartnerName: '',
    mixedDoublesPartnerName: '',
    adminNotes: ''
  });

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

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === registrations.length && registrations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registrations.map((r) => r._id));
    }
  };

  const handleDeleteAllRegistrations = async () => {
    if (registrations.length === 0) return;
    const isConfirmed = await confirm({
      title: `Delete ALL (${registrations.length}) Registrations?`,
      message: 'Are you sure you want to completely delete all participant entries, student profiles, and generated teams? This action cannot be undone.',
      confirmText: `Delete All (${registrations.length})`,
      type: 'danger'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await api.bulkDeleteRegistrations([]);
      if (res.success) {
        toast.success(res.message || 'All participant registrations deleted.');
        setSelectedIds([]);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete registrations.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSelectedRegistrations = async () => {
    if (selectedIds.length === 0) return;
    const isConfirmed = await confirm({
      title: `Delete ${selectedIds.length} Selected Registrations?`,
      message: `Are you sure you want to remove the ${selectedIds.length} selected participant entries and their associated records?`,
      confirmText: `Delete Selected (${selectedIds.length})`,
      type: 'danger'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await api.bulkDeleteRegistrations(selectedIds);
      if (res.success) {
        toast.success(res.message || `Deleted ${selectedIds.length} registrations.`);
        setSelectedIds([]);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete selected registrations.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      for (const id of selectedIds) {
        await api.updateRegistrationStatus(id, 'approved');
      }
      toast.success(`Approved ${selectedIds.length} participant registrations.`);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (err) {
      toast.error(err.message || 'Failed to approve selected registrations.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.updateRegistrationStatus(id, newStatus);
      if (res.success) {
        toast.success(`Registration marked as ${newStatus}.`);
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
        toast.success(res.message || 'Registration removed successfully.');
        fetchRegistrations();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete registration.');
      toast.error(err.message || 'Failed to delete registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditModal = (reg) => {
    setSelectedReg(reg);
    setEditFormData({
      fullName: reg.participantId?.fullName || '',
      department: reg.participantId?.department || '',
      doublesPartnerName: reg.doublesPartnerName || '',
      mixedDoublesPartnerName: reg.mixedDoublesPartnerName || '',
      adminNotes: reg.adminNotes || ''
    });
    setEditModalOpen(true);
  };

  const handleAdminEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;

    setActionLoading(true);
    try {
      const res = await api.adminEditRegistration(selectedReg._id, editFormData);
      if (res.success) {
        toast.success('Registration details updated by admin.');
        setEditModalOpen(false);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPairModal = (reg, category = null, defaultPartnerId = '') => {
    setSelectedReg(reg);
    const p = reg.participantId;
    const cat = category || (p.gender === 'male' ? 'boys_doubles' : 'girls_doubles');
    setSelectedPairCategory(cat);
    setSelectedPartnerId(defaultPartnerId);
    setPairModalOpen(true);
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
        toast.success(res.message || 'Doubles team created and approved successfully.');
        setPairModalOpen(false);
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create doubles team.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to render partner verification pill
  const renderPartnerStatusBadge = (validation, requestedName) => {
    if (!requestedName) {
      return (
        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono italic block">
          Singles Only
        </span>
      );
    }

    if (!validation) {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
            <Clock className="w-2.5 h-2.5" /> Pending Verification
          </span>
        </div>
      );
    }

    const { status, partner } = validation;

    if (status === 'valid_paired') {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{requestedName || partner?.fullName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#FAF9F6] dark:bg-[#181C1F] text-[#E74C3C] dark:text-[#D4A94C] px-2 py-0.5 rounded-full border border-[#D5C4A1] dark:border-[#2B3034] font-bold">
            <Trophy className="w-2.5 h-2.5" /> Team Paired
          </span>
        </div>
      );
    }

    if (status === 'partner_registered') {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{partner?.fullName || requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-bold">
            <CheckCircle2 className="w-2.5 h-2.5" /> Partner Registered
          </span>
        </div>
      );
    }

    if (status === 'pending_approval') {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{partner?.fullName || requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
            <Clock className="w-2.5 h-2.5" /> Partner Awaiting Approval
          </span>
        </div>
      );
    }

    if (status === 'partner_not_registered') {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
            <Clock className="w-2.5 h-2.5" /> Partner Not Registered
          </span>
        </div>
      );
    }

    if (status === 'invalid_gender') {
      return (
        <div className="space-y-1 font-mono">
          <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
            <XCircle className="w-2.5 h-2.5 text-rose-600" /> Invalid Gender
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1 font-mono">
        <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{requestedName}</span>
        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block">{validation.message}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="eyebrow-label">
            ADMIN VERIFICATION & PAIRING CONSOLE
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
            Registrations & Partner Verification
          </h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Review registrations, lock approved participants, correct errors, and pair doubles teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteAllRegistrations}
            disabled={actionLoading || registrations.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FDEDEC] dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 text-[#E74C3C] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Delete all registered participants and their login accounts"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Registrations</span>
          </button>
        </div>
      </div>

      {/* Top Validation Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="editorial-card p-5 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-1 shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono uppercase font-bold">Registered Athletes</span>
          <div className="text-2xl font-black font-mono text-[#3E342B] dark:text-[#F5F1E8]">
            {registrations.length} Students
          </div>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold font-mono">
            {registrations.filter((r) => r.gender === 'male').length} Male · {registrations.filter((r) => r.gender === 'female').length} Female
          </span>
        </div>

        <div className="editorial-card p-5 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-1 shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono uppercase font-bold">Approval & Lock Status</span>
          <div className="text-2xl font-black font-mono text-[#E74C3C] dark:text-[#D4A94C]">
            {registrations.filter((r) => r.status === 'approved').length} Locked / Approved
          </div>
          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
            {registrations.filter((r) => r.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="editorial-card p-5 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-1 shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono uppercase font-bold">Partner Verification Engine</span>
          <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-1.5 pt-1">
            <Shield className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C] shrink-0" />
            <span className="tracking-wider uppercase">Auto-Matching by Name</span>
          </div>
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block font-mono">
            Independent partner registration flow
          </span>
        </div>
      </div>

      {/* Bulk Action Toolbar when Participants are Selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] font-mono">
            <span className="w-6 h-6 rounded-full bg-[#E74C3C] text-white flex items-center justify-center font-black text-xs">
              {selectedIds.length}
            </span>
            <span>Participants Selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleApproveSelected}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Selected ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleDeleteSelectedRegistrations}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-white dark:hover:bg-[#121517] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold transition-all cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="editorial-card p-4 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-[#7E7060] dark:text-[#817B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search athlete, student ID, department, partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-white dark:bg-[#181C1F] pl-10 pr-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 bg-white dark:bg-[#181C1F] text-xs text-[#3E342B] dark:text-[#F5F1E8] px-4 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved & Locked</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-11 bg-white dark:bg-[#181C1F] text-xs text-[#3E342B] dark:text-[#F5F1E8] px-4 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          >
            <option value="">All Genders</option>
            <option value="male">Male (Boys)</option>
            <option value="female">Female (Girls)</option>
          </select>
        </div>

        <div className="text-xs text-[#7E7060] dark:text-[#817B72] font-mono">
          Showing <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{registrations.length}</span> registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">Loading registrations & partner validations...</div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">No registrations match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-bold uppercase text-[11px] font-mono">
                <tr>
                  <th className="pb-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={registrations.length > 0 && selectedIds.length === registrations.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] focus:ring-0 cursor-pointer accent-[#E74C3C]"
                      aria-label="Select all registrations"
                    />
                  </th>
                  <th className="pb-3 w-12 text-center">#</th>
                  <th className="pb-3">Athlete Details</th>
                  <th className="pb-3">Student ID & Dept</th>
                  <th className="pb-3">Doubles Partner Request</th>
                  <th className="pb-3">Mixed Partner Request</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034]">
                {registrations.map((reg, index) => {
                  const p = reg.participantId;
                  if (!p) return null;

                  const doublesVal = reg.doublesValidation;
                  const mixedVal = reg.mixedDoublesValidation;

                  const canPairDoubles = doublesVal?.canPair;
                  const canPairMixed = mixedVal?.canPair;

                  return (
                    <tr
                      key={reg._id}
                      className={`transition-colors ${
                        selectedIds.includes(reg._id)
                          ? 'bg-[#FAF9F6] dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F]'
                          : 'hover:bg-[#FAF9F6]/60 dark:hover:bg-[#181C1F]/60'
                      }`}
                    >
                      <td className="py-4 text-center align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(reg._id)}
                          onChange={() => handleToggleSelect(reg._id)}
                          className="w-4 h-4 rounded border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] focus:ring-0 cursor-pointer accent-[#E74C3C]"
                          aria-label={`Select ${p.fullName}`}
                        />
                      </td>

                      <td className="py-4 text-center align-top">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold text-xs border border-[#D5C4A1] dark:border-[#2B3034]">
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">{p.fullName}</span>
                          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] block font-mono capitalize">
                            {p.gender}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold block">{p.studentId}</span>
                          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] block">{p.department}</span>
                        </div>
                      </td>

                      {/* Doubles Partner Status */}
                      <td className="py-4 align-top">
                        {renderPartnerStatusBadge(
                          doublesVal,
                          reg.doublesPartnerName
                        )}
                      </td>

                      {/* Mixed Doubles Partner Status */}
                      <td className="py-4 align-top">
                        {renderPartnerStatusBadge(
                          mixedVal,
                          reg.mixedDoublesPartnerName
                        )}
                      </td>

                      <td className="py-4 align-top">
                        <StatusBadge status={reg.status} />
                      </td>

                      <td className="py-4 text-right align-top">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5">
                            {reg.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(reg._id, 'approved')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                                title="Approve & Lock Registration"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Approve</span>
                              </button>
                            )}

                            {reg.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                                disabled={actionLoading}
                                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 transition-colors cursor-pointer"
                                title="Reject Registration"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditModal(reg)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034] transition-colors cursor-pointer"
                              title="Admin Edit Override"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => promptDeleteUser(reg)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 border border-rose-200 dark:border-rose-800/40 transition-colors cursor-pointer"
                              title={`Delete ${p.fullName} registration`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Pair Actions if Approved */}
                          {reg.status === 'approved' && (
                            <div className="flex flex-col gap-1.5 w-full items-end pt-1">
                              {/* Pair Doubles */}
                              {reg.doublesPartnerName && (
                                <button
                                  onClick={() =>
                                    handleOpenPairModal(
                                      reg,
                                      p.gender === 'male' ? 'boys_doubles' : 'girls_doubles',
                                      doublesVal?.partner?._id || ''
                                    )
                                  }
                                  disabled={!canPairDoubles}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider transition-all flex items-center gap-1 ${
                                    canPairDoubles
                                      ? 'btn-primary shadow-2xs cursor-pointer'
                                      : 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060]/50 dark:text-[#817B72]/50 border border-[#E8E1D5] dark:border-[#2B3034] cursor-not-allowed opacity-60'
                                  }`}
                                  title={
                                    canPairDoubles
                                      ? `Pair ${p.fullName} with ${doublesVal?.partner?.fullName}`
                                      : doublesVal?.message || 'Cannot pair yet'
                                  }
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>{doublesVal?.status === 'valid_paired' ? 'Doubles Paired' : 'Pair Doubles'}</span>
                                </button>
                              )}

                              {/* Pair Mixed Doubles */}
                              {reg.mixedDoublesPartnerName && (
                                <button
                                  onClick={() =>
                                    handleOpenPairModal(
                                      reg,
                                      'mixed_doubles',
                                      mixedVal?.partner?._id || ''
                                    )
                                  }
                                  disabled={!canPairMixed}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider transition-all flex items-center gap-1 ${
                                    canPairMixed
                                      ? 'btn-primary shadow-2xs cursor-pointer'
                                      : 'bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060]/50 dark:text-[#817B72]/50 border border-[#E8E1D5] dark:border-[#2B3034] cursor-not-allowed opacity-60'
                                  }`}
                                  title={
                                    canPairMixed
                                      ? `Pair Mixed Doubles with ${mixedVal?.partner?.fullName}`
                                      : mixedVal?.message || 'Cannot pair yet'
                                  }
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>{mixedVal?.status === 'valid_paired' ? 'Mixed Paired' : 'Pair Mixed'}</span>
                                </button>
                              )}
                            </div>
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

      {/* Admin Edit Modal (Override for Genuine Mistakes) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Admin Edit: ${selectedReg?.participantId?.fullName} (${selectedReg?.participantId?.studentId})`}
      >
        <form onSubmit={handleAdminEditSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C] shrink-0" />
            <span>Admin Authority: Modify details if a student made an honest error during entry.</span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase font-mono">
              Athlete Legal Name
            </label>
            <input
              type="text"
              required
              value={editFormData.fullName}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase font-mono">
              Department
            </label>
            <input
              type="text"
              required
              value={editFormData.department}
              onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase font-mono">
              Doubles Partner Name
            </label>
            <input
              type="text"
              required
              value={editFormData.doublesPartnerName}
              onChange={(e) => setEditFormData({ ...editFormData, doublesPartnerName: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase font-mono">
              Mixed Doubles Partner Name
            </label>
            <input
              type="text"
              required
              value={editFormData.mixedDoublesPartnerName}
              onChange={(e) => setEditFormData({ ...editFormData, mixedDoublesPartnerName: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase font-mono">
              Admin Notes (Optional)
            </label>
            <input
              type="text"
              value={editFormData.adminNotes}
              onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
              placeholder="e.g. Corrected partner name spelling per student email"
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
            >
              {actionLoading ? 'Saving...' : 'Save Corrections'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User In-App Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setDeleteModalOpen(false);
            setDeleteError('');
          }
        }}
        title="Delete Participant Registration"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-rose-800 dark:text-rose-300 font-bold font-mono uppercase">Confirm Deletion</p>
              <p className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                {regToDelete?.participantId?.fullName || 'Participant'}
              </p>
              <p className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                {regToDelete?.participantId?.studentId} · {regToDelete?.participantId?.department}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-mono">
              {deleteError}
            </div>
          )}

          <div className="text-xs text-[#4A4238] dark:text-[#F5F1E8] space-y-2">
            <p>
              Are you sure you want to remove the tournament registration for <strong className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{regToDelete?.participantId?.fullName}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[11px] text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>This will remove their registration and any created tournament team entries.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteError('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] transition-colors cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={executeDeleteUser}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E74C3C] hover:bg-[#C0392B] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {actionLoading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Registration</span>
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
          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1 text-xs font-mono">
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">
              <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Player 1:</span>{' '}
              <span className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">{selectedReg?.participantId?.fullName}</span> ({selectedReg?.participantId?.gender}, {selectedReg?.participantId?.studentId})
            </p>
            {selectedReg?.doublesPartnerName && (
              <p className="text-[#7E7060] dark:text-[#B8B1A5]">
                <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Requested Doubles Partner:</span>{' '}
                <span className="font-bold text-[#E74C3C] dark:text-[#D4A94C]">{selectedReg?.doublesPartnerName}</span>
              </p>
            )}
            {selectedReg?.mixedDoublesPartnerName && (
              <p className="text-[#7E7060] dark:text-[#B8B1A5]">
                <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Requested Mixed Partner:</span>{' '}
                <span className="font-bold text-[#E74C3C] dark:text-[#D4A94C]">{selectedReg?.mixedDoublesPartnerName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Division Category *
            </label>
            <select
              value={selectedPairCategory}
              onChange={(e) => setSelectedPairCategory(e.target.value)}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
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
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Select Player 2 (From Approved Athletes) *
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            >
              <option value="">-- Choose Partner --</option>
              {registrations
                .filter(
                  (r) =>
                    r.status === 'approved' &&
                    r.participantId?._id !== selectedReg?.participantId?._id
                )
                .map((r) => (
                  <option key={r.participantId._id} value={r.participantId._id}>
                    {r.participantId.fullName} ({r.participantId.gender}, {r.participantId.studentId} - {r.participantId.department})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setPairModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
            >
              {actionLoading ? 'Creating Team Entry...' : 'Confirm & Create Team Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


