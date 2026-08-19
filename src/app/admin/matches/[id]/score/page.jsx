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
      <div className="py-24 text-center text-[#7E7060] dark:text-[#B8B1A5] text-sm flex items-center justify-center gap-2 font-mono">
        <RefreshCw className="w-5 h-5 animate-spin text-[#E74C3C]" />
        <span>Loading live scorekeeper desk...</span>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="py-16 text-center text-[#7E7060] dark:text-[#B8B1A5] text-sm space-y-3 font-mono">
        <p>Match fixture not found.</p>
        <Link href="/admin/matches" className="text-[#E74C3C] dark:text-[#D4A94C] hover:underline text-xs font-bold">
          Back to match list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/matches"
            className="p-2 rounded-xl bg-white dark:bg-[#15191C] text-[#7E7060] dark:text-[#B8B1A5] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <CategoryBadge category={match.category} />
              <span className="text-xs font-mono text-[#E74C3C] dark:text-[#D4A94C] font-bold">
                Match #{match.matchNumber} ({match.roundName})
              </span>
            </div>
            <h1 className="text-xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] mt-0.5">
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


