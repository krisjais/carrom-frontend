'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { BracketView } from '@/components/bracket/BracketView';
import { GitFork, RefreshCw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Championship Brackets
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Dynamic knockout single-elimination brackets for all 5 tournament divisions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#1C2B48]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#D4AF37] text-[#070B16] shadow-sm'
                  : 'bg-[#0E1626] text-[#94A3B8] hover:text-white hover:bg-[#141F36]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Bracket Component Display */}
      {loading ? (
        <div className="py-20 text-center text-[#94A3B8] text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
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
    <Suspense fallback={<div className="py-20 text-center text-[#94A3B8] text-xs">Loading brackets...</div>}>
      <BracketsContent />
    </Suspense>
  );
}
