'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Pin } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.getAnnouncements();
        if (res.success) setAnnouncements(res.announcements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          OFFICIAL NOTICE BOARD
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Tournament Bulletins
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Official communications, board schedule updates, and tournament directives.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl">
          <Bell className="w-8 h-8 text-[#7E7060] dark:text-[#817B72] mx-auto mb-2 opacity-70" />
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-normal">No announcements published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="editorial-card p-6 space-y-3 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-[#3E342B] dark:text-[#F5F1E8] font-bold bg-[#FAF9F6] dark:bg-[#181C1F] px-2.5 py-0.5 rounded-full border border-[#D5C4A1] dark:border-[rgba(212,169,76,0.3)]">
                      <Pin className="w-3 h-3 text-[#E74C3C]" /> PINNED
                    </span>
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <span className="text-[#7E7060] dark:text-[#817B72]">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#3E342B] dark:text-[#F5F1E8]">{ann.title}</h3>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


