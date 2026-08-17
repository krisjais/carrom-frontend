'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Calendar, Clock } from 'lucide-react';
import { StatusBadge, BoardNumberBadge, CategoryBadge } from '@/components/ui/Badge';

export default function FixturesPage() {
  const [matches, setMatches] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        if (statusFilter) params.status = statusFilter;

        const res = await api.getMatches(params);
        if (res.success) setMatches(res.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [categoryFilter, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Tournament Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Schedule, physical board assignments, and status across all categories.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sport-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#070B16] text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070B16] text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">All Statuses</option>
            <option value="live">Live Matches</option>
            <option value="scheduled">READY in Queue</option>
            <option value="pending">WAITING (TBD)</option>
            <option value="completed">Completed</option>
            <option value="bye">Bye Advances</option>
          </select>
        </div>

        <div className="text-xs text-[#94A3B8] font-mono">
          {matches.length} matches found
        </div>
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center text-[#94A3B8] text-xs">Loading fixtures...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center sport-card">
          <Calendar className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8]">No matches found for selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <div key={m._id} className="sport-card p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#1C2B48]">
                <CategoryBadge category={m.category} />
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={m.status} queuePosition={m.queuePosition} />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#D4AF37]">{m.roundName} • Match #{m.matchNumber}</span>
                <span className="text-slate-400">Main Carrom Board</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#070B16]">
                  <span className="truncate max-w-[170px] text-white font-medium">{m.team1?.name || 'TBD'}</span>
                  <span className="font-mono font-bold text-[#D4AF37]">{m.finalScore?.team1BoardsWon || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#070B16]">
                  <span className="truncate max-w-[170px] text-white font-medium">
                    {m.isBye ? 'BYE (Automatic Advance)' : m.team2?.name || 'TBD'}
                  </span>
                  {!m.isBye && (
                    <span className="font-mono font-bold text-[#D4AF37]">{m.finalScore?.team2BoardsWon || 0}</span>
                  )}
                </div>
              </div>

              {m.scheduledTime && (
                <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>Est: {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {m.queuePosition && (
                    <span className="font-mono text-blue-300 font-semibold">Queue #{m.queuePosition}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
