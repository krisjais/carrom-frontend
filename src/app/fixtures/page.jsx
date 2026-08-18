'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Arena Schedule
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Tournament Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Sequential match schedule and live arena queue on the Main Carrom Board.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sport-card p-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#4A138C]">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#140129] text-xs text-white px-4 py-2 rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
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
            className="bg-[#140129] text-xs text-white px-4 py-2 rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
          >
            <option value="">All Statuses</option>
            <option value="live">Live Matches</option>
            <option value="scheduled">READY in Queue</option>
            <option value="pending">WAITING (TBD)</option>
            <option value="completed">Completed</option>
            <option value="bye">Bye Advances</option>
          </select>
        </div>

        <div className="text-xs text-[#FDB095] font-mono font-bold">
          {matches.length} fixtures found
        </div>
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center text-[#D8C7F0] text-xs">Loading fixtures...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center sport-card rounded-3xl space-y-2">
          <Calendar className="w-8 h-8 text-[#FDB095] mx-auto opacity-70" />
          <p className="text-xs text-[#D8C7F0]">No matches found for selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => (
            <div key={m._id} className="sport-card p-5 space-y-4 rounded-3xl border border-[#4A138C]">
              <div className="flex items-center justify-between text-[11px] pb-3 border-b border-[#4A138C]">
                <CategoryBadge category={m.category} />
                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#FFBA00] font-bold">{m.roundName} • Match #{m.matchNumber}</span>
                <span className="text-[#D8C7F0]">Main Board</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#140129] border border-[#4A138C]/60">
                  <span className="truncate max-w-[200px] text-white font-bold">{m.team1?.name || 'TBD'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#140129] border border-[#4A138C]/60">
                  <span className="truncate max-w-[200px] text-white font-bold">
                    {m.isBye ? 'BYE (Automatic Advance)' : m.team2?.name || 'TBD'}
                  </span>
                </div>
              </div>

              {m.scheduledTime && (
                <div className="pt-3 border-t border-[#4A138C] flex items-center justify-between text-[11px] text-[#D8C7F0]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#FDB095]" />
                    <span>Est: {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {m.queuePosition && (
                    <span className="font-mono text-[#FFBA00] font-bold">Queue #{m.queuePosition}</span>
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
