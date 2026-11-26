'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { subscribeToCarromRoster } from '@/lib/socket';
import { CATEGORIES } from '@/lib/constants';
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function ParticipantsDirectoryPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const fetchDirectory = useCallback(async () => {
    try {
      const res = await api.getParticipantsDirectory({
        search,
        category: categoryFilter,
        gender: genderFilter
      });
      if (res?.success) {
        setParticipants(res.participants || []);
      }
    } catch (err) {
      console.error('Failed to load participants directory:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, genderFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchDirectory();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchDirectory]);

  useEffect(() => {
    const unsub = subscribeToCarromRoster(() => {
      fetchDirectory();
    });
    return unsub;
  }, [fetchDirectory]);

  const maleCount = participants.filter((p) => p.gender === 'male').length;
  const femaleCount = participants.filter((p) => p.gender === 'female').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div className="space-y-2">
          <span className="eyebrow-label">CENTRALIZED PARTICIPANT ROSTER</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
            Registered Participants
          </h1>
          <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] max-w-2xl">
            Deduplicated player directory displaying every registered athlete once across Singles, Doubles, and Mixed Doubles with linked partners and match history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/categories"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] hover:border-[#E74C3C] transition-colors"
          >
            Division Teams
          </Link>
          <Link
            href="/registration"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="editorial-card p-4 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-[#7E7060] dark:text-[#817B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player, department, or partner..."
              className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] pl-10 pr-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 bg-[#FAF9F6] dark:bg-[#181C1F] text-xs text-[#3E342B] dark:text-[#F5F1E8] px-4 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          >
            <option value="">All Categories</option>
            <option value="singles">Singles (All)</option>
            <option value="doubles">Doubles (All)</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-11 bg-[#FAF9F6] dark:bg-[#181C1F] text-xs text-[#3E342B] dark:text-[#F5F1E8] px-4 rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="text-xs font-mono text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-3">
          <span>
            <strong className="text-[#3E342B] dark:text-[#F5F1E8]">{participants.length}</strong> Unique Players
          </span>
          <span className="text-[11px]">({maleCount}M · {femaleCount}F)</span>
        </div>
      </div>

      {/* Table */}
      <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
            <span>Loading unified participant roster...</span>
          </div>
        ) : participants.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">
            No participants match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="pb-3 w-10 text-center">#</th>
                  <th className="pb-3">Participant</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Enrolled Categories</th>
                  <th className="pb-3">Doubles Partner</th>
                  <th className="pb-3">Mixed Doubles Partner</th>
                  <th className="pb-3">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034]">
                {participants.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-[#FAF9F6]/70 dark:hover:bg-[#181C1F]/60 transition-colors">
                    <td className="py-3.5 text-center font-mono text-[#7E7060]">{idx + 1}</td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-serif font-bold text-sm text-[#3E342B] dark:text-[#F5F1E8]">
                          {p.fullName}
                        </div>
                        {p.studentId && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] font-mono text-[10px] font-bold text-[#3E342B] dark:text-[#C2A268]">
                            {p.studentId}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] capitalize text-[#7E7060] dark:text-[#817B72]">
                        {p.gender} · {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-medium text-[#4A4238] dark:text-[#D5C4A1]">
                      {p.department}
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map((cat) => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5">
                      {!p.participateDoubles ? (
                        <span className="text-[#7E7060] dark:text-[#817B72] italic">Not Enrolled</span>
                      ) : p.doublesPartner?.paired ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">
                            {p.doublesPartner.partnerName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Paired Team
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-medium text-[#3E342B] dark:text-[#F5F1E8] block">
                            {p.doublesPartner?.partnerName || 'Unassigned'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending Pairing
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5">
                      {!p.participateMixedDoubles ? (
                        <span className="text-[#7E7060] dark:text-[#817B72] italic">Not Enrolled</span>
                      ) : p.mixedDoublesPartner?.paired ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">
                            {p.mixedDoublesPartner.partnerName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Paired Team
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-medium text-[#3E342B] dark:text-[#F5F1E8] block">
                            {p.mixedDoublesPartner?.partnerName || 'Unassigned'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending Pairing
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5">
                      {p.matches.length === 0 ? (
                        <span className="text-[11px] font-mono text-[#7E7060] dark:text-[#817B72]">
                          No fixtures yet
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {p.matches.map((m) => (
                            <div key={m._id} className="text-[11px] font-mono text-[#3E342B] dark:text-[#F5F1E8]">
                              <span className="font-bold">M#{m.matchNumber}</span> ({m.roundName}) vs {m.opponentName}{' '}
                              <span className="text-[10px] uppercase text-[#7E7060]">[{m.status}]</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
