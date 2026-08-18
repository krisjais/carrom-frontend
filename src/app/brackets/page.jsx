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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Knockout Draw Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Championship Brackets
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Dynamic single-elimination brackets with real-time winner advancement across all 5 tournament divisions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#4A138C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFBA00] text-[#210440] shadow-md shadow-[#FFBA00]/20'
                  : 'bg-[#2C0854] text-[#D8C7F0] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Bracket Component Display */}
      {loading ? (
        <div className="py-20 text-center text-[#D8C7F0] text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFBA00]" />
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
    <Suspense fallback={<div className="py-20 text-center text-[#D8C7F0] text-xs">Loading brackets...</div>}>
      <BracketsContent />
    </Suspense>
  );
}
