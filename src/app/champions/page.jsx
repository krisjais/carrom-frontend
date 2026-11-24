'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { subscribeToCarromRoster } from '@/lib/socket';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, ArrowRight, RefreshCw, Medal } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { CategoryCoinPair, CarromCoin } from '@/components/ui/CarromElements';

export default function ChampionsPage() {
  const [champions, setChampions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, dirRes] = await Promise.all([
        api.getOverviewStats().catch(() => null),
        api.getParticipantsDirectory().catch(() => null)
      ]);
      if (statsRes?.success && statsRes.stats?.champions) {
        const champs = Object.entries(statsRes.stats.champions).map(([category, val]) => ({
          category,
          teamName: val?.team?.name || 'Champion'
        }));
        setChampions(champs);
      }
      if (dirRes?.success) {
        setLeaderboard(dirRes.leaderboard || []);
      }
    } catch (err) {
      // Fallback gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsub = subscribeToCarromRoster(() => {
      fetchData();
    });
    return unsub;
  }, [fetchData]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          HALL OF FAME & STANDINGS
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Leaderboard & Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Division champions and unified athlete standings across Singles, Doubles, and Mixed Doubles.
        </p>
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const champ = champions.find((c) => c.category === cat.id);

          return (
            <div
              key={cat.id}
              className="editorial-card p-6 space-y-6 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                <div className="flex items-center gap-2">
                  <CategoryCoinPair category={cat.id} />
                  <CategoryBadge category={cat.id} />
                </div>
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] font-bold uppercase tracking-wider">Edition 2026</span>
              </div>

              <div className="py-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto shadow-xs">
                  <CarromCoin type="queen" size="sm" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#7E7060] dark:text-[#817B72] font-bold block tracking-widest">
                    {champ ? 'Official Champion' : 'Knockout In Progress'}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
                    {champ ? champ.teamName || champ.name : 'Contested in Arena'}
                  </h3>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono">
                <span className="text-[#7E7060] dark:text-[#817B72] text-[11px]">Main Carrom Board</span>
                <Link
                  href={`/brackets?category=${cat.id}`}
                  className="text-[#E74C3C] hover:underline font-bold flex items-center gap-1 uppercase text-xs"
                >
                  <span>Bracket View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Participant Leaderboard */}
      <div className="editorial-card rounded-2xl p-6 sm:p-8 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-2.5">
            <Medal className="w-5 h-5 text-[#E74C3C] dark:text-[#D4A94C]" />
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                Participant Leaderboard ({leaderboard.length})
              </h2>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
                Deduplicated athlete standings synced across Singles, Doubles, and Mixed Doubles.
              </p>
            </div>
          </div>

          <Link
            href="/participants"
            className="text-xs font-bold text-[#E74C3C] hover:underline flex items-center gap-1 uppercase font-mono"
          >
            <span>Full Participant Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#7E7060] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
            <span>Loading leaderboard...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[#7E7060]">
            No registered participants yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="pb-3 w-12 text-center">Rank</th>
                  <th className="pb-3">Player</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Divisions</th>
                  <th className="pb-3">Partners</th>
                  <th className="pb-3 text-center">Played</th>
                  <th className="pb-3 text-center">Wins</th>
                  <th className="pb-3 text-center">Boards</th>
                  <th className="pb-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034]">
                {leaderboard.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-[#FAF9F6]/60 dark:hover:bg-[#181C1F]/60">
                    <td className="py-3 text-center font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                      #{idx + 1}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-[#3E342B] dark:text-[#F5F1E8] block">{p.fullName}</span>
                      <span className="text-[10px] capitalize text-[#7E7060]">{p.gender}</span>
                    </td>
                    <td className="py-3 text-[#4A4238] dark:text-[#D5C4A1]">{p.department}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map((cat) => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-[11px] text-[#7E7060] dark:text-[#B8B1A5]">
                      {p.doublesPartner?.partnerName && (
                        <div>D: <strong className="text-[#3E342B] dark:text-[#F5F1E8]">{p.doublesPartner.partnerName}</strong></div>
                      )}
                      {p.mixedDoublesPartner?.partnerName && (
                        <div>M: <strong className="text-[#3E342B] dark:text-[#F5F1E8]">{p.mixedDoublesPartner.partnerName}</strong></div>
                      )}
                      {!p.doublesPartner?.partnerName && !p.mixedDoublesPartner?.partnerName && '—'}
                    </td>
                    <td className="py-3 text-center font-mono">{p.stats.matchesPlayed}</td>
                    <td className="py-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{p.stats.wins}</td>
                    <td className="py-3 text-center font-mono">{p.stats.boardsWon}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#E74C3C] dark:text-[#D4A94C]">{p.stats.points}</td>
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
