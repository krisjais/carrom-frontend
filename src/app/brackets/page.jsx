'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { BracketView } from '@/components/bracket/BracketView';
import { GitFork, RefreshCw, Trophy } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Knockout Draw Architecture
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Championship Brackets
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Dynamic single-elimination knockout brackets with live winner propagation across all 5 tournament divisions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#2A313C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pill-tab ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Bracket Component Display */}
      {loading ? (
        <div className="py-20 text-center text-[#F5F1E8]/60 text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#F2C94C]" />
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
    <Suspense fallback={<div className="py-20 text-center text-[#F5F1E8]/60 text-xs font-mono">Loading brackets...</div>}>
      <BracketsContent />
    </Suspense>
  );
}
