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
  Lock,
  UploadCloud,
  Download,
  FileSpreadsheet,
  FileText,
  FileUp,
  Sparkles
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

  // Manual Add Specific Player Modal State
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [addPlayerForm, setAddPlayerForm] = useState({
    fullName: '',
    gender: 'male',
    department: '',
    doublesPartnerName: '',
    mixedDoublesPartnerName: ''
  });
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);

  const resetAddPlayerState = () => {
    setAddPlayerForm({
      fullName: '',
      gender: 'male',
      department: '',
      doublesPartnerName: '',
      mixedDoublesPartnerName: ''
    });
  };

  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();
    if (!addPlayerForm.fullName.trim()) {
      toast.warning('Please enter the athlete full name.');
      return;
    }
    if (!addPlayerForm.department.trim()) {
      toast.warning('Please enter the department / major.');
      return;
    }

    setAddPlayerLoading(true);
    try {
      const res = await api.adminAddPlayer({
        fullName: addPlayerForm.fullName.trim(),
        gender: addPlayerForm.gender,
        department: addPlayerForm.department.trim(),
        doublesPartnerName: addPlayerForm.doublesPartnerName.trim(),
        mixedDoublesPartnerName: addPlayerForm.mixedDoublesPartnerName.trim()
      });

      if (res.success) {
        toast.success(res.message || `Player "${addPlayerForm.fullName}" registered successfully.`);
        setAddPlayerModalOpen(false);
        resetAddPlayerState();
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add player.');
    } finally {
      setAddPlayerLoading(false);
    }
  };

  // CSV Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState([]);
  const [importStats, setImportStats] = useState({ total: 0, ready: 0, duplicates: 0, invalid: 0 });
  const [importLoading, setImportLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const resetImportState = () => {
    setImportFileName('');
    setImportRows([]);
    setImportStats({ total: 0, ready: 0, duplicates: 0, invalid: 0 });
    setIsDragging(false);
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      'Full Name,Gender,Department,Boys Doubles Partner,Girls Doubles Partner,Mixed Doubles Partner',
      'Aarav Sharma,Male,Computer Science,Rohan Verma,,Ananya Patel',
      'Rohan Verma,Male,Mechanical Engineering,Aarav Sharma,,Priya Singh',
      'Vikram Rao,Male,Electrical Engineering,Arjun Mehta,,Kavya Nair',
      'Arjun Mehta,Male,Civil Engineering,Vikram Rao,,Neha Kapoor',
      'Priya Singh,Female,Computer Science,,Ananya Patel,Rohan Verma',
      'Ananya Patel,Female,Electronics,,Priya Singh,Aarav Sharma',
      'Kavya Nair,Female,Mechanical Engineering,,Neha Kapoor,Vikram Rao',
      'Neha Kapoor,Female,Civil Engineering,,Kavya Nair,Arjun Mehta',
      'Siddharth Roy,Male,Mathematics,,,',
      'Isha Gupta,Female,Physics,,,'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'carrom_players_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded carrom_players_template.csv');
  };

  const processCSVContent = (text, fileName = 'uploaded.csv') => {
    if (!text || typeof text !== 'string') {
      toast.error('The selected file is empty or could not be read.');
      return;
    }

    // Strip BOM
    let cleanText = text.replace(/^\uFEFF/, '').trim();
    if (!cleanText) {
      toast.error('The selected file is empty.');
      return;
    }

    // Auto-detect delimiter
    const firstLine = cleanText.split(/\r?\n/)[0] || '';
    let delimiter = ',';
    if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) {
      delimiter = '\t';
    } else if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
      delimiter = ';';
    }

    // Parse lines considering quotes
    const parseLine = (line) => {
      const values = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          if (inQuotes && line[i + 1] === char) {
            cur += char;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          values.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim());
      return values;
    };

    const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error('CSV file must contain at least a header row and one player row.');
      return;
    }

    const rawHeaders = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ' '));

    const getColIndex = (aliases) => {
      // 1. Exact alias match first
      const exactIdx = rawHeaders.findIndex((h) =>
        aliases.some((alias) => {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
          return h.trim() === cleanAlias;
        })
      );
      if (exactIdx >= 0) return exactIdx;

      // 2. Substring match fallback
      return rawHeaders.findIndex((h) =>
        aliases.some((alias) => {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
          return h.trim().includes(cleanAlias);
        })
      );
    };

    const nameIdx = getColIndex(['full name', 'student name', 'athlete name', 'player name', 'athlete', 'player', 'name']);
    const genderIdx = getColIndex(['gender', 'sex']);
    const deptIdx = getColIndex(['department', 'dept', 'major', 'branch', 'course', 'program']);
    const boysDoublesIdx = getColIndex(['boys doubles partner', 'boys partner', 'boys doubles']);
    const girlsDoublesIdx = getColIndex(['girls doubles partner', 'girls partner', 'girls doubles']);
    const mixedIdx = getColIndex(['mixed doubles partner', 'mixed partner', 'mixed doubles']);
    const legacyDoublesIdx = getColIndex(['doubles partner name', 'doubles partner', 'partner', 'doubles']);

    // Map of existing registrations currently loaded in system
    const existingRegMap = new Map();
    registrations.forEach((r) => {
      const name = r.participantId?.fullName?.toLowerCase().trim();
      if (name) existingRegMap.set(name, r);
    });

    const seenInCSV = new Set();
    const rows = [];
    let readyCount = 0;
    let dupCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.every((c) => !c)) continue;

      const fullName = (nameIdx >= 0 ? cols[nameIdx] || '' : cols[0] || '').replace(/\s+/g, ' ').trim();
      const rawGender = (genderIdx >= 0 ? cols[genderIdx] || '' : cols[1] || '').trim();
      const department = (deptIdx >= 0 ? cols[deptIdx] || '' : cols[2] || '').replace(/\s+/g, ' ').trim();
      let boysDoublesPartner = (boysDoublesIdx >= 0 ? cols[boysDoublesIdx] || '' : '').replace(/\s+/g, ' ').trim();
      let girlsDoublesPartner = (girlsDoublesIdx >= 0 ? cols[girlsDoublesIdx] || '' : '').replace(/\s+/g, ' ').trim();
      const mixedDoublesPartner = (mixedIdx >= 0 ? cols[mixedIdx] || '' : '').replace(/\s+/g, ' ').trim();

      // Normalize gender
      const gLower = rawGender.toLowerCase().trim();
      let gender = '';
      if (['m', 'male', 'boy', 'boys'].includes(gLower)) gender = 'male';
      else if (['f', 'female', 'girl', 'girls'].includes(gLower)) gender = 'female';

      // Legacy single doubles partner mapping fallback only if separate columns are absent
      if (
        !boysDoublesPartner &&
        !girlsDoublesPartner &&
        legacyDoublesIdx >= 0 &&
        legacyDoublesIdx !== boysDoublesIdx &&
        legacyDoublesIdx !== girlsDoublesIdx &&
        legacyDoublesIdx !== mixedIdx
      ) {
        const legVal = (cols[legacyDoublesIdx] || '').replace(/\s+/g, ' ').trim();
        if (gender === 'male') {
          boysDoublesPartner = legVal;
        } else {
          girlsDoublesPartner = legVal;
        }
      }

      const effectiveDoubles = gender === 'female' ? girlsDoublesPartner : boysDoublesPartner;
      const normalizedName = fullName.toLowerCase();
      let status = 'ready';
      let statusMessage = '✓ Ready';

      const existingReg = existingRegMap.get(normalizedName);

      if (!fullName) {
        status = 'invalid';
        statusMessage = '❌ Missing name';
        invalidCount++;
      } else if (!gender) {
        status = 'invalid';
        statusMessage = '❌ Missing gender';
        invalidCount++;
      } else if (!department) {
        status = 'invalid';
        statusMessage = '❌ Missing department';
        invalidCount++;
      } else if (gender === 'male' && girlsDoublesPartner) {
        status = 'invalid';
        statusMessage = '❌ Invalid Girls Doubles partner (Player is male)';
        invalidCount++;
      } else if (gender === 'female' && boysDoublesPartner) {
        status = 'invalid';
        statusMessage = '❌ Invalid Boys Doubles partner (Player is female)';
        invalidCount++;
      } else if (seenInCSV.has(normalizedName)) {
        status = 'duplicate';
        statusMessage = '⚠ Repeated row in CSV';
        dupCount++;
      } else if (existingReg) {
        if (existingReg.status === 'approved') {
          status = 'duplicate';
          statusMessage = '⚠ Already Approved';
          dupCount++;
        } else {
          status = 'ready';
          statusMessage = '✓ Updates Pending Registration';
          readyCount++;
          seenInCSV.add(normalizedName);
        }
      } else {
        status = 'ready';
        statusMessage = '✓ Ready';
        readyCount++;
        seenInCSV.add(normalizedName);
      }

      rows.push({
        rowNumber: i,
        fullName,
        gender: gender || rawGender,
        rawGender,
        department,
        boysDoublesPartner,
        girlsDoublesPartner,
        doublesPartnerName: effectiveDoubles,
        mixedDoublesPartner,
        mixedDoublesPartnerName: mixedDoublesPartner,
        status,
        statusMessage
      });
    }

    setImportFileName(fileName);
    setImportRows(rows);
    setImportStats({
      total: rows.length,
      ready: readyCount,
      duplicates: dupCount,
      invalid: invalidCount
    });
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      processCSVContent(e.target.result, file.name);
    };
    reader.onerror = () => {
      toast.error('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    const validRows = importRows.filter((r) => r.status === 'ready');
    if (validRows.length === 0) {
      toast.warning('No ready player rows to import.');
      return;
    }

    setImportLoading(true);
    try {
      const payload = {
        participants: validRows.map((r) => ({
          fullName: r.fullName,
          gender: r.gender,
          department: r.department,
          boysDoublesPartner: r.boysDoublesPartner,
          girlsDoublesPartner: r.girlsDoublesPartner,
          doublesPartnerName: r.doublesPartnerName || (r.gender === 'female' ? r.girlsDoublesPartner : r.boysDoublesPartner),
          mixedDoublesPartner: r.mixedDoublesPartner,
          mixedDoublesPartnerName: r.mixedDoublesPartner
        }))
      };

      const res = await api.importParticipants(payload);
      if (res.success) {
        toast.success(
          `Import Complete: ${res.summary?.imported || validRows.length} players imported successfully! ${
            res.summary?.skipped ? `(${res.summary.skipped} skipped)` : ''
          }`
        );
        setImportModalOpen(false);
        resetImportState();
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to import player data.');
    } finally {
      setImportLoading(false);
    }
  };

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
        <span className="text-xs text-[#7E7060] dark:text-[#817B72] italic block">
          Singles Only
        </span>
      );
    }

    if (!validation) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 font-medium">
            <Clock className="w-3 h-3" /> Pending Verification
          </span>
        </div>
      );
    }

    const { status, partner } = validation;

    if (status === 'valid_paired') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{requestedName || partner?.fullName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF9F6] dark:bg-[#181C1F] text-[#E74C3C] dark:text-[#D4A94C] px-2 py-0.5 rounded-full border border-[#D5C4A1] dark:border-[#2B3034] font-semibold">
            <Trophy className="w-3 h-3" /> Team Paired
          </span>
        </div>
      );
    }

    if (status === 'partner_registered') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{partner?.fullName || requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Partner Registered
          </span>
        </div>
      );
    }

    if (status === 'pending_approval') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{partner?.fullName || requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 font-medium">
            <Clock className="w-3 h-3" /> Partner Awaiting Approval
          </span>
        </div>
      );
    }

    if (status === 'partner_not_registered') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 font-medium">
            <Clock className="w-3 h-3" /> Partner Not Registered
          </span>
        </div>
      );
    }

    if (status === 'invalid_gender') {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{requestedName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40 font-medium">
            <XCircle className="w-3 h-3 text-rose-600" /> Invalid Gender
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{requestedName}</span>
        <span className="text-xs text-[#7E7060] dark:text-[#817B72] block">{validation.message}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[#7E7060] dark:text-[#817B72] uppercase block">
            ADMIN VERIFICATION & PAIRING CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3E342B] dark:text-[#F5F1E8] mt-1">
            Registrations & Partner Verification
          </h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Review registrations, lock approved participants, correct errors, and pair doubles teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              resetAddPlayerState();
              setAddPlayerModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Add an individual player manually"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Player</span>
          </button>

          <button
            onClick={() => {
              resetImportState();
              setImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FAF9F6] dark:hover:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] text-xs font-bold transition-all cursor-pointer shadow-xs hover:border-[#E74C3C] dark:hover:border-[#D4A94C]"
            title="Import players from CSV file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#E74C3C] dark:text-[#D4A94C]" />
            <span>Import Players (CSV)</span>
          </button>

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
          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] uppercase font-semibold">Registered Athletes</span>
          <div className="text-2xl font-bold text-[#3E342B] dark:text-[#F5F1E8]">
            {registrations.length} Students
          </div>
          <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
            {registrations.filter((r) => r.gender === 'male').length} Male · {registrations.filter((r) => r.gender === 'female').length} Female
          </span>
        </div>

        <div className="editorial-card p-5 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-1 shadow-xs">
          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] uppercase font-semibold">Approval & Lock Status</span>
          <div className="text-2xl font-bold text-[#E74C3C] dark:text-[#D4A94C]">
            {registrations.filter((r) => r.status === 'approved').length} Locked / Approved
          </div>
          <span className="text-xs text-[#7E7060] dark:text-[#817B72]">
            {registrations.filter((r) => r.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="editorial-card p-5 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-1 shadow-xs">
          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] uppercase font-semibold">Partner Verification Engine</span>
          <div className="text-sm font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-1.5 pt-1">
            <Shield className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C] shrink-0" />
            <span className="tracking-wide uppercase">Auto-Matching by Name</span>
          </div>
          <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] block">
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
              placeholder="Search athlete, department, partner..."
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

        <div className="text-xs text-[#7E7060] dark:text-[#817B72]">
          Showing <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{registrations.length}</span> registrations
        </div>
      </div>

      {/* Registrations Table */}
      <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs">Loading registrations & partner validations...</div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs">No registrations match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-semibold uppercase text-[11px] tracking-wider">
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
                  <th className="pb-3">Department</th>
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
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-semibold text-xs border border-[#D5C4A1] dark:border-[#2B3034]">
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8] text-sm block">{p.fullName}</span>
                          <span className="text-xs text-[#7E7060] dark:text-[#817B72] block capitalize">
                            {p.gender}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 align-top">
                        <div className="space-y-0.5">
                          <span className="text-xs text-[#4A4238] dark:text-[#D5C4A1] font-medium block">{p.department}</span>
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
                                className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
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
        title="Admin Override & Correction"
      >
        <form onSubmit={handleAdminEditSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Direct admin edit mode. Any changes made here immediately override participant records and update partner validation matching.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={editFormData.fullName}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase">
              Department
            </label>
            <input
              type="text"
              required
              value={editFormData.department}
              onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase">
              Doubles Partner Name
            </label>
            <input
              type="text"
              value={editFormData.doublesPartnerName}
              onChange={(e) => setEditFormData({ ...editFormData, doublesPartnerName: e.target.value })}
              placeholder="Partner's Full Name (Optional)"
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase">
              Mixed Doubles Partner Name
            </label>
            <input
              type="text"
              value={editFormData.mixedDoublesPartnerName}
              onChange={(e) => setEditFormData({ ...editFormData, mixedDoublesPartnerName: e.target.value })}
              placeholder="Partner's Full Name (Optional)"
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1 uppercase">
              Admin Notes (Optional)
            </label>
            <input
              type="text"
              value={editFormData.adminNotes}
              onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
              placeholder="e.g. Corrected partner name spelling per student email"
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer"
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
              <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold uppercase">Confirm Deletion</p>
              <p className="text-sm font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                {regToDelete?.participantId?.fullName || 'Participant'}
              </p>
              <p className="text-xs text-[#7E7060] dark:text-[#817B72]">
                {regToDelete?.participantId?.department}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="text-xs text-[#4A4238] dark:text-[#F5F1E8] space-y-2">
            <p>
              Are you sure you want to remove the tournament registration for <strong className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{regToDelete?.participantId?.fullName}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-1.5">
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] transition-colors cursor-pointer"
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
          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-1 text-xs">
            <p className="text-[#7E7060] dark:text-[#B8B1A5]">
              <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Player 1:</span>{' '}
              <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8]">{selectedReg?.participantId?.fullName}</span> ({selectedReg?.participantId?.gender})
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
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase">
              Division Category *
            </label>
            <select
              value={selectedPairCategory}
              onChange={(e) => setSelectedPairCategory(e.target.value)}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
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
            <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase">
              Select Player 2 (From Approved Athletes) *
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-sm text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
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
                    {r.participantId.fullName} ({r.participantId.gender} - {r.participantId.department})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              onClick={() => setPairModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer"
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

      {/* CSV Player Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => {
          if (!importLoading) {
            setImportModalOpen(false);
            resetImportState();
          }
        }}
        title="Import Players from CSV"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Instruction & Download template banner */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-[#7E7060] dark:text-[#B8B1A5] text-xs max-w-xl">
              <FileSpreadsheet className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C] shrink-0 mt-0.5" />
              <div>
                <span>Standard 5-Division columns: </span>
                <strong className="text-[#3E342B] dark:text-[#F5F1E8]">
                  Full Name, Gender, Department, Boys Doubles Partner, Girls Doubles Partner, Mixed Doubles Partner
                </strong>
                <p className="text-[11px] text-[#7E7060] dark:text-[#817B72] mt-0.5">
                  Supports all 5 tournament events (Boys/Girls Singles, Boys/Girls Doubles, Mixed Doubles).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] hover:border-[#E74C3C] dark:hover:border-[#D4A94C] text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Download CSV sample template"
            >
              <Download className="w-3.5 h-3.5 text-[#E74C3C] dark:text-[#D4A94C]" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Dropzone (if no file loaded) */}
          {importRows.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
                isDragging
                  ? 'border-[#E74C3C] dark:border-[#D4A94C] bg-[#FAF9F6] dark:bg-[#181C1F]'
                  : 'border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#E74C3C] dark:hover:border-[#D4A94C] bg-white dark:bg-[#121517]'
              }`}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center text-[#E74C3C] dark:text-[#D4A94C]">
                <FileUp className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#3E342B] dark:text-[#F5F1E8]">
                  Click to browse or drag & drop CSV file
                </p>
                <p className="text-xs text-[#7E7060] dark:text-[#817B72]">
                  File must contain athlete names, gender, department, and partner nominations
                </p>
              </div>
            </div>
          ) : (
            /* CSV Preview Section */
            <div className="space-y-4">
              {/* File details bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034]">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-[#E74C3C] dark:text-[#D4A94C]" />
                  <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8]">{importFileName}</span>
                  <span className="text-[#7E7060] dark:text-[#817B72]">({importStats.total} rows parsed)</span>
                </div>
                <button
                  type="button"
                  onClick={resetImportState}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Choose Different File
                </button>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 uppercase block font-semibold">Ready to Import</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{importStats.ready}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
                  <span className="text-xs text-amber-800 dark:text-amber-300 uppercase block font-semibold">Possible Duplicates</span>
                  <span className="text-base font-bold text-amber-700 dark:text-amber-300">⚠ {importStats.duplicates}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
                  <span className="text-xs text-rose-800 dark:text-rose-300 uppercase block font-semibold">Invalid Rows</span>
                  <span className="text-base font-bold text-rose-700 dark:text-rose-300">❌ {importStats.invalid}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-[#E8E1D5] dark:border-[#2B3034] rounded-xl overflow-hidden bg-white dark:bg-[#121517]">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#FAF9F6] dark:bg-[#181C1F] border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Athlete Name</th>
                        <th className="py-2.5 px-3">Gender</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Doubles Partner</th>
                        <th className="py-2.5 px-3">Mixed Partner</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034] text-xs">
                      {importRows.map((row) => {
                        const doublesPartner =
                          (row.gender === 'female' ? row.girlsDoublesPartner : row.boysDoublesPartner) ||
                          row.doublesPartnerName ||
                          row.girlsDoublesPartner ||
                          row.boysDoublesPartner;

                        return (
                          <tr
                            key={row.rowNumber}
                            className={`transition-colors ${
                              row.status === 'ready'
                                ? 'hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                                : row.status === 'duplicate'
                                ? 'bg-amber-50/20 dark:bg-amber-950/10'
                                : 'bg-rose-50/30 dark:bg-rose-950/20'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center text-[#7E7060] dark:text-[#817B72]">{row.rowNumber}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#3E342B] dark:text-[#F5F1E8]">{row.fullName || '—'}</td>
                            <td className="py-2.5 px-3 capitalize">
                              {row.gender ? (
                                <span className={row.gender === 'male' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-pink-600 dark:text-pink-400 font-semibold'}>
                                  {row.gender}
                                </span>
                              ) : (
                                <span className="text-rose-500 font-semibold">{row.rawGender || '—'}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[#3E342B] dark:text-[#F5F1E8] font-medium">{row.department || '—'}</td>
                            <td className="py-2.5 px-3">
                              {doublesPartner ? (
                                <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8]">
                                  {doublesPartner}
                                </span>
                              ) : (
                                <span className="text-[#7E7060] dark:text-[#817B72]">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {row.mixedDoublesPartner || row.mixedDoublesPartnerName ? (
                                <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8]">
                                  {row.mixedDoublesPartner || row.mixedDoublesPartnerName}
                                </span>
                              ) : (
                                <span className="text-[#7E7060] dark:text-[#817B72]">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {row.status === 'ready' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Ready
                                </span>
                              ) : row.status === 'duplicate' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 font-semibold" title={row.statusMessage}>
                                  <AlertTriangle className="w-3 h-3" /> Duplicate
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40 font-semibold" title={row.statusMessage}>
                                  <XCircle className="w-3 h-3" /> {row.statusMessage}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E74C3C] dark:text-[#D4A94C] shrink-0" />
                <span>
                  Imported athletes will be queued in <strong className="text-[#3E342B] dark:text-[#F5F1E8]">Pending Approval</strong>. Partner verification and pairings will evaluate automatically.
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              disabled={importLoading}
              onClick={() => {
                setImportModalOpen(false);
                resetImportState();
              }}
              className="px-4 py-2.5 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-semibold"
            >
              Cancel
            </button>

            {importRows.length > 0 && (
              <button
                type="button"
                disabled={importLoading || importStats.ready === 0}
                onClick={handleExecuteImport}
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
              >
                {importLoading ? (
                  <span>Importing Players...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import {importStats.ready} Ready Player{importStats.ready !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Manual Add Specific Player Modal */}
      <Modal
        isOpen={addPlayerModalOpen}
        onClose={() => {
          setAddPlayerModalOpen(false);
          resetAddPlayerState();
        }}
        title="Add Specific Player"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddPlayerSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-[#7E7060] dark:text-[#817B72]">
            Register an individual athlete into the tournament. Partner nominations are optional.
          </p>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] uppercase mb-1">
              Full Legal Name <span className="text-[#E74C3C]">*</span>
            </label>
            <input
              type="text"
              required
              value={addPlayerForm.fullName}
              onChange={(e) => setAddPlayerForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="e.g. Aryan Verma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#121517] text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] focus:outline-hidden focus:border-[#E74C3C] dark:focus:border-[#D4A94C]"
            />
          </div>

          {/* Gender & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] uppercase mb-1">
                Gender <span className="text-[#E74C3C]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034]">
                <button
                  type="button"
                  onClick={() => setAddPlayerForm((prev) => ({ ...prev, gender: 'male' }))}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    addPlayerForm.gender === 'male'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8]'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setAddPlayerForm((prev) => ({ ...prev, gender: 'female' }))}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    addPlayerForm.gender === 'female'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8]'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] uppercase mb-1">
                Department / Major <span className="text-[#E74C3C]">*</span>
              </label>
              <input
                type="text"
                required
                value={addPlayerForm.department}
                onChange={(e) => setAddPlayerForm((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#121517] text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] focus:outline-hidden focus:border-[#E74C3C] dark:focus:border-[#D4A94C]"
              />
            </div>
          </div>

          {/* Doubles Partner (Gender Dynamic) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] uppercase">
                {addPlayerForm.gender === 'male' ? 'Boys Doubles Partner' : 'Girls Doubles Partner'}
              </label>
              <span className="text-xs text-[#7E7060] dark:text-[#817B72] italic">Optional</span>
            </div>
            <input
              type="text"
              value={addPlayerForm.doublesPartnerName}
              onChange={(e) => setAddPlayerForm((prev) => ({ ...prev, doublesPartnerName: e.target.value }))}
              placeholder={addPlayerForm.gender === 'male' ? "Male Partner's Full Name (or blank for Singles)" : "Female Partner's Full Name (or blank for Singles)"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#121517] text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] focus:outline-hidden focus:border-[#E74C3C] dark:focus:border-[#D4A94C]"
            />
          </div>

          {/* Mixed Doubles Partner */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#3E342B] dark:text-[#F5F1E8] uppercase">
                Mixed Doubles Partner
              </label>
              <span className="text-xs text-[#7E7060] dark:text-[#817B72] italic">Optional</span>
            </div>
            <input
              type="text"
              value={addPlayerForm.mixedDoublesPartnerName}
              onChange={(e) => setAddPlayerForm((prev) => ({ ...prev, mixedDoublesPartnerName: e.target.value }))}
              placeholder={addPlayerForm.gender === 'male' ? "Female Mixed Partner's Full Name (Optional)" : "Male Mixed Partner's Full Name (Optional)"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#121517] text-sm font-normal text-[#3E342B] dark:text-[#F5F1E8] focus:outline-hidden focus:border-[#E74C3C] dark:focus:border-[#D4A94C]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#E74C3C] dark:text-[#D4A94C] shrink-0" />
            <span>
              Player will enter in <strong className="text-[#3E342B] dark:text-[#F5F1E8]">Pending Approval</strong> status. Approving will automatically generate Singles entries.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="button"
              disabled={addPlayerLoading}
              onClick={() => {
                setAddPlayerModalOpen(false);
                resetAddPlayerState();
              }}
              className="px-4 py-2.5 rounded-xl text-xs text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] cursor-pointer font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={addPlayerLoading}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              {addPlayerLoading ? (
                <span>Adding Player...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add Player</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
