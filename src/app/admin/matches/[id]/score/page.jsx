'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LiveScoreKeeper } from '@/components/scoring/LiveScoreKeeper';
import { ArrowLeft, RefreshCw, Shield, Trophy } from 'lucide-react';
import { CategoryBadge, StatusBadge, MainBoardBadge } from '@/components/ui/Badge';

export default function MatchScoringDeskPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    try {
      const res = await api.getMatchById(matchId);
      if (res.success) {
        setMatch(res.match);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-gold-400" />
        <span>Loading live scorekeeper desk...</span>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm space-y-3">
        <p>Match fixture not found.</p>
        <Link href="/admin/matches" className="text-gold-400 hover:underline text-xs">
          Back to match list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/matches"
            className="p-2 rounded-xl bg-navy-900 text-slate-400 hover:text-white border border-navy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <CategoryBadge category={match.category} />
              <span className="text-xs font-mono text-gold-400 font-bold">
                Match #{match.matchNumber} ({match.roundName})
              </span>
            </div>
            <h1 className="text-xl font-bold font-display text-white mt-0.5">
              {match.team1?.name || 'TBD'} vs {match.team2?.name || 'TBD'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MainBoardBadge />
          <StatusBadge status={match.status} queuePosition={match.queuePosition} />
        </div>
      </div>

      {/* Embedded Live Scorekeeper Component */}
      <LiveScoreKeeper
        match={match}
        onUpdate={(updated) => setMatch(updated)}
      />
    </div>
  );
}
