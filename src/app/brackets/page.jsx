'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { BracketView } from '@/components/bracket/BracketView';
import { RefreshCw } from 'lucide-react';
import { CategoryCoinPair } from '@/components/ui/CarromElements';

function BracketsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'boys_singles';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [bracketData, setBracketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBracket = async (category) => {
    setLoading(true);
    try {
      const res = await api.getBracketTree(category);
      if (res.success) {
        setBracketData(res);
      }
    } catch (err) {
      console.error(err);
      setBracketData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          KNOCKOUT TOURNAMENT DRAW
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Championship Brackets
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Dynamic single-elimination knockout brackets with live winner advancement across all 5 divisions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pill-tab cursor-pointer flex items-center gap-2 ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
            >
              <CategoryCoinPair category={cat.id} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Bracket Component Display */}
      {loading ? (
        <div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
          <span>Loading dynamic bracket...</span>
        </div>
      ) : (
        <BracketView
          rounds={bracketData?.rounds || []}
          category={selectedCategory}
          isLocked={bracketData?.isLocked}
          isPublished={bracketData?.isPublished}
        />
      )}
    </div>
  );
}

export default function BracketsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">Loading brackets...</div>}>
      <BracketsContent />
    </Suspense>
  );
}


