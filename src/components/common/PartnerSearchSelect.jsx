'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '@/lib/api';
import { Search, X, CheckCircle2, AlertCircle, UserCheck, ChevronDown, RefreshCw } from 'lucide-react';

/**
 * Searchable partner selector strictly bound to existing registered participants.
 * Enforces category gender rules and blocks self-pairing or already-paired duplicates.
 */
export const PartnerSearchSelect = ({
  category,
  playerGender,
  excludeId = '',
  excludeName = '',
  valueId = '',
  valueName = '',
  onChange,
  placeholder = 'Search registered participant by name or department...',
  disabled = false,
  required = false
}) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadCandidates = async () => {
      setLoading(true);
      try {
        const res = await api.searchPartners({
          category,
          playerGender,
          excludeId
        });
        if (active && res?.success) {
          setCandidates(res.candidates || []);
        }
      } catch (err) {
        console.error('Failed to search partner candidates:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCandidates();
    return () => {
      active = false;
    };
  }, [category, playerGender, excludeId]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selectedCandidate = useMemo(() => {
    if (valueId) {
      const byId = candidates.find((c) => c._id === valueId);
      if (byId) return byId;
    }
    if (valueName) {
      const norm = valueName.trim().toLowerCase();
      return candidates.find((c) => c.fullName.toLowerCase().trim() === norm) || null;
    }
    return null;
  }, [candidates, valueId, valueName]);

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const excludeNameLower = excludeName.trim().toLowerCase();

    return candidates.filter((c) => {
      if (excludeId && c._id === excludeId) return false;
      if (excludeNameLower && c.fullName.toLowerCase().trim() === excludeNameLower) return false;
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        c.gender.toLowerCase().includes(q)
      );
    });
  }, [candidates, query, excludeId, excludeName]);

  const handleSelect = (candidate) => {
    if (candidate.isAlreadyPaired) return;
    setOpen(false);
    setQuery('');
    if (onChange) onChange(candidate);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    if (onChange) onChange(null);
  };

  const genderHint =
    category === 'mixed_doubles'
      ? playerGender === 'male'
        ? 'Showing Female Participants'
        : 'Showing Male Participants'
      : category === 'boys_doubles' || (category === 'doubles' && playerGender === 'male')
      ? 'Showing Male Participants'
      : 'Showing Female Participants';

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input to enforce native HTML form validation if required */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={valueId || selectedCandidate?._id || ''}
          onChange={() => {}}
          required
          className="sr-only"
        />
      )}

      {/* Selected Pill or Search Trigger */}
      {selectedCandidate || (valueName && !open) ? (
        <div
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
            disabled
              ? 'opacity-60 cursor-not-allowed bg-[#FAF9F6] dark:bg-[#181C1F] border-[#E8E1D5] dark:border-[#2B3034]'
              : 'cursor-pointer bg-white dark:bg-[#181C1F] border-emerald-500/70 dark:border-emerald-600/60 hover:border-[#E74C3C]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                {selectedCandidate?.fullName || valueName}
              </div>
              {selectedCandidate && (
                <div className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] capitalize truncate">
                  {selectedCandidate.gender} · {selectedCandidate.department}
                </div>
              )}
            </div>
          </div>
          {!disabled && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#7E7060] hover:text-rose-600 cursor-pointer"
                title="Clear selected partner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ChevronDown className="w-4 h-4 text-[#7E7060]" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="w-4 h-4 text-[#7E7060] dark:text-[#817B72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            disabled={disabled}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder={placeholder}
            className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] pl-10 pr-9 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C] dark:focus:border-[#D4A94C]"
          />
          <ChevronDown className="w-4 h-4 text-[#7E7060] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Searchable Dropdown List */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] shadow-xl overflow-hidden">
          <div className="px-3 py-2 bg-[#FAF9F6] dark:bg-[#181C1F] border-b border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7E7060] dark:text-[#B8B1A5]">
              {genderHint}
            </span>
            <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#817B72]">
              {filteredCandidates.length} found
            </span>
          </div>

          {selectedCandidate && (
            <div className="p-2 border-b border-[#E8E1D5] dark:border-[#2B3034] bg-[#FAF9F6]/60 dark:bg-[#181C1F]/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#7E7060] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter participants..."
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-lg bg-white dark:bg-[#121517] border border-[#D5C4A1] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] focus:outline-none focus:border-[#E74C3C]"
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto divide-y divide-[#E8E1D5]/60 dark:divide-[#2B3034]/60">
            {loading ? (
              <div className="p-4 text-center text-xs text-[#7E7060] flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E74C3C]" />
                <span>Searching registered participants...</span>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7E7060] dark:text-[#817B72]">
                No eligible registered participants match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              filteredCandidates.map((c) => {
                const isSelected = valueId === c._id;
                const unavailable = c.isAlreadyPaired;

                return (
                  <button
                    key={c._id}
                    type="button"
                    disabled={unavailable}
                    onClick={() => handleSelect(c)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between gap-2 transition-colors ${
                      unavailable
                        ? 'opacity-55 cursor-not-allowed bg-[#FAF9F6] dark:bg-[#181C1F]/40'
                        : isSelected
                        ? 'bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] cursor-pointer'
                        : 'hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] cursor-pointer text-[#3E342B] dark:text-[#F5F1E8]'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-bold truncate flex items-center gap-1.5">
                        <span>{c.fullName}</span>
                        {c.isApproved && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-[#7E7060] dark:text-[#817B72] truncate capitalize">
                        {c.gender} · {c.department}
                        {c.isAlreadyPaired && ` · Paired (${c.pairedTeamName})`}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {unavailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          <AlertCircle className="w-3 h-3" />
                          Paired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
